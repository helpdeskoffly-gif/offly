import { supabase, supabaseHelpers } from "../supabase";
import { assignRandomAvatar } from "./avatars";

// Validation helper
const validateSupabase = () => {
  if (!supabase) {
    throw new Error("Supabase client not initialized");
  }
  return true;
};

// Safe Supabase operation wrapper with enhanced error handling
const safeSupabaseOperation = async (operation, fallback = null) => {
  try {
    validateSupabase();
    return await operation();
  } catch (error) {
    console.error("Supabase operation failed:", error);

    // Handle specific error types
    let errorMessage = error.message;
    if (error.code === "PGRST204") {
      errorMessage = `Database schema error: ${error.message}. Please run database migrations.`;
    } else if (error.code === "PGRST116") {
      errorMessage = `No data found: ${error.message}`;
    } else if (error.code === "23505") {
      errorMessage = `Duplicate entry: ${error.message}`;
    }

    return {
      success: false,
      error: errorMessage,
      code: error.code,
      data: fallback,
    };
  }
};

// Track landing page view
export const trackLandingPageView = async (viewData = {}) => {
  return safeSupabaseOperation(async () => {
    const data = await supabaseHelpers.insert("landing_page_views", {
      page_path: viewData.pagePath || window.location.pathname,
      user_agent: navigator.userAgent,
      referrer: document.referrer || null,
      created_at: new Date().toISOString(),
    });

    return { success: true, data };
  });
};

// Add to waitlist
export const addToWaitlist = async (email, name = "", referralSource = "") => {
  return safeSupabaseOperation(async () => {
    const data = await supabaseHelpers.insert("waitlist", {
      email: email.toLowerCase().trim(),
      name: name.trim(),
      referral_source: referralSource,
      created_at: new Date().toISOString(),
    });

    return { success: true, data };
  });
};

