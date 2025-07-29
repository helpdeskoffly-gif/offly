import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card";
import { Button } from "./ui/Button";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { Trophy, Target, RefreshCw, Sparkles, Coins, CheckCircle, Lock, Flame, Heart, Palette, Users, Sprout, Clock, Book } from "lucide-react";
import { supabase } from "../supabase";
import { getUserAchievements, getUserPoints, checkAndUnlockAchievements, initializeUserAchievements, getAllAchievementDefinitions } from "../services/database";

import { usePoints } from "../contexts/PointsContext.jsx";

function Achievements() {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const { points, fetchUserPoints } = usePoints();
  const [user, setUser] = useState(null);

  const loadUserData = async (userId) => {
    try {
      
      
      // Load user points
      fetchUserPoints();

      // Initialize user achievements if needed
      await initializeUserAchievements(userId);

      // Check for new achievements first
      await checkAndUnlockAchievements(userId);

      // Refresh points after checking achievements (in case new ones were unlocked)
      fetchUserPoints();

      // Load user achievements with current progress
      const achievementsResult = await getUserAchievements(userId);
      if (achievementsResult.success) {
        
        
        // Get achievement definitions to add points_reward if missing
        const achievementDefinitions = getAllAchievementDefinitions();
        
        // Add points_reward to achievements if missing
        const achievementsWithPoints = achievementsResult.data.map(achievement => {
          if (!achievement.points_reward) {
            const definition = achievementDefinitions[achievement.achievement_id];
            return {
              ...achievement,
              points_reward: definition?.points_reward || 10
            };
          }
          return achievement;
        });
        
        setAchievements(achievementsWithPoints);
      } else {
        
        setAchievements([]);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      setAchievements([]);
    }
  };

  useEffect(() => {
    
    
    const initializeComponent = async () => {
      try {
        
        const { data: { user } } = await supabase.auth.getUser();
        
        
        if (user) {
          
          setUser(user);
          await loadUserData(user.id);
          
          setLoading(false);
        
          setLoading(false);
        }
      } catch (error) {
        console.error('Error in initializeComponent:', error);
        setLoading(false);
      }
    };

    initializeComponent();
  }, []);

  // Add a refresh function that can be called from parent components
  const refreshAchievements = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      await loadUserData(user.id);
    } catch (error) {
      console.error('Error refreshing achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  // Expose refresh function to parent components
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.refreshAchievements = refreshAchievements;
    }
  }, [user]);

  

  const checkForNewAchievements = async () => {
    
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Check for new achievements and get updated data
      const result = await checkAndUnlockAchievements(user.id);
      
      if (result.success) {
        // Reload all data to show updated progress and any new achievements
        await loadUserData(user.id);
        
        if (result.newAchievements && result.newAchievements.length > 0) {
          const achievementNames = result.newAchievements
            .map((a) => a.achievement_name)
            .join(", ");
          alert(`🏆 New achievements unlocked: ${achievementNames}!`);
        } else {
          alert("No new achievements unlocked yet. Keep up the great work!");
        }
      } else {
        alert("Error checking for achievements. Please try again.");
      }
    } catch (error) {
      console.error('Error checking achievements:', error);
      alert("Error checking for achievements. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Debug function to show current analytics data
  const debugAnalytics = async () => {
    if (!user) return;
    
    try {
      const { getUserAnalytics } = await import('../services/database');
      const analyticsResult = await getUserAnalytics(user.id);
      
      if (analyticsResult.success) {
        
        alert(`Analytics Debug:\nTotal Checkins: ${analyticsResult.data.total_checkins}\nCurrent Streak: ${analyticsResult.data.current_streak}\nCompleted Anti-Todos: ${analyticsResult.data.completedantitodos}\nWeekly Anti-Todos: ${analyticsResult.data.weeklyantitodos}`);
      } else {
        console.error('Failed to get analytics:', analyticsResult.error);
        alert('Failed to get analytics data');
      }
    } catch (error) {
      console.error('Error debugging analytics:', error);
      alert('Error debugging analytics');
    }
  };

  const showToast = (message) => {
    alert(message);
  };

  const getCategoryIcon = (category) => {
    const icons = {
      milestone: Target,
      streak: Flame,
      wellness: Heart,
      variety: Palette,
      social: Users,
      plant: Sprout,
      timing: Clock,
      engagement: Book,
    };
    return icons[category] || Trophy;
  };

  const getCategoryColor = (category) => {
    const colors = {
      milestone: "from-blue-500 to-cyan-500",
      streak: "from-orange-500 to-red-500",
      wellness: "from-pink-500 to-rose-500",
      variety: "from-purple-500 to-pink-500",
      social: "from-green-500 to-emerald-500",
      plant: "from-emerald-500 to-teal-500",
      timing: "from-indigo-500 to-purple-500",
      engagement: "from-yellow-500 to-orange-500",
    };
    return colors[category] || "from-gray-500 to-slate-500";
  };

  if (loading) {
    
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500" />
        <p className="ml-4 text-slate-600 dark:text-slate-400">Loading achievements...</p>
      </div>
    );
  }

  

  return (
    <div className="space-y-4 sm:space-y-8 p-3 sm:p-6">
      
      {/* Stats Header */}
      <div className="grid grid-cols-1 gap-4 mb-6">
        <Card className="bg-white/70 dark:bg-slate-800/50 border-slate-200/60 dark:border-slate-700/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full flex items-center justify-center">
                <Coins className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Available Points</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">{points}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>



      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {achievements.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <p className="text-lg text-slate-600 dark:text-slate-400">No achievements found</p>
            <p className="text-sm text-slate-500 dark:text-slate-500">Complete activities to unlock achievements!</p>
          </div>
        ) : (
          achievements.map((achievement, index) => {
            const IconComponent = getCategoryIcon(achievement.achievement_category);
            const progressPercentage = achievement.percentage || Math.round((achievement.progress / achievement.target) * 100);
            const isCompleted = achievement.is_unlocked;

            return (
              <Card 
                key={achievement.achievement_id}
                className="bg-white/70 dark:bg-slate-800/50 border-slate-200/60 dark:border-slate-700/50 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-r ${getCategoryColor(achievement.achievement_category)}`}>
                        <span className="text-xl">{achievement.achievement_icon}</span>
                      </div>
                      <div>
                        <CardTitle className="text-base text-slate-800 dark:text-slate-200">
                          {achievement.achievement_name}
                        </CardTitle>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          {achievement.achievement_description}
                        </p>
                      </div>
                    </div>
                    {isCompleted && (
                      <Badge className="bg-green-500 text-white">
                        Complete
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-600 dark:text-slate-400">Progress</span>
                      <span className="text-slate-800 dark:text-slate-200">
                        {achievement.progress} / {achievement.target}
                      </span>
                    </div>
                    <Progress value={progressPercentage} className="h-2" />
                  </div>

                  {/* Rewards */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Coins className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                          {achievement.points_reward || 10} points
                        </span>
                      </div>
                    </div>

                    {/* Status */}
                    {isCompleted ? (
                      <div className="flex items-center gap-1 text-green-500">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-xs">Awarded</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-slate-400">
                        <Lock className="w-4 h-4" />
                        <span className="text-xs">Locked</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

export default Achievements;