import React, { useRef, useEffect, useMemo, useState } from "react";
import { gsap } from "gsap";
import { Card, CardContent } from "./ui/Card";
import { Calendar, ChevronLeft, ChevronRight, Flame, CheckCircle } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { getUserCheckins } from "../services/database";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const CalendarTracker = ({ theme = "dark", className = "", currentStreak = 0 }) => {
  const { user } = useAuth();
  const containerRef = useRef(null);
  const calendarRef = useRef(null);
  const [realCheckins, setRealCheckins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedDayCheckins, setSelectedDayCheckins] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);

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

  // Load real check-ins from Supabase
  useEffect(() => {
    const loadCheckins = async () => {
      if (!user) return;

      setLoading(true);
      try {
        // Get checkins for the last 2 months to cover current view
        const firstDayOfMonth = new Date(currentYear, currentMonth, 1).toISOString().split('T')[0];
        const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).toISOString().split('T')[0];
        const result = await getUserCheckins(user.id, firstDayOfMonth, lastDayOfMonth, 100);
        if (result.success) {
          setRealCheckins(result.data);
          console.log('CalendarTracker: realCheckins', result.data);
        }
      } catch (error) {
        // Error loading checkins
      }
      setLoading(false);
    };

    loadCheckins();
  }, [user, currentMonth, currentYear]);

  // Convert real check-ins to calendar data
  const checkinData = useMemo(() => {
    const data = {};

    if (!realCheckins.length) {
      // Return empty data if no checkins
      return data;
    }

    realCheckins.forEach((checkin) => {
      if (!checkin.checkin_date) return;

      const checkinDate = new Date(checkin.checkin_date);
      const checkinMonth = checkinDate.getMonth();
      const checkinYear = checkinDate.getFullYear();

      // Only include checkins from the current month/year being viewed
      if (checkinMonth === currentMonth && checkinYear === currentYear) {
        const day = checkinDate.getDate();

        // Initialize array for the day if it doesn't exist
        if (!data[day]) {
          data[day] = { hasCheckin: false, checkins: [] };
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
      }
    });

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
        : "bg-white/95 border-slate-200/60 backdrop-blur-xl shadow-lg",
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
        : "bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 shadow-lg shadow-blue-500/50 ring-2 ring-blue-500/40",
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

  const getDayStatus = (day) => {
    if (!day) return null;
    const isToday = day === today;
    const dayData = checkinData[day];
    const hasCheckin = dayData?.hasCheckin;
    const sentiment = dayData?.sentiment;

    return { isToday, hasCheckin, sentiment };
  };

  const totalCheckins = Object.keys(checkinData).length;

  return (
    <Card
      ref={containerRef}
      className={`${themeColors.background} border-0 shadow-xl overflow-hidden ${className}`}
    >
      <CardContent className="p-6">
        {/* Premium Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-lg shadow-purple-500/25">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3
                className={`text-lg font-bold ${themeColors.text.primary} tracking-tight`}
              >
                {monthNames[currentMonth]} {currentYear}
              </h3>
              <p
                className={`text-sm ${themeColors.text.secondary} font-medium`}
              >
                {loading
                  ? "Loading..."
                  : `${totalCheckins} check-ins this month`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              className={`p-2 rounded-xl ${themeColors.hover} ${themeColors.text.secondary} transition-colors`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              className={`p-2 rounded-xl ${themeColors.hover} ${themeColors.text.secondary} transition-colors`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-2 mb-3">
          {daysOfWeek.map((day, index) => (
            <div key={`day-${index}`} className="text-center py-2">
              <span
                className={`text-xs font-semibold ${themeColors.text.muted} uppercase tracking-wider`}
              >
                {day}
              </span>
            </div>
          ))}
        </div>

        {/* Premium Calendar Grid */}
        <div ref={calendarRef} className="grid grid-cols-7 gap-2">
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
                      w-9 h-9 rounded-xl flex items-center justify-center text-sm font-semibold
                      transition-all duration-300 cursor-pointer transform hover:scale-105
                      ${
                        status?.isToday && !status?.hasCheckin
                          ? `ring-2 ring-indigo-400 ring-offset-2 ${theme === "dark" ? "ring-offset-slate-900" : "ring-offset-white"} ${themeColors.text.primary} border border-indigo-400/30`
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
                    onClick={() => {
                      if (status?.hasCheckin) {
                        setSelectedDayCheckins(checkinData[day].checkins);
                        setSelectedDay(day);
                        setShowDialog(true);
                      }
                    }}
                  >
                    {status?.hasCheckin ? (
                      <div
                        className="flex items-center justify-center"
                        title={`${status.emoji || "✓"} Score: ${status.score || "N/A"}`}
                      >
                        {status.emoji ? (
                          <span className="text-lg">{status.emoji}</span>
                        ) : (
                          <div className="w-6 h-6 bg-green-500 rounded-md flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm font-medium">{day}</span>
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
          <div className="space-y-4 py-4">
            {selectedDayCheckins.length > 0 ? (
              selectedDayCheckins.map((checkin) => (
                <div
                  key={checkin.id}
                  className="flex items-center space-x-3 p-3 rounded-lg bg-slate-100 dark:bg-slate-800"
                >
                  <span className="text-2xl">{checkin.mood_emoji}</span>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {checkin.mood_text || "No notes"}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Score: {checkin.mood_score} | Sentiment:{" "}
                      {checkin.sentiment}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {new Date(checkin.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-slate-500">
                No check-ins for this day.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default CalendarTracker;
