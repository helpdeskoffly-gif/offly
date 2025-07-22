import React, { useState, useEffect, useRef, Component } from "react";
import { gsap } from "gsap";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../contexts/ThemeContext.jsx";
import { Card, CardContent } from "./ui/Card";
import { Button } from "./ui/Button";
import { Badge } from "./ui/badge";
import {
  Trophy,
  Crown,
  Star,
  Flame,
  Gift,
  Users,
  Target,
  Clock,
  Zap,
  Award,
  TrendingUp,
  Calendar,
  Sun,
  Moon,
  Heart,
  CheckCircle,
} from "lucide-react";
import {
  getAchievementStats,
  checkAndUnlockAchievements,
  initializeUserAchievements,
} from "../services/database";

// Error Boundary Component
class AchievementsErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Achievements Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const { theme } = this.props;
      const themeColors = {
        background:
          theme === "dark"
            ? "bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950"
            : "bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50",
        text: {
          primary: theme === "dark" ? "text-white" : "text-gray-900",
          muted: theme === "dark" ? "text-slate-400" : "text-gray-600",
        },
        card:
          theme === "dark"
            ? "bg-slate-800/50 border-slate-700/50"
            : "bg-white/70 border-orange-200/50",
      };

      return (
        <div className="space-y-8">
          <div className="text-center py-12">
            <Trophy
              className={`w-16 h-16 mx-auto ${themeColors.text.muted} mb-4`}
            />
            <h2
              className={`text-2xl font-semibold ${themeColors.text.primary} mb-2`}
            >
              Achievements Temporarily Unavailable
            </h2>
            <p className={`${themeColors.text.muted} mb-6`}>
              We're working on getting your achievements back online. Please try
              again later.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition-all duration-300"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const premiumGradients = {
  primary: "from-violet-500 via-purple-500 to-fuchsia-500",
  secondary: "from-blue-500 via-cyan-500 to-teal-500",
  accent: "from-amber-500 via-orange-500 to-red-500",
  tertiary: "from-emerald-500 via-green-500 to-lime-500",
};