// Create signup user
export const createSignupUser = async (
  uid,
  email,
  displayName,
  additionalData = {},
) => {
  return safeSupabaseOperation(async () => {
    console.log("Creating signup user:", { uid, email, displayName });

    // First, ensure the user record exists in public.users
    const userData = {
      id: uid,
      email: email,
      full_name: displayName,
      username: displayName,
      ...additionalData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Use insert with ON CONFLICT to handle duplicates properly
    const { data: userResult, error: userError } = await supabase
      .from("users")
      .upsert(userData, { onConflict: "id" })
      .select();

    if (userError) {
      console.error("Error creating user:", userError);
      throw userError;
    }

    console.log("User record created/updated:", userResult[0]);

    // Initialize user analytics
    const analyticsData = {
      user_id: uid,
      username: displayName,
      daily_checkin_counter: 0,
      total_checkins: 0,
      current_ai_score: 0,
      today_average_sentiment: 0,
      overall_average_sentiment: 0,
      average_mood_score: 0,
      current_streak: 0,
      weekly_unique_checkin_days: 0,
      weekly_score: 0,
      completedantitodos: 0,
      weeklyantitodos: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: analyticsResult, error: analyticsError } = await supabase
      .from("user_analytics")
      .upsert(analyticsData, { onConflict: "user_id" })
      .select();

    if (analyticsError) {
      console.error("Error creating analytics:", analyticsError);
      throw analyticsError;
    }

    console.log("Analytics record created/updated:", analyticsResult[0]);

    // Assign random avatar to new user
    try {
      console.log("Assigning random avatar to new user:", uid);
      const avatarResult = await assignRandomAvatar(uid);
      if (avatarResult.success) {
        console.log("Random avatar assigned successfully:", avatarResult.avatarUrl);
      } else {
        console.error("Failed to assign random avatar:", avatarResult.error);
      }
    } catch (avatarError) {
      console.error("Failed to assign random avatar:", avatarError);
      // Don't fail user creation if avatar assignment fails
    }

    // Generate initial anti-todo activities for new users
    try {
      console.log("Generating initial anti-todo activities for new user:", uid);
      const { generateInitialAntiTodos } = await import('./antiTodo');
      await generateInitialAntiTodos(uid);
      console.log("Initial anti-todo activities generated successfully");
    } catch (antiTodoError) {
      console.error("Failed to generate initial anti-todo activities:", antiTodoError);
      // Don't fail user creation if anti-todo generation fails
    }

    return {
      success: true,
      data: { user: userResult[0], analytics: analyticsResult[0] },
    };
  });
};

// Update user profile
export const updateUserProfile = async (uid, profileData) => {
  return safeSupabaseOperation(async () => {
    const updateData = {
      ...profileData,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", uid)
      .select();

    if (error) {
      console.error("Profile update error:", error);
      throw error;
    }

    // Also update username in analytics if provided
    if (profileData.username) {
      await supabase
        .from("user_analytics")
        .update({ username: profileData.username })
        .eq("user_id", uid);
    }

    return { success: true, data: data[0] };
  });
};

// Mark profile as completed (update user with hobbies and username)
export const markProfileAsCompleted = async (userId, profileData) => {
  return safeSupabaseOperation(async () => {
    if (!userId) {
      throw new Error("User ID is required");
    }

    console.log("Marking profile as completed:", { userId, profileData });

    const updateData = {
      updated_at: new Date().toISOString(),
    };

    // Add all profile data
    if (profileData.username) {
      updateData.username = profileData.username;
    }
    if (profileData.hobbies) {
      updateData.hobbies = profileData.hobbies;
    }
    if (profileData.full_name) {
      updateData.full_name = profileData.full_name;
    }

    const { data, error } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", userId)
      .select();

    if (error) {
      console.error("Profile completion error:", error);
      throw error;
    }

    console.log("Profile marked as completed:", data[0]);
    return { success: true, data: data[0] };
  });
};

// Check if user profile is completed (based on existing schema)
export const checkProfileCompletion = async (userId) => {
  return safeSupabaseOperation(async () => {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const { data, error } = await supabase
      .from("users")
      .select("username, hobbies, full_name")
      .eq("id", userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error("Profile completion check error:", error);
      throw error;
    }

    // Profile is considered complete if user has hobbies (main indicator)
    const hasHobbies = data?.hobbies && Array.isArray(data.hobbies) && data.hobbies.length > 0;
    const hasUsername = data?.username && data.username.trim().length > 0;
    
    // Profile is complete if user has at least hobbies
    const isCompleted = hasHobbies;
    const hasBasicInfo = hasUsername || hasHobbies;
    
    console.log("Profile completion check:", { 
      hasHobbies, 
      hasUsername, 
      isCompleted, 
      hobbies: data?.hobbies 
    });
    
    return { 
      success: true, 
      isCompleted,
      hasBasicInfo,
      data: data 
    };
  });
};

// Create active user
export const createActiveUser = async (uid, username) => {
  return safeSupabaseOperation(async () => {
    console.log("Creating active user:", { uid, username });

    // First ensure user exists in public.users table
    const { data: existingUser, error: userCheckError } = await supabase
      .from("users")
      .select("id")
      .eq("id", uid)
      .single();

    if (userCheckError && userCheckError.code === "PGRST116") {
      // User doesn't exist, create it
      console.log("User record missing, creating...");
      const { data: newUser, error: createUserError } = await supabase
        .from("users")
        .insert({
          id: uid,
          username: username,
          email: username, // fallback
          full_name: username,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select();

      if (createUserError) {
        console.error("Failed to create user record:", createUserError);
        throw createUserError;
      }
      console.log("User record created:", newUser[0]);

      // Assign random avatar to new user
      try {
        console.log("Assigning random avatar to new user:", uid);
        const avatarResult = await assignRandomAvatar(uid);
        if (avatarResult.success) {
          console.log("Random avatar assigned successfully:", avatarResult.avatarUrl);
        } else {
          console.error("Failed to assign random avatar:", avatarResult.error);
        }
      } catch (avatarError) {
        console.error("Failed to assign random avatar:", avatarError);
        // Don't fail user creation if avatar assignment fails
      }

      // Generate initial anti-todo activities for new users
      try {
        console.log("Generating initial anti-todo activities for new user:", uid);
        const { generateInitialAntiTodos } = await import('./antiTodo');
        await generateInitialAntiTodos(uid);
        console.log("Initial anti-todo activities generated successfully");
      } catch (antiTodoError) {
        console.error("Failed to generate initial anti-todo activities:", antiTodoError);
        // Don't fail user creation if anti-todo generation fails
      }
    } else if (userCheckError) {
      throw userCheckError;
    }

    // Now create/update analytics
    const { data: analyticsData, error: analyticsError } = await supabase
      .from("user_analytics")
      .upsert(
        {
          user_id: uid,
          username: username,
          daily_checkin_counter: 0,
          total_checkins: 0,
          average_mood_score: 0,
          current_ai_score: 0,
          today_average_sentiment: 0,
          overall_average_sentiment: 0,
          current_streak: 0,
          weekly_unique_checkin_days: 0,
          weekly_score: 0,
          completedantitodos: 0,
          weeklyantitodos: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      )
      .select();

    if (analyticsError) {
      console.error("Failed to create analytics:", analyticsError);
      throw analyticsError;
    }

    console.log("Active user created successfully:", analyticsData[0]);
    return { success: true, data: analyticsData[0] };
  });
};

// Check if user can check-in (4-hour cooldown)
export const canUserCheckin = async (uid) => {
  return safeSupabaseOperation(async () => {
    if (!uid || uid === "undefined" || typeof uid !== "string") {
      return { success: false, error: "Invalid user ID provided", canCheckin: false };
    }

    // Get the latest check-in for this user
    const { data, error } = await supabase
      .from("checkins")
      .select("created_at")
      .eq("user_id", uid)
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) {
      console.error("Error checking last checkin:", error);
      throw error;
    }

    // If no previous check-ins, user can check-in
    if (!data || data.length === 0) {
      return { 
        success: true, 
        canCheckin: true, 
        lastCheckinTime: null,
        waitTimeHours: 0 
      };
    }

    const lastCheckinTime = new Date(data[0].created_at);
    const now = new Date();
    const hoursSinceLastCheckin = (now - lastCheckinTime) / (1000 * 60 * 60);
    const cooldownHours = 4;

    const canCheckin = hoursSinceLastCheckin >= cooldownHours;
    const waitTimeHours = canCheckin ? 0 : Math.ceil(cooldownHours - hoursSinceLastCheckin);

    return {
      success: true,
      canCheckin,
      lastCheckinTime: lastCheckinTime.toISOString(),
      hoursSinceLastCheckin: Math.round(hoursSinceLastCheckin * 100) / 100,
      waitTimeHours,
      waitTimeMinutes: canCheckin ? 0 : Math.ceil((cooldownHours - hoursSinceLastCheckin) * 60)
    };
  });
};

// Submit checkin
export const submitCheckin = async (uid, checkinData) => {
  return safeSupabaseOperation(async () => {
    // Validate required parameters
    if (!uid || uid === "undefined" || typeof uid !== "string") {
      console.error("submitCheckin: Invalid uid provided:", uid);
      return { success: false, error: "Invalid user ID provided", data: null };
    }

    // Check cooldown period before proceeding
    const cooldownResult = await canUserCheckin(uid);
    if (!cooldownResult.success) {
      return { success: false, error: "Error checking cooldown period", data: null };
    }

    if (!cooldownResult.canCheckin) {
      const waitTime = cooldownResult.waitTimeHours > 1 
        ? `${cooldownResult.waitTimeHours} hours`
        : `${cooldownResult.waitTimeMinutes} minutes`;
      return { 
        success: false, 
        error: `Please wait ${waitTime} before your next check-in. This helps maintain meaningful tracking.`,
        data: null,
        cooldownActive: true,
        waitTime: cooldownResult.waitTimeHours > 1 ? cooldownResult.waitTimeHours : cooldownResult.waitTimeMinutes,
        waitType: cooldownResult.waitTimeHours > 1 ? 'hours' : 'minutes'
      };
    }

    // CRITICAL FIX: Ensure user exists in public.users before creating checkin
    console.log("Checking if user exists before creating checkin...");
    const { data: userExists, error: userCheckError } = await supabase
      .from("users")
      .select("id")
      .eq("id", uid)
      .single();

    if (userCheckError && userCheckError.code === "PGRST116") {
      console.log("User record missing, creating it now...");

      // Get user info from auth
      const {
        data: { user: authUser },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !authUser) {
        console.error("Cannot get auth user info:", authError);
        return { success: false, error: "Authentication required", data: null };
      }

      // Create missing user record
      const { data: newUser, error: createUserError } = await supabase
        .from("users")
        .insert({
          id: uid,
          email: authUser.email,
          full_name: authUser.user_metadata?.full_name || authUser.email,
          username:
            authUser.user_metadata?.username || authUser.email.split("@")[0],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select();

      if (createUserError) {
        console.error(
          "Failed to create user record during checkin:",
          createUserError,
        );
        return {
          success: false,
          error: "Failed to create user record",
          data: null,
        };
      }

      console.log("User record created during checkin:", newUser[0]);

      // Also create analytics record
      await supabase.from("user_analytics").upsert(
        {
          user_id: uid,
          username: authUser.user_metadata?.full_name || authUser.email,
          daily_checkin_counter: 0,
          total_checkins: 0,
          current_ai_score: 0,
          today_average_sentiment: 0,
          overall_average_sentiment: 0,
          average_mood_score: 0,
          current_streak: 0,
          weekly_unique_checkin_days: 0,
          weekly_score: 0,
          completedantitodos: 0,
          weeklyantitodos: 0,
          created_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      );
    } else if (userCheckError) {
      console.error("Error checking user existence:", userCheckError);
      return { success: false, error: "Database error", data: null };
    }

    console.log("User exists, proceeding with checkin...");

    const { moodScore, moodText, aiScore, moodEmoji, hashtags } = checkinData;

    // Validate and provide defaults for required fields
    const validMoodScore = typeof moodScore === "number" ? moodScore : 5; // Default to neutral mood
    const validMoodText = typeof moodText === "string" ? moodText : "";
    const validAiScore = typeof aiScore === "number" ? aiScore : 0;
    const validMoodEmoji = typeof moodEmoji === "string" ? moodEmoji : "🙂";
    const validHashtags = Array.isArray(hashtags) ? hashtags : [];

    // Calculate sentiment score using the database function
    const sentimentResult = await supabase.rpc("calculate_sentiment_score", {
      mood_text: validMoodText,
    });

    const sentimentScore = sentimentResult.data || 0;

    // Create base checkin record with required fields only
    const checkinRecord = {
      user_id: uid,
      mood_score: validMoodScore, // Use validated value
      mood_text: validMoodText, // Use validated value
      ai_score: validAiScore, // Use validated value
      sentiment_score: sentimentScore,
      checkin_date: new Date().toISOString().split("T")[0], // YYYY-MM-DD format
      checkin_time: new Date().toTimeString().split(" ")[0], // HH:MM:SS format
      created_at: new Date().toISOString(),
    };

    // Add mood_emoji and hashtags since they exist in the database schema
    if (validMoodEmoji) {
      checkinRecord.mood_emoji = validMoodEmoji;
    }
    if (validHashtags.length > 0) {
      checkinRecord.hashtags = validHashtags.join(',');
    }

    console.log("Attempting to insert checkin record:", checkinRecord);
    const result = await supabaseHelpers.insert("checkins", checkinRecord);
    console.log("Checkin insert result:", result);

    // CRITICAL: Update analytics table after successful checkin
    try {
      console.log("Updating analytics for user:", uid);
      const analyticsResult = await updateUserAnalytics(uid);
      if(analyticsResult.success) {
        console.log("Analytics updated successfully after checkin", analyticsResult.data.weekly_unique_checkin_days);
      }
      console.log("Analytics updated successfully after checkin");
    } catch (analyticsError) {
      console.error(
        "Failed to update analytics after checkin:",
        analyticsError,
      );
      // Don't fail the checkin if analytics update fails
    }

    // Award points for checkin completion
    try {
      const checkinPoints = 5; // Simple 5 points for checkin

      const pointsResult = await awardPoints(
        uid, 
        checkinPoints, 
        'checkin', 
        result[0].id, 
        'Daily check-in'
      );
      
      if (pointsResult.success) {
        console.log(`Awarded ${checkinPoints} points for checkin`);
        
        // Update plant growth with earned points
        let plantXp = 0;
        try {
          const plantResult = await getUserPlant(uid);
          if (plantResult.success && plantResult.data) {
            plantXp = Math.floor(checkinPoints / 2); // 1 XP per 2 points
            await updatePlantGrowth(plantResult.data.id, plantXp);
            console.log(`Added ${plantXp} XP to user's plant`);
          }
        } catch (plantError) {
          console.error("Failed to update plant growth:", plantError);
        }
        
        // Return checkin data with points information for toast
        return { 
          success: true, 
          data: {
            ...result[0],
            pointsEarned: {
              total: checkinPoints,
              plantXp: plantXp
            }
          }
        };
      }
    } catch (pointsError) {
      console.error("Failed to award points for checkin:", pointsError);
    }

    return { success: true, data: result[0] };
  });
};

// Get user analytics
export const getUserAnalytics = async (uid) => {
  return safeSupabaseOperation(async () => {
    // Validate uid parameter
    if (!uid || uid === "undefined" || typeof uid !== "string") {
      console.error("getUserAnalytics: Invalid uid provided:", uid);
      return { success: false, error: "Invalid user ID provided", data: null };
    }

    console.log("Querying user_analytics for user:", uid);

    // Add shorter timeout to prevent hanging (reduced to 2 seconds for testing)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(
        () => reject(new Error("getUserAnalytics timeout after 10 seconds")),
        10000,
      );
    });

    const queryPromise = supabase
      .from("user_analytics")
      .select("*, weekly_unique_checkin_days")
      .eq("user_id", uid)
      .single();

    try {
      const { data, error } = await Promise.race([
        queryPromise,
        timeoutPromise,
      ]);

      if (error && error.code !== "PGRST116") {
        console.error("getUserAnalytics error:", error);
        throw error;
      }

      if (error && error.code === "PGRST116") {
        console.warn("No user_analytics record found for user:", uid);
        return {
          success: false,
          error: "No analytics record found",
          data: null,
        };
      }

      console.log(
        "getUserAnalytics success:",
        data ? "Record found" : "No record",
      );
      return { success: true, data };
    } catch (timeoutError) {
      console.error("getUserAnalytics timed out:", timeoutError.message);
      return { success: false, error: timeoutError.message, data: null };
    }
  });
};

// Get user checkins
export const getUserCheckins = async (uid, startDate = null, endDate = null, limit = 50) => {
  return safeSupabaseOperation(async () => {
    let query = supabase
      .from("checkins")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });

    if (startDate) {
      query = query.gte("checkin_date", startDate);
    }
    if (endDate) {
      query = query.lte("checkin_date", endDate);
    }

    if (!startDate && !endDate) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    return { success: true, data };
  });
};

// Reset daily counters
export const resetDailyCounters = async () => {
  return safeSupabaseOperation(async () => {
    const { data, error } = await supabase.rpc("reset_daily_counters");
    if (error) throw error;
    return { success: true, data };
  });
};

// Calculate sentiment score (client-side fallback)
export const calculateSentimentScore = (text) => {
  if (!text || typeof text !== "string") return 0;

  const positiveWords = [
    "happy",
    "great",
    "good",
    "excellent",
    "amazing",
    "wonderful",
    "fantastic",
    "awesome",
    "love",
    "excited",
    "joy",
    "perfect",
    "brilliant",
    "outstanding",
    "superb",
    "marvelous",
    "delighted",
    "thrilled",
    "ecstatic",
    "blissful",
    "grateful",
    "blessed",
    "peaceful",
    "content",
    "satisfied",
    "optimistic",
    "confident",
  ];

  const negativeWords = [
    "sad",
    "bad",
    "terrible",
    "awful",
    "horrible",
    "hate",
    "angry",
    "frustrated",
    "depressed",
    "anxious",
    "worried",
    "stressed",
    "upset",
    "disappointed",
    "miserable",
    "furious",
    "devastated",
    "hopeless",
    "overwhelmed",
    "exhausted",
    "lonely",
    "scared",
    "confused",
    "annoyed",
    "irritated",
    "bored",
    "tired",
  ];

  const words = text.toLowerCase().split(/\s+/);
  let positiveCount = 0;
  let negativeCount = 0;

  words.forEach((word) => {
    const cleanWord = word.replace(/[^\w]/g, "");
    if (positiveWords.includes(cleanWord)) positiveCount++;
    if (negativeWords.includes(cleanWord)) negativeCount++;
  });

  if (words.length === 0) return 0;

  const score = ((positiveCount - negativeCount) / words.length) * 100;
  return Math.max(-100, Math.min(100, score));
};

// Get landing page stats
export const getLandingPageStats = async () => {
  return safeSupabaseOperation(async () => {
    const { data, error } = await supabase
      .from("landing_page_views")
      .select("*");

    if (error) throw error;
    return { success: true, data };
  });
};

// Save user activities
export const saveUserActivities = async (uid, activities) => {
  return safeSupabaseOperation(async () => {
    const activitiesWithUserId = activities.map((activity) => ({
      ...activity,
      user_id: uid,
      created_at: new Date().toISOString(),
    }));

    const data = await supabaseHelpers.insert(
      "activities",
      activitiesWithUserId,
    );
    return { success: true, data };
  });
};

// Get user activities
export const getUserActivities = async (uid) => {
  return safeSupabaseOperation(async () => {
    const { data, error } = await supabase
      .from("activities")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { success: true, data };
  });
};

// Update activity status
export const updateActivityStatus = async (
  activityId,
  status,
  completedAt = null,
) => {
  return safeSupabaseOperation(async () => {
    const updateData = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === "completed" && completedAt) {
      updateData.completed_at = completedAt;
    }

    const data = await supabaseHelpers.update(
      "activities",
      activityId,
      updateData,
    );
    return { success: true, data };
  });
};

// Save anti-todo list
export const saveAntiTodoList = async (uid, listData) => {
  return safeSupabaseOperation(async () => {
    const { title, description, category, items } = listData;

    // Create the list
    const listResult = await supabaseHelpers.insert("anti_todo_lists", {
      user_id: uid,
      title,
      description,
      category,
      created_at: new Date().toISOString(),
    });

    const list = listResult[0];

    // Add items if provided
    if (items && items.length > 0) {
      const itemsWithListId = items.map((item) => ({
        list_id: list.id,
        user_id: uid,
        content: item.content,
        is_completed: item.is_completed || false,
        created_at: new Date().toISOString(),
      }));

      await supabaseHelpers.insert("anti_todo_items", itemsWithListId);
    }

    return { success: true, data: list };
  });
};

// Get current anti-todo list
export const getCurrentAntiTodoList = async (uid) => {
  return safeSupabaseOperation(async () => {
    const { data: lists, error: listsError } = await supabase
      .from("anti_todo_lists")
      .select(
        `
        *,
        anti_todo_items (*)
      `,
      )
      .eq("user_id", uid)
      .eq("is_archived", false)
      .order("created_at", { ascending: false })
      .limit(1);

    if (listsError) throw listsError;

    return { success: true, data: lists[0] || null };
  });
};

// Update anti-todo status
export const updateAntiTodoStatus = async (itemId, isCompleted) => {
  return safeSupabaseOperation(async () => {
    const updateData = {
      is_completed: isCompleted,
      updated_at: new Date().toISOString(),
    };

    if (isCompleted) {
      updateData.completed_at = new Date().toISOString();
    } else {
      updateData.completed_at = null;
    }

    const data = await supabaseHelpers.update(
      "anti_todo_items",
      itemId,
      updateData,
    );
    return { success: true, data };
  });
};

// Get anti-todo stats
export const getAntiTodoStats = async (uid) => {
  return safeSupabaseOperation(async () => {
    const { data: items, error } = await supabase
      .from("anti_todo_items")
      .select("*")
      .eq("user_id", uid);

    if (error) throw error;

    const totalItems = items.length;
    const completedItems = items.filter((item) => item.is_completed).length;
    const completionRate =
      totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

    const stats = {
      totalItems,
      completedItems,
      pendingItems: totalItems - completedItems,
      completionRate: Math.round(completionRate * 100) / 100,
    };

    return { success: true, data: stats };
  });
};

// Archive anti-todo list
export const archiveAntiTodoList = async (listId) => {
  return safeSupabaseOperation(async () => {
    const data = await supabaseHelpers.update("anti_todo_lists", listId, {
      is_archived: true,
      updated_at: new Date().toISOString(),
    });

    return { success: true, data };
  });
};

// Get weekly anti-todo insights
export const getWeeklyAntiTodoInsights = async (uid) => {
  return safeSupabaseOperation(async () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const { data, error } = await supabase
      .from("anti_todo_items")
      .select("*")
      .eq("user_id", uid)
      .gte("created_at", oneWeekAgo.toISOString());

    if (error) throw error;

    const totalThisWeek = data.length;
    const completedThisWeek = data.filter((item) => item.is_completed).length;
    const weeklyCompletionRate =
      totalThisWeek > 0 ? (completedThisWeek / totalThisWeek) * 100 : 0;

    // Group by day
    const dailyStats = {};
    data.forEach((item) => {
      const day = new Date(item.created_at).toLocaleDateString();
      if (!dailyStats[day]) {
        dailyStats[day] = { total: 0, completed: 0 };
      }
      dailyStats[day].total++;
      if (item.is_completed) {
        dailyStats[day].completed++;
      }
    });

    const insights = {
      totalThisWeek,
      completedThisWeek,
      weeklyCompletionRate: Math.round(weeklyCompletionRate * 100) / 100,
      dailyStats,
      averagePerDay: totalThisWeek / 7,
    };

    return { success: true, data: insights };
  });
};

