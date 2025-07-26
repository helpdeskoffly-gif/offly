import { supabase } from "../supabase";
import { openaiService } from "./openai";

// Validation helper
const validateSupabase = () => {
  if (!supabase) {
    throw new Error("Supabase client not initialized");
  }
  return true;
};

// Safe Supabase operation wrapper
const safeSupabaseOperation = async (operation, fallback = null) => {
  try {
    validateSupabase();
    const result = await operation();
    return result;
  } catch (error) {
    console.error("Supabase operation failed:", error);

    if (fallback !== null) {
      console.warn("Using fallback data due to Supabase error");
      return fallback;
    }

    throw error;
  }
};

class NotificationService {
  constructor() {
    this.listeners = [];
  }

  // Event listener system
  addListener(listener) {
    this.listeners.push(listener);
  }

  removeListener(listener) {
    this.listeners = this.listeners.filter((l) => l !== listener);
  }

  notifyListeners(data) {
    this.listeners.forEach((listener) => {
      try {
        listener(data);
      } catch (error) {
        console.error("Error notifying listener:", error);
      }
    });
  }

  async createNotification(userId, notificationData) {
    return safeSupabaseOperation(
      async () => {
        if (!userId) {
          throw new Error("User ID is required");
        }
        if (!notificationData?.title || !notificationData?.message) {
          throw new Error("Title and message are required");
        }

        const notification = {
          user_id: userId,
          title: notificationData.title,
          message: notificationData.message,
          type: notificationData.type || "info",
          priority: notificationData.priority || "normal",
          read: false,
          dismissed: false,
          created_at: new Date().toISOString(),
          expires_at: notificationData.expiresAt || null,
          data: notificationData.data || null,
        };

        // First, try to create notifications table if it doesn't exist
        const { data, error } = await supabase
          .from("notifications")
          .insert([notification])
          .select();

        if (error) {
          // If table doesn't exist, create it dynamically
          if (error.code === "42P01") {
            await this.createNotificationsTable();
            // Retry the insert
            const { data: retryData, error: retryError } = await supabase
              .from("notifications")
              .insert([notification])
              .select();

            if (retryError) throw retryError;

            this.notifyListeners({
              type: "notification_created",
              data: retryData[0],
            });
            return { success: true, data: retryData[0] };
          }
          throw error;
        }

        this.notifyListeners({ type: "notification_created", data: data[0] });
        return { success: true, data: data[0] };
      },
      {
        success: false,
        error: "Failed to create notification - Supabase unavailable",
      },
    );
  }

  async createNotificationsTable() {
    const { error } = await supabase.rpc("create_notifications_table");
    if (error && !error.message.includes("already exists")) {
      console.error("Failed to create notifications table:", error);
    }
  }

  async getUserNotifications(userId, includeRead = true, limitCount = 50) {
    return safeSupabaseOperation(
      async () => {
        if (!userId) {
          throw new Error("User ID is required");
        }

        let query = supabase
          .from("notifications")
          .select("*")
          .eq("user_id", userId)
          .eq("dismissed", false)
          .or("expires_at.is.null,expires_at.gt." + new Date().toISOString())
          .order("created_at", { ascending: false })
          .limit(limitCount);

        if (!includeRead) {
          query = query.eq("read", false);
        }

        const { data, error } = await query;

        if (error) {
          // If table doesn't exist, return empty array
          if (error.code === "42P01") {
            return { success: true, data: [] };
          }
          throw error;
        }

        // Filter out expired notifications
        const validNotifications = data.filter((notification) => {
          if (!notification.expires_at) return true;
          return new Date(notification.expires_at) > new Date();
        });

        return { success: true, data: validNotifications };
      },
      { success: true, data: [] },
    );
  }

  async markAsRead(userId, notificationId) {
    return safeSupabaseOperation(
      async () => {
        if (!userId || !notificationId) {
          throw new Error("User ID and notification ID are required");
        }

        const { data, error } = await supabase
          .from("notifications")
          .update({ read: true, updated_at: new Date().toISOString() })
          .eq("id", notificationId)
          .eq("user_id", userId)
          .select();

        if (error) throw error;

        if (data && data.length > 0) {
          this.notifyListeners({ type: "notification_read", data: data[0] });
        }

        return { success: true, data: data[0] };
      },
      {
        success: false,
        error: "Failed to mark notification as read - Supabase unavailable",
      },
    );
  }

