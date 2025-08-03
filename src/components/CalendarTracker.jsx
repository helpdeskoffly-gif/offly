import React, { useRef, useEffect, useMemo, useState, useCallback } from "react";
import { gsap } from "gsap";
import { Card, CardContent } from "./ui/Card";
import { Calendar, ChevronLeft, ChevronRight, Flame, CheckCircle } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { getUserCheckins, getUserCheckinsForDate } from "../services/database";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";

const CalendarTracker = ({ theme = "dark", className = "", currentStreak = 0, refreshTrigger = 0 }) => {
  const { user } = useAuth();
  const containerRef = useRef(null);
  const calendarRef = useRef(null);
  const [realCheckins, setRealCheckins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedDayCheckins, setSelectedDayCheckins] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [loadingDayData, setLoadingDayData] = useState(false);

  // Get current date info
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const today = currentDate.getDate();

  // Days of week
  const daysOfWeek = ["S", "M", "T", "W", "T", "F", "S"];

  // Month names
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  
  console.log('🔍 Calendar Debug - Current date info:', {
    currentDate: currentDate.toISOString(),
    currentMonth,
    currentYear,
    today,
    monthName: monthNames[currentMonth]
  });

  // Load real check-ins from Supabase
  const loadCheckins = useCallback(async () => {
    console.log('🔍 Calendar Debug - loadCheckins called:', { user: !!user, userId: user?.id });
    
    if (!user) {
      console.log('❌ Calendar Debug - No user, returning early');
      return;
    }

    setLoading(true);
    try {
      // Get checkins for the current month
      const firstDayOfMonth = new Date(currentYear, currentMonth, 1).toISOString().split('T')[0];
      const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).toISOString().split('T')[0];
      
      console.log('🔍 Calendar Debug - Date calculation:', {
        currentYear,
        currentMonth,
        firstDayOfMonth,
        lastDayOfMonth,
        firstDayCalculation: new Date(currentYear, currentMonth, 1),
        lastDayCalculation: new Date(currentYear, currentMonth + 1, 0)
      });
      
      console.log('🔍 Calendar Debug - Fetching checkins:', {
        userId: user.id,
        firstDayOfMonth,
        lastDayOfMonth,
        currentMonth,
        currentYear,
        today: new Date().toISOString().split('T')[0]
      });
      
      const result = await getUserCheckins(user.id, firstDayOfMonth, lastDayOfMonth, 100);
      if (result.success) {
        setRealCheckins(result.data);
        console.log('CalendarTracker: realCheckins refreshed', result.data);
        console.log('🔍 Calendar Debug - Fetched checkins count:', result.data.length);
      } else {
        console.error('CalendarTracker: Failed to fetch checkins:', result.error);
      }
    } catch (error) {
      console.error('Error loading calendar checkins:', error);
    }
    setLoading(false);
  }, [user, currentMonth, currentYear]);

  // Load checkins on mount and when user changes
  useEffect(() => {
    console.log('🔍 Calendar Debug - useEffect called for loadCheckins');
    loadCheckins();
  }, [loadCheckins]);

  // Refresh data when refreshTrigger changes (after check-ins)
  useEffect(() => {
    console.log('🔍 Calendar Debug - useEffect called for refreshTrigger:', refreshTrigger);
    if (refreshTrigger > 0) {
      console.log('CalendarTracker: Refreshing due to trigger change');
      loadCheckins();
    }
  }, [refreshTrigger, loadCheckins]);

  // Convert real check-ins to calendar data
  const checkinData = useMemo(() => {
    const data = {};

    console.log('🔍 Calendar Debug - Processing checkins:', {
      realCheckinsCount: realCheckins.length,
      currentMonth,
      currentYear,
      today: new Date().getDate(),
      realCheckins: realCheckins.map(c => ({
        id: c.id,
        checkin_date: c.checkin_date,
        mood_score: c.mood_score,
        sentiment_score: c.sentiment_score
      }))
    });

    if (!realCheckins.length) {
      // Return empty data if no checkins
      return data;
    }

    realCheckins.forEach((checkin) => {
      if (!checkin.checkin_date) return;

      const checkinDate = new Date(checkin.checkin_date);
      const checkinMonth = checkinDate.getMonth();
      const checkinYear = checkinDate.getFullYear();
      const checkinDay = checkinDate.getDate();

      console.log('🔍 Processing checkin:', {
        checkin_date: checkin.checkin_date,
        parsedDate: checkinDate,
        checkinMonth,
        checkinYear,
        checkinDay,
        currentMonth,
        currentYear,
        matchesCurrentMonth: checkinMonth === currentMonth && checkinYear === currentYear
      });

      // Only include checkins from the current month/year being viewed
      if (checkinMonth === currentMonth && checkinYear === currentYear) {
        const day = checkinDate.getDate();

        // Initialize array for the day if it doesn't exist
        if (!data[day]) {
          data[day] = { hasCheckin: false, checkins: [], sentiment: "neutral" };
        }

        // Convert sentiment score to sentiment label
        let sentiment = "neutral";
        if (checkin.sentiment_score >= 4) {
          sentiment = "positive";
        } else if (checkin.sentiment_score <= 2) {
          sentiment = "negative";
        }

        data[day].hasCheckin = true;
        data[day].checkins.push({
          id: checkin.id,
          mood_score: checkin.mood_score,
          mood_text: checkin.mood_text,
          mood_emoji: checkin.mood_emoji,
          sentiment: sentiment,
          sentiment_score: checkin.sentiment_score,
          created_at: checkin.created_at,
        });

        // Set the day's overall sentiment to the most recent checkin's sentiment
        // (since checkins are ordered by created_at descending)
        if (data[day].checkins.length === 1) {
          data[day].sentiment = sentiment;
        }

        console.log('✅ Added checkin to calendar for day:', day, 'with sentiment:', sentiment);
      } else {
        console.log('❌ Checkin excluded - wrong month/year:', {
          checkinMonth,
          currentMonth,
          checkinYear,
          currentYear
        });
      }
    });

    console.log('📅 Final calendar data:', data);
    return data;
  }, [realCheckins, currentMonth, currentYear]);

  // Get days in month
  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get first day of month (0 = Sunday, 6 = Saturday)
  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  }, [daysInMonth, firstDay]);

  const themeColors = {
    background:
      theme === "dark"
        ? "bg-slate-900/80 border-slate-700/50 backdrop-blur-xl"
        : "bg-gradient-to-br from-teal-50/90 via-white/95 to-cyan-50/80 border-teal-200/60 backdrop-blur-xl shadow-lg",
    text: {
      primary: theme === "dark" ? "text-slate-100" : "text-slate-900",
      secondary: theme === "dark" ? "text-slate-300" : "text-slate-700",
      muted: theme === "dark" ? "text-slate-400" : "text-slate-600",
    },
    hover: theme === "dark" ? "hover:bg-slate-700/30" : "hover:bg-slate-100/60",
  };

  // Premium gradients for different sentiments
  const sentimentStyles = {
    positive:
      theme === "dark"
        ? "bg-gradient-to-br from-emerald-400 via-green-400 to-teal-400 shadow-lg shadow-emerald-500/40 ring-2 ring-emerald-400/30"
        : "bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 shadow-lg shadow-emerald-500/50 ring-2 ring-emerald-500/40",
    neutral:
      theme === "dark"
        ? "bg-gradient-to-br from-blue-400 via-indigo-400 to-purple-400 shadow-lg shadow-blue-500/40 ring-2 ring-blue-400/30"
        : "bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 shadow-lg shadow-teal-500/50 ring-2 ring-teal-500/40",
    negative:
      theme === "dark"
        ? "bg-gradient-to-br from-pink-400 via-rose-400 to-red-400 shadow-lg shadow-pink-500/40 ring-2 ring-pink-400/30"
        : "bg-gradient-to-br from-pink-500 via-rose-500 to-red-500 shadow-lg shadow-pink-500/50 ring-2 ring-pink-500/40",
  };

  useEffect(() => {
    if (containerRef.current) {
      // Initial fade in animation
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" },
      );

      // Animate calendar items
      if (calendarRef.current) {
        const dayElements =
          calendarRef.current.querySelectorAll(".calendar-day");
        gsap.fromTo(
          dayElements,
          { opacity: 0, scale: 0.8 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.4,
            stagger: 0.02,
            ease: "back.out(1.7)",
            delay: 0.3,
          },
        );
      }
    }
  }, []);

  const handleDayClick = async (day) => {
    if (!day || !user) return;
    
    const dayData = checkinData[day];
    if (!dayData?.hasCheckin) return;

    setLoadingDayData(true);
    try {
      // Format the date properly for database query - ensure consistent timezone handling
      const clickedDate = new Date(currentYear, currentMonth, day);
      const dateString = clickedDate.toISOString().split('T')[0]; // YYYY-MM-DD format
      
      console.log('🔍 Calendar Click Debug:', {
        clickedDay: day,
        currentMonth: currentMonth + 1, // +1 because JS months are 0-indexed
        currentYear,
        clickedDate,
        dateString,
        todaysDate: new Date().toISOString().split('T')[0],
        isToday: dateString === new Date().toISOString().split('T')[0],
        availableCheckins: dayData.checkins.map(c => ({
          id: c.id,
          created_at: c.created_at,
          mood_score: c.mood_score,
          sentiment: c.sentiment
        })),
        checkinDatesInData: realCheckins.filter(c => c.checkin_date).map(c => c.checkin_date)
      });

      // Show dialog immediately with loading state
      setSelectedDay(day);
      setSelectedDayCheckins([]);
      setShowDialog(true);

      // First try to use the cached data from checkinData
      if (dayData.checkins && dayData.checkins.length > 0) {
        console.log('📦 Using cached checkin data for day:', day);
        
        // Validate that the cached data is for the correct date
        const expectedDateString = dateString;
        const validCheckins = dayData.checkins.filter(checkin => {
          // If checkin has a checkin_date, validate it matches
          if (checkin.checkin_date) {
            const checkinDateString = new Date(checkin.checkin_date).toISOString().split('T')[0];
            return checkinDateString === expectedDateString;
          }
          // If no checkin_date, check created_at
          if (checkin.created_at) {
            const createdDateString = new Date(checkin.created_at).toISOString().split('T')[0];
            return createdDateString === expectedDateString;
          }
          return true; // Keep if no date info to filter by
        });
        
        console.log('🔍 Date validation results:', {
          expectedDate: expectedDateString,
          originalCount: dayData.checkins.length,
          validCount: validCheckins.length,
          invalidCheckins: dayData.checkins.filter(c => !validCheckins.includes(c))
        });
        
        setSelectedDayCheckins(validCheckins.length > 0 ? validCheckins : dayData.checkins);
        setLoadingDayData(false);
        return;
      }

      // Fallback: Fetch detailed checkins for this specific date from database
      console.log('🔍 Fetching fresh checkins from database for date:', dateString);
      const result = await getUserCheckinsForDate(user.id, dateString);
      
      if (result.success && result.data && result.data.length > 0) {
        setSelectedDayCheckins(result.data);
        
        console.log('✅ Fetched fresh checkins from database:', {
          date: dateString,
          count: result.data.length,
          checkins: result.data.map(c => ({
            id: c.id,
            checkin_date: c.checkin_date,
            created_at: c.created_at,
            mood_score: c.mood_score
          }))
        });
      } else {
        console.warn('❌ No checkins found in database for date:', dateString);
        // Show empty state or cached data
        setSelectedDayCheckins(dayData.checkins || []);
      }
    } catch (error) {
      console.error('Error fetching day checkins:', error);
      // Fallback to cached data
      const dayData = checkinData[day];
      setSelectedDayCheckins(dayData.checkins || []);
    } finally {
      setLoadingDayData(false);
    }
  };

  const getDayStatus = (day) => {;
    if (!day) return null;
    const isToday = day === today;
    const dayData = checkinData[day];
    const hasCheckin = dayData?.hasCheckin;
    const sentiment = dayData?.sentiment;
    
    // Get the most recent checkin's emoji and mood score for display
    let emoji = null;
    let score = null;
    if (hasCheckin && dayData.checkins.length > 0) {
      const mostRecentCheckin = dayData.checkins[0]; // First checkin (most recent due to desc order)
      emoji = mostRecentCheckin.mood_emoji;
      score = mostRecentCheckin.mood_score;
    }

    return { isToday, hasCheckin, sentiment, emoji, score };
  };

  const totalCheckins = Object.keys(checkinData).length;

  console.log('🔍 Calendar Debug - Component rendering:', {
    totalCheckins,
    realCheckinsLength: realCheckins.length,
    checkinDataKeys: Object.keys(checkinData),
    loading
  });

  return (
    <Card
      ref={containerRef}
      className={`${themeColors.background} border-0 shadow-xl overflow-hidden ${className}`}
    >
      <CardContent className="p-3 sm:p-6">
        {/* Premium Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl ${theme === "dark" ? "bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-lg shadow-purple-500/25" : "bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 shadow-lg shadow-emerald-500/25"}`}>
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <h3
                className={`text-base sm:text-lg font-bold ${themeColors.text.primary} tracking-tight`}
              >
                {monthNames[currentMonth]} {currentYear}
              </h3>
              <p
                className={`text-xs sm:text-sm ${themeColors.text.secondary} font-medium`}
              >
                {loading
                  ? "Loading..."
                  : `${totalCheckins} check-ins this month`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <button
              className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl ${themeColors.hover} ${themeColors.text.secondary} transition-colors`}
            >
              <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
            <button
              className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl ${themeColors.hover} ${themeColors.text.secondary} transition-colors`}
            >
              <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 sm:mb-3">
          {daysOfWeek.map((day, index) => (
            <div key={`day-${index}`} className="text-center py-1 sm:py-2">
              <span
                className={`text-xs font-semibold ${themeColors.text.muted} uppercase tracking-wider`}
              >
                {day}
              </span>
            </div>
          ))}
        </div>

        {/* Premium Calendar Grid */}
        <div ref={calendarRef} className="grid grid-cols-7 gap-1 sm:gap-2">
          {calendarDays.map((day, index) => {
            const status = getDayStatus(day);

            return (
              <div
                key={
                  day
                    ? `${currentYear}-${currentMonth}-${day}`
                    : `empty-${index}`
                }
                className="calendar-day relative aspect-square flex items-center justify-center"
              >
                {day && (
                  <div
                    className={`
                      w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center text-xs sm:text-sm font-semibold
                      transition-all duration-300 cursor-pointer transform hover:scale-105
                      ${
                        status?.isToday && !status?.hasCheckin
                          ? `ring-2 ${theme === "dark" ? "ring-indigo-400" : "ring-emerald-400"} ring-offset-2 ${theme === "dark" ? "ring-offset-slate-900" : "ring-offset-white"} ${themeColors.text.primary} border ${theme === "dark" ? "border-indigo-400/30" : "border-emerald-400/30"}`
                          : ""
                      }
                      ${
                        status?.hasCheckin
                          ? `${sentimentStyles[status.sentiment]} text-white shadow-lg ${
                              status?.isToday
                                ? `ring-2 ring-white/50 ring-offset-2 ${theme === "dark" ? "ring-offset-slate-900" : "ring-offset-white"}`
                                : ""
                            }`
                          : status?.isToday
                            ? ""
                            : `${themeColors.hover} ${themeColors.text.secondary}`
                      }
                    `}
                    onClick={() => handleDayClick(day)}
                  >
                    {status?.hasCheckin ? (
                      <div
                        className="flex items-center justify-center"
                        title={`${status.emoji || "✓"} Score: ${status.score || "N/A"}`}
                      >
                        {status.emoji ? (
                          <span className="text-sm sm:text-lg">{status.emoji}</span>
                        ) : (
                          <div className="w-4 h-4 sm:w-6 sm:h-6 bg-green-500 rounded-md flex items-center justify-center">
                            <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs sm:text-sm font-medium">{day}</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Premium Legend */}
        <div className="mt-6 pt-4 border-t border-slate-200/10">
          <div className="flex items-center justify-center gap-6 text-xs">
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-lg ${sentimentStyles.positive.split(" ")[0]}`}
              ></div>
              <span className={`${themeColors.text.muted} font-medium`}>
                Positive
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-lg ${sentimentStyles.neutral.split(" ")[0]}`}
              ></div>
              <span className={`${themeColors.text.muted} font-medium`}>
                Neutral
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-lg ${sentimentStyles.negative.split(" ")[0]}`}
              ></div>
              <span className={`${themeColors.text.muted} font-medium`}>
                Needs Care
              </span>
            </div>
          </div>
        </div>
      </CardContent>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Check-ins for {monthNames[currentMonth]} {selectedDay},
              {currentYear}
            </DialogTitle>
            <DialogDescription>
              All your recorded moods for this day.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-96 overflow-y-auto">
            {loadingDayData ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-2" />
                <p className="text-slate-500 dark:text-slate-400">Loading check-ins...</p>
              </div>
            ) : selectedDayCheckins.length > 0 ? (
              selectedDayCheckins.map((checkin, index) => (
                <div
                  key={checkin.id || index}
                  className="flex items-start space-x-3 p-4 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                >
                  <div className="flex-shrink-0">
                    <span className="text-2xl">{checkin.mood_emoji || "🙂"}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        Mood Score: {checkin.mood_score}/10
                      </p>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        checkin.sentiment_score >= 4 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : checkin.sentiment_score <= 2
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      }`}>
                        {checkin.sentiment_score >= 4 ? 'Positive' : checkin.sentiment_score <= 2 ? 'Negative' : 'Neutral'}
                      </span>
                    </div>
                    {checkin.mood_text && (
                      <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
                        "{checkin.mood_text}"
                      </p>
                    )}
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>
                        Sentiment Score: {checkin.sentiment_score}/5
                      </span>
                      <span>
                        {new Date(checkin.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    {checkin.hashtags && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {checkin.hashtags.split(',').map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded-full"
                          >
                            #{tag.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">📅</div>
                <p className="text-slate-500 dark:text-slate-400">
                  No check-ins found for this day.
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default CalendarTracker;