// Generate anti-todo suggestions (placeholder - you might want to enhance this)
export const generateAntiTodoSuggestions = async (uid) => {
  return safeSupabaseOperation(async () => {
    // Get user's recent items to understand patterns
    const { data: recentItems, error } = await supabase
      .from("anti_todo_items")
      .select("content")
      .eq("user_id", uid)
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) throw error;

    // Simple suggestion logic (you can enhance this with AI)
    const suggestions = [
      "Don't check social media for the first hour after waking up",
      "Don't skip meals when busy",
      "Don't procrastinate on important tasks",
      "Don't neglect exercise",
      "Don't stay up too late scrolling",
      "Don't overthink small decisions",
      "Don't compare yourself to others on social media",
      "Don't multitask during focused work time",
    ];

    // Filter out suggestions similar to recent items
    const userContent = recentItems.map((item) => item.content.toLowerCase());
    const filteredSuggestions = suggestions.filter(
      (suggestion) =>
        !userContent.some(
          (content) =>
            content.includes(suggestion.toLowerCase().split(" ")[1]) ||
            suggestion.toLowerCase().includes(content.split(" ")[1]),
        ),
    );

    return { success: true, data: filteredSuggestions.slice(0, 3) };
  });
};

// Achievement definitions
export const ACHIEVEMENT_DEFINITIONS = {
  first_checkin: {
    id: "first_checkin",
    name: "First Steps",
    description: "Complete your first mood check-in",
    icon: "🎯",
    category: "milestone",
    target: 1,
    condition: (stats) => stats.totalCheckins >= 1,
  },
  streak_3: {
    id: "streak_3",
    name: "Getting Started",
    description: "Maintain a 3-day check-in streak",
    icon: "🔥",
    category: "streak",
    target: 3,
    condition: (stats) => stats.currentStreak >= 3,
  },
  streak_7: {
    id: "streak_7",
    name: "Weekly Warrior",
    description: "Maintain a 7-day check-in streak",
    icon: "⚡",
    category: "streak",
    target: 7,
    condition: (stats) => stats.currentStreak >= 7,
  },
  streak_30: {
    id: "streak_30",
    name: "Monthly Master",
    description: "Maintain a 30-day check-in streak",
    icon: "👑",
    category: "streak",
    target: 30,
    condition: (stats) => stats.currentStreak >= 30,
  },
  checkins_10: {
    id: "checkins_10",
    name: "Dedicated Tracker",
    description: "Complete 10 total check-ins",
    icon: "📊",
    category: "milestone",
    target: 10,
    condition: (stats) => stats.totalCheckins >= 10,
  },
  checkins_50: {
    id: "checkins_50",
    name: "Mood Expert",
    description: "Complete 50 total check-ins",
    icon: "🎓",
    category: "milestone",
    target: 50,
    condition: (stats) => stats.totalCheckins >= 50,
  },
  checkins_100: {
    id: "checkins_100",
    name: "Centurion",
    description: "Complete 100 total check-ins",
    icon: "💯",
    category: "milestone",
    target: 100,
    condition: (stats) => stats.totalCheckins >= 100,
  },
  // NEW: Anti-Todo Activity Achievements
  first_antitodo: {
    id: "first_antitodo",
    name: "Mindful Explorer",
    description: "Complete your first wellness activity",
    icon: "🌸",
    category: "wellness",
    target: 1,
    condition: (stats) => stats.completedAntiTodos >= 1,
  },
  antitodo_5: {
    id: "antitodo_5",
    name: "Wellness Enthusiast",
    description: "Complete 5 wellness activities",
    icon: "🌺",
    category: "wellness",
    target: 5,
    condition: (stats) => stats.completedAntiTodos >= 5,
  },
  antitodo_15: {
    id: "antitodo_15",
    name: "Mindfulness Master",
    description: "Complete 15 wellness activities",
    icon: "🧘‍♀️",
    category: "wellness",
    target: 15,
    condition: (stats) => stats.completedAntiTodos >= 15,
  },
  antitodo_30: {
    id: "antitodo_30",
    name: "Zen Warrior",
    description: "Complete 30 wellness activities",
    icon: "🏆",
    category: "wellness",
    target: 30,
    condition: (stats) => stats.completedAntiTodos >= 30,
  },
  wellness_week: {
    id: "wellness_week",
    name: "Weekly Wellness",
    description: "Complete 3 activities in one week",
    icon: "📅",
    category: "wellness",
    target: 3,
    condition: (stats) => stats.weeklyAntiTodos >= 3,
  },
};

