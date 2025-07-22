import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useTheme } from "../contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "./ui/Card";
import { X, Sparkles, Heart, Brain } from "lucide-react";
import { openaiService } from "../services/openai";

const AINudges = ({
  user,
  userProfile,
  recentCheckins,
  currentMood,
  onClose,
}) => {
  const { theme } = useTheme();
  const [nudges, setNudges] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const containerRef = useRef(null);

  // Generate initial nudge when component mounts or key props change
  useEffect(() => {
    let mounted = true;

    const generateInitialNudge = async () => {
      if (!user || !userProfile || isGenerating) return;

      setIsGenerating(true);
      try {
        const result = await openaiService.generateAINudge(
          userProfile,
          recentCheckins,
          currentMood,
        );

        if (result.success && mounted) {
          const newNudge = {
            id: Date.now(),
            content: result.nudge,
            type: result.type,
            timestamp: new Date(),
            mood: currentMood,
          };

          setNudges([newNudge]);
        }
      } catch (error) {
        // Error generating nudge
      } finally {
        if (mounted) {
          setIsGenerating(false);
        }
      }
    };

    generateInitialNudge();

    return () => {
      mounted = false;
    };
  }, [user?.uid, userProfile?.currentStreak, currentMood]); // Only depend on stable values

  // Show nudges with animation
  useEffect(() => {
    if (nudges.length > 0 && !isVisible) {
      setIsVisible(true);

      // Animate in
      if (containerRef.current) {
        gsap.fromTo(
          containerRef.current,
          {
            opacity: 0,
            x: 100,
            scale: 0.8,
          },
          {
            opacity: 1,
            x: 0,
            scale: 1,
            duration: 0.6,
            ease: "back.out(1.7)",
          },
        );
      }
    }
  }, [nudges.length, isVisible]);

  // Generate additional nudge
  const generateAdditionalNudge = async () => {
    if (isGenerating || !user || !userProfile) return;

    setIsGenerating(true);
    try {
      const result = await openaiService.generateAINudge(
        userProfile,
        recentCheckins,
        currentMood,
      );

      if (result.success) {
        const newNudge = {
          id: Date.now(),
          content: result.nudge,
          type: result.type,
          timestamp: new Date(),
          mood: currentMood,
        };

        setNudges((prev) => [newNudge, ...prev.slice(0, 2)]); // Keep max 3 nudges
      }
    } catch (error) {
      // Error generating nudge
    } finally {
      setIsGenerating(false);
    }
  };

  const dismissNudge = (nudgeId) => {
    const nudgeElement = document.querySelector(`[data-nudge-id="${nudgeId}"]`);

    if (nudgeElement) {
      gsap.to(nudgeElement, {
        opacity: 0,
        x: 100,
        scale: 0.8,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => {
          setNudges((prev) => prev.filter((nudge) => nudge.id !== nudgeId));
        },
      });
    }
  };

  const dismissAll = () => {
    if (containerRef.current) {
      gsap.to(containerRef.current, {
        opacity: 0,
        x: 100,
        scale: 0.8,
        duration: 0.4,
        ease: "power2.in",
        onComplete: () => {
          setNudges([]);
          setIsVisible(false);
          if (onClose) onClose();
        },
      });
    }
  };

  // Auto-dismiss after 10 seconds
  useEffect(() => {
    if (nudges.length > 0) {
      const timer = setTimeout(() => {
        dismissAll();
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [nudges.length]);

  const themeColors = {
    background:
      theme === "dark"
        ? "bg-gradient-to-br from-slate-800/95 via-slate-900/95 to-slate-800/95"
        : "bg-gradient-to-br from-white/95 via-purple-50/95 to-white/95",
    border: theme === "dark" ? "border-purple-500/30" : "border-purple-300/40",
    text: {
      primary: theme === "dark" ? "text-white" : "text-gray-900",
      secondary: theme === "dark" ? "text-purple-200" : "text-purple-700",
      muted: theme === "dark" ? "text-slate-400" : "text-gray-600",
    },
  };

  if (!isVisible || nudges.length === 0) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="fixed bottom-4 right-4 z-50 max-w-sm space-y-3"
      style={{ maxHeight: "400px", overflowY: "auto" }}
    >
      {nudges.map((nudge, index) => (
        <Card
          key={nudge.id}
          data-nudge-id={nudge.id}
          className={`${themeColors.background} ${themeColors.border} border-2 shadow-lg backdrop-blur-md`}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                {/* Header */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-1">
                    {nudge.type === "ai_generated" ? (
                      <Brain className="h-4 w-4 text-purple-500" />
                    ) : (
                      <Heart className="h-4 w-4 text-pink-500" />
                    )}
                    <span
                      className={`text-xs font-medium ${themeColors.text.secondary}`}
                    >
                      {nudge.type === "ai_generated"
                        ? "AI Nudge"
                        : "Offly Cares"}
                    </span>
                  </div>

                  {nudge.mood && <span className="text-sm">{nudge.mood}</span>}
                </div>

                {/* Content */}
                <p
                  className={`text-sm leading-relaxed ${themeColors.text.primary}`}
                >
                  {nudge.content}
                </p>

                {/* Timestamp */}
                <div className="flex items-center justify-between mt-3">
                  <span className={`text-xs ${themeColors.text.muted}`}>
                    {nudge.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2">
                    {index === 0 && !isGenerating && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={generateAdditionalNudge}
                        className="h-6 px-2 text-xs hover:bg-purple-100 dark:hover:bg-purple-900/30"
                      >
                        <Sparkles className="h-3 w-3 mr-1" />
                        More
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Close button */}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => dismissNudge(nudge.id)}
                className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Loading indicator */}
      {isGenerating && (
        <Card
          className={`${themeColors.background} ${themeColors.border} border-2 shadow-lg backdrop-blur-md opacity-70`}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              <span className={`text-sm ${themeColors.text.muted}`}>
                Generating nudge...
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dismiss all button */}
      {nudges.length > 1 && (
        <div className="flex justify-end">
          <Button
            size="sm"
            variant="outline"
            onClick={dismissAll}
            className="text-xs opacity-70 hover:opacity-100"
          >
            Dismiss All
          </Button>
        </div>
      )}
    </div>
  );
};

export default AINudges;
