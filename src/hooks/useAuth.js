import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { getUserAnalytics, createActiveUser, initializeOrUpdateUserAnalytics } from "../services/database";
import { getUserAvatarUrl } from "../services/avatars";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyticsLoaded, setAnalyticsLoaded] = useState(false);

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
        // Prevent processing the same user session multiple times
        if (lastProcessedUserId !== session.user.id) {
          lastProcessedUserId = session.user.id;
          await handleUserSession(session.user);
        } else {
          console.log("Skipping duplicate session for user:", session.user.id);
        }
      } else {
        lastProcessedUserId = null;
        setUser(null);
        setUserProfile(null);
        setAnalyticsLoaded(false); // Reset analytics loaded state
        setLoading(false);
      }
    });

    // Then get initial session
    const getInitialSession = async () => {
      if (!mounted) return;

      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Error getting session:", error);
          setLoading(false);
          return;
        }

        if (session?.user) {
          console.log("Initial session found:", session.user.id);
          await handleUserSession(session.user);
        } else {
          console.log("No initial session");
          setAnalyticsLoaded(false);
          setLoading(false);
        }
      } catch (error) {
        console.error("Session initialization error:", error);
        setAnalyticsLoaded(false);
        setLoading(false);
      }
    };

    getInitialSession();

    return () => {
      mounted = false;
      subscription?.unsubscribe();
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

      // Set user and basic profile immediately - NO TIMEOUTS
      setUser(supabaseUser);
      setUserProfile(basicProfile);
      setLoading(false); // Set loading false immediately

      // Load analytics in the background WITHOUT blocking auth
      if (!analyticsLoaded) {
        console.log("Loading analytics in background...");
        setAnalyticsLoaded(true);
        
        // Fire and forget - don't await this
        loadAnalyticsInBackground(supabaseUser.id);
      }
    } catch (error) {
      console.error("Critical error handling user session:", error);
      // Always set a basic user profile to prevent infinite loading
      setUser(supabaseUser);
      setUserProfile({
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
      
      // Initialize analytics
      await initializeOrUpdateUserAnalytics(userId);
      
      // Fetch analytics and profile data
      const [analyticsResult, userProfileResult] = await Promise.all([
        getUserAnalytics(userId),
        supabase.from('users').select('username, hobbies, avatar_url, full_name, bio').eq('id', userId).single(),
      ]);

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
        setUserProfile({
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
      
      // Clear states immediately to provide immediate feedback
      setLoading(true);
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Supabase signOut error:", error);
        throw error;
      }

      // Clear all user-related state
      setUser(null);
      setUserProfile(null);
      setAnalyticsLoaded(false);
      setLoading(false);
      
      console.log("Successfully signed out");
    } catch (error) {
      console.error("Error signing out:", error);
      setLoading(false);
      // Even if there's an error, clear the local state
      setUser(null);
      setUserProfile(null);
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
          
          setUserProfile(newUserProfile);
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
