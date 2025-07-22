import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import CheckinDrawer from "./dashboard/CheckinDrawer";
import CalendarTracker from "./CalendarTracker";
import AINudges from "./AINudges";
import WeeklyMoodChart from "./WeeklyMoodChart";
import Achievements from "./Achievements";
import { ProfileCompletionNotification } from "./ProfileCompletionNotification";
import { useProfileCompletionNotification } from "../hooks/useProfileCompletionNotification";
import { ProfileCompletionModal } from "./ProfileCompletionModal";
import { ProfileSettingsModal } from "./ProfileSettingsModal";
import { AntiTodoList } from "./AntiTodoList";

import { gsap } from "gsap";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../contexts/ThemeContext.jsx";
import { useNavigate } from "react-router-dom";
import {
  submitCheckin,
  getUserCheckins,
  saveUserActivities,
  getUserActivities,
  saveAntiTodoList,
  updateAntiTodoStatus,
  getWeeklyAntiTodoInsights,
  checkAndUnlockAchievements,
  checkProfileCompletion,
} from "../services/database";
import { notificationService } from "../services/notifications";
import { openaiService } from "../services/openai";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Smile,
  TrendingUp,
  Calendar,
  Clock,
  Users,
  Trophy,
  Flame,
  Heart,
  Sparkles,
  Bell,
  Settings,
  User,
  ChevronRight,
  Target,
  Zap,
  Star,
  Award,
  Activity,
  BarChart3,
  Brain,
  Plus,
  CheckCircle,
  UserPlus,
  MessageCircle,
  Gift,
  Medal,
  Crown,
  Coffee,
  Book,
  Music,
  Camera,
  Headphones,
  MapPin,
  Sun,
  Moon,
  Wind,
  Umbrella,
  ArrowRight,
  Palette,
  Volume2,
  HelpCircle,
  LogOut,
  ChevronDown,
  Wand2,
  Lightbulb,
  Play,
  Pause,
  X,
  Send,
  Hash,
  ChevronLeft,
} from "lucide-react";

// Helper function moved outside component to prevent re-creation
const getMoodLabelFromEmoji = (emoji) => {
  const labels = {
    "😊": "Happy",
    "😄": "Joyful",
    "😁": "Excited",
    "🤗": "Warm",
    "🥰": "Loving",
    "😎": "Cool",
    "🥳": "Celebratory",
    "✨": "Magical",
    "😐": "Neutral",
    "🤔": "Thoughtful",
    "😌": "Peaceful",
    "😴": "Tired",
    "🙂": "Content",
    "😯": "Surprised",
    "🤷‍♂️": "Indifferent",
    "😶": "Quiet",
    "😔": "Sad",
    "😞": "Disappointed",
    "😢": "Tearful",
    "😭": "Crying",
    "😤": "Frustrated",
    "😡": "Angry",
    "😰": "Anxious",
    "😩": "Overwhelmed",
  };
  return labels[emoji] || "Unknown";
};