// Get user achievements
export const getUserAchievements = async (uid) => {
  return safeSupabaseOperation(async () => {
    const { data, error } = await supabase
      .from("achievements")
      .select("*")
      .eq("user_id", uid);

    if (error) throw error;
    return { success: true, data };
  });
};

// Calculate achievement progress
export const calculateAchievementProgress = (achievementId, stats) => {
  const achievement = ACHIEVEMENT_DEFINITIONS[achievementId];
  if (!achievement) return { progress: 0, target: 1, isUnlocked: false };

  const isUnlocked = achievement.condition(stats);
  let progress = 0;

  switch (achievementId) {
    case "first_checkin":
    case "checkins_10":
    case "checkins_50":
    case "checkins_100":
      progress = Math.min(stats.totalCheckins || 0, achievement.target);
      break;
    case "streak_3":
    case "streak_7":
    case "streak_30":
      progress = Math.min(stats.currentStreak || 0, achievement.target);
      break;
    // NEW: Anti-Todo Achievement Progress
    case "first_antitodo":
    case "antitodo_5":
    case "antitodo_15":
    case "antitodo_30":
      progress = Math.min(stats.completedAntiTodos || 0, achievement.target);
      break;
    case "wellness_week":
      progress = Math.min(stats.weeklyAntiTodos || 0, achievement.target);
      break;
    default:
      progress = 0;
  }

  return {
    progress,
    target: achievement.target,
    isUnlocked,
    percentage: Math.round((progress / achievement.target) * 100),
  };
};