export function Achievements() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [achievementData, setAchievementData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newlyUnlocked, setNewlyUnlocked] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showCelebration, setShowCelebration] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);

  // Animation refs
  const headerRef = useRef(null);
  const statsRef = useRef(null);
  const categoriesRef = useRef(null);
  const achievementsRef = useRef(null);

  const themeColors = {
    background:
      theme === "dark"
        ? "bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950"
        : "bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50",
    text: {
      primary: theme === "dark" ? "text-white" : "text-gray-900",
      secondary: theme === "dark" ? "text-slate-300" : "text-gray-700",
      muted: theme === "dark" ? "text-slate-400" : "text-gray-600",
    },
    card:
      theme === "dark"
        ? "bg-slate-800/50 border-slate-700/50"
        : "bg-white/70 border-orange-200/50",
  };

  const iconMap = {
    "🎯": Target,
    "🔥": Flame,
    "📈": TrendingUp,
    "📊": Award,
    "💯": Award,
    "🌟": Star,
    "🌅": Sun,
    "🎭": Users,
    "🦉": Moon,
    "🏆": Trophy,
  };

  const categoryInfo = {
    all: {
      label: "All Achievements",
      icon: Trophy,
      color: premiumGradients.primary,
    },
    consistency: {
      label: "Consistency",
      icon: Flame,
      color: premiumGradients.accent,
    },
    milestones: {
      label: "Milestones",
      icon: Star,
      color: premiumGradients.secondary,
    },
    special: {
      label: "Special",
      icon: Crown,
      color: premiumGradients.tertiary,
    },
  };

  useEffect(() => {
    loadAchievementData();
  }, [user]);

  useEffect(() => {
    if (achievementData) {
      animateComponents();
    }
  }, [achievementData]);

  useEffect(() => {
    if (newlyUnlocked.length > 0) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 5000);
    }
  }, [newlyUnlocked]);

  const loadAchievementData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Check for new achievements first
      const unlockResult = await checkAndUnlockAchievements(user.uid);
      if (
        unlockResult &&
        unlockResult.newlyUnlocked &&
        unlockResult.newlyUnlocked.length > 0
      ) {
        setNewlyUnlocked(unlockResult.newlyUnlocked);
      }

      // Load current achievement stats
      const stats = await getAchievementStats(user.uid);
      setAchievementData(
        stats || {
          totalAchievements: 0,
          unlockedCount: 0,
          inProgressCount: 0,
          totalPoints: 0,
          level: 1,
          unlockedAchievements: [],
          nextAchievements: [],
          progress: {},
        },
      );
    } catch (error) {
      console.error("Error loading achievements:", error);
      // Set fallback data instead of leaving empty
      setAchievementData({
        totalAchievements: 12,
        unlockedCount: 0,
        inProgressCount: 12,
        totalPoints: 0,
        level: 1,
        unlockedAchievements: [],
        nextAchievements: [
          {
            id: "first_checkin",
            title: "First Steps",
            description: "Complete your first check-in",
            category: "consistency",
            icon: "🎯",
            color: "from-blue-400 to-purple-400",
            points: 10,
            progressText: "0/1 check-ins",
            progressPercentage: 0,
          },
        ],
        progress: {},
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMigration = async () => {
    if (!user) return;

    setIsInitializing(true);
    try {
      const result = await initializeUserAchievements(user.uid);
      if (result.success) {
        // Reload data after migration
        await loadAchievementData();
        console.log("Migration completed successfully");
      }
    } catch (error) {
      console.error("Migration failed:", error);
    } finally {
      setIsInitializing(false);
    }
  };

  const animateComponents = () => {
    const tl = gsap.timeline();

    tl.fromTo(
      headerRef.current,
      { opacity: 0, y: -30 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },
    )
      .fromTo(
        statsRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },
        "-=0.3",
      )
      .fromTo(
        categoriesRef.current,
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 0.5, ease: "power3.out" },
        "-=0.2",
      )
      .fromTo(
        achievementsRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" },
        "-=0.1",
      );
  };

  const getAchievementsByCategory = () => {
    if (!achievementData) return { unlocked: [], inProgress: [] };

    const unlocked = achievementData.unlockedAchievements || [];
    const inProgress = achievementData.nextAchievements || [];

    if (selectedCategory === "all") {
      return { unlocked, inProgress };
    }

    return {
      unlocked: unlocked.filter((a) => a.category === selectedCategory),
      inProgress: inProgress.filter((a) => a.category === selectedCategory),
    };
  };

  const renderAchievementCard = (achievement, isUnlocked = false) => {
    const IconComponent = iconMap[achievement.icon] || Target;
    const progressPercentage = achievement.progressPercentage || 0;

    return (
      <Card
        key={achievement.id}
        className={`${themeColors.card} border-0 shadow-sm transition-all duration-300 hover:shadow-lg ${
          isUnlocked ? "" : "opacity-75"
        }`}
      >
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div
              className={`p-3 rounded-xl bg-gradient-to-br ${achievement.color} shadow-sm flex items-center justify-center ${
                isUnlocked ? "" : "grayscale"
              }`}
            >
              <span className="text-white text-lg">{achievement.icon}</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className={`font-semibold ${themeColors.text.primary}`}>
                  {achievement.title}
                </h3>
                {isUnlocked && (
                  <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Earned
                  </Badge>
                )}
              </div>
              <p className={`text-sm ${themeColors.text.muted} mb-3`}>
                {achievement.description}
              </p>

              {!isUnlocked && achievement.progressText && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className={`text-xs ${themeColors.text.secondary}`}>
                      Progress
                    </span>
                    <span className={`text-xs ${themeColors.text.secondary}`}>
                      {achievement.progressText}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div
                      className={`h-2 bg-gradient-to-r ${achievement.color} rounded-full transition-all duration-500`}
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-1">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <span
                    className={`text-sm font-medium ${themeColors.text.secondary}`}
                  >
                    {achievement.points} points
                  </span>
                </div>
                {isUnlocked && achievement.unlockedAt && (
                  <span className={`text-xs ${themeColors.text.muted}`}>
                    Earned{" "}
                    {new Date(achievement.unlockedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500" />
      </div>
    );
  }

  if (!achievementData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className={`${themeColors.text.muted} mb-4`}>
            Unable to load achievements data.
          </p>
          <div className="space-x-4">
            <Button
              onClick={loadAchievementData}
              className={`bg-gradient-to-r ${premiumGradients.primary} text-white`}
            >
              Try Again
            </Button>
            <Button
              onClick={handleMigration}
              disabled={isInitializing}
              variant="outline"
            >
              {isInitializing ? "Initializing..." : "Initialize Achievements"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const { unlocked, inProgress } = getAchievementsByCategory();

  return (
    <AchievementsErrorBoundary theme={theme}>
      <div className="space-y-8">
        {/* Celebration Modal */}
        {showCelebration && newlyUnlocked.length > 0 && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card
              className={`${themeColors.card} p-8 max-w-md mx-4 text-center`}
            >
              <div className="mb-4">
                <Trophy className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
                <h2
                  className={`text-2xl font-bold ${themeColors.text.primary} mb-2`}
                >
                  Achievement Unlocked!
                </h2>
                {newlyUnlocked.map((achievement) => (
                  <div key={achievement.id} className="mb-4">
                    <div className="flex items-center gap-3 justify-center mb-2">
                      <span className="text-2xl">{achievement.icon}</span>
                      <h3
                        className={`font-semibold ${themeColors.text.primary}`}
                      >
                        {achievement.title}
                      </h3>
                    </div>
                    <p className={`text-sm ${themeColors.text.muted}`}>
                      {achievement.description}
                    </p>
                    <p
                      className={`text-sm font-medium ${themeColors.text.secondary} mt-1`}
                    >
                      +{achievement.points} points earned!
                    </p>
                  </div>
                ))}
              </div>
              <Button
                onClick={() => setShowCelebration(false)}
                className={`bg-gradient-to-r ${premiumGradients.primary} text-white`}
              >
                Awesome!
              </Button>
            </Card>
          </div>
        )}

        {/* Header */}
        <div ref={headerRef} className="fade-in">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div
                className={`p-3 rounded-2xl bg-gradient-to-br ${premiumGradients.tertiary} shadow-sm`}
              >
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1
                  className={`text-3xl font-semibold ${themeColors.text.primary} mb-1`}
                >
                  Achievements
                </h1>
                <p className={`${themeColors.text.secondary} text-lg`}>
                  Celebrate your wellness milestones and unlock new levels of
                  growth
                </p>
              </div>
            </div>
            {/* Migration Button for existing users */}
            <Button
              onClick={handleMigration}
              disabled={isInitializing}
              variant="outline"
              className="text-sm"
            >
              {isInitializing
                ? "Initializing..."
                : "🔄 Initialize for Existing User"}
            </Button>
          </div>
        </div>

        {/* Achievement Stats */}
        <div ref={statsRef} className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className={`${themeColors.card} border-0 shadow-sm`}>
            <CardContent className="p-6 text-center">
              <div
                className={`text-3xl font-bold ${themeColors.text.primary} mb-2`}
              >
                {achievementData?.level || 1}
              </div>
              <p className={`text-sm ${themeColors.text.muted}`}>
                Current Level
              </p>
            </CardContent>
          </Card>

          <Card className={`${themeColors.card} border-0 shadow-sm`}>
            <CardContent className="p-6 text-center">
              <div
                className={`text-3xl font-bold ${themeColors.text.primary} mb-2`}
              >
                {achievementData?.totalPoints || 0}
              </div>
              <p className={`text-sm ${themeColors.text.muted}`}>
                Total Points
              </p>
            </CardContent>
          </Card>

          <Card className={`${themeColors.card} border-0 shadow-sm`}>
            <CardContent className="p-6 text-center">
              <div
                className={`text-3xl font-bold ${themeColors.text.primary} mb-2`}
              >
                {achievementData?.unlockedCount || 0}
              </div>
              <p className={`text-sm ${themeColors.text.muted}`}>
                Badges Earned
              </p>
            </CardContent>
          </Card>

          <Card className={`${themeColors.card} border-0 shadow-sm`}>
            <CardContent className="p-6 text-center">
              <div
                className={`text-3xl font-bold ${themeColors.text.primary} mb-2`}
              >
                {achievementData?.inProgressCount || 0}
              </div>
              <p className={`text-sm ${themeColors.text.muted}`}>In Progress</p>
            </CardContent>
          </Card>
        </div>

        {/* Category Filters */}
        <div ref={categoriesRef}>
          <div className="flex flex-wrap gap-3 mb-6">
            {Object.entries(categoryInfo).map(([key, info]) => {
              const IconComponent = info.icon;
              return (
                <Button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  variant={selectedCategory === key ? "default" : "outline"}
                  className={`flex items-center gap-2 ${
                    selectedCategory === key
                      ? `bg-gradient-to-r ${info.color} text-white`
                      : ""
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  {info.label}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Achievements Grid */}
        <div ref={achievementsRef} className="space-y-8">
          {/* Unlocked Achievements */}
          {unlocked.length > 0 && (
            <div>
              <h2
                className={`text-xl font-semibold ${themeColors.text.primary} mb-4`}
              >
                Earned Achievements ({unlocked.length})
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {unlocked.map((achievement) =>
                  renderAchievementCard(achievement, true),
                )}
              </div>
            </div>
          )}

          {/* In Progress Achievements */}
          {inProgress.length > 0 && (
            <div>
              <h2
                className={`text-xl font-semibold ${themeColors.text.primary} mb-4`}
              >
                In Progress ({inProgress.length})
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {inProgress.map((achievement) =>
                  renderAchievementCard(achievement, false),
                )}
              </div>
            </div>
          )}

          {/* Empty State */}
          {unlocked.length === 0 && inProgress.length === 0 && (
            <Card className={`${themeColors.card} border-0 shadow-sm`}>
              <CardContent className="p-12 text-center">
                <Trophy
                  className={`w-16 h-16 mx-auto ${themeColors.text.muted} mb-4`}
                />
                <h3
                  className={`text-xl font-semibold ${themeColors.text.primary} mb-2`}
                >
                  Start Your Journey
                </h3>
                <p className={`${themeColors.text.muted} mb-6`}>
                  Complete your first check-in to start earning achievements!
                </p>
                <Button
                  onClick={() => window.location.reload()}
                  className={`bg-gradient-to-r ${premiumGradients.primary} text-white`}
                >
                  Refresh Achievements
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AchievementsErrorBoundary>
  );
}

export default Achievements;
