import React, { memo } from 'react';
import { gsap } from 'gsap';
import { useOptimizedInView } from '../../hooks/useOptimizedInView';
import { OptimizedMotionDiv, animateItem, animateCard } from '../OptimizedAnimations';
import { MemoizedCard, MemoizedButton } from '../MemoizedComponents';
import { Heart, Clock, Sparkles, CheckCircle } from 'lucide-react';

const CheckInSection = memo(({ theme, themeColors, premiumGradients }) => {
  const { ref, inView } = useOptimizedInView();

  return (
    <div
      className={`py-16 md:py-24 ${
        theme === "dark"
          ? "bg-gradient-to-b from-gray-900 to-slate-900"
          : "bg-gradient-to-b from-yellow-50 to-orange-50"
      } relative overflow-hidden`}
      ref={ref}
      id="check-in"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <OptimizedMotionDiv
          className="text-center mb-12 md:mb-16"
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
          }}
        >
          <div
            ref={(el) => {
              if (el) {
                animateItem(el, { delay: 0.1 });
              }
            }}
          >
            <div
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 mb-4 md:mb-6 bg-gradient-to-r ${
                theme === "dark"
                  ? `${premiumGradients.secondary}/20 text-emerald-300 border-emerald-500/30`
                  : `${premiumGradients.secondary}/20 text-emerald-600 border-emerald-400/50`
              } backdrop-blur-sm`}
            >
              💝 Daily Check-ins
            </div>
          </div>

          <h2
            ref={(el) => {
              if (el) {
                animateItem(el, { delay: 0.2 });
              }
            }}
            className={`text-3xl sm:text-4xl md:text-5xl font-bold ${themeColors.text.primary} mb-3 md:mb-4`}
          >
            Check in with your{" "}
            <span
              className={`bg-gradient-to-r ${premiumGradients.secondary} bg-clip-text text-transparent`}
            >
              emotional self
            </span>
          </h2>

          <p
            ref={(el) => {
              if (el) {
                animateItem(el, { delay: 0.3 });
              }
            }}
            className={`text-lg md:text-xl ${themeColors.text.secondary} max-w-3xl mx-auto px-4`}
          >
            Take a moment to pause, reflect, and track how you're feeling. 
            Build a meaningful relationship with your emotions.
          </p>
        </OptimizedMotionDiv>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
          <div
            ref={(el) => {
              if (el) {
                animateItem(el, { delay: 0.4 });
              }
            }}
            className="order-2 lg:order-1"
          >
            <h3
              className={`text-2xl md:text-3xl font-bold ${themeColors.text.primary} mb-4 md:mb-6`}
            >
              Simple, meaningful check-ins
            </h3>

            <div
              className={`space-y-3 md:space-y-4 text-base md:text-lg ${themeColors.text.secondary}`}
            >
              {[
                "Log your mood with emojis, text, and context",
                "Set gentle reminders that respect your pace",
                "Track patterns and celebrate small wins",
                "Build streaks without pressure or guilt",
              ].map((text, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <span
                    className={`${
                      theme === "dark" ? "text-emerald-400" : "text-green-600"
                    } mt-1 font-bold`}
                  >
                    ✓
                  </span>
                  <span>{text}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 md:mt-8">
              <MemoizedButton
                className={`bg-gradient-to-r ${premiumGradients.secondary} hover:shadow-xl hover:shadow-emerald-500/25 text-gray-900 font-semibold transition-all duration-300`}
              >
                <Heart className="w-4 h-4 mr-2" />
                Start Your Journey
              </MemoizedButton>
            </div>
          </div>

          <div
            ref={(el) => {
              if (el) {
                animateItem(el, { delay: 0.5 });
              }
            }}
            className="relative order-1 lg:order-2"
          >
            <MemoizedCard
              ref={(el) => {
                if (el) {
                  animateCard(el, { delay: 0.6 });
                  el.addEventListener("mouseenter", () =>
                    gsap.to(el, { scale: 1.02, duration: 0.2 }),
                  );
                  el.addEventListener("mouseleave", () =>
                    gsap.to(el, { scale: 1, duration: 0.2 }),
                  );
                }
              }}
              className={`rounded-2xl border shadow-xl p-8 ${
                theme === "dark"
                  ? "bg-slate-800/80 border-slate-700/50 backdrop-blur-xl"
                  : "bg-white/90 border-gray-200/50 backdrop-blur-xl"
              }`}
            >
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                      <Heart className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className={`text-lg font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                        Today's Check-in
                      </h4>
                      <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                        Just completed
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${theme === "dark" ? "text-emerald-400" : "text-emerald-600"}`}>
                      8.7
                    </div>
                    <div className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                      Joy Score
                    </div>
                  </div>
                </div>

                {/* Mood Display */}
                <div className="flex items-center space-x-4 p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
                  <div className="text-4xl">😊</div>
                  <div className="flex-1">
                    <p className={`font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                      Feeling grateful today
                    </p>
                    <p className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                      Had a great conversation with a friend
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <div>
                      <div className={`text-sm font-medium ${theme === "dark" ? "text-amber-400" : "text-amber-600"}`}>
                        +15 points
                      </div>
                      <div className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                        Earned
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <div>
                      <div className={`text-sm font-medium ${theme === "dark" ? "text-emerald-400" : "text-emerald-600"}`}>
                        Day 7 streak
                      </div>
                      <div className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                        Current
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </MemoizedCard>
          </div>
        </div>
      </div>
    </div>
  );
});

CheckInSection.displayName = 'CheckInSection';

export default CheckInSection; 