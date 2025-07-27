import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../contexts/ThemeContext.jsx";
import { Button } from "./ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { 
  Heart, 
  Share2, 
  Plus,
  Search,
  Filter,
  TrendingUp,
  Users,
  Sparkles,
  Hash,
  Clock,
  MoreHorizontal,
  Calendar,
  BarChart3,
  Target,
  Zap,
  Award,
  Tree,
  Leaf,
  Sprout,
} from "lucide-react";
import {
  submitCheckin,
  getUserCheckins,
  getUserAnalytics,
  getCurrentAntiTodoList,
  getPlantHistory,
} from "../services/database";
import { PlantGarden } from "./Achievements";
import { AntiTodoList } from "./AntiTodoList";
import { Community } from "./Community";
import { AINudges } from "./AINudges";
import { WeeklyMoodChart } from "./WeeklyMoodChart";
import { CalendarTracker } from "./CalendarTracker";

export function Dashboard() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState("overview");
  const [checkinData, setCheckinData] = useState({
    mood: 5,
    energy: 5,
    stress: 5,
    notes: "",
  });
  const [recentCheckins, setRecentCheckins] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [treesPlanted, setTreesPlanted] = useState(0);
  const [plantHistory, setPlantHistory] = useState([]);

  const themeColors = {
    background: theme === "dark" 
      ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
      : "bg-gradient-to-br from-emerald-50 via-green-50 to-blue-50",
    text: {
      primary: theme === "dark" ? "text-slate-200" : "text-slate-800",
      secondary: theme === "dark" ? "text-slate-400" : "text-slate-600",
      muted: theme === "dark" ? "text-slate-500" : "text-slate-500",
    },
    card: theme === "dark"
      ? "bg-slate-800/60 border-slate-700/50 backdrop-blur-xl"
      : "bg-white/80 border-green-200/50 backdrop-blur-xl shadow-lg",
  };

  // Load user data
  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      const [checkinsResult, analyticsResult, historyResult] = await Promise.all([
        getUserCheckins(user.id, null, null, 5),
        getUserAnalytics(user.id),
        getPlantHistory(user.id),
      ]);

      if (checkinsResult.success) {
        setRecentCheckins(checkinsResult.data || []);
      }

      if (analyticsResult.success) {
        setUserStats(analyticsResult.data);
      }

      if (historyResult.success) {
        setPlantHistory(historyResult.data || []);
        setTreesPlanted(historyResult.data?.length || 0);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckin = async () => {
    if (!user) return;

    try {
      const result = await submitCheckin(user.id, checkinData);
      if (result.success) {
        showToast("✅ Check-in submitted successfully!");
        setCheckinData({
          mood: 5,
          energy: 5,
          stress: 5,
          notes: "",
        });
        loadUserData(); // Reload data
      }
    } catch (error) {
      showToast("❌ Failed to submit check-in");
    }
  };

  const showToast = (message) => {
    setSuccessMessage(message);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const getMoodEmoji = (mood) => {
    if (mood >= 8) return "😊";
    if (mood >= 6) return "🙂";
    if (mood >= 4) return "😐";
    if (mood >= 2) return "😔";
    return "😢";
  };

  const getEnergyEmoji = (energy) => {
    if (energy >= 8) return "⚡";
    if (energy >= 6) return "💪";
    if (energy >= 4) return "😴";
    if (energy >= 2) return "😴";
    return "😴";
  };

  const getStressEmoji = (stress) => {
    if (stress <= 2) return "😌";
    if (stress <= 4) return "😐";
    if (stress <= 6) return "😰";
    if (stress <= 8) return "😨";
    return "😱";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div>
          <h1 className={`text-xl sm:text-2xl lg:text-3xl font-bold ${themeColors.text.primary}`}>
            Welcome back, {user?.display_name || user?.email?.split('@')[0] || 'User'}!
          </h1>
          <p className={`${themeColors.text.secondary} mt-1 text-sm sm:text-base`}>
            How are you feeling today?
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Avatar className="w-8 h-8 sm:w-10 sm:h-10">
            <AvatarImage src={user?.photoURL} />
            <AvatarFallback className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm sm:text-base">
              {user?.display_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Current Streak */}
        <Card className={`${themeColors.card} p-3 sm:p-6`}>
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className={`text-xs sm:text-sm font-medium ${themeColors.text.secondary} flex items-center gap-1 sm:gap-2`}>
              <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500" />
              <span className="hidden sm:inline">Current Streak</span>
              <span className="sm:hidden">Streak</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className={`text-lg sm:text-2xl font-bold ${themeColors.text.primary}`}>
              {userStats?.currentStreak || 0}
            </div>
            <p className={`text-xs ${themeColors.text.muted} mt-1 hidden sm:block`}>
              Keep it going! 🔥
            </p>
          </CardContent>
        </Card>

        {/* Total Check-ins */}
        <Card className={`${themeColors.card} p-3 sm:p-6`}>
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className={`text-xs sm:text-sm font-medium ${themeColors.text.secondary} flex items-center gap-1 sm:gap-2`}>
              <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
              <span className="hidden sm:inline">Total Check-ins</span>
              <span className="sm:hidden">Check-ins</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className={`text-lg sm:text-2xl font-bold ${themeColors.text.primary}`}>
              {userStats?.totalCheckins || 0}
            </div>
            <p className={`text-xs ${themeColors.text.muted} mt-1 hidden sm:block`}>
              Great progress! 📊
            </p>
          </CardContent>
        </Card>

        {/* Trees Planted */}
        <Card className={`${themeColors.card} p-3 sm:p-6`}>
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className={`text-xs sm:text-sm font-medium ${themeColors.text.secondary} flex items-center gap-1 sm:gap-2`}>
              <Tree className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
              <span className="hidden sm:inline">Trees Planted</span>
              <span className="sm:hidden">Trees</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className={`text-lg sm:text-2xl font-bold ${themeColors.text.primary}`}>
              {treesPlanted}
            </div>
            <p className={`text-xs ${themeColors.text.muted} mt-1 hidden sm:block`}>
              Growing your forest! 🌲
            </p>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card className={`${themeColors.card} p-3 sm:p-6`}>
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className={`text-xs sm:text-sm font-medium ${themeColors.text.secondary} flex items-center gap-1 sm:gap-2`}>
              <Award className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500" />
              <span className="hidden sm:inline">Achievements</span>
              <span className="sm:hidden">Badges</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className={`text-lg sm:text-2xl font-bold ${themeColors.text.primary}`}>
              {userStats?.unlockedAchievements || 0}
            </div>
            <p className={`text-xs ${themeColors.text.muted} mt-1 hidden sm:block`}>
              Unlocked badges! 🏆
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        {/* Mobile: Icon-only tabs, Desktop: Full tabs */}
        <TabsList className={`grid w-full grid-cols-5 gap-1 sm:gap-2 ${theme === 'dark' ? 'bg-slate-800/50' : 'bg-white/50'} backdrop-blur-sm p-1`}>
          <TabsTrigger 
            value="overview" 
            className="flex flex-col items-center gap-1 px-2 py-3 text-xs sm:text-sm sm:flex-row sm:gap-2"
          >
            <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger 
            value="plant" 
            className="flex flex-col items-center gap-1 px-2 py-3 text-xs sm:text-sm sm:flex-row sm:gap-2"
          >
            <Sprout className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Plant</span>
          </TabsTrigger>
          <TabsTrigger 
            value="activities" 
            className="flex flex-col items-center gap-1 px-2 py-3 text-xs sm:text-sm sm:flex-row sm:gap-2"
          >
            <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Activities</span>
          </TabsTrigger>
          <TabsTrigger 
            value="community" 
            className="flex flex-col items-center gap-1 px-2 py-3 text-xs sm:text-sm sm:flex-row sm:gap-2"
          >
            <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Community</span>
          </TabsTrigger>
          <TabsTrigger 
            value="insights" 
            className="flex flex-col items-center gap-1 px-2 py-3 text-xs sm:text-sm sm:flex-row sm:gap-2"
          >
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Insights</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Quick Check-in */}
          <Card className={themeColors.card}>
            <CardHeader>
              <CardTitle className={`${themeColors.text.primary} flex items-center gap-2`}>
                <Heart className="w-5 h-5 text-red-500" />
                Quick Check-in
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Mood */}
                <div>
                  <label className={`text-sm font-medium ${themeColors.text.secondary} mb-2 block`}>
                    Mood {getMoodEmoji(checkinData.mood)}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={checkinData.mood}
                    onChange={(e) => setCheckinData({...checkinData, mood: parseInt(e.target.value)})}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>😢</span>
                    <span>😊</span>
                  </div>
                </div>

                {/* Energy */}
                <div>
                  <label className={`text-sm font-medium ${themeColors.text.secondary} mb-2 block`}>
                    Energy {getEnergyEmoji(checkinData.energy)}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={checkinData.energy}
                    onChange={(e) => setCheckinData({...checkinData, energy: parseInt(e.target.value)})}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>😴</span>
                    <span>⚡</span>
                  </div>
                </div>

                {/* Stress */}
                <div>
                  <label className={`text-sm font-medium ${themeColors.text.secondary} mb-2 block`}>
                    Stress {getStressEmoji(checkinData.stress)}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={checkinData.stress}
                    onChange={(e) => setCheckinData({...checkinData, stress: parseInt(e.target.value)})}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>😌</span>
                    <span>😱</span>
                  </div>
                </div>
              </div>

              <div>
                <label className={`text-sm font-medium ${themeColors.text.secondary} mb-2 block`}>
                  Notes (optional)
                </label>
                <Textarea
                  placeholder="How are you feeling today?"
                  value={checkinData.notes}
                  onChange={(e) => setCheckinData({...checkinData, notes: e.target.value})}
                  className={`${theme === 'dark' ? 'bg-slate-700 border-slate-600' : 'bg-white border-slate-200'} ${themeColors.text.primary}`}
                  rows={3}
                />
              </div>

              <Button
                onClick={handleCheckin}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-lg"
              >
                Submit Check-in
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Check-ins */}
            <Card className={themeColors.card}>
              <CardHeader>
                <CardTitle className={`${themeColors.text.primary} flex items-center gap-2`}>
                  <Clock className="w-5 h-5 text-blue-500" />
                  Recent Check-ins
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentCheckins.length > 0 ? (
                  <div className="space-y-3">
                    {recentCheckins.slice(0, 5).map((checkin, index) => (
                      <div key={checkin.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50/50 dark:bg-slate-700/30">
                        <div className="text-2xl">{getMoodEmoji(checkin.mood)}</div>
                        <div className="flex-1">
                          <div className={`text-sm font-medium ${themeColors.text.primary}`}>
                            Mood: {checkin.mood}/10
                          </div>
                          <div className={`text-xs ${themeColors.text.muted}`}>
                            {new Date(checkin.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={`text-sm ${themeColors.text.muted} text-center py-4`}>
                    No recent check-ins yet
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Tree Planting Progress */}
            <Card className={themeColors.card}>
              <CardHeader>
                <CardTitle className={`${themeColors.text.primary} flex items-center gap-2`}>
                  <Sprout className="w-5 h-5 text-green-500" />
                  Tree Planting Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className={`text-4xl font-bold ${themeColors.text.primary} mb-2`}>
                    {treesPlanted}
                  </div>
                  <div className={`text-sm ${themeColors.text.secondary} mb-4`}>
                    Trees planted
                  </div>
                  
                  {/* Progress towards next badge */}
                  {treesPlanted < 5 && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className={themeColors.text.secondary}>Next badge:</span>
                        <span className={themeColors.text.primary}>Tree Planter (5 trees)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(treesPlanted / 5) * 100}%` }}
                        />
                      </div>
                      <div className={`text-xs ${themeColors.text.muted}`}>
                        {5 - treesPlanted} more to go!
                      </div>
                    </div>
                  )}
                  
                  {treesPlanted >= 5 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-2 text-green-500">
                        <Award className="w-4 h-4" />
                        <span className="text-sm font-medium">Tree Planter Badge Unlocked!</span>
                      </div>
                      {treesPlanted < 10 && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className={themeColors.text.secondary}>Next badge:</span>
                            <span className={themeColors.text.primary}>Forest Guardian (10 trees)</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${((treesPlanted - 5) / 5) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Plant Tab */}
        <TabsContent value="plant">
          <PlantGarden />
        </TabsContent>

        {/* Activities Tab */}
        <TabsContent value="activities">
          <AntiTodoList />
        </TabsContent>

        {/* Community Tab */}
        <TabsContent value="community">
          <Community />
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <WeeklyMoodChart />
            <CalendarTracker />
          </div>
          <AINudges />
        </TabsContent>
      </Tabs>

      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed top-4 right-4 z-50">
          <div className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} border rounded-xl shadow-xl p-4 max-w-sm backdrop-blur-sm`}>
            <div className="flex items-start gap-3">
              <Sparkles className="w-6 h-6 text-green-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${themeColors.text.primary} break-words`}>{successMessage}</p>
              </div>
              <button
                onClick={() => setShowSuccessToast(false)}
                className={`${themeColors.text.muted} hover:${themeColors.text.primary} transition-colors flex-shrink-0`}
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
