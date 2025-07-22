import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { useTheme } from "../contexts/ThemeContext";

const WeeklyMoodChart = ({ checkins = [], themeColors }) => {
  const { theme } = useTheme();

  // Process checkins data for chart
  const chartData = useMemo(() => {
    const last7Days = [];
    const today = new Date();

    // Generate last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      last7Days.push({
        date: dateStr,
        displayDate: date.toLocaleDateString("en-US", { weekday: "short" }),
        fullDate: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        score: 0,
        hasCheckin: false,
        emoji: null,
      });
    }

    // Map checkins to dates
    checkins.forEach((checkin) => {
      const checkinDate = checkin.checkin_date;

      const dayIndex = last7Days.findIndex((day) => day.date === checkinDate);
      if (dayIndex !== -1) {
        last7Days[dayIndex] = {
          ...last7Days[dayIndex],
          score: checkin.sentiment_score || 3,
          hasCheckin: true,
          emoji: checkin.mood_emoji,
        };
      }
    });

    return last7Days;
  }, [checkins]);

  // Calculate average mood
  const averageMood = useMemo(() => {
    const validScores = chartData.filter((day) => day.hasCheckin);
    if (validScores.length === 0) return 0;
    return (
      validScores.reduce((sum, day) => sum + day.score, 0) / validScores.length
    );
  }, [chartData]);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div
          className={`${themeColors.card} border border-slate-200/50 dark:border-slate-700/50 rounded-lg p-3 shadow-lg backdrop-blur-sm`}
        >
          <p className={`font-medium ${themeColors.text.primary}`}>
            {data.fullDate}
          </p>
          {data.hasCheckin ? (
            <>
              <p className={`text-sm ${themeColors.text.secondary}`}>
                Mood: {data.emoji} ({data.score.toFixed(1)}/5)
              </p>
              <div className="flex items-center gap-2 mt-1">
                <div
                  className={`w-2 h-2 rounded-full ${
                    data.score >= 4
                      ? "bg-green-500"
                      : data.score >= 3
                        ? "bg-yellow-500"
                        : "bg-red-500"
                  }`}
                />
                <span className={`text-xs ${themeColors.text.muted}`}>
                  {data.score >= 4
                    ? "Great day"
                    : data.score >= 3
                      ? "Okay day"
                      : "Challenging day"}
                </span>
              </div>
            </>
          ) : (
            <p className={`text-sm ${themeColors.text.muted}`}>
              No check-in recorded
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // Custom dot component
  const CustomDot = (props) => {
    const { cx, cy, payload } = props;
    if (!payload.hasCheckin) return null;

    return (
      <g>
        <circle
          cx={cx}
          cy={cy}
          r={6}
          fill={
            payload.score >= 4
              ? "#10b981"
              : payload.score >= 3
                ? "#f59e0b"
                : "#ef4444"
          }
          stroke={theme === "dark" ? "#1e293b" : "#ffffff"}
          strokeWidth={2}
          className="drop-shadow-sm"
        />
        <text
          x={cx}
          y={cy + 1}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={10}
          className="pointer-events-none"
        >
          {payload.emoji}
        </text>
      </g>
    );
  };

  return (
    <div className="space-y-4">
      {/* Chart Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`text-lg font-semibold ${themeColors.text.primary}`}>
            Weekly Mood Trends
          </h3>
          <p className={`text-sm ${themeColors.text.muted}`}>
            Your emotional journey over the past 7 days
          </p>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-bold ${themeColors.text.primary}`}>
            {averageMood.toFixed(1)}
          </div>
          <div className={`text-xs ${themeColors.text.muted}`}>
            Average Mood
          </div>
        </div>
      </div>

      {/* Chart Container */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{
              top: 10,
              right: 30,
              left: 0,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={theme === "dark" ? "#6366f1" : "#8b5cf6"}
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor={theme === "dark" ? "#6366f1" : "#8b5cf6"}
                  stopOpacity={0.05}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={theme === "dark" ? "#374151" : "#e5e7eb"}
              opacity={0.5}
            />
            <XAxis
              dataKey="displayDate"
              axisLine={false}
              tickLine={false}
              tick={{
                fill: theme === "dark" ? "#9ca3af" : "#6b7280",
                fontSize: 12,
              }}
            />
            <YAxis
              domain={[0, 5]}
              axisLine={false}
              tickLine={false}
              tick={{
                fill: theme === "dark" ? "#9ca3af" : "#6b7280",
                fontSize: 12,
              }}
              tickFormatter={(value) => value.toFixed(1)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="score"
              stroke={theme === "dark" ? "#6366f1" : "#8b5cf6"}
              strokeWidth={3}
              fill="url(#moodGradient)"
              connectNulls={false}
              dot={<CustomDot />}
              activeDot={{
                r: 8,
                fill: theme === "dark" ? "#6366f1" : "#8b5cf6",
                strokeWidth: 2,
                stroke: theme === "dark" ? "#1e293b" : "#ffffff",
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Mood Legend */}
      <div className="flex items-center justify-center gap-6 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className={themeColors.text.muted}>Great (4.0+)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <span className={themeColors.text.muted}>Okay (3.0-3.9)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span className={themeColors.text.muted}>Challenging (0-2.9)</span>
        </div>
      </div>

      {/* Insights */}
      {chartData.filter((day) => day.hasCheckin).length > 0 && (
        <div
          className={`mt-4 p-4 rounded-lg ${themeColors.card} border border-slate-200/50 dark:border-slate-700/50`}
        >
          <h4 className={`font-medium ${themeColors.text.primary} mb-2`}>
            Weekly Insights
          </h4>
          <div className="space-y-1 text-sm">
            <p className={themeColors.text.secondary}>
              • You checked in{" "}
              <span className="font-medium text-indigo-500">
                {chartData.filter((day) => day.hasCheckin).length}
              </span>{" "}
              out of 7 days this week
            </p>
            {averageMood >= 4 && (
              <p className={`${themeColors.text.secondary} text-green-600`}>
                • You're having a great week! Keep up the positive momentum ✨
              </p>
            )}
            {averageMood < 3 && (
              <p className={`${themeColors.text.secondary} text-amber-600`}>
                • This week seems challenging. Remember to be kind to yourself
                🌱
              </p>
            )}
            {chartData.filter((day) => day.hasCheckin).length < 4 && (
              <p className={`${themeColors.text.secondary} text-blue-600`}>
                • Try checking in more regularly to track your mood patterns 📊
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklyMoodChart;