  async dismissNotification(userId, notificationId) {
    return safeSupabaseOperation(
      async () => {
        if (!userId || !notificationId) {
          throw new Error("User ID and notification ID are required");
        }

        const { data, error } = await supabase
          .from("notifications")
          .update({ dismissed: true, updated_at: new Date().toISOString() })
          .eq("id", notificationId)
          .eq("user_id", userId)
          .select();

        if (error) throw error;

        if (data && data.length > 0) {
          this.notifyListeners({
            type: "notification_dismissed",
            data: data[0],
          });
        }

        return { success: true, data: data[0] };
      },
      {
        success: false,
        error: "Failed to dismiss notification - Supabase unavailable",
      },
    );
  }

  async clearAllNotifications(userId) {
    return safeSupabaseOperation(
      async () => {
        if (!userId) {
          throw new Error("User ID is required");
        }

        // Clear all notifications except persistent profile completion ones
        const { error } = await supabase
          .from("notifications")
          .update({ dismissed: true, updated_at: new Date().toISOString() })
          .eq("user_id", userId)
          .eq("dismissed", false)
          .neq("type", "profile_completion"); // Don't clear profile completion notifications

        if (error) throw error;

        this.notifyListeners({ type: "all_notifications_cleared", userId });
        return { success: true };
      },
      {
        success: false,
        error: "Failed to clear notifications - Supabase unavailable",
      },
    );
  }

  // Clear profile completion notification specifically
  async clearProfileCompletionNotification(userId) {
    return safeSupabaseOperation(
      async () => {
        if (!userId) {
          throw new Error("User ID is required");
        }

        const { error } = await supabase
          .from("notifications")
          .update({ dismissed: true, updated_at: new Date().toISOString() })
          .eq("user_id", userId)
          .eq("type", "profile_completion")
          .eq("dismissed", false);

        if (error) throw error;

        this.notifyListeners({ type: "profile_notification_cleared", userId });
        return { success: true };
      },
      {
        success: false,
        error: "Failed to clear profile notification - Supabase unavailable",
      },
    );
  }

  async generateDailyNudge(userId, userProfile, checkinHistory = []) {
    try {
      if (!userId || !userProfile) {
        throw new Error("User ID and profile are required");
      }

      const today = new Date().toISOString().split("T")[0];
      const hasCheckedInToday = checkinHistory.some(
        (checkin) => checkin.checkin_date === today,
      );

      if (hasCheckedInToday) {
        console.log("User has already checked in today, skipping nudge");
        return {
          success: true,
          skipped: true,
          reason: "Already checked in today",
        };
      }

      // Generate AI-powered nudge message
      const nudgePrompt = `Create a gentle, encouraging daily check-in reminder for ${userProfile.username}.
      Current streak: ${userProfile.currentStreak} days.
      Total check-ins: ${userProfile.totalCheckins}.
      Keep it under 100 characters and make it personal and motivating.`;

      const aiResponse = await openaiService.generateResponse(nudgePrompt);
      const nudgeMessage = aiResponse.success
        ? aiResponse.response
        : `Time for your daily check-in, ${userProfile.username}! Keep your ${userProfile.currentStreak}-day streak going! 🌟`;

      return await this.createNotification(userId, {
        title: "Daily Check-in Reminder",
        message: nudgeMessage,
        type: "daily_nudge",
        priority: "normal",
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Expires in 24 hours
      });
    } catch (error) {
      console.error("Error generating daily nudge:", error);
      return { success: false, error: error.message };
    }
  }

  async generateWeeklyInsights(userId, userProfile, weeklyData = []) {
    try {
      if (!userId || !userProfile) {
        throw new Error("User ID and profile are required");
      }

      if (weeklyData.length === 0) {
        console.log("No weekly data available for insights");
        return { success: true, skipped: true, reason: "No data available" };
      }

      const insights = this.calculateWeeklyProgress(weeklyData);
      const insightMessage = this.generateInsightMessage(
        userProfile.username,
        insights,
      );

      return await this.createNotification(userId, {
        title: "Weekly Insights Ready! 📊",
        message: insightMessage,
        type: "weekly_insights",
        priority: "normal",
        data: insights,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Expires in 7 days
      });
    } catch (error) {
      console.error("Error generating weekly insights:", error);
      return { success: false, error: error.message };
    }
  }