const Dashboard = () => {
  const { user, userProfile, signOut, refreshUserProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Dashboard");

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCheckinDrawer, setShowCheckinDrawer] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);

  const [weeklyInsights, setWeeklyInsights] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [profileCompletion, setProfileCompletion] = useState({
    isCompleted: false,
    hasBasicInfo: false,
    showNotification: false,
    showModal: false,
  });

  useEffect(() => {
    console.log('Dashboard: userProfile updated', userProfile);
    if (userProfile) {
      console.log('Profile completion status:', {
        hobbies: userProfile.hobbies,
        hobbiesLength: userProfile.hobbies?.length,
        profileCompleted: userProfile.profileCompleted
      });
    }
  }, [userProfile]);
  const [recentCheckins, setRecentCheckins] = useState([]);
  const [weeklyChartCheckins, setWeeklyChartCheckins] = useState([]);
  const [showAINudges, setShowAINudges] = useState(false);
  const [lastCheckinMood, setLastCheckinMood] = useState("");
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [toastType, setToastType] = useState("success"); // "success" or "error"

  const containerRef = useRef(null);
  const contentRef = useRef(null);

  // Professional premium theme colors
  const premiumGradients = useMemo(
    () => ({
      primary:
        theme === "dark"
          ? "from-slate-600 via-slate-700 to-slate-800"
          : "from-slate-200 via-slate-300 to-slate-400",
      secondary:
        theme === "dark"
          ? "from-blue-600 via-indigo-600 to-purple-600"
          : "from-blue-500 via-indigo-500 to-purple-500",
      tertiary:
        theme === "dark"
          ? "from-gray-600 via-gray-700 to-gray-800"
          : "from-gray-400 via-gray-500 to-gray-600",
      accent:
        theme === "dark"
          ? "from-indigo-600 via-purple-600 to-violet-600"
          : "from-indigo-500 via-purple-500 to-violet-500",
    }),
    [theme],
  );

  const themeColors = useMemo(
    () => ({
      background:
        theme === "dark"
          ? "bg-gradient-to-br from-slate-950 via-gray-950 to-slate-950"
          : "bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100",
      text: {
        primary: theme === "dark" ? "text-slate-200" : "text-gray-900",
        secondary: theme === "dark" ? "text-slate-400" : "text-gray-600",
        muted: theme === "dark" ? "text-slate-500" : "text-gray-500",
      },
      card:
        theme === "dark"
          ? "bg-slate-900/60 border-slate-800/50 backdrop-blur-xl"
          : "bg-white/80 border-slate-200/50 backdrop-blur-xl",
      cardHover:
        theme === "dark"
          ? "hover:bg-slate-800/70 hover:border-slate-700/60"
          : "hover:bg-white/90 hover:border-slate-300/60",
    }),
    [theme],
  );

  // Helper functions for data formatting
  const getTimeAgo = (dateString) => {
    if (!dateString) return "Never";
    const today = new Date().toISOString().split("T")[0];
    if (dateString === today) return "Today";
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (dateString === yesterday.toISOString().split("T")[0])
      return "Yesterday";
    return `${Math.floor((new Date() - new Date(dateString)) / (1000 * 60 * 60 * 24))} days ago`;
  };

  const getMoodLabel = (score) => {
    if (score >= 4.5) return "excellent";
    if (score >= 4.0) return "great";
    if (score >= 3.5) return "good";
    if (score >= 3.0) return "okay";
    if (score >= 2.5) return "challenging";
    return "difficult";
  };

  // Real data from userProfile
  const dashboardData = useMemo(() => ({
    currentStreak: userProfile?.currentStreak || 0,
    weeklyJoy: { current: userProfile?.dailyCheckins || 0, target: 7 },
    lastCheckIn: userProfile?.lastCheckinDate
      ? getTimeAgo(userProfile.lastCheckinDate)
      : "Never",
    moodData: userProfile?.currentAiScore
      ? getMoodLabel(userProfile.currentAiScore)
      : "neutral",
    totalCheckIns: userProfile?.totalCheckins || 0,
    weeklyProgress: userProfile?.weeklyUniqueCheckinDays || 0,
    currentRank: Math.floor((userProfile?.totalCheckins || 0) / 10) + 1,
    percentile: Math.min(95, (userProfile?.totalCheckins || 0) * 2),
  }), [userProfile]);

  // Calculate top moods from recent check-ins
  const topMoods = useMemo(() => {
    if (!recentCheckins.length) {
      return [
        {
          emoji: "😊",
          label: "Start checking in",
          count: 0,
          color: "from-blue-500 to-indigo-500",
        },
      ];
    }

    const moodCounts = {};
    recentCheckins.forEach((checkin) => {
      if (checkin.mood_emoji) {
        moodCounts[checkin.mood_emoji] =
          (moodCounts[checkin.mood_emoji] || 0) + 1;
      }
    });

    const sortedMoods = Object.entries(moodCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([emoji, count], index) => ({
        emoji,
        label: getMoodLabelFromEmoji(emoji),
        count,
        color:
          index === 0
            ? "from-blue-500 to-indigo-500"
            : index === 1
              ? "from-purple-500 to-violet-500"
              : "from-slate-500 to-gray-500",
      }));

    return sortedMoods.length
      ? sortedMoods
      : [
          {
            emoji: "😊",
            label: "Start checking in",
            count: 0,
            color: "from-blue-500 to-indigo-500",
          },
        ];
  }, [recentCheckins]);

  // Icon mapping function for AI-generated activities
  const getIconComponent = (iconName) => {
    const iconMap = {
      Coffee: Coffee,
      Book: Book,
      Music: Music,
      Camera: Camera,
      Heart: Heart,
      Palette: Palette,
      Sun: Sun,
      Lightbulb: Lightbulb,
      Target: Target,
      Smile: Smile,
      Sparkles: Sparkles,
    };
    return iconMap[iconName] || Sparkles;
  };

  const [activities, setActivities] = useState([]);

  const navigationTabs = [
    {
      id: "Dashboard",
      label: "Dashboard",
      icon: BarChart3,
      color: "text-indigo-500",
      bgColor: "bg-indigo-500/10",
      gradient: premiumGradients.accent,
    },
    {
      id: "Joy Tracker",
      label: "Joy Tracker",
      icon: TrendingUp,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      gradient: premiumGradients.secondary,
    },
    {
      id: "Anti-To-Do",
      label: "Anti-To-Do",
      icon: Zap,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      gradient: premiumGradients.accent,
    },
    {
      id: "Community",
      label: "Community",
      icon: Users,
      color: "text-slate-500",
      bgColor: "bg-slate-500/10",
      gradient: premiumGradients.primary,
    },
    {
      id: "Achievements",
      label: "Achievements",
      icon: Trophy,
      color: "text-gray-600",
      bgColor: "bg-gray-500/10",
      gradient: premiumGradients.tertiary,
    },
  ];

  // Load notifications from database
  const loadNotifications = useCallback(async () => {
    if (!user?.id) return;

    try {
      const result = await notificationService.getUserNotifications(
        user.id,
        true,
        10,
      );

      if (result.success) {
        setNotifications(result.notifications);
      } else {
        // Fallback to empty notifications if service fails
        setNotifications([]);
      }

      const countResult = await notificationService.getNotificationCount(
        user.id,
      );
      if (countResult.success) {
        setNotificationCount(countResult.count);
      } else {
        setNotificationCount(0);
      }
    } catch {
      // Set fallback values
      setNotifications([]);
      setNotificationCount(0);
    }
  }, [user?.id]);

  // Load weekly insights
  const loadWeeklyInsights = useCallback(async () => {
    if (!user?.id) return;

    try {
      const result = await getWeeklyAntiTodoInsights(user.id);
      if (result.success) {
        setWeeklyInsights(result.insights);
      } else {
        setWeeklyInsights(null);
      }
    } catch {
      setWeeklyInsights(null);
    }
  }, [user?.id]);

  // Check profile completion status
  const checkProfileCompletionStatus = useCallback(async () => {
    if (!user?.id) return;

    try {
      const result = await checkProfileCompletion(user.id);
      if (result.success) {
        const newProfileCompletion = {
          isCompleted: result.isCompleted,
          hasBasicInfo: result.hasBasicInfo,
          showNotification: !result.isCompleted && !result.hasBasicInfo,
          showModal: false, // Modal will be shown manually
        };
        
        setProfileCompletion(newProfileCompletion);

        console.log("Profile completion result:", result);

        // Show modal directly if not completed
        if (!result.isCompleted) {
          console.log("Profile incomplete, showing modal");
          setShowProfileModal(true);
        }

        // Create persistent notification if profile incomplete
        if (!result.isCompleted) {
          try {
            console.log("Creating profile completion notification");
            // Check if a profile completion notification already exists
            const notifications = await notificationService.getUserNotifications(user.id, true, 50);
            const hasProfileNotification = notifications.data?.some(n => 
              n.type === "profile_completion" && !n.dismissed
            );
            
            console.log("Existing profile notification:", hasProfileNotification);
            
            if (!hasProfileNotification) {
                              const notificationResult = await notificationService.createNotification(user.id, {
                  title: "Complete Your Profile",
                  message: "Help us personalize your experience by sharing your interests and preferences. Click to complete now!",
                  type: "profile_completion",
                  priority: "high",
                  icon: "🎯",
                  data: { persistent: true, action: "complete_profile" },
                });
              console.log("Profile notification created:", notificationResult);
              await loadNotifications();
            }
          } catch (error) {
            console.error("Failed to create profile completion notification:", error);
          }
        } else {
          console.log("Profile already completed, no notification needed");
        }
      }
    } catch (error) {
      console.error("Error checking profile completion:", error);
    }
  }, [user?.id, loadNotifications]);

  // Load notifications and anti-todo activities on mount
  // Load data and set up periodic notifications
  useEffect(() => {
    if (user?.id) {
      loadNotifications();
      loadWeeklyInsights();
      checkProfileCompletionStatus();

      // Start periodic notification checks
      try {
        notificationService.startPeriodicCheck(user.id, userProfile, 30); // Check every 30 minutes
      } catch {
        // Periodic notifications unavailable
      }

      // Cleanup on unmount
      return () => {
        try {
          notificationService.stopPeriodicCheck();
        } catch {
          // Error stopping periodic check
        }
      };
    }
  }, [user?.id, userProfile, loadNotifications, loadWeeklyInsights, checkProfileCompletionStatus]);

  // Handle notification click to open profile modal for profile completion notifications
  const handleNotificationAction = async (notification) => {
    if (notification.data?.action === "complete_profile") {
      setShowProfileModal(true);
    }
  };

  // Handle notification click
  const handleNotificationClick = async (notification) => {
    // Handle specific notification actions
    if (notification.data?.action) {
      await handleNotificationAction(notification);
    }

    if (!notification.read) {
      try {
        const result = await notificationService.markAsRead(
          user.id,
          notification.id,
        );
        if (result.success) {
          await loadNotifications(); // Refresh notifications
        } else {
          // Failed to mark notification as read
        }
      } catch {
        // Error marking notification as read
      }
    }
  };

  // Clear all notifications
  const clearAllNotifications = async () => {
    try {
      const result = await notificationService.clearAllNotifications(user.id);
      if (result.success) {
        await loadNotifications();
        setShowNotifications(false);
      } else {
        // Fallback: clear locally
        setNotifications([]);
        setNotificationCount(0);
        setShowNotifications(false);
      }
    } catch {
      // Fallback: clear locally
      setNotifications([]);
      setNotificationCount(0);
      setShowNotifications(false);
    }
  };

  // Format notification time
  const formatNotificationTime = (date) => {
    if (!date) return "Just now";

    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    return `${days} day${days > 1 ? "s" : ""} ago`;
  };

  useEffect(() => {
    // GSAP animations on mount
    const ctx = gsap.context(() => {
      gsap.set(".fade-in", { opacity: 0, y: 30 });
      gsap.to(".fade-in", {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power2.out",
      });
    }, containerRef);

    return () => ctx.revert();
  }, [activeTab]);

  // Animate tab changes
  const animateTabChange = (newTab) => {
    if (contentRef.current) {
      gsap.to(contentRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.2,
        ease: "power2.in",
        onComplete: () => {
          setActiveTab(newTab);
          gsap.to(contentRef.current, {
            opacity: 1,
            y: 0,
            duration: 0.3,
            ease: "power2.out",
          });
        },
      });
    } else {
      setActiveTab(newTab);
    }
  };

  // Professional floating background
  const FloatingBackground = () => {
    const bgRef = useRef(null);

    useEffect(() => {
      const ctx = gsap.context(() => {
        // Subtle floating orbs
        gsap.to(".floating-orb-1", {
          x: 50,
          y: -25,
          scale: 1.1,
          rotation: 180,
          duration: 30,
          repeat: -1,
          ease: "none",
        });

        gsap.to(".floating-orb-2", {
          x: -40,
          y: 30,
          scale: 0.9,
          rotation: -180,
          duration: 25,
          repeat: -1,
          ease: "none",
        });

        gsap.to(".floating-orb-3", {
          x: 30,
          y: -20,
          scale: 1.2,
          rotation: 180,
          duration: 35,
          repeat: -1,
          ease: "none",
        });
      }, bgRef);

      return () => ctx.revert();
    }, []);

    return (
      <div
        ref={bgRef}
        className="fixed inset-0 overflow-hidden pointer-events-none z-0"
      >
        {/* Subtle gradient orbs */}
        <div
          className={`floating-orb-1 absolute top-20 left-10 w-96 h-96 ${
            theme === "dark"
              ? "bg-gradient-to-r from-slate-800/10 to-gray-800/10"
              : "bg-gradient-to-r from-slate-200/20 to-gray-200/20"
          } rounded-full blur-3xl`}
        />

        <div
          className={`floating-orb-2 absolute top-40 right-20 w-80 h-80 ${
            theme === "dark"
              ? "bg-gradient-to-r from-indigo-800/8 to-purple-800/8"
              : "bg-gradient-to-r from-indigo-200/15 to-purple-200/15"
          } rounded-full blur-3xl`}
        />

        <div
          className={`floating-orb-3 absolute bottom-20 left-1/3 w-72 h-72 ${
            theme === "dark"
              ? "bg-gradient-to-r from-gray-800/5 to-slate-800/5"
              : "bg-gradient-to-r from-gray-200/10 to-slate-200/10"
          } rounded-full blur-3xl`}
        />
      </div>
    );
  };

  // Generate Activities Modal
  const GenerateModal = () => {
    const modalRef = useRef(null);

    useEffect(() => {
      if (showGenerateModal && modalRef.current) {
        gsap.fromTo(
          modalRef.current,
          { scale: 0.8, opacity: 0, y: 20 },
          { scale: 1, opacity: 1, y: 0, duration: 0.3, ease: "back.out(1.7)" },
        );
      }
    }, []);

    if (!showGenerateModal) return null;

    return (
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={() => setShowGenerateModal(false)}
      >
        <div
          ref={modalRef}
          className={`${themeColors.card} rounded-2xl p-8 border shadow-xl max-w-md w-full relative overflow-hidden`}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className={`absolute inset-0 bg-gradient-to-br ${premiumGradients.accent} opacity-5`}
          />

          <div className="relative z-10 text-center">
            <div
              className={`w-16 h-16 bg-gradient-to-br ${premiumGradients.accent} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm ${
                isGenerating ? "animate-pulse" : ""
              }`}
            >
              <Wand2 className="w-8 h-8 text-white" />
            </div>

            <h3
              className={`text-xl font-semibold ${themeColors.text.primary} mb-3`}
            >
              {isGenerating
                ? "Generating Activities..."
                : "Generate New Activities"}
            </h3>
            <p className={`${themeColors.text.secondary} mb-8`}>
              {isGenerating
                ? "Creating personalized activities based on your preferences"
                : "Get fresh activity recommendations tailored to your current mood"}
            </p>

            {!isGenerating ? (
              <div className="space-y-3">
                <Button
                  className={`w-full h-11 bg-gradient-to-r ${premiumGradients.accent} text-white rounded-xl font-medium`}
                  onClick={async () => {
                    setIsGenerating(true);
                    try {
                      const result =
                        await openaiService.generateAntiToDoActivities(
                          userProfile,
                          recentCheckins,
                          5,
                        );

                      // Save the generated activities to database
                      if (result.success && result.activities) {
                        try {
                          const saveResult = await saveAntiTodoList(
                            user.id,
                            result.activities,
                            {
                              type: result.type,
                              userMood: lastCheckinMood,
                              generatedAt: new Date().toISOString(),
                            },
                          );

                          if (saveResult.success) {
                            // Update local state
                            // Activities updated

                            // Create notification for successful generation
                            try {
                              await notificationService.createNotification(
                                user.id,
                                {
                                  title: "New Anti-Todo List Generated! ✨",
                                  message: `${result.activities.length} personalized activities are ready for you`,
                                  type: "success",
                                  icon: "✨",
                                  metadata: {
                                    activitiesCount: result.activities.length,
                                  },
                                },
                              );

                              // Refresh notifications
                              await loadNotifications();
                            } catch {
                              // Failed to create notification
                            }
                          } else {
                            // Failed to save anti-todo list
                          }
                        } catch {
                          // Error saving anti-todo list
                        }
                      }

                      if (result.success) {
                        // Map icon names to actual components
                        const activitiesWithIcons = result.activities.map(
                          (activity) => ({
                            ...activity,
                            icon: getIconComponent(activity.icon),
                          }),
                        );
                        const newActivities = [
                          ...activitiesWithIcons,
                          ...activities,
                        ];
                        setActivities(newActivities);

                        // Save activities to database
                        await saveUserActivities(user.id, newActivities);
                        setShowGenerateModal(false);
                      } else {
                        setSuccessMessage(
                          "Failed to generate activities. Please try again.",
                        );
                        setToastType("error");
                        setShowSuccessToast(true);
                        setTimeout(() => setShowSuccessToast(false), 3000);
                      }
                    } catch {
                      setSuccessMessage(
                        "Error generating activities. Please try again.",
                      );
                      setToastType("error");
                      setShowSuccessToast(true);
                      setTimeout(() => setShowSuccessToast(false), 3000);
                    } finally {
                      setIsGenerating(false);
                    }
                  }}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Activities
                </Button>
                <Button
                  variant="outline"
                  className="w-full h-11 rounded-xl"
                  onClick={() => setShowGenerateModal(false)}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                  <div
                    className={`h-2 bg-gradient-to-r ${premiumGradients.accent} rounded-full animate-pulse`}
                    style={{ width: "100%" }}
                  />
                </div>
                <p className={`text-sm ${themeColors.text.muted}`}>
                  This may take a few moments...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Professional Notification Panel
  const NotificationPanel = () => (
    <Popover open={showNotifications} onOpenChange={setShowNotifications}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`relative ${themeColors.text.muted} hover:${themeColors.text.primary} transition-all duration-300 hover:bg-slate-500/10 rounded-xl`}
        >
          <Bell className="w-5 h-5" />
          {notificationCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-xs text-white font-medium shadow-sm">
              {notificationCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={`w-96 p-0 ${themeColors.card} border shadow-xl rounded-xl overflow-hidden`}
        align="end"
      >
        <div className="p-6 border-b border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center justify-between">
            <h3 className={`text-lg font-semibold ${themeColors.text.primary}`}>
              Notifications
            </h3>
            <div className="flex items-center gap-2">
              <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-2 py-1 rounded-full text-xs">
                {notificationCount} new
              </Badge>
              {notifications && notifications.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllNotifications}
                  className="text-xs h-6 px-2 hover:bg-red-500/10 hover:text-red-600"
                >
                  Clear All
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {!notifications || notifications.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-4xl mb-3">🔔</div>
              <p className={`${themeColors.text.muted} text-sm`}>
                No notifications yet
              </p>
            </div>
          ) : (
            (notifications || []).map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`p-4 border-b border-slate-200/30 dark:border-slate-700/30 ${themeColors.cardHover} transition-all duration-300 cursor-pointer group relative ${!notification.read ? "bg-blue-50/50 dark:bg-blue-900/20" : ""}`}
              >
                {!notification.read && (
                  <div className="absolute left-2 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full"></div>
                )}
                <div className="flex items-start gap-4 ml-4">
                  <div className="text-xl group-hover:scale-105 transition-transform duration-300">
                    {notification.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4
                      className={`${themeColors.text.primary} font-medium text-sm ${!notification.read ? "font-semibold" : ""}`}
                    >
                      {notification.title}
                    </h4>
                    <p
                      className={`${themeColors.text.secondary} text-sm mt-1 line-clamp-2`}
                    >
                      {notification.message}
                    </p>
                    <p className={`${themeColors.text.muted} text-xs mt-2`}>
                      {formatNotificationTime(notification.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-slate-200/50 dark:border-slate-700/50">
          <Button
            variant="ghost"
            onClick={clearAllNotifications}
            className={`w-full ${themeColors.text.secondary} hover:${themeColors.text.primary} hover:bg-red-500/10 hover:text-red-600 rounded-lg`}
          >
            Clear All Notifications
            <X className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );

  // Professional Profile Dropdown
  const ProfileDropdown = () => {
    const getProfileImage = () => {
      // Check multiple possible locations for profile photo
      const photoURL = user?.user_metadata?.avatar_url || 
                      user?.user_metadata?.picture || 
                      user?.photoURL || 
                      user?.avatar_url;
                      
      if (!photoURL) {
        const name =
          userProfile?.username || user?.displayName || user?.user_metadata?.full_name || user?.email || "User";
        const initials = name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=6366F1&color=fff&size=128&format=svg`;
      }
      return photoURL;
    };

    return (
      <Popover open={showProfile} onOpenChange={setShowProfile}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className={`flex items-center space-x-3 h-10 px-3 ${themeColors.cardHover} rounded-xl transition-all duration-300 group`}
          >
            <div className="relative">
              <img
                className="w-8 h-8 rounded-lg object-cover ring-2 ring-indigo-400/30 group-hover:ring-indigo-400/50 transition-all duration-300"
                src={getProfileImage()}
                alt="Profile"
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-background shadow-sm"></div>
            </div>
            <div className="hidden md:block text-left">
              <p className={`text-sm font-medium ${themeColors.text.primary}`}>
                {userProfile?.username ||
                  user?.displayName?.split(" ")[0] ||
                  "User"}
              </p>
              <p className={`text-xs ${themeColors.text.muted}`}>
                Wellness Explorer
              </p>
            </div>
            <ChevronDown
              className={`w-4 h-4 ${themeColors.text.muted} transition-all duration-300 group-hover:rotate-180`}
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className={`w-72 p-0 ${themeColors.card} border shadow-xl rounded-xl overflow-hidden`}
          align="end"
        >
          {/* Profile Header */}
          <div
            className={`p-6 bg-gradient-to-br ${premiumGradients.accent} relative overflow-hidden`}
          >
            <div className="absolute inset-0 bg-white/5" />
            <div className="relative z-10 flex items-center space-x-4">
              <img
                className="w-12 h-12 rounded-xl object-cover ring-4 ring-white/20 shadow-sm"
                src={getProfileImage()}
                alt="Profile"
              />
              <div>
                <div className="font-semibold text-white text-base">
                  {userProfile?.username || user?.displayName || "User"}
                </div>
                <div className="text-white/80 text-sm">{user?.email}</div>
                <Badge className="bg-white/20 text-white border-white/30 mt-2 px-2 py-1 rounded-full text-xs">
                  ✨ Premium Explorer
                </Badge>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-2">
            <div className="space-y-1">
              <Button
                variant="ghost"
                className={`w-full justify-start px-4 py-3 ${themeColors.text.secondary} hover:${themeColors.text.primary} hover:bg-violet-500/10 rounded-lg transition-all duration-300 group`}
                onClick={() => {
                  setShowSettingsModal(true);
                  setShowProfile(false);
                }}
              >
                <Settings className="w-4 h-4 mr-3" />
                Account Settings
              </Button>

              <Button
                variant="ghost"
                onClick={toggleTheme}
                className={`w-full justify-start px-4 py-3 ${themeColors.text.secondary} hover:${themeColors.text.primary} hover:bg-amber-500/10 rounded-lg transition-all duration-300 group`}
              >
                {theme === "dark" ? (
                  <Sun className="w-4 h-4 mr-3" />
                ) : (
                  <Moon className="w-4 h-4 mr-3" />
                )}
                {theme === "dark" ? "Light Mode" : "Dark Mode"}
              </Button>
            </div>
          </div>

          {/* Sign Out */}
          <div className="p-2 border-t border-slate-200/50 dark:border-slate-700/50">
            <Button
              variant="ghost"
              onClick={() => {
                signOut();
                setShowProfile(false);
              }}
              className="w-full justify-start px-4 py-3 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-300 group"
            >
              <LogOut className="w-4 h-4 mr-3" />
              Sign Out
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    );
  };

  // Load recent check-ins and activities on component mount
  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        // Load recent check-ins (for the last 5, for general display)
        const recentCheckinsResult = await getUserCheckins(user.id, null, null, 5);
        if (recentCheckinsResult.success) {
          setRecentCheckins(recentCheckinsResult.data);
        }

        // Load weekly check-ins (for the last 7 days, for the chart)
        const today = new Date();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(today.getDate() - 6); // Get checkins for the last 7 days including today

        const weeklyCheckinsResult = await getUserCheckins(
          user.id,
          sevenDaysAgo.toISOString().split('T')[0],
          today.toISOString().split('T')[0],
          100 // A reasonable limit for weekly checkins
        );

        if (weeklyCheckinsResult.success) {
          // Filter to ensure only unique days are counted for the chart if multiple checkins per day
          const uniqueDailyCheckins = weeklyCheckinsResult.data.reduce((acc, checkin) => {
            const date = checkin.checkin_date;
            if (!acc[date]) {
              acc[date] = checkin;
            }
            return acc;
          }, {});
          setWeeklyChartCheckins(Object.values(uniqueDailyCheckins));
        }

        // Load saved activities with robust error handling
        try {
          const activitiesResult = await getUserActivities(user.id);
          if (activitiesResult.success && activitiesResult.data && Array.isArray(activitiesResult.data)) {
            // Map icon names to actual components for saved activities
            const activitiesWithIcons = activitiesResult.data.map(
              (activity) => ({
                ...activity,
                icon: getIconComponent(activity.icon),
              }),
            );
            setActivities(activitiesWithIcons);
          } else {
            console.warn('Failed to load activities or activities is not an array:', activitiesResult);
            setActivities([]); // Set empty array as fallback
          }
        } catch (error) {
          console.error('Error loading activities:', error);
          setActivities([]); // Set empty array as fallback
        }
      }
    };
    loadUserData();
  }, [user]);

  // Helper function to convert emoji to mood score (1-10)
  const convertEmojiToScore = (emoji) => {
    const emojiScoreMap = {
      '😭': 1, '😢': 2, '😔': 3, '😐': 4, '🙂': 5,
      '😊': 6, '😄': 7, '😁': 8, '🤩': 9, '🥳': 10
    };
    return emojiScoreMap[emoji] || 5; // Default to neutral if emoji not found
  };

  // Helper function to get AI score from OpenAI
  const getAIScore = async (emoji, text) => {
    try {
      // For now, return a placeholder score based on emoji and text length
      // TODO: Implement actual OpenAI integration
      const baseScore = convertEmojiToScore(emoji);
      const textBonus = text.length > 50 ? 1 : 0; // Bonus for detailed entries
      return Math.min(10, baseScore + textBonus);
    } catch (error) {
      console.error('Error getting AI score:', error);
      return convertEmojiToScore(emoji); // Fallback to emoji score
    }
  };

  // Add error logging to checkin submission
  const logCheckinData = (data) => {
    console.log('Checkin data being submitted:', {
      moodScore: data.moodScore,
      moodText: data.moodText,
      aiScore: data.aiScore,
      moodEmoji: data.moodEmoji,
      hashtags: data.hashtags
    });
  };

  // Checkin functionality
  const handleCheckinSubmit = async (checkinData) => {
    const moodEmoji = checkinData?.emoji;
    const notes = checkinData?.notes || "";
    const hashtags = checkinData?.hashtags || [];

    // Validate that at least one field is filled
    if (!moodEmoji && !notes.trim()) {
      return; // Don't submit if both are empty
    }

    setIsSubmitting(true);

    try {
      // Convert emoji to mood score (1-10 scale)
      const moodScore = convertEmojiToScore(moodEmoji);
      
      // Get AI score from OpenAI (placeholder for now, will implement)
      const aiScore = await getAIScore(moodEmoji, notes);
      
      const checkinPayload = {
        moodScore: moodScore,
        moodText: notes,
        aiScore: aiScore,
        moodEmoji: moodEmoji, // Keep original emoji for display
        hashtags: hashtags,
      };
      
      // Log the data being submitted for debugging
      logCheckinData(checkinPayload);
      
      const result = await submitCheckin(user.id, checkinPayload);

      if (result.success) {
        // Update local state
        setLastCheckinMood(moodEmoji);

        // Refresh user profile to get updated stats
        await refreshUserProfile();
        console.log('User profile refreshed. Current userProfile:', userProfile);
        console.log('Current dashboardData:', dashboardData);

        // Reload recent check-ins
        const checkinsResult = await getUserCheckins(user.id, 5);
        if (checkinsResult.success) {
          setRecentCheckins(checkinsResult.data);
        }

        // Check for new achievements
        try {
          const achievementResult = await checkAndUnlockAchievements(user.id);
          if (
            achievementResult.newlyUnlocked &&
            achievementResult.newlyUnlocked.length > 0
          ) {
            // Show achievement notification
            const achievementNames = achievementResult.newlyUnlocked
              .map((a) => a.title)
              .join(", ");
            setSuccessMessage(
              `🏆 Achievement unlocked: ${achievementNames}! Check your Achievements tab to see your progress.`,
            );
            setToastType("achievement");
          }
        } catch (error) {
          console.error("Error checking achievements:", error);
        }

        // Close drawer and reset form
        setShowCheckinDrawer(false);

        // Show styled success notification
        setSuccessMessage(
          `Check-in completed! Your mood has been recorded.`,
        );
        setToastType("success");
        setShowSuccessToast(true);

        // Auto-hide success message after 3 seconds
        setTimeout(() => {
          setShowSuccessToast(false);
        }, 3000);

        // Show AI nudges after successful check-in (delayed)
        setTimeout(() => {
          setShowAINudges(true);
        }, 1000);
      } else {
        console.error('Checkin submission failed:', result);
        setSuccessMessage(`Failed to submit check-in: ${result.error || 'Unknown error'}. Please try again.`);
        setToastType("error");
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 3000);
      }
    } catch (error) {
      console.error('Caught error in handleCheckinSubmit:', error);
      setSuccessMessage("Error submitting check-in. Please try again.");
      setToastType("error");
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Enhanced Tab Navigation Component
  const TabNavigation = () => (
    <div className="mb-8">
      <div
        className={`p-2 ${themeColors.card} rounded-3xl border shadow-lg backdrop-blur-xl`}
      >
        <div className="grid grid-cols-5 gap-2">
          {navigationTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => animateTabChange(tab.id)}
                className={`relative flex flex-col items-center space-y-1.5 px-4 py-2.5 rounded-xl transition-all duration-500 font-medium group overflow-hidden ${
                  isActive
                    ? `bg-gradient-to-br ${tab.gradient} text-white shadow-lg scale-105 transform`
                    : `${themeColors.text.muted} hover:${themeColors.text.primary} hover:bg-slate-700/30 hover:scale-102 transform`
                }`}
              >
                {/* Animated background glow for active tab */}
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-xl animate-pulse" />
                )}

                {/* Icon container with enhanced styling */}
                <div
                  className={`relative p-1.5 rounded-lg transition-all duration-300 ${
                    isActive
                      ? "bg-white/20 shadow-md"
                      : `${tab.bgColor} group-hover:bg-opacity-80 group-hover:scale-110`
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 transition-all duration-300 ${isActive ? "drop-shadow-sm" : ""}`}
                  />

                  {/* Subtle glow effect for active icon */}
                  {isActive && (
                    <div className="absolute inset-0 bg-white/10 rounded-lg blur-sm" />
                  )}
                </div>

                {/* Enhanced label with better typography */}
                <span
                  className={`text-xs font-semibold tracking-wide transition-all duration-300 ${
                    isActive ? "text-white drop-shadow-sm" : ""
                  }`}
                >
                  {tab.label}
                </span>

                {/* Active indicator dot */}
                {isActive && (
                  <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full shadow-md animate-pulse" />
                )}

                {/* Hover effect overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "Dashboard":
        return (
          <div className="space-y-8">
            {/* Enhanced Welcome Section */}
            <div className="fade-in grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Check-in Card */}
              <div className="lg:col-span-2">
                <Card
                  className={`${themeColors.card} border-0 overflow-hidden relative shadow-sm h-full`}
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${premiumGradients.accent} opacity-5`}
                  />
                  <CardContent className="p-8 relative z-10 flex flex-col justify-center items-center text-center h-full min-h-[280px]">
                    <div className="space-y-6 max-w-md">
                      <div className="relative">
                        <div
                          className={`w-16 h-16 bg-gradient-to-br ${premiumGradients.accent} rounded-2xl flex items-center justify-center shadow-lg mx-auto`}
                        >
                          <Smile className="w-8 h-8 text-white" />
                        </div>
                        <div className="absolute -inset-2 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-3xl blur-xl -z-10 animate-pulse"></div>
                      </div>

                      <div className="space-y-3">
                        <h1
                          className={`text-2xl font-bold ${themeColors.text.primary}`}
                        >
                          How are you feeling today?
                        </h1>
                        <p
                          className={`${themeColors.text.secondary} text-sm leading-relaxed`}
                        >
                          Welcome back,{" "}
                          <span className="font-medium text-blue-400">
                            {userProfile?.username ||
                              user?.displayName ||
                              "Explorer"}
                          </span>
                          ! Take a moment to reflect and share your thoughts.
                        </p>
                      </div>

                      <Button
                        onClick={() => setShowCheckinDrawer(true)}
                        className={`bg-gradient-to-r ${premiumGradients.secondary} hover:shadow-xl hover:scale-105 text-white h-11 px-6 rounded-xl font-medium transition-all duration-300 w-full max-w-xs`}
                      >
                        <Heart className="w-4 h-4 mr-2" />
                        Start Check-in
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Calendar Tracker */}
              <div>
                <CalendarTracker theme={theme} currentStreak={userProfile?.currentStreak} />
              </div>
            </div>

            {/* Enhanced Stats Overview */}
            <div className="fade-in">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2
                    className={`text-xl font-semibold ${themeColors.text.primary} mb-1`}
                  >
                    Your Wellness Overview
                  </h2>
                  <p className={`${themeColors.text.secondary}`}>
                    Track your progress and patterns
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => animateTabChange("Joy Tracker")}
                  className="rounded-xl border-2"
                >
                  View Details
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                <Card className={`${themeColors.card} border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 group overflow-hidden relative`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-purple-500/5 to-fuchsia-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <CardContent className="p-3 sm:p-4 lg:p-6 relative z-10">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div
                        className={`p-2 sm:p-3 rounded-xl bg-gradient-to-br ${premiumGradients.primary} shadow-lg shadow-violet-500/25 group-hover:shadow-violet-500/40 transition-all duration-300`}
                      >
                        <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
                      </div>
                      <span
                        className={`text-xs ${themeColors.text.muted} uppercase tracking-wide font-semibold bg-violet-500/10 px-2 py-1 rounded-full`}
                      >
                        Total
                      </span>
                    </div>
                    <div
                      className={`text-xl sm:text-2xl lg:text-3xl font-bold ${themeColors.text.primary} mb-1 sm:mb-2 group-hover:text-violet-600 transition-colors duration-300`}
                    >
                      {dashboardData.totalCheckIns}
                    </div>
                    <p className={`text-xs sm:text-sm ${themeColors.text.secondary} font-medium`}>
                      Check-ins ✨
                    </p>
                  </CardContent>
                </Card>

                <Card className={`${themeColors.card} border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 group overflow-hidden relative`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-teal-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <CardContent className="p-3 sm:p-4 lg:p-6 relative z-10">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div
                        className={`p-2 sm:p-3 rounded-xl bg-gradient-to-br ${premiumGradients.secondary} shadow-lg shadow-emerald-500/25 group-hover:shadow-emerald-500/40 transition-all duration-300`}
                      >
                        <Calendar className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
                      </div>
                      <span
                        className={`text-xs ${themeColors.text.muted} uppercase tracking-wide font-semibold bg-emerald-500/10 px-2 py-1 rounded-full`}
                      >
                        Weekly
                      </span>
                    </div>
                    <div
                      className={`text-xl sm:text-2xl lg:text-3xl font-bold ${themeColors.text.primary} mb-1 sm:mb-2 group-hover:text-emerald-600 transition-colors duration-300`}
                    >
                      {dashboardData.weeklyProgress}/7
                    </div>
                    <p className={`text-xs sm:text-sm ${themeColors.text.secondary} font-medium`}>
                      This Week 🔥
                    </p>
                  </CardContent>
                </Card>

                <Card className={`${themeColors.card} border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 group overflow-hidden relative`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-orange-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <CardContent className="p-3 sm:p-4 lg:p-6 relative z-10">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div
                        className={`p-2 sm:p-3 rounded-xl bg-gradient-to-br ${premiumGradients.accent} shadow-lg shadow-amber-500/25 group-hover:shadow-amber-500/40 transition-all duration-300`}
                      >
                        <Clock className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
                      </div>
                      <span
                        className={`text-xs ${themeColors.text.muted} uppercase tracking-wide font-semibold bg-amber-500/10 px-2 py-1 rounded-full`}
                      >
                        Recent
                      </span>
                    </div>
                    <div
                      className={`text-xl sm:text-2xl lg:text-3xl font-bold ${themeColors.text.primary} mb-1 sm:mb-2 group-hover:text-amber-600 transition-colors duration-300`}
                    >
                      {dashboardData.lastCheckIn}
                    </div>
                    <p className={`text-xs sm:text-sm ${themeColors.text.secondary} font-medium`}>
                      Last Check-in 📝
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Weekly Insights Widget */}
            {weeklyInsights && (
              <div className="fade-in">
                <Card className={`${themeColors.card} border-0 shadow-sm`}>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg bg-gradient-to-br ${premiumGradients.secondary} shadow-sm`}
                        >
                          <TrendingUp className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3
                            className={`font-semibold ${themeColors.text.primary}`}
                          >
                            Weekly Progress Insights
                          </h3>
                          <p className={`text-xs ${themeColors.text.muted}`}>
                            Your anti-todo completion this week
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`text-2xl font-bold ${themeColors.text.primary}`}
                        >
                          {weeklyInsights.weeklyProgress?.completionRate || 0}%
                        </div>
                        <p className={`text-xs ${themeColors.text.muted}`}>
                          Complete
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <p className={`text-sm ${themeColors.text.secondary}`}>
                        {weeklyInsights.message}
                      </p>
                      {weeklyInsights.suggestions &&
                        weeklyInsights.suggestions.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {weeklyInsights.suggestions
                              .slice(0, 2)
                              .map((suggestion, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className={`text-xs ${themeColors.text.muted} border-slate-300 dark:border-slate-600`}
                                >
                                  💡 {suggestion}
                                </Badge>
                              ))}
                          </div>
                        )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        );

      case "Joy Tracker":
        return (
          <div className="space-y-8">
            <div className="fade-in">
              {/* Analytics Dashboard */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Main Chart Area */}
                <div className="lg:col-span-2">
                  <Card
                    className={`${themeColors.card} border-0 shadow-sm h-full`}
                  >
                    <CardHeader>
                      <CardTitle
                        className={`text-lg ${themeColors.text.primary} flex items-center gap-3`}
                      >
                        <div
                          className={`p-2 rounded-lg bg-gradient-to-br ${premiumGradients.secondary}`}
                        >
                          <BarChart3 className="w-5 h-5 text-white" />
                        </div>
                        Weekly Mood Trends
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <WeeklyMoodChart
                        checkins={weeklyChartCheckins}
                        themeColors={themeColors}
                      />
                    </CardContent>
                  </Card>
                </div>

                {/* Stats Sidebar */}
                <div className="space-y-4">
                  <Card className={`${themeColors.card} border-0 shadow-sm`}>
                    <CardContent className="p-6 text-center">
                      <div
                        className={`w-16 h-16 bg-gradient-to-br ${premiumGradients.primary} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm`}
                      >
                        <Calendar className="w-8 h-8 text-white" />
                      </div>
                      <div
                        className={`text-3xl font-bold ${themeColors.text.primary} mb-1`}
                      >
                        {dashboardData.totalCheckIns}
                      </div>
                      <p
                        className={`${themeColors.text.secondary} font-medium`}
                      >
                        Total Check-ins
                      </p>
                      <p className={`text-xs ${themeColors.text.muted} mt-2`}>
                        All time
                      </p>
                    </CardContent>
                  </Card>

                  <Card className={`${themeColors.card} border-0 shadow-sm`}>
                    <CardContent className="p-6 text-center">
                      <div
                        className={`w-16 h-16 bg-gradient-to-br ${premiumGradients.accent} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm`}
                      >
                        <Flame className="w-8 h-8 text-white" />
                      </div>
                      <div
                        className={`text-3xl font-bold ${themeColors.text.primary} mb-1`}
                      >
                        {dashboardData.currentStreak}
                      </div>
                      <p
                        className={`${themeColors.text.secondary} font-medium`}
                      >
                        Current Streak
                      </p>
                      <p className={`text-xs ${themeColors.text.muted} mt-2`}>
                        Keep it going!
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Enhanced Mood Insights */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Moods */}
                <Card className={`${themeColors.card} border-0 shadow-sm`}>
                  <CardHeader>
                    <CardTitle
                      className={`text-lg ${themeColors.text.primary} flex items-center gap-3`}
                    >
                      <div
                        className={`p-2 rounded-lg bg-gradient-to-br ${premiumGradients.secondary}`}
                      >
                        <Heart className="w-5 h-5 text-white" />
                      </div>
                      Your Top Moods This Week
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {topMoods.map((mood, index) => (
                        <div
                          key={`${mood.emoji}-${mood.label}`}
                          className={`p-4 ${themeColors.cardHover} rounded-xl border border-slate-200/50 dark:border-slate-700/30 transition-all duration-300 group cursor-pointer`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="relative">
                                <div
                                  className={`p-3 rounded-xl bg-gradient-to-br ${mood.color} shadow-sm group-hover:scale-105 transition-transform duration-300`}
                                >
                                  <span className="text-xl">{mood.emoji}</span>
                                </div>
                                <div
                                  className={`absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br ${premiumGradients.accent} rounded-full flex items-center justify-center text-xs text-white font-bold`}
                                >
                                  {index + 1}
                                </div>
                              </div>
                              <div>
                                <span
                                  className={`text-base font-medium ${themeColors.text.primary}`}
                                >
                                  {mood.label}
                                </span>
                                <p
                                  className={`text-sm ${themeColors.text.muted}`}
                                >
                                  Most frequent this week
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div
                                className={`text-xl font-semibold ${themeColors.text.primary}`}
                              >
                                {mood.count}
                              </div>
                              <p
                                className={`text-sm ${themeColors.text.muted}`}
                              >
                                times
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Weekly Progress */}
                <Card className={`${themeColors.card} border-0 shadow-sm`}>
                  <CardHeader>
                    <CardTitle
                      className={`text-lg ${themeColors.text.primary} flex items-center gap-3`}
                    >
                      <div
                        className={`p-2 rounded-lg bg-gradient-to-br ${premiumGradients.accent}`}
                      >
                        <Target className="w-5 h-5 text-white" />
                      </div>
                      Weekly Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="text-center">
                        <div
                          className={`text-4xl font-bold ${themeColors.text.primary} mb-2`}
                        >
                          {dashboardData.weeklyProgress}/7
                        </div>
                        <p
                          className={`${themeColors.text.secondary} font-medium`}
                        >
                          Check-ins this week
                        </p>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span
                            className={`text-sm ${themeColors.text.secondary}`}
                          >
                            Progress
                          </span>
                          <span
                            className={`text-sm font-medium ${themeColors.text.primary}`}
                          >
                            {Math.round(
                              (dashboardData.weeklyProgress / 7) * 100,
                            )}
                            %
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                          <div
                            className={`h-2 bg-gradient-to-r ${premiumGradients.secondary} rounded-full transition-all duration-300`}
                            style={{
                              width: `${(dashboardData.weeklyProgress / 7) * 100}%`,
                            }}
                          ></div>
                        </div>
                        <p
                          className={`text-xs ${themeColors.text.muted} text-center`}
                        >
                          {7 - dashboardData.weeklyProgress} more check-ins to
                          complete your weekly goal
                        </p>
                      </div>

                      <Button
                        onClick={() => setShowCheckinDrawer(true)}
                        className={`w-full bg-gradient-to-r ${premiumGradients.secondary} text-white rounded-xl font-medium`}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Check-in
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        );

      case "Anti-To-Do":
        return <AntiTodoList userId={user.id} />;

      case "Community":
        return (
          <div className="space-y-8">
            <div className="fade-in">
              {/* Enhanced Header */}
              <div className="mb-8">
                <div className="flex items-center gap-4 mb-6">
                  <div
                    className={`p-3 rounded-2xl bg-gradient-to-br ${premiumGradients.secondary} shadow-sm`}
                  >
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1
                      className={`text-3xl font-semibold ${themeColors.text.primary} mb-1`}
                    >
                      Community
                    </h1>
                    <p className={`${themeColors.text.secondary} text-lg`}>
                      Connect with others on their wellness journey and share
                      meaningful moments
                    </p>
                  </div>
                </div>
              </div>

              {/* Community Preview Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <Card className={`${themeColors.card} border-0 shadow-sm`}>
                  <CardContent className="p-8">
                    <div
                      className={`w-16 h-16 bg-gradient-to-br ${premiumGradients.secondary} rounded-2xl flex items-center justify-center mb-6 shadow-sm`}
                    >
                      <UserPlus className="w-8 h-8 text-white" />
                    </div>
                    <h3
                      className={`text-xl font-semibold ${themeColors.text.primary} mb-3`}
                    >
                      Connect & Share
                    </h3>
                    <p
                      className={`${themeColors.text.secondary} mb-6 leading-relaxed`}
                    >
                      Join a supportive community where you can share your
                      wellness journey, celebrate milestones, and inspire others
                      through authentic connections.
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                        <span
                          className={`text-sm ${themeColors.text.secondary}`}
                        >
                          Share daily check-ins
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                        <span
                          className={`text-sm ${themeColors.text.secondary}`}
                        >
                          Celebrate achievements
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                        <span
                          className={`text-sm ${themeColors.text.secondary}`}
                        >
                          Find accountability partners
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className={`${themeColors.card} border-0 shadow-sm`}>
                  <CardContent className="p-8">
                    <div
                      className={`w-16 h-16 bg-gradient-to-br ${premiumGradients.accent} rounded-2xl flex items-center justify-center mb-6 shadow-sm`}
                    >
                      <MessageCircle className="w-8 h-8 text-white" />
                    </div>
                    <h3
                      className={`text-xl font-semibold ${themeColors.text.primary} mb-3`}
                    >
                      Wellness Groups
                    </h3>
                    <p
                      className={`${themeColors.text.secondary} mb-6 leading-relaxed`}
                    >
                      Join specialized groups focused on specific wellness goals
                      like mindfulness, fitness, mental health, or personal
                      growth with guided activities.
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                        <span
                          className={`text-sm ${themeColors.text.secondary}`}
                        >
                          Join interest-based groups
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                        <span
                          className={`text-sm ${themeColors.text.secondary}`}
                        >
                          Participate in challenges
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                        <span
                          className={`text-sm ${themeColors.text.secondary}`}
                        >
                          Access expert guidance
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Coming Soon Features */}
              <Card className={`${themeColors.card} border-0 shadow-sm`}>
                <CardContent className="p-10 text-center">
                  <div
                    className={`w-20 h-20 bg-gradient-to-br ${premiumGradients.secondary} rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm`}
                  >
                    <Sparkles className="w-10 h-10 text-white" />
                  </div>
                  <h3
                    className={`text-2xl font-semibold ${themeColors.text.primary} mb-3`}
                  >
                    Community Features Coming Soon
                  </h3>
                  <p
                    className={`${themeColors.text.secondary} mb-8 text-lg max-w-2xl mx-auto leading-relaxed`}
                  >
                    We're building a supportive space where you can connect with
                    like-minded individuals, share your wellness journey, and
                    find inspiration in others' stories.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="text-center">
                      <div
                        className={`w-12 h-12 bg-gradient-to-br ${premiumGradients.primary} rounded-xl flex items-center justify-center mx-auto mb-3`}
                      >
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <h4
                        className={`font-medium ${themeColors.text.primary} mb-2`}
                      >
                        Community Feed
                      </h4>
                      <p className={`text-sm ${themeColors.text.muted}`}>
                        Share updates and see others' progress
                      </p>
                    </div>
                    <div className="text-center">
                      <div
                        className={`w-12 h-12 bg-gradient-to-br ${premiumGradients.secondary} rounded-xl flex items-center justify-center mx-auto mb-3`}
                      >
                        <Trophy className="w-6 h-6 text-white" />
                      </div>
                      <h4
                        className={`font-medium ${themeColors.text.primary} mb-2`}
                      >
                        Group Challenges
                      </h4>
                      <p className={`text-sm ${themeColors.text.muted}`}>
                        Participate in wellness challenges
                      </p>
                    </div>
                    <div className="text-center">
                      <div
                        className={`w-12 h-12 bg-gradient-to-br ${premiumGradients.accent} rounded-xl flex items-center justify-center mx-auto mb-3`}
                      >
                        <Heart className="w-6 h-6 text-white" />
                      </div>
                      <h4
                        className={`font-medium ${themeColors.text.primary} mb-2`}
                      >
                        Support Network
                      </h4>
                      <p className={`text-sm ${themeColors.text.muted}`}>
                        Find and offer peer support
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      className={`bg-gradient-to-r ${premiumGradients.secondary} text-white h-11 px-6 rounded-xl font-medium transition-all duration-300 hover:shadow-lg`}
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Join Early Access
                    </Button>
                    <Button
                      variant="outline"
                      className="h-11 px-6 rounded-xl font-medium border-2"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Share Ideas
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case "Achievements":
        return <Achievements />;

      default:
        return null;
    }
  };

  // Authentication guard - redirect to auth if not logged in
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!user) {
        navigate("/auth");
      }
    }, 200); // Small delay to prevent race condition
    
    return () => clearTimeout(timer);
  }, [user, navigate]);

  // Show loading briefly while user state is being set
  if (!user) {
    return <div>Loading user...</div>;
  }

  // Loading state while user profile is being fetched
  if (!userProfile) {
    return (
      <div
        className={`min-h-screen ${themeColors.background} flex items-center justify-center`}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className={`${themeColors.text.secondary} text-lg`}>
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${themeColors.background} relative overflow-hidden transition-colors duration-500`}
    >
      {/* Professional Floating Background */}
      <FloatingBackground />

      {/* Header */}
      <header
        className={`relative z-10 ${themeColors.card} border-b backdrop-blur-xl shadow-sm`}
      >
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div
                className={`w-8 h-8 bg-gradient-to-r ${premiumGradients.secondary} rounded-xl flex items-center justify-center shadow-sm`}
              >
                <span className="text-white font-semibold text-sm">O</span>
              </div>
              <span
                className={`text-xl font-semibold bg-gradient-to-r ${premiumGradients.secondary} bg-clip-text text-transparent`}
              >
                OFFLY
              </span>
            </div>

            {/* User Actions */}
            <div className="flex items-center space-x-3">
              <NotificationPanel />
              <ProfileDropdown />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content with Tab Navigation */}
      <main
        className="relative z-10 max-w-7xl mx-auto px-6 py-6"
        ref={containerRef}
      >
        {/* Tab Navigation */}
        <TabNavigation />

        {/* Content */}
        <div ref={contentRef}>{renderTabContent()}</div>
      </main>

      {/* Modals */}
      <GenerateModal />

      {/* Import and Use New CheckinDrawer */}
      <CheckinDrawer
        showCheckinDrawer={showCheckinDrawer}
        setShowCheckinDrawer={setShowCheckinDrawer}
        handleCheckinSubmit={handleCheckinSubmit}
        theme={theme}
        isSubmitting={isSubmitting}
      />

      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
          <Card className={`${themeColors.card} border-0 shadow-xl max-w-sm`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    toastType === "success"
                      ? "bg-gradient-to-r from-green-500 to-emerald-500"
                      : "bg-gradient-to-r from-red-500 to-rose-500"
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <h3
                    className={`font-medium ${themeColors.text.primary} mb-1`}
                  >
                    {toastType === "success" ? "Check-in Complete!" : "Oops!"}
                  </h3>
                  <p className={`text-sm ${themeColors.text.secondary}`}>
                    {successMessage}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSuccessToast(false)}
                  className="h-6 w-6 p-0 flex-shrink-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* AI Nudges */}
      {showAINudges && user && userProfile && (
        <AINudges
          user={user}
          userProfile={userProfile}
          recentCheckins={recentCheckins}
          currentMood={lastCheckinMood}
          onClose={() => setShowAINudges(false)}
        />
      )}

      {/* Profile Completion Modal */}
      <ProfileCompletionModal
        user={user}
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onComplete={async () => {
          setShowProfileModal(false);
          await refreshUserProfile();
          
          // Clear profile completion notification specifically
          try {
            await notificationService.clearProfileCompletionNotification(user.id);
          } catch (error) {
            console.error("Failed to clear profile completion notification:", error);
          }
          
          await checkProfileCompletionStatus();
          await loadNotifications(); // Refresh notifications
        }}
      />

      {/* Profile Settings Modal */}
      <ProfileSettingsModal
        user={user}
        userProfile={userProfile}
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        onSave={async (data) => {
          await refreshUserProfile();
          await loadNotifications();
        }}
      />
    </div>
  );
};

export default Dashboard;