// Check and unlock achievements
export const checkAndUnlockAchievements = async (uid) => {
  return safeSupabaseOperation(async () => {
    // Get user stats
    const analyticsResult = await getUserAnalytics(uid);
    if (!analyticsResult.success)
      return { success: false, newAchievements: [] };

    const stats = analyticsResult.data;
    const newAchievements = [];

    // Get existing achievements
    const existingResult = await getUserAchievements(uid);
    const existingAchievements = existingResult.success
      ? existingResult.data
      : [];
    const existingIds = existingAchievements.map((a) => a.achievement_id);

    // Check each achievement
    for (const [achievementId, achievement] of Object.entries(
      ACHIEVEMENT_DEFINITIONS,
    )) {
      if (!existingIds.includes(achievementId)) {
        const progress = calculateAchievementProgress(achievementId, stats);

        if (progress.isUnlocked) {
          // Unlock the achievement
          const newAchievement = await supabaseHelpers.insert("achievements", {
            user_id: uid,
            achievement_id: achievementId,
            achievement_name: achievement.name,
            achievement_description: achievement.description,
            achievement_icon: achievement.icon,
            achievement_category: achievement.category,
            progress: progress.progress,
            target: progress.target,
            is_unlocked: true,
            unlocked_at: new Date().toISOString(),
          });

          newAchievements.push(newAchievement[0]);
        } else {
          // Create progress record
          await supabaseHelpers.insert("achievements", {
            user_id: uid,
            achievement_id: achievementId,
            achievement_name: achievement.name,
            achievement_description: achievement.description,
            achievement_icon: achievement.icon,
            achievement_category: achievement.category,
            progress: progress.progress,
            target: progress.target,
            is_unlocked: false,
          });
        }
      } else {
        // Update existing achievement progress
        const existing = existingAchievements.find(
          (a) => a.achievement_id === achievementId,
        );
        if (!existing.is_unlocked) {
          const progress = calculateAchievementProgress(achievementId, stats);

          const updateData = {
            progress: progress.progress,
            updated_at: new Date().toISOString(),
          };

          if (progress.isUnlocked) {
            updateData.is_unlocked = true;
            updateData.unlocked_at = new Date().toISOString();
            newAchievements.push({ ...existing, ...updateData });
          }

          await supabaseHelpers.update("achievements", existing.id, updateData);
        }
      }
    }

    return { success: true, newAchievements };
  });
};

// Get achievement stats
export const getAchievementStats = async (uid) => {
  return safeSupabaseOperation(async () => {
    const { data, error } = await supabase
      .from("achievements")
      .select("*")
      .eq("user_id", uid);

    if (error) throw error;

    const totalAchievements = Object.keys(ACHIEVEMENT_DEFINITIONS).length;
    const unlockedAchievements = data.filter((a) => a.is_unlocked).length;
    const completionRate = (unlockedAchievements / totalAchievements) * 100;

    const stats = {
      total: totalAchievements,
      unlocked: unlockedAchievements,
      locked: totalAchievements - unlockedAchievements,
      completionRate: Math.round(completionRate * 100) / 100,
      recentlyUnlocked: data
        .filter((a) => a.is_unlocked)
        .sort((a, b) => new Date(b.unlocked_at) - new Date(a.unlocked_at))
        .slice(0, 3),
    };

    return { success: true, data: stats };
  });
};

