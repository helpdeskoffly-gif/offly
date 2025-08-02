import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { getUserAnalytics, createActiveUser, initializeOrUpdateUserAnalytics } from "../services/database";
import { getUserAvatarUrl } from "../services/avatars";

export const useAuth = () => {
  const [user, setUserState] = useState(null);
  const [userProfile, setUserProfileState] = useState(null);

  const setUser = (newUser) => {
    console.log("setUser called:", newUser ? newUser.id : "null");
    setUserState(newUser);
  };

  const setUserProfile = (newProfile) => {
    console.log("setUserProfile called:", newProfile ? newProfile.username : "null");
    setUserProfileState(newProfile);
  };
  const [loading, setLoading] = useState(true);
  const [analyticsLoaded, setAnalyticsLoaded] = useState(false);

  // Session timeout management (24 hours)
  const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  const [sessionTimeoutId, setSessionTimeoutId] = useState(null);

  // Function to handle automatic logout
  const handleSessionTimeout = async () => {
    console.log("Session timeout - logging out user");
    try {
      await supabase.auth.signOut();
      // Clear any stored session data
      localStorage.removeItem('sb-session');
      localStorage.removeItem('offly-session-start');
    } catch (error) {
      console.error("Error during session timeout logout:", error);
    }
  };

  // Function to start session timeout timer
  const startSessionTimeout = () => {
    // Clear any existing timeout
    if (sessionTimeoutId) {
      clearTimeout(sessionTimeoutId);
    }

    // Store session start time
    const sessionStart = new Date().getTime();
    localStorage.setItem('offly-session-start', sessionStart.toString());

    // Set new timeout
    const timeoutId = setTimeout(handleSessionTimeout, SESSION_TIMEOUT);
    setSessionTimeoutId(timeoutId);
    
    console.log("Session timeout set for 24 hours");
  };

  // Function to check if session has expired
  const checkSessionExpiry = () => {
    const sessionStart = localStorage.getItem('offly-session-start');
    if (!sessionStart) return false;

    const currentTime = new Date().getTime();
    const sessionAge = currentTime - parseInt(sessionStart);
    
    if (sessionAge > SESSION_TIMEOUT) {
      console.log("Session has expired, logging out");
      handleSessionTimeout();
      return true;
    }
    return false;
  };

  useEffect(() => {
    let mounted = true;
    let lastProcessedUserId = null; // Track last processed user to prevent duplicates

    // Listen for auth changes first
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log("Auth state change:", event, session?.user?.id);

      if (session?.user) {
        // For OAuth sign-ins, process the session immediately
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          console.log("useAuth: Processing user session from auth state change:", session.user.id);
          
          // Prevent processing the same user session multiple times
          if (lastProcessedUserId !== session.user.id) {
            lastProcessedUserId = session.user.id;
            await handleUserSession(session.user);
          } else {
            console.log("useAuth: User already processed, just updating loading state");
            setLoading(false);
          }
        }
      } else {
        console.log("Auth state change: No session, clearing user state");
        lastProcessedUserId = null;
        setUserState(null);
        setUserProfileState(null);
        setAnalyticsLoaded(false);
        setLoading(false);
      }
    });

    // Then get initial session with simplified logic
    const getInitialSession = async () => {
      if (!mounted) return;

      console.log("useAuth: Getting initial session...");
      
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("useAuth: Error getting initial session:", error);
          setLoading(false);
          return;
        }
        
        if (data.session?.user) {
          console.log("useAuth: Initial session found:", data.session.user.id);
          lastProcessedUserId = data.session.user.id;
          await handleUserSession(data.session.user);
        } else {
          console.log("useAuth: No initial session found");
          setAnalyticsLoaded(false);
          setLoading(false);
        }
      } catch (error) {
        console.error("useAuth: Session initialization error:", error);
        setAnalyticsLoaded(false);
        setLoading(false);
      }
    };

    getInitialSession();

    return () => {
      mounted = false;
      subscription?.unsubscribe();
      
      // Clean up session timeout
      if (sessionTimeoutId) {
        clearTimeout(sessionTimeoutId);
      }
    };
  }, []);

  const handleUserSession = async (supabaseUser) => {
    try {
      console.log("Handling user session for:", supabaseUser.id);

      // Create a basic user profile first
      const basicProfile = {
        username:
          supabaseUser.user_metadata?.full_name || supabaseUser.email || "User",
        level: 1,
        xp: 0,
        nextLevelXp: 100,
        dailyCheckins: 0,
        totalCheckins: 0,
        currentAiScore: 0,
        todayAverage: 0,
        overallAverage: 0,
        currentStreak: 0,
        lastCheckinDate: null,
        weeklyUniqueCheckinDays: 0,
        weekly_score: 0,
      };

      // Set user immediately
      setUserState(supabaseUser);
      setLoading(false); // Set loading false immediately

      // Start session timeout for 24-hour auto logout
      if (!checkSessionExpiry()) {
        startSessionTimeout();
      }

      // Ensure user exists in database (critical for OAuth users)
      // But only if we're not on the OAuth callback page (to prevent duplicate creation)
      const isOAuthCallback = window.location.pathname === '/auth/callback' || 
                              window.location.search.includes('code=') ||
                              window.location.hash.includes('access_token');
                              
      if (!isOAuthCallback) {
        try {
          console.log("Ensuring user exists in database...");
          const { data: existingUser, error: userCheckError } = await supabase
            .from("users")
            .select("*")
            .eq("id", supabaseUser.id)
            .single();

          if (userCheckError && userCheckError.code === 'PGRST116') {
            console.log("User not found in database, creating...");
            
            // Import and use createSignupUser
            const { createSignupUser } = await import('../services/database');
            
            try {
              await createSignupUser(
                supabaseUser.id,
                supabaseUser.email,
                supabaseUser.user_metadata?.full_name || supabaseUser.email
              );
              console.log("User created successfully in database");
            } catch (createError) {
              console.error("Failed to create user in database:", createError);
              // Continue anyway, the user session is still valid
            }
          } else if (existingUser) {
            console.log("User already exists in database");
          }
        } catch (dbError) {
          console.error("Database check/creation failed:", dbError);
          // Continue anyway, the session is still valid
        }
      } else {
        console.log("OAuth callback detected, skipping user creation in useAuth (handled by callback handler)");
      }

      // Load analytics and full profile in the background
      if (!analyticsLoaded) {
        console.log("Loading analytics and full profile in background...");
        setAnalyticsLoaded(true);
        // Fire and forget - don't await this
        loadAnalyticsInBackground(supabaseUser.id);
      } else {
        // If analytics already loaded, ensure userProfile is up-to-date
        // This handles cases where userProfile might be null on subsequent auth changes
        // without a full reload, but analytics are already loaded.
        // We'll re-fetch the profile to ensure it's current.
        loadAnalyticsInBackground(supabaseUser.id);
      }
    } catch (error) {
      console.error("Critical error handling user session:", error);
      // Always set a basic user profile to prevent infinite loading
      setUserState(supabaseUser);
      setUserProfileState({
        username:
          supabaseUser.user_metadata?.full_name || supabaseUser.email || "User",
        level: 1,
        xp: 0,
        nextLevelXp: 100,
        dailyCheckins: 0,
        totalCheckins: 0,
        currentAiScore: 0,
        todayAverage: 0,
        overallAverage: 0,
        currentStreak: 0,
        lastCheckinDate: null,
        weeklyUniqueCheckinDays: 0,
        weekly_score: 0,
      });
      setLoading(false);
    }
  };

  // Separate function to load analytics in background
  const loadAnalyticsInBackground = async (userId) => {
    try {
      console.log("Background: Initializing analytics for user:", userId);
      
      // Initialize analytics - wrap in try/catch to proceed even if this fails
      try {
        await initializeOrUpdateUserAnalytics(userId);
      } catch (analyticInitError) {
        console.error("Error initializing analytics, continuing anyway:", analyticInitError);
      }
      
      // Fetch analytics and profile data - use individual try/catch to handle failures gracefully
      let analyticsResult = { data: null, error: null };
      let userProfileResult = { data: null, error: null };
      
      try {
        analyticsResult = await getUserAnalytics(userId);
      } catch (analyticsError) {
        console.error("Failed to load analytics, continuing anyway:", analyticsError);
      }
      
      try {
        userProfileResult = await supabase.from('users').select('username, hobbies, avatar_url, full_name, bio').eq('id', userId).single();
      } catch (profileError) {
        console.error("Failed to load user profile, continuing anyway:", profileError);
      }

      let userHobbies = [];
      let userUsername = user?.user_metadata?.full_name || user?.email || "User";
      let userFullName = user?.user_metadata?.full_name || "";
      let userBio = "";
      let userAvatarUrl = "";

      if (userProfileResult.data) {
        userHobbies = userProfileResult.data.hobbies || [];
        userUsername = userProfileResult.data.username || userUsername;
        userFullName = userProfileResult.data.full_name || userFullName;
        userBio = userProfileResult.data.bio || "";
        userAvatarUrl = userProfileResult.data.avatar_url || "";
        
        // If user doesn't have an avatar assigned, assign one now and save it
        if (!userAvatarUrl) {
          try {
            console.log("User has no avatar, assigning random avatar...");
            const { assignRandomAvatar } = await import('../services/avatars');
            const avatarResult = await assignRandomAvatar(userId);
            if (avatarResult.success) {
              userAvatarUrl = avatarResult.avatarUrl;
              console.log("✅ Successfully assigned random avatar to existing user:", userAvatarUrl);
            } else {
              console.error("❌ Failed to assign avatar:", avatarResult.error);
            }
          } catch (avatarError) {
            console.error("❌ Error assigning avatar to existing user:", avatarError);
          }
        } else {
          console.log("✅ User already has avatar:", userAvatarUrl);
        }
      } else if (userProfileResult.error && userProfileResult.error.code !== 'PGRST116') {
        console.error('Error fetching user profile from "users" table:', userProfileResult.error);
      }
      
      // Determine if profile is completed based on hobbies
      const profileCompleted = userHobbies && userHobbies.length > 0;

      if (analyticsResult.success && analyticsResult.data) {
        console.log("Background: Analytics data found, updating profile");
        const analytics = analyticsResult.data;
        console.log("Background: Analytics data received:", analytics);
        setUserProfileState({
          username: userUsername,
          full_name: userFullName,
          bio: userBio,
          avatar_url: userAvatarUrl,
          hobbies: userHobbies,
          profileCompleted: profileCompleted,
          level: Math.floor(analytics.total_checkins / 10) + 1,
          xp: analytics.total_checkins * 10,
          nextLevelXp: (Math.floor(analytics.total_checkins / 10) + 1) * 100,
          dailyCheckins: analytics.daily_checkin_counter || 0,
          totalCheckins: analytics.total_checkins || 0,
          currentAiScore: analytics.current_ai_score || 0,
          todayAverage: analytics.today_average_sentiment || 0,
          overallAverage: analytics.overall_average_sentiment || 0,
          currentStreak: analytics.current_streak || 0,
          lastCheckinDate: analytics.last_checkin_date,
          weeklyUniqueCheckinDays: analytics.weekly_unique_checkin_days || 0,
          weekly_score: analytics.weekly_score || 0,
        });
        console.log("Background: userProfile updated with analytics");
      } else {
        console.log("Background: No analytics data found, keeping basic profile");
      }
    } catch (error) {
      console.warn("Background: Failed to load analytics:", error.message);
      // Don't fail the auth process - just log the error
    }
  };

  const signOut = async () => {
    try {
      console.log("Signing out user...");
      
      // Clear session timeout
      if (sessionTimeoutId) {
        clearTimeout(sessionTimeoutId);
        setSessionTimeoutId(null);
      }
      
      // Clear states immediately to provide immediate feedback
      setLoading(true);
      
      // Clear all browser storage and caches
      console.log("Clearing all browser storage...");
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear any cached data
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => {
            caches.delete(name);
          });
        });
      }
      
      // Clear any app-specific storage items
      const keysToRemove = [
        'dashboard-active-tab',
        'supabase.auth.token',
        'supabase.auth.expires_at',
        'supabase.auth.refresh_token',
        'supabase.auth.provider_token',
        'supabase.auth.provider_refresh_token'
      ];
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });
      
      // Clear Supabase session and all related data
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Supabase signOut error:", error);
        throw error;
      }

      // Clear all user-related state immediately
      console.log("Clearing user state after signOut");
      setUserState(null);
      setUserProfileState(null);
      setAnalyticsLoaded(false);
      setLoading(false);
      
      // Force a small delay to ensure state updates are processed
      setTimeout(() => {
        console.log("SignOut: Forcing state refresh");
        setUserState(null);
        setUserProfileState(null);
      }, 100);
      
      console.log("Successfully signed out");
    } catch (error) {
      console.error("Error signing out:", error);
      setLoading(false);
      // Even if there's an error, clear the local state and storage
      console.log("Clearing user state after signOut error");
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear any cached data
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => {
            caches.delete(name);
          });
        });
      }
      
      // Clear any app-specific storage items
      const keysToRemove = [
        'dashboard-active-tab',
        'supabase.auth.token',
        'supabase.auth.expires_at',
        'supabase.auth.refresh_token',
        'supabase.auth.provider_token',
        'supabase.auth.provider_refresh_token'
      ];
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });
      
      setUserState(null);
      setUserProfileState(null);
      setAnalyticsLoaded(false);
    }
  };

  const refreshUserProfile = async () => {
    if (user && user.id) {
      try {
        console.log("=== refreshUserProfile DEBUG START ===");
        console.log("Refreshing profile for user:", user.id);
        
        // Ensure analytics are properly initialized before fetching
        await initializeOrUpdateUserAnalytics(user.id);
        
        const [analyticsResult, userProfileResult] = await Promise.all([
          getUserAnalytics(user.id),
          supabase.from('users').select('username, hobbies, avatar_url, full_name, bio').eq('id', user.id).single(),
        ]);

        console.log("refreshUserProfile: Raw analytics result:", analyticsResult);
        console.log("refreshUserProfile: Raw user profile result:", userProfileResult);

        let userHobbies = [];
        let userUsername = user.user_metadata?.full_name || user.email || "User";
        let userFullName = user.user_metadata?.full_name || "";
        let userBio = "";
        let userAvatarUrl = "";

        if (userProfileResult.data) {
          userHobbies = userProfileResult.data.hobbies || [];
          userUsername = userProfileResult.data.username || userUsername;
          userFullName = userProfileResult.data.full_name || userFullName;
          userBio = userProfileResult.data.bio || "";
          userAvatarUrl = userProfileResult.data.avatar_url || "";
          
          // If user doesn't have an avatar assigned, assign one now and save it
          if (!userAvatarUrl) {
            try {
              const { assignRandomAvatar } = await import('../services/avatars');
              const avatarResult = await assignRandomAvatar(user.id);
              if (avatarResult.success) {
                userAvatarUrl = avatarResult.avatarUrl;
                console.log("Assigned random avatar to existing user during refresh:", userAvatarUrl);
              }
            } catch (avatarError) {
              console.error("Failed to assign avatar to existing user during refresh:", avatarError);
            }
          }
        } else if (userProfileResult.error && userProfileResult.error.code !== 'PGRST116') {
          console.error('Error fetching user profile from "users" table during refresh:', userProfileResult.error);
        }
        
        // Determine if profile is completed based on hobbies
        const profileCompleted = userHobbies && userHobbies.length > 0;

        if (analyticsResult.success && analyticsResult.data) {
          const analytics = analyticsResult.data;
          console.log("refreshUserProfile: Analytics data received:", analytics);
          console.log("refreshUserProfile: weekly_unique_checkin_days from DB:", analytics.weekly_unique_checkin_days);
          
          const newUserProfile = {
            username: userUsername,
            full_name: userFullName,
            bio: userBio,
            avatar_url: userAvatarUrl,
            hobbies: userHobbies,
            profileCompleted: profileCompleted,
            level: Math.floor(analytics.total_checkins / 10) + 1,
            xp: analytics.total_checkins * 10,
            nextLevelXp: (Math.floor(analytics.total_checkins / 10) + 1) * 100,
            dailyCheckins: analytics.daily_checkin_counter || 0,
            totalCheckins: analytics.total_checkins || 0,
            currentAiScore: analytics.current_ai_score || 0,
            todayAverage: analytics.today_average_sentiment || 0,
            overallAverage: analytics.overall_average_sentiment || 0,
            currentStreak: analytics.current_streak || 0,
            lastCheckinDate: analytics.last_checkin_date,
            weeklyUniqueCheckinDays: analytics.weekly_unique_checkin_days || 0,
            weekly_score: analytics.weekly_score || 0,
          };
          
          console.log("refreshUserProfile: New userProfile object:", newUserProfile);
          console.log("refreshUserProfile: weeklyUniqueCheckinDays mapped to:", newUserProfile.weeklyUniqueCheckinDays);
          
          setUserProfileState(newUserProfile);
          console.log("User profile refreshed successfully");
          console.log("=== refreshUserProfile DEBUG END ===");
        } else {
          console.log("No analytics data found during refresh");
          console.log("Analytics result:", analyticsResult);
        }
      } catch (error) {
        console.error("Error refreshing user profile:", error);
      }
    }
  };

  return {
    user,
    userProfile,
    loading,
    signOut,
    refreshUserProfile,
  };
};

export default useAuth;
