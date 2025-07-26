import { supabase } from "../supabase";
import { notificationService } from "./notifications";

class DailyNotificationScheduler {
  constructor() {
    this.isRunning = false;
    this.intervalId = null;
  }

  // Check if it's time to send daily notifications (4 AM local time)
  shouldSendDailyNotifications() {
    const now = new Date();
    const hour = now.getHours();
    
    // Check if it's between 4:00 AM and 4:59 AM
    return hour === 4;
  }

  // Check if it's time to send weekly notifications (Sunday 9 AM)
  shouldSendWeeklyNotifications() {
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay(); // 0 = Sunday
    
    // Check if it's Sunday between 9:00 AM and 9:59 AM
    return dayOfWeek === 0 && hour === 9;
  }

  // Get the last time notifications were sent
  async getLastNotificationTime(type) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('created_at')
        .eq('type', type)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;
      
      return data.length > 0 ? new Date(data[0].created_at) : null;
    } catch (error) {
      console.error(`Error getting last ${type} notification time:`, error);
      return null;
    }
  }

  // Check if notifications were already sent today
  async shouldSkipToday(type) {
    const lastTime = await this.getLastNotificationTime(type);
    if (!lastTime) return false;

    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    return lastTime >= todayStart;
  }

  // Trigger daily notifications via SQL function
  async triggerDailyNotifications() {
    try {
      console.log('Triggering daily notifications...');
      
      const shouldSkip = await this.shouldSkipToday('daily_nudge');
      if (shouldSkip) {
        console.log('Daily notifications already sent today, skipping...');
        return { success: true, skipped: true };
      }

      const result = await notificationService.triggerDailyNotifications();
      
      if (result.success) {
        console.log(`✅ Created ${result.count} daily notifications`);
      } else {
        console.error('Failed to trigger daily notifications:', result.error);
      }
      
      return result;
    } catch (error) {
      console.error('Error triggering daily notifications:', error);
      return { success: false, error: error.message };
    }
  }

  // Trigger weekly notifications via SQL function
  async triggerWeeklyNotifications() {
    try {
      console.log('Triggering weekly notifications...');
      
      const shouldSkip = await this.shouldSkipToday('weekly_insights');
      if (shouldSkip) {
        console.log('Weekly notifications already sent today, skipping...');
        return { success: true, skipped: true };
      }

      const result = await notificationService.triggerWeeklyNotifications();
      
      if (result.success) {
        console.log(`✅ Created ${result.count} weekly notifications`);
      } else {
        console.error('Failed to trigger weekly notifications:', result.error);
      }
      
      return result;
    } catch (error) {
      console.error('Error triggering weekly notifications:', error);
      return { success: false, error: error.message };
    }
  }

  // Check and send notifications if needed
  async checkAndSendNotifications() {
    try {
      // Check for daily notifications
      if (this.shouldSendDailyNotifications()) {
        await this.triggerDailyNotifications();
      }

      // Check for weekly notifications  
      if (this.shouldSendWeeklyNotifications()) {
        await this.triggerWeeklyNotifications();
      }
    } catch (error) {
      console.error('Error in checkAndSendNotifications:', error);
    }
  }

  // Start the scheduler (check every hour)
  start() {
    if (this.isRunning) {
      console.log('Notification scheduler is already running');
      return;
    }

    console.log('🔔 Starting notification scheduler...');
    this.isRunning = true;

    // Check immediately
    this.checkAndSendNotifications();

    // Then check every hour
    this.intervalId = setInterval(() => {
      this.checkAndSendNotifications();
    }, 60 * 60 * 1000); // Every hour
  }

  // Stop the scheduler
  stop() {
    if (!this.isRunning) {
      console.log('Notification scheduler is not running');
      return;
    }

    console.log('🛑 Stopping notification scheduler...');
    this.isRunning = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  // Manual trigger for testing
  async manualTrigger(type = 'daily') {
    if (type === 'daily') {
      return await this.triggerDailyNotifications();
    } else if (type === 'weekly') {
      return await this.triggerWeeklyNotifications();
    } else {
      return { success: false, error: 'Invalid notification type' };
    }
  }
}

// Export singleton instance
export const dailyNotificationScheduler = new DailyNotificationScheduler();

// For testing and manual triggers
export const testNotifications = {
  createDaily: () => dailyNotificationScheduler.manualTrigger('daily'),
  createWeekly: () => dailyNotificationScheduler.manualTrigger('weekly'),
  start: () => dailyNotificationScheduler.start(),
  stop: () => dailyNotificationScheduler.stop()
}; 