// Get all achievement definitions
export const getAllAchievementDefinitions = () => {
  return ACHIEVEMENT_DEFINITIONS;
};

// Upsert user analytics data
const upsertUserAnalytics = async (uid, analyticsData) => {
  return safeSupabaseOperation(async () => {
    console.log("upsertUserAnalytics: Storing analytics for user:", uid, analyticsData);
    
    const { data, error } = await supabase
      .from("user_analytics")
      .upsert(analyticsData, { onConflict: "user_id" })
      .select();

    if (error) {
      console.error("upsertUserAnalytics: Error storing analytics:", error);
      throw error;
    }

    console.log("upsertUserAnalytics: Successfully stored analytics:", data[0]);
    return { success: true, data: data[0] };
  });
};

// Update user analytics after checkin (CRITICAL for dashboard integration)
export const updateUserAnalytics = async (uid) => {
  return safeSupabaseOperation(async () => {
    console.log("=== updateUserAnalytics DEBUG START ===");
    console.log("Updating analytics for user:", uid);
    
    // Get all user checkins to calculate analytics
    const { data: checkins, error: checkinsError } = await supabase
      .from("checkins")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });

    if (checkinsError) throw checkinsError;

    console.log("updateUserAnalytics: Raw checkins data:", checkins);
    console.log("updateUserAnalytics: Number of total checkins:", checkins?.length || 0);

    // Get anti-todo activity stats
    const { data: antiTodoItems, error: antiTodoError } = await supabase
      .from("anti_todo_items")
      .select("*")
      .eq("user_id", uid);

    if (antiTodoError) {
      console.warn("Failed to fetch anti-todo items for analytics:", antiTodoError);
      // Continue without anti-todo stats
    }

    if (!checkins || checkins.length === 0) {
      console.log("updateUserAnalytics: No checkins found for user:", uid);
      
      // Create basic analytics record with just anti-todo stats if available
      const basicAnalytics = {
        user_id: uid,
        total_checkins: 0,
        average_mood_score: 0,
        current_streak: 0,
        weekly_unique_checkin_days: 0,
        weekly_score: 0,
        last_checkin_date: null,
        completedantitodos: antiTodoItems?.filter(item => item.status === 'completed').length || 0,
        weeklyantitodos: 0, // Will calculate this below
        updated_at: new Date().toISOString(),
      };

      // Calculate weekly anti-todo stats
      if (antiTodoItems && antiTodoItems.length > 0) {
        const weekAgoForAntiTodo = new Date();
        weekAgoForAntiTodo.setDate(weekAgoForAntiTodo.getDate() - 7);
        
        basicAnalytics.weeklyantitodos = antiTodoItems.filter(item => 
          item.status === 'completed' && 
          new Date(item.completed_at) >= weekAgoForAntiTodo
        ).length;
      }

      console.log("updateUserAnalytics: Creating basic analytics (no checkins):", basicAnalytics);
      
      // Store basic analytics
      await upsertUserAnalytics(uid, basicAnalytics);
      return { success: true, message: "Basic analytics created with anti-todo stats" };
    }

    console.log("updateUserAnalytics: Processing", checkins.length, "checkins");

    // Calculate analytics from checkins
    const totalCheckins = checkins.length;
    const averageMoodScore =
      checkins.reduce((sum, c) => sum + (c.mood_score || 0), 0) / totalCheckins;
    const averageSentiment =
      checkins.reduce((sum, c) => sum + (c.sentiment_score || 0), 0) /
      totalCheckins;
    const averageAiScore =
      checkins.reduce((sum, c) => sum + (c.ai_score || 0), 0) / totalCheckins;

    // Calculate anti-todo activity stats
    const completedAntiTodos = antiTodoItems?.filter(item => item.status === 'completed').length || 0;
    
    // Calculate weekly anti-todo activities (completed in last 7 days)
    const weekAgoForAntiTodoWeekly = new Date();
    weekAgoForAntiTodoWeekly.setDate(weekAgoForAntiTodoWeekly.getDate() - 7);
    const weeklyAntiTodos = antiTodoItems?.filter(item => 
      item.status === 'completed' && 
      item.completed_at &&
      new Date(item.completed_at) >= weekAgoForAntiTodoWeekly
    ).length || 0;

    // Calculate streak (consecutive days with checkins)
    const today = new Date().toISOString().split("T")[0];
    const checkinDates = [...new Set(checkins.map((c) => c.checkin_date))]
      .sort()
      .reverse();
    console.log("updateUserAnalytics: Unique checkin dates (sorted desc):", checkinDates);
    console.log("updateUserAnalytics: Today's date:", today);

    let currentStreak = 0;
    let checkDate = new Date();

    for (let i = 0; i < checkinDates.length; i++) {
      const dateStr = checkDate.toISOString().split("T")[0];
      if (checkinDates.includes(dateStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (i === 0 && dateStr !== today) {
        // If today has no checkin, streak is 0
        break;
      } else {
        break;
      }
    }

    console.log("updateUserAnalytics: Calculated streak:", currentStreak);

    // Calculate weekly unique check-in days - DETAILED DEBUG
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    const weekAgoForCheckins = new Date();
    weekAgoForCheckins.setDate(weekAgoForCheckins.getDate() - 6); // Last 7 days including today
    const weekAgoDateStr = weekAgoForCheckins.toISOString().split("T")[0];
    
    console.log("=== WEEKLY CALCULATION DEBUG ===");
    console.log("Current date:", todayStr);
    console.log("Week ago date (inclusive):", weekAgoDateStr);
    console.log("Date range for weekly calculation:", weekAgoDateStr, "to", todayStr);
    
    console.log("All checkin dates from DB:", checkins.map(c => ({
      id: c.id,
      checkin_date: c.checkin_date,
      created_at: c.created_at
    })));
    
    const recentCheckins = checkins.filter(
      (c) => c.checkin_date >= weekAgoDateStr, // Use checkin_date instead of created_at
    );
    
    console.log("Filtered recent checkins:", recentCheckins.map(c => ({
      id: c.id,
      checkin_date: c.checkin_date,
      passes_filter: c.checkin_date >= weekAgoDateStr
    })));
    
    const weeklyCheckinDates = recentCheckins.map((c) => c.checkin_date);
    console.log("Weekly checkin dates (before unique):", weeklyCheckinDates);
    
    const uniqueWeeklyDates = [...new Set(weeklyCheckinDates)];
    console.log("Unique weekly checkin dates:", uniqueWeeklyDates);
    
    const weeklyUniqueCheckinDays = uniqueWeeklyDates.length;
    console.log("Final weekly unique checkin days count:", weeklyUniqueCheckinDays);
    console.log("=== WEEKLY CALCULATION DEBUG END ===");

    const analyticsData = {
      user_id: uid,
      total_checkins: totalCheckins,
      average_mood_score: Math.round(averageMoodScore * 100) / 100,
      overall_average_sentiment: Math.round(averageSentiment * 100) / 100,
      current_ai_score: Math.round(averageAiScore * 100) / 100,
      current_streak: currentStreak,
      weekly_unique_checkin_days: weeklyUniqueCheckinDays,
      last_checkin_date: checkins[0]?.checkin_date || null,
      completedantitodos: completedAntiTodos,
      weeklyantitodos: weeklyAntiTodos,
      weekly_score: weeklyUniqueCheckinDays, // Set weekly_score to the count of unique checkin days
      updated_at: new Date().toISOString(),
    };

    console.log("updateUserAnalytics: Final analytics data to store:", analyticsData);

    // Store analytics using upsert
    const result = await upsertUserAnalytics(uid, analyticsData);
    console.log("updateUserAnalytics: Analytics storage result:", result);
    console.log("=== updateUserAnalytics DEBUG END ===");

    return { success: true, data: analyticsData };
  });
};