  calculateWeeklyProgress(weeklyData) {
    const totalCheckins = weeklyData.length;
    const averageMood =
      weeklyData.reduce((sum, checkin) => sum + checkin.mood_score, 0) /
      totalCheckins;
    const averageSentiment =
      weeklyData.reduce(
        (sum, checkin) => sum + (checkin.sentiment_score || 0),
        0,
      ) / totalCheckins;

    const moodTrend = this.calculateTrend(weeklyData.map((c) => c.mood_score));
    const sentimentTrend = this.calculateTrend(
      weeklyData.map((c) => c.sentiment_score || 0),
    );

    return {
      totalCheckins,
      averageMood: Math.round(averageMood * 10) / 10,
      averageSentiment: Math.round(averageSentiment * 10) / 10,
      moodTrend,
      sentimentTrend,
      weekRange: {
        start: weeklyData[weeklyData.length - 1]?.checkin_date,
        end: weeklyData[0]?.checkin_date,
      },
    };
  }

  calculateTrend(values) {
    if (values.length < 2) return "stable";

    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));

    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    const difference = secondAvg - firstAvg;

    if (difference > 0.5) return "improving";
    if (difference < -0.5) return "declining";
    return "stable";
  }

  generateInsightMessage(username, insights) {
    const { averageMood, moodTrend, totalCheckins } = insights;

    const trendEmoji = {
      improving: "📈",
      declining: "📉",
      stable: "➡️",
    };

    return `${username}, you logged ${totalCheckins} check-ins this week! Your average mood was ${averageMood}/10 ${trendEmoji[moodTrend]}. ${this.generateSuggestions(insights)}`;
  }

  generateSuggestions(insights) {
    const { moodTrend, averageMood } = insights;

    if (moodTrend === "improving") {
      return "Keep up the great momentum! 🌟";
    } else if (moodTrend === "declining") {
      return "Consider what self-care activities might help boost your mood. 💙";
    } else if (averageMood >= 7) {
      return "You're maintaining great emotional balance! 🎯";
    } else {
      return "Small steps towards better days ahead. You've got this! 💪";
    }
  }

  async checkMissedCheckIns(userId, userProfile) {
    try {
      if (!userId || !userProfile) {
        throw new Error("User ID and profile are required");
      }

      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

      // Check if user has missed yesterday's check-in
      const { data: yesterdayCheckins } = await supabase
        .from("checkins")
        .select("*")
        .eq("user_id", userId)
        .eq("checkin_date", yesterday);

      if (!yesterdayCheckins || yesterdayCheckins.length === 0) {
        // User missed yesterday's check-in
        const currentHour = new Date().getHours();

        // Only send reminder after 10 AM to avoid early morning notifications
        if (currentHour >= 10) {
          return await this.createNotification(userId, {
            title: "Don't lose your streak! 🔥",
            message: `${userProfile.username}, you missed yesterday's check-in. Today is a fresh start!`,
            type: "missed_checkin",
            priority: "normal",
          });
        }
      }

      return { success: true, skipped: true, reason: "No missed check-ins" };
    } catch (error) {
      console.error("Error checking missed check-ins:", error);
      return { success: false, error: error.message };
    }
  }

  async getNotificationCount(userId) {
    return safeSupabaseOperation(
      async () => {
        if (!userId) {
          throw new Error("User ID is required");
        }

        const { data, error } = await supabase
          .from("notifications")
          .select("id", { count: "exact" })
          .eq("user_id", userId)
          .eq("read", false)
          .eq("dismissed", false)
          .or("expires_at.is.null,expires_at.gt." + new Date().toISOString());

        if (error) {
          if (error.code === "42P01") {
            return { success: true, count: 0 };
          }
          throw error;
        }

        return { success: true, count: data?.length || 0 };
      },
      {
        success: false,
        error: "Failed to get notification count - Supabase unavailable",
        count: 0,
      },
    );
  }

  async sendCelebrationNotification(userId, userProfile, achievement) {
    try {
      if (!userId || !userProfile || !achievement) {
        throw new Error("User ID, profile, and achievement data are required");
      }

      const celebrationMessage = this.generateCelebrationMessage(
        userProfile,
        achievement,
      );

      return await this.createNotification(userId, {
        title: "🎉 Achievement Unlocked!",
        message: celebrationMessage,
        type: "achievement",
        priority: "high",
        data: {
          achievementId: achievement.id,
          achievementName: achievement.name,
          achievementIcon: achievement.icon,
        },
      });
    } catch (error) {
      console.error("Error sending celebration notification:", error);
      return { success: false, error: error.message };
    }
  }

  generateCelebrationMessage(userProfile, achievement) {
    const messages = [
      `Congratulations ${userProfile.username}! You've unlocked "${achievement.name}"! 🌟`,
      `Amazing work, ${userProfile.username}! "${achievement.name}" achievement earned! 🏆`,
      `Well done ${userProfile.username}! You've achieved "${achievement.name}"! 🎯`,
    ];

    return messages[Math.floor(Math.random() * messages.length)];
  }

  // Periodic notification check system
  intervalId = null;

  startPeriodicCheck(userId, userProfile, intervalMinutes = 60) {
    try {
      if (this.intervalId) {
        this.stopPeriodicCheck();
      }

      console.log(
        `Starting periodic notification checks every ${intervalMinutes} minutes`,
      );

      this.intervalId = setInterval(
        async () => {
          try {
            // Check for missed check-ins
            await this.checkMissedCheckIns(userId, userProfile);

            // Generate daily nudge if needed (only once per day)
            const now = new Date();
            if (now.getHours() === 9 && now.getMinutes() < intervalMinutes) {
              await this.generateDailyNudge(userId, userProfile);
            }
          } catch (error) {
            console.error("Error in periodic notification check:", error);
          }
        },
        intervalMinutes * 60 * 1000,
      );
    } catch (error) {
      console.error("Failed to start periodic checks:", error);
    }
  }

  stopPeriodicCheck() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log("Stopped periodic notification checks");
    }
  }

  async cleanupExpiredNotifications() {
    return safeSupabaseOperation(
      async () => {
        const now = new Date().toISOString();

        const { error } = await supabase
          .from("notifications")
          .delete()
          .lt("expires_at", now)
          .not("expires_at", "is", null);

        if (error) throw error;

        console.log("Cleaned up expired notifications");
        return { success: true };
      },
      { success: false, error: "Failed to cleanup expired notifications" },
    );
  }

  // Manual trigger for daily notifications (for testing)
  async triggerDailyNotifications() {
    return safeSupabaseOperation(
      async () => {
        const { data, error } = await supabase.rpc('create_daily_notifications');
        
        if (error) throw error;
        
        console.log(`Created ${data} daily notifications`);
        return { success: true, count: data };
      },
      {
        success: false,
        error: "Failed to trigger daily notifications",
        count: 0
      }
    );
  }

  // Manual trigger for weekly notifications (for testing)
  async triggerWeeklyNotifications() {
    return safeSupabaseOperation(
      async () => {
        const { data, error } = await supabase.rpc('create_weekly_progress_notifications');
        
        if (error) throw error;
        
        console.log(`Created ${data} weekly notifications`);
        return { success: true, count: data };
      },
      {
        success: false,
        error: "Failed to trigger weekly notifications",
        count: 0
      }
    );
  }

  // Create a test notification for debugging
  async createTestNotification(userId) {
    const testMessages = [
      "🌟 Good morning! Ready to make today amazing? Your wellness journey continues with every small step.",
      "☀️ Time for your daily check-in! How are you feeling today? Every moment of self-reflection matters.",
      "🚀 You're building incredible habits! Take a moment to check in and celebrate your progress.",
      "💫 Your future self will thank you for the wellness habits you're building today. How's your mood?",
      "🌈 A new day, a fresh opportunity to nurture your well-being. Ready for your check-in?"
    ];

    const randomMessage = testMessages[Math.floor(Math.random() * testMessages.length)];

    return this.createNotification(userId, {
      title: "🌅 Daily Wellness Check-in",
      message: randomMessage,
      type: "daily_nudge",
      priority: "normal",
      data: { isTest: true, createdAt: new Date().toISOString() }
    });
  }
}

// Create and export singleton instance
const notificationService = new NotificationService();
export { notificationService };
export default notificationService;
