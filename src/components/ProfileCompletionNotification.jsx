import React, { useState, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext.jsx";
import { Button } from "./ui/Button";
import { X, User, Sparkles, CheckCircle } from "lucide-react";

export function ProfileCompletionNotification({
  isVisible,
  onComplete,
  onDismiss,
  onRemindLater,
}) {
  const { theme } = useTheme();

  // Theme colors
  const themeColors = {
    background:
      theme === "dark"
        ? "bg-gradient-to-r from-violet-900/90 to-purple-900/90 backdrop-blur-md border-violet-700/50"
        : "bg-gradient-to-r from-violet-50/95 to-purple-50/95 backdrop-blur-md border-violet-200/50",
    text: {
      primary: theme === "dark" ? "text-white" : "text-gray-900",
      secondary: theme === "dark" ? "text-violet-200" : "text-violet-700",
    },
    button: {
      primary:
        theme === "dark"
          ? "bg-violet-600 hover:bg-violet-700 text-white"
          : "bg-violet-600 hover:bg-violet-700 text-white",
      secondary:
        theme === "dark"
          ? "text-violet-300 hover:text-white"
          : "text-violet-600 hover:text-violet-800",
    },
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4">
      <div
        id="profile-notification"
        className={`
          ${themeColors.background}
          border rounded-lg shadow-lg p-4
          opacity-0
        `}
      >
        <div className="flex items-start space-x-3">
          {/* Icon */}
          <div className="flex-shrink-0">
            <div
              className={`
              w-10 h-10 rounded-full flex items-center justify-center
              ${theme === "dark" ? "bg-violet-600/20" : "bg-violet-100"}
            `}
            >
              <Sparkles className="w-5 h-5 text-violet-500" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4
                className={`text-sm font-semibold ${themeColors.text.primary}`}
              >
                Complete Your Profile
              </h4>
                              <button
                  onClick={onDismiss}
                  className={`${themeColors.button.secondary} p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors`}
                >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p
              className={`text-xs ${themeColors.text.secondary} mt-1 leading-relaxed`}
            >
              Help us personalize your experience! Share your preferences and
              interests.
            </p>

            {/* Action buttons */}
            <div className="flex items-center space-x-2 mt-3">
                              <Button
                  size="sm"
                  onClick={onComplete}
                  className={`${themeColors.button.primary} text-xs px-3 py-1.5 h-auto`}
                >
                <CheckCircle className="w-3 h-3 mr-1" />
                Complete Now
              </Button>

                              <Button
                  variant="ghost"
                  size="sm"
                  onClick={onRemindLater}
                  className={`${themeColors.button.secondary} text-xs px-2 py-1.5 h-auto`}
                >
                Remind Later
              </Button>
            </div>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="mt-3 pt-3 border-t border-violet-200/20 dark:border-violet-700/20">
          <div className="flex items-center justify-between text-xs">
            <span className={themeColors.text.secondary}>Profile Progress</span>
            <span className={`${themeColors.text.secondary} font-medium`}>
              30%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1">
            <div
              className="bg-gradient-to-r from-violet-500 to-purple-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: "30%" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
