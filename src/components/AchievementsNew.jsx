import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card";
import { Button } from "./ui/Button";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { 
  Trophy, Target, RefreshCw, Sparkles, Coins, CheckCircle, Lock, 
  Flame, Heart, Palette, Users, Sprout, Clock, Book, Award, Star,
  Crown, Fire, Zap, Lightning, Bolt, Infinity, Compass, Leaf, TreePine,
  Flower, Trees, Mountain, MessageCircle, UserCheck, HeartHandshake,
  Flower2, Sunrise, Moon, Calendar, CalendarDays
} from "lucide-react";
import { supabase } from "../supabase";
import { getUserAchievements, getUserPoints, updateAchievementProgress, initializeUserAchievements } from "../services/database";
import { usePoints } from "../contexts/PointsContext.jsx";
import { useTheme } from "../contexts/ThemeContext";

function Achievements() {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { points, fetchUserPoints } = usePoints();
  const { theme } = useTheme();
  const [user, setUser] = useState(null);
  const [filter, setFilter] = useState('all'); // all, completed, incomplete
  const [categoryFilter, setCategoryFilter] = useState('all'); // all, milestone, streak, wellness, social, plant, timing

  // Icon mapping for achievement icons
  const iconMap = {
    Sparkles, Target, Trophy, Heart, Flame, Award, Star, Crown, Fire, Zap, 
    Lightning, Bolt, Infinity, Compass, Leaf, TreePine, Flower, Trees, Mountain,
    MessageCircle, Users, UserCheck, HeartHandshake, Flower2, Sprout, Sunrise, 
    Moon, Calendar, CalendarDays, CheckCircle, Lock
  };

  // Theme colors
  const themeColors = useMemo(() => ({
    background: theme === "dark" 
      ? "bg-gradient-to-br from-slate-950 via-gray-950 to-slate-950"
      : "bg-gradient-to-br from-emerald-200 via-green-200 to-teal-200",
    text: {
      primary: theme === "dark" ? "text-slate-200" : "text-slate-800",
      secondary: theme === "dark" ? "text-slate-400" : "text-slate-600",
      muted: theme === "dark" ? "text-slate-500" : "text-slate-500",
    },
    card: theme === "dark"
      ? "bg-slate-900/60 border-slate-800/50 backdrop-blur-xl"
      : "bg-gradient-to-br from-slate-50/90 via-white/95 to-slate-50/80 border-slate-200/60 backdrop-blur-xl shadow-lg",
    cardHover: theme === "dark"
      ? "hover:bg-slate-800/70 hover:border-slate-700/60"
      : "hover:bg-gradient-to-br hover:from-slate-100/95 hover:via-white/100 hover:to-slate-100/95 hover:border-slate-300/70 hover:shadow-xl",
  }), [theme]);

  // Category configurations
  const categories = {
    milestone: { name: 'Milestones', icon: Trophy, color: 'from-blue-500 to-indigo-500', bgColor: 'bg-blue-500/10' },
    streak: { name: 'Streaks', icon: Flame, color: 'from-orange-500 to-red-500', bgColor: 'bg-orange-500/10' },
    wellness: { name: 'Wellness', icon: Heart, color: 'from-green-500 to-emerald-500', bgColor: 'bg-green-500/10' },
    social: { name: 'Social', icon: Users, color: 'from-purple-500 to-violet-500', bgColor: 'bg-purple-500/10' },
    plant: { name: 'Garden', icon: Sprout, color: 'from-emerald-500 to-teal-500', bgColor: 'bg-emerald-500/10' },
    timing: { name: 'Consistency', icon: Clock, color: 'from-amber-500 to-yellow-500', bgColor: 'bg-amber-500/10' }
  };

  const loadUserData = async (userId) => {
    try {
      setLoading(true);
      
      // Load user points
      fetchUserPoints();

      // Initialize user achievements if needed
      await initializeUserAchievements(userId);

      // Load user achievements with current progress
      const achievementsResult = await getUserAchievements(userId);
      if (achievementsResult.success) {
        console.log('✅ Loaded achievements:', achievementsResult.data);
        setAchievements(achievementsResult.data || []);
      } else {
        console.error('❌ Failed to load achievements:', achievementsResult.error);
        setAchievements([]);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      setAchievements([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeComponent = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          setUser(user);
          await loadUserData(user.id);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error in initializeComponent:', error);
        setLoading(false);
      }
    };

    initializeComponent();
  }, []);

  // Refresh achievements function
  const refreshAchievements = async () => {
    if (!user) return;
    
    try {
      console.log('🔄 Refreshing achievements...');
      setRefreshing(true);
      
      // Update achievement progress first
      await updateAchievementProgress(user.id);
      
      // Then reload achievements
      await loadUserData(user.id);
      console.log('✅ Achievements refreshed successfully');
    } catch (error) {
      console.error('Error refreshing achievements:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Expose refresh function globally for Dashboard to call
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.refreshAchievements = refreshAchievements;
    }
    return () => {
      if (typeof window !== 'undefined') {
        delete window.refreshAchievements;
      }
    };
  }, [user]);

  // Filter achievements based on current filters
  const filteredAchievements = useMemo(() => {
    let filtered = achievements;

    // Filter by completion status
    if (filter === 'completed') {
      filtered = filtered.filter(a => a.is_completed);
    } else if (filter === 'incomplete') {
      filtered = filtered.filter(a => !a.is_completed);
    }

    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(a => a.category === categoryFilter);
    }

    // Sort by completion status (completed first), then by category, then by sort_order
    return filtered.sort((a, b) => {
      if (a.is_completed !== b.is_completed) {
        return b.is_completed - a.is_completed; // Completed first
      }
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category);
      }
      return (a.sort_order || 0) - (b.sort_order || 0);
    });
  }, [achievements, filter, categoryFilter]);

  // Calculate achievement statistics
  const stats = useMemo(() => {
    const total = achievements.length;
    const completed = achievements.filter(a => a.is_completed).length;
    const totalPoints = achievements
      .filter(a => a.is_completed)
      .reduce((sum, a) => sum + (a.points_earned || 0), 0);
    
    return {
      total,
      completed,
      completionPercentage: total > 0 ? Math.round((completed / total) * 100) : 0,
      totalPoints
    };
  }, [achievements]);

  // Render achievement card
  const renderAchievementCard = (achievement) => {
    const IconComponent = iconMap[achievement.achievement_icon] || Trophy;
    const category = categories[achievement.category] || categories.milestone;
    const progressPercentage = Math.min((achievement.progress / achievement.target) * 100, 100);
    
    return (
      <Card 
        key={achievement.id} 
        className={`${themeColors.card} ${themeColors.cardHover} transition-all duration-300 relative overflow-hidden ${
          achievement.is_completed ? 'ring-2 ring-emerald-400/30' : ''
        }`}
      >
        {/* Completion glow effect */}
        {achievement.is_completed && (
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-green-500/5 to-emerald-500/5 animate-pulse" />
        )}
        
        <CardHeader className="pb-3 relative z-10">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div 
                className={`p-3 rounded-xl ${category.bgColor} ${
                  achievement.is_completed ? 'bg-emerald-500/20' : ''
                } transition-all duration-300`}
                style={{ 
                  background: achievement.is_completed 
                    ? achievement.badge_color + '20' 
                    : category.bgColor 
                }}
              >
                <IconComponent 
                  className={`w-6 h-6 ${
                    achievement.is_completed 
                      ? 'text-emerald-600' 
                      : theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
                  }`} 
                />
              </div>
              <div>
                <h3 className={`font-semibold ${themeColors.text.primary} text-lg`}>
                  {achievement.achievement_name}
                </h3>
                <p className={`${themeColors.text.secondary} text-sm mt-1`}>
                  {achievement.achievement_description}
                </p>
              </div>
            </div>
            
            {achievement.is_completed ? (
              <Badge className="bg-emerald-500 text-white border-emerald-400 shadow-sm">
                <CheckCircle className="w-3 h-3 mr-1" />
                Complete
              </Badge>
            ) : (
              <Badge 
                variant="outline" 
                className={`${themeColors.text.muted} border-slate-300/50`}
              >
                <Lock className="w-3 h-3 mr-1" />
                Locked
              </Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="pt-0 relative z-10">
          {/* Progress section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className={themeColors.text.secondary}>
                Progress: {achievement.progress} / {achievement.target}
              </span>
              <span className={`font-medium ${
                achievement.is_completed ? 'text-emerald-600' : themeColors.text.primary
              }`}>
                {Math.round(progressPercentage)}%
              </span>
            </div>
            
            <Progress 
              value={progressPercentage} 
              className="h-2 bg-slate-200/50 dark:bg-slate-700/50" 
              style={{
                '--progress-color': achievement.is_completed 
                  ? '#10B981' 
                  : achievement.badge_color || '#3B82F6'
              }}
            />
            
            {/* Reward section */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
              <div className="flex items-center space-x-2">
                <Coins className="w-4 h-4 text-amber-500" />
                <span className={`text-sm font-medium ${themeColors.text.primary}`}>
                  {achievement.points_reward} points
                </span>
              </div>
              
              <Badge 
                variant="outline" 
                className={`text-xs ${category.bgColor} border-transparent`}
              >
                {category.name}
              </Badge>
            </div>
            
            {achievement.completed_at && (
              <div className={`text-xs ${themeColors.text.muted} pt-1`}>
                Completed {new Date(achievement.completed_at).toLocaleDateString()}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
            <p className={themeColors.text.secondary}>Loading your achievements...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className={`${themeColors.card} rounded-2xl p-6 border shadow-lg`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <h1 className={`text-3xl font-bold ${themeColors.text.primary} mb-2`}>
                🏆 Achievements
              </h1>
              <p className={themeColors.text.secondary}>
                Track your wellness journey milestones and earn rewards
              </p>
            </div>
            
            <Button
              onClick={refreshAchievements}
              disabled={refreshing}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 transition-all duration-300"
            >
              {refreshing ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Refresh Progress
            </Button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className={`${themeColors.card} border shadow-lg`}>
            <CardContent className="p-6 text-center">
              <Trophy className="w-8 h-8 mx-auto mb-3 text-amber-500" />
              <div className={`text-2xl font-bold ${themeColors.text.primary} mb-1`}>
                {stats.completed}
              </div>
              <div className={`text-sm ${themeColors.text.secondary}`}>
                Achievements Unlocked
              </div>
            </CardContent>
          </Card>
          
          <Card className={`${themeColors.card} border shadow-lg`}>
            <CardContent className="p-6 text-center">
              <Target className="w-8 h-8 mx-auto mb-3 text-blue-500" />
              <div className={`text-2xl font-bold ${themeColors.text.primary} mb-1`}>
                {stats.completionPercentage}%
              </div>
              <div className={`text-sm ${themeColors.text.secondary}`}>
                Completion Rate
              </div>
            </CardContent>
          </Card>
          
          <Card className={`${themeColors.card} border shadow-lg`}>
            <CardContent className="p-6 text-center">
              <Coins className="w-8 h-8 mx-auto mb-3 text-emerald-500" />
              <div className={`text-2xl font-bold ${themeColors.text.primary} mb-1`}>
                {stats.totalPoints}
              </div>
              <div className={`text-sm ${themeColors.text.secondary}`}>
                Points from Achievements
              </div>
            </CardContent>
          </Card>
          
          <Card className={`${themeColors.card} border shadow-lg`}>
            <CardContent className="p-6 text-center">
              <Star className="w-8 h-8 mx-auto mb-3 text-purple-500" />
              <div className={`text-2xl font-bold ${themeColors.text.primary} mb-1`}>
                {stats.total}
              </div>
              <div className={`text-sm ${themeColors.text.secondary}`}>
                Total Achievements
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters Section */}
        <div className={`${themeColors.card} rounded-xl p-4 border shadow-lg`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex flex-wrap gap-2">
              {['all', 'completed', 'incomplete'].map((filterOption) => (
                <Button
                  key={filterOption}
                  variant={filter === filterOption ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setFilter(filterOption)}
                  className={filter === filterOption 
                    ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white" 
                    : `${themeColors.text.secondary} hover:${themeColors.text.primary}`
                  }
                >
                  {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
                </Button>
              ))}
            </div>
            
            <div className="flex flex-wrap gap-2">
              {['all', ...Object.keys(categories)].map((category) => (
                <Button
                  key={category}
                  variant={categoryFilter === category ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setCategoryFilter(category)}
                  className={categoryFilter === category 
                    ? "bg-gradient-to-r from-purple-500 to-violet-500 text-white" 
                    : `${themeColors.text.secondary} hover:${themeColors.text.primary}`
                  }
                >
                  {category === 'all' ? 'All Categories' : categories[category]?.name}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredAchievements.length > 0 ? (
            filteredAchievements.map(renderAchievementCard)
          ) : (
            <div className="col-span-full text-center py-12">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-slate-400" />
              <h3 className={`text-xl font-semibold ${themeColors.text.primary} mb-2`}>
                No achievements found
              </h3>
              <p className={themeColors.text.secondary}>
                {filter === 'completed' 
                  ? "You haven't unlocked any achievements yet. Keep using the app to earn your first achievement!"
                  : filter === 'incomplete'
                  ? "Great job! You've completed all available achievements."
                  : "Start your wellness journey to unlock achievements."
                }
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default Achievements;
