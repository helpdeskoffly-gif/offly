// Debug and test functions for achievements and points system
// Add these functions to your database.js file or create a separate debug file

import { supabase } from "../supabase";

export const debugAchievementsAndPoints = async (userId) => {
  console.log('🔍 DEBUG: Checking achievements and points system for user:', userId);
  
  try {
    // 1. Check user analytics
    const { data: analytics, error: analyticsError } = await supabase
      .from('user_analytics')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    console.log('📊 User Analytics:', analytics);
    if (analyticsError) console.error('❌ Analytics Error:', analyticsError);
    
    // 2. Check user achievements
    const { data: achievements, error: achievementsError } = await supabase
      .from('user_achievements_with_details')
      .select('*')
      .eq('user_id', userId)
      .order('category');
    
    console.log('🏆 User Achievements:', achievements);
    if (achievementsError) console.error('❌ Achievements Error:', achievementsError);
    
    // 3. Check points
    const { data: points, error: pointsError } = await supabase
      .from('user_points')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    console.log('💰 User Points:', points);
    if (pointsError) console.error('❌ Points Error:', pointsError);
    
    // 4. Check users table points
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('points')
      .eq('id', userId)
      .single();
    
    console.log('👤 Users Table Points:', userData?.points);
    if (userError) console.error('❌ User Points Error:', userError);
    
    // 5. Check recent transactions
    const { data: transactions, error: transError } = await supabase
      .from('point_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);
    
    console.log('💳 Recent Transactions:', transactions);
    if (transError) console.error('❌ Transactions Error:', transError);
    
    // 6. Check if achievements are properly initialized
    const { data: achievementDefs, error: defError } = await supabase
      .from('achievement_definitions')
      .select('id, name, target, points_reward, category');
    
    console.log('📋 Achievement Definitions:', achievementDefs);
    if (defError) console.error('❌ Definitions Error:', defError);
    
    // 7. Summary
    const summary = {
      totalCheckins: analytics?.total_checkins || 0,
      currentStreak: analytics?.current_streak || 0,
      completedAntitodos: analytics?.completedantitodos || 0,
      achievementsUnlocked: achievements?.filter(a => a.is_completed).length || 0,
      totalAchievements: achievements?.length || 0,
      pointsBalance: userData?.points || 0,
      pointsEarned: points?.total_earned || 0,
      pointsSpent: points?.total_spent || 0
    };
    
    console.log('📋 SUMMARY:', summary);
    
    return { success: true, data: summary };
    
  } catch (error) {
    console.error('❌ Debug function error:', error);
    return { success: false, error: error.message };
  }
};

export const forceRecalculateAchievements = async (userId) => {
  console.log('🔄 Force recalculating achievements for user:', userId);
  
  try {
    // 1. Initialize achievements if missing
    await supabase.rpc('initialize_user_achievements', { user_uuid: userId });
    
    // 2. Force recalculate progress
    const { error: calcError } = await supabase.rpc('calculate_achievement_progress', {
      user_uuid: userId
    });
    
    if (calcError) {
      console.error('❌ Error in calculation function:', calcError);
      throw calcError;
    }
    
    // 3. Sync points
    await supabase.rpc('sync_user_points', { user_uuid: userId });
    
    console.log('✅ Achievements and points recalculated successfully');
    
    // 4. Return updated data
    return await debugAchievementsAndPoints(userId);
    
  } catch (error) {
    console.error('❌ Force recalculation error:', error);
    return { success: false, error: error.message };
  }
};

// Function to test the achievement system with dummy data
export const testAchievementSystem = async (userId) => {
  console.log('🧪 Testing achievement system for user:', userId);
  
  try {
    // Simulate checkin progress
    console.log('📝 Simulating checkin progress...');
    await supabase
      .from('user_analytics')
      .upsert({
        user_id: userId,
        total_checkins: 15,
        current_streak: 5,
        completedantitodos: 3,
      }, { onConflict: 'user_id' });
    
    // Force recalculate
    const result = await forceRecalculateAchievements(userId);
    
    return result;
    
  } catch (error) {
    console.error('❌ Test error:', error);
    return { success: false, error: error.message };
  }
};

// Export these functions so they can be called from browser console
if (typeof window !== 'undefined') {
  window.debugAchievements = debugAchievementsAndPoints;
  window.forceRecalculateAchievements = forceRecalculateAchievements;
  window.testAchievementSystem = testAchievementSystem;
}