// Initialize user achievements
export const initializeUserAchievements = async (uid) => {
  return safeSupabaseOperation(async () => {
    const existingResult = await getUserAchievements(uid);
    const existingAchievements = existingResult.success
      ? existingResult.data
      : [];
    const existingIds = existingAchievements.map((a) => a.achievement_id);

    const achievementsToCreate = [];

    for (const [achievementId, achievement] of Object.entries(
      ACHIEVEMENT_DEFINITIONS,
    )) {
      if (!existingIds.includes(achievementId)) {
        achievementsToCreate.push({
          user_id: uid,
          achievement_id: achievementId,
          achievement_name: achievement.name,
          achievement_description: achievement.description,
          achievement_icon: achievement.icon,
          achievement_category: achievement.category,
          progress: 0,
          target: achievement.target,
          is_unlocked: false,
          created_at: new Date().toISOString(),
        });
      }
    }

    if (achievementsToCreate.length > 0) {
      const data = await supabaseHelpers.insert(
        "achievements",
        achievementsToCreate,
      );
      return { success: true, data };
    }

    return { success: true, data: [] };
  });
};

// Initialize or update user analytics for existing users
export const initializeOrUpdateUserAnalytics = async (uid) => {
  return safeSupabaseOperation(async () => {
    console.log("Initializing/updating analytics for user:", uid);
    
    // Check if user analytics record exists
    const { data: existingAnalytics, error: fetchError } = await supabase
      .from("user_analytics")
      .select("*")
      .eq("user_id", uid)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Error fetching existing analytics:", fetchError);
      throw fetchError;
    }

    if (!existingAnalytics) {
      console.log("No analytics record found, creating new one");
      // Create new analytics record with all required fields
      const newAnalytics = {
        user_id: uid,
        daily_checkin_counter: 0,
        total_checkins: 0,
        current_ai_score: 0,
        today_average_sentiment: 0,
        overall_average_sentiment: 0,
        average_mood_score: 0,
        current_streak: 0,
        weekly_unique_checkin_days: 0,
        weekly_score: 0,
        completedantitodos: 0,
        weeklyantitodos: 0,
        last_checkin_date: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const result = await upsertUserAnalytics(uid, newAnalytics);
      
      // Now update with real data
      await updateUserAnalytics(uid);
      
      return result;
    } else {
      console.log("Analytics record exists, ensuring all fields are present");
      
      // Check if new fields are missing and update if needed
      const needsUpdate = 
        existingAnalytics.weekly_unique_checkin_days === null ||
        existingAnalytics.weekly_unique_checkin_days === undefined ||
        existingAnalytics.weekly_score === null ||
        existingAnalytics.weekly_score === undefined ||
        existingAnalytics.completedantitodos === null ||
        existingAnalytics.completedantitodos === undefined ||
        existingAnalytics.weeklyantitodos === null ||
        existingAnalytics.weeklyantitodos === undefined;

      if (needsUpdate) {
        console.log("Updating analytics with missing fields");
        await updateUserAnalytics(uid);
      }
      
      return { success: true, data: existingAnalytics };
    }
  });
};

// =================
// GAMIFICATION SYSTEM
// =================

// Point System Functions
export const getUserPoints = async (userId) => {
  return safeSupabaseOperation(async () => {
    const { data, error } = await supabase
      .from("user_points")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error;
    }

    // Create points record if none exists
    if (!data) {
      const { data: newPoints, error: createError } = await supabase
        .from("user_points")
        .insert({
          user_id: userId,
          total_points: 0,
          total_earned: 0,
          total_spent: 0
        })
        .select()
        .single();

      if (createError) throw createError;
      return { success: true, data: newPoints };
    }

    return { success: true, data };
  });
};

export const awardPoints = async (userId, points, sourceType, sourceId = null, description = null) => {
  return safeSupabaseOperation(async () => {
    const { data, error } = await supabase.rpc('award_user_points', {
      p_user_id: userId,
      p_points: points,
      p_source_type: sourceType,
      p_source_id: sourceId,
      p_description: description
    });

    if (error) throw error;
    return { success: true, data };
  });
};

export const spendPoints = async (userId, points, sourceType, sourceId = null, description = null) => {
  return safeSupabaseOperation(async () => {
    const { data, error } = await supabase.rpc('spend_user_points', {
      p_user_id: userId,
      p_points: points,
      p_source_type: sourceType,
      p_source_id: sourceId,
      p_description: description
    });

    if (error) throw error;
    return { success: true, data };
  });
};

export const getPointTransactions = async (userId, limit = 20) => {
  return safeSupabaseOperation(async () => {
    const { data, error } = await supabase
      .from("point_transactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return { success: true, data };
  });
};

// Plant System Functions
export const getUserPlant = async (userId) => {
  return safeSupabaseOperation(async () => {
    const { data, error } = await supabase
      .from("user_plants")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    // Create a new plant if none exists
    if (!data) {
      const newPlant = await createNewPlant(userId);
      return newPlant;
    }

    return { success: true, data };
  });
};

export const createNewPlant = async (userId, plantName = "My Plant", plantType = "basic_seed") => {
  return safeSupabaseOperation(async () => {
    // First, deactivate any existing active plants
    await supabase
      .from("user_plants")
      .update({ is_active: false })
      .eq("user_id", userId)
      .eq("is_active", true);

    // Create new plant
    const { data, error } = await supabase
      .from("user_plants")
      .insert({
        user_id: userId,
        plant_name: plantName,
        plant_type: plantType,
        growth_level: 1,
        growth_xp: 0,
        growth_xp_required: 100,
        is_active: true
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  });
};

export const updatePlantGrowth = async (plantId, xpGain) => {
  return safeSupabaseOperation(async () => {
    // Get current plant data
    const { data: plant, error: fetchError } = await supabase
      .from("user_plants")
      .select("*")
      .eq("id", plantId)
      .single();

    if (fetchError) throw fetchError;

    let newXp = plant.growth_xp + xpGain;
    let newLevel = plant.growth_level;
    let newXpRequired = plant.growth_xp_required;

    // Check for level ups (handle any level, but cap at 4 for display)
    while (newXp >= newXpRequired && newLevel < 10) {
      newXp -= newXpRequired;
      newLevel++;
      newXpRequired = Math.floor(newXpRequired * 1.5); // Increase XP requirement by 50% each level
    }
    
    // Cap the level at 4 for display purposes (since schema only allows 1-4)
    const displayLevel = Math.min(newLevel, 4);

    // Update plant
    const { data, error } = await supabase
      .from("user_plants")
      .update({
        growth_xp: newXp,
        growth_level: displayLevel, // Use capped level for database
        growth_xp_required: newXpRequired,
        updated_at: new Date().toISOString()
      })
      .eq("id", plantId)
      .select()
      .single();

    if (error) throw error;

    // Check if plant is fully grown (when it reaches level 4)
    let completedPlant = null;
    if (displayLevel === 4 && plant.growth_level < 4) {
      // Move to history and create new plant
      completedPlant = await completePlant(plant.user_id, data);
    }

    return { 
      success: true, 
      data,
      leveledUp: newLevel > plant.growth_level,
      oldLevel: plant.growth_level,
      newLevel,
      completedPlant
    };
  });
};

export const completePlant = async (userId, plantData) => {
  return safeSupabaseOperation(async () => {
    // Calculate growth duration
    const growthDuration = new Date() - new Date(plantData.created_at);
    
    // Move to history
    const { data: historyEntry, error: historyError } = await supabase
      .from("plant_history")
      .insert({
        user_id: userId,
        plant_name: plantData.plant_name,
        plant_type: plantData.plant_type,
        final_growth_level: plantData.growth_level,
        final_decorations: plantData.decorations,
        growth_duration: growthDuration,
        total_care_actions: 0 // TODO: Track this
      })
      .select()
      .single();

    if (historyError) throw historyError;

    // Create new plant
    const newPlantResult = await createNewPlant(userId, "My New Plant", "basic_seed");
    
    // Award points for completing a plant
    try {
      const completionPoints = 50; // Points for completing a plant
      const pointsResult = await awardPoints(
        userId, 
        completionPoints, 
        'achievement', 
        historyEntry.id, 
        `Completed plant: ${plantData.plant_name}`
      );
      
      if (pointsResult.success) {
        console.log(`Awarded ${completionPoints} points for plant completion`);
      }
    } catch (pointsError) {
      console.error("Failed to award points for plant completion:", pointsError);
    }
    
    return { 
      success: true, 
      completedPlant: historyEntry,
      newPlant: newPlantResult.data
    };
  });
};

export const waterPlant = async (plantId, userId) => {
  return safeSupabaseOperation(async () => {
    // Add growth XP directly
    const growthResult = await updatePlantGrowth(plantId, 10);
    
    return { 
      success: true, 
      data: growthResult.data,
      ...growthResult
    };
  });
};

export const fertilizePlant = async (plantId, userId, fertilizerValue = 25) => {
  return safeSupabaseOperation(async () => {
    // Add significant growth XP directly
    const growthResult = await updatePlantGrowth(plantId, fertilizerValue);
    
    return { 
      success: true, 
      data: growthResult.data,
      ...growthResult
    };
  });
};

// Plant Store Functions
export const getStoreItems = async () => {
  return safeSupabaseOperation(async () => {
    const { data, error } = await supabase
      .from("plant_store_items")
      .select("*")
      .order("price", { ascending: true });

    if (error) throw error;
    return { success: true, data };
  });
};

export const purchaseStoreItem = async (userId, itemId) => {
  return safeSupabaseOperation(async () => {
    // Get item details
    const { data: item, error: itemError } = await supabase
      .from("plant_store_items")
      .select("*")
      .eq("id", itemId)
      .single();

    if (itemError) throw itemError;

    const totalCost = item.price;

    // Check if user has enough points
    const pointsResult = await getUserPoints(userId);
    if (!pointsResult.success || pointsResult.data.total_points < totalCost) {
      return { success: false, error: "Insufficient points" };
    }

    // Spend points
    const spendResult = await spendPoints(userId, totalCost, 'store_purchase', itemId, `Purchased ${item.name}`);
    if (!spendResult.success) {
      return spendResult;
    }

    // Record purchase
    const { data, error } = await supabase
      .from("user_store_purchases")
      .insert({
        user_id: userId,
        item_id: itemId
      })
      .select()
      .single();

    if (error) throw error;

    return { 
      success: true, 
      data: {
        purchase: data,
        item,
        remainingPoints: spendResult.data.new_total
      }
    };
  });
};

export const getUserInventory = async (userId) => {
  return safeSupabaseOperation(async () => {
    const { data, error } = await supabase
      .from("user_store_purchases")
      .select(`
        *,
        plant_store_items (*)
      `)
      .eq("user_id", userId)
      .eq("is_used", false) // Only unused items
      .order("purchased_at", { ascending: false });

    if (error) throw error;
    return { success: true, data };
  });
};

export const useInventoryItem = async (userId, purchaseId, plantId) => {
  return safeSupabaseOperation(async () => {
    // Get purchase details
    const { data: purchase, error: purchaseError } = await supabase
      .from("user_store_purchases")
      .select(`
        *,
        plant_store_items (*)
      `)
      .eq("id", purchaseId)
      .eq("user_id", userId)
      .single();

    if (purchaseError) throw purchaseError;

    if (purchase.is_used) {
      return { success: false, error: "Item already used" };
    }

    const item = purchase.plant_store_items;
    let result = { success: true };

    // Apply item effect based on item_type
    switch (item.item_type) {
      case 'water':
        result = await waterPlant(plantId, userId);
        break;
      case 'fertilizer':
        result = await fertilizePlant(plantId, userId, item.effect_value);
        break;
      case 'decoration':
        // Add decoration to plant
        const { data: plant, error: plantError } = await supabase
          .from("user_plants")
          .select("decorations")
          .eq("id", plantId)
          .single();

        if (plantError) throw plantError;

        const decorations = plant.decorations || [];
        decorations.push({
          id: item.id,
          name: item.name,
          icon: item.icon,
          addedAt: new Date().toISOString()
        });

        const { data: updatedPlant, error: updateError } = await supabase
          .from("user_plants")
          .update({ decorations })
          .eq("id", plantId)
          .select()
          .single();

        if (updateError) throw updateError;
        result = { success: true, data: updatedPlant };
        break;
    }

    if (result.success) {
      // Mark item as used
      await supabase
        .from("user_store_purchases")
        .update({ 
          is_used: true,
          used_at: new Date().toISOString()
        })
        .eq("id", purchaseId);
    }

    return result;
  });
};

export const getPlantHistory = async (userId) => {
  return safeSupabaseOperation(async () => {
    const { data, error } = await supabase
      .from("plant_history")
      .select("*")
      .eq("user_id", userId)
      .order("completion_date", { ascending: false });

    if (error) throw error;
    return { success: true, data };
  });
};

// Reset plant to level 1 for testing
export const resetPlantToLevel1 = async (userId) => {
  return safeSupabaseOperation(async () => {
    const { data, error } = await supabase
      .from("user_plants")
      .update({
        growth_level: 1,
        growth_xp: 0,
        growth_xp_required: 100,
        updated_at: new Date().toISOString()
      })
      .eq("user_id", userId)
      .eq("is_active", true)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  });
};
