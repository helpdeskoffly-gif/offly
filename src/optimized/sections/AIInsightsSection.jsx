import React, { memo } from 'react';
import { gsap } from 'gsap';
import { useOptimizedInView } from '../../hooks/useOptimizedInView';
import { OptimizedMotionDiv, animateItem, animateCard } from '../OptimizedAnimations';
import { MemoizedCard, MemoizedButton } from '../MemoizedComponents';
import { Brain, Sparkles, Lightbulb, TrendingUp, Heart, MessageCircle } from 'lucide-react';

const AIInsightsSection = memo(({ theme, themeColors, premiumGradients }) => {
  const { ref, inView } = useOptimizedInView();

  return (
    <div
      className={`py-16 md:py-24 ${
        theme === "dark"
          ? "bg-gradient-to-b from-gray-900 to-slate-900"
          : "bg-gradient-to-b from-indigo-50 to-purple-50"
      } relative overflow-hidden`}
      ref={ref}
      id="ai-insights"
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
                  ? `${premiumGradients.primary}/20 text-purple-300 border-purple-500/30`
                  : `${premiumGradients.primary}/20 text-purple-600 border-purple-400/50`
              } backdrop-blur-sm`}
            >
              🤖 AI-Powered Insights
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
            Your personal{" "}
            <span
              className={`bg-gradient-to-r ${premiumGradients.primary} bg-clip-text text-transparent`}
            >
              emotional coach
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
            Get personalized insights, gentle nudges, and emotional support powered by AI that understands your journey.
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
              Intelligent emotional support
            </h3>

            <div
              className={`space-y-3 md:space-y-4 text-base md:text-lg ${themeColors.text.secondary}`}
            >
              {[
                "Personalized insights based on your patterns",
                "Gentle nudges when you need support",
                "Emotional state analysis and recommendations",
                "Celebrate progress and identify growth areas",
              ].map((text, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <span
                    className={`${
                      theme === "dark" ? "text-purple-400" : "text-purple-600"
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
                className={`bg-gradient-to-r ${premiumGradients.primary} hover:shadow-xl hover:shadow-purple-500/25 text-white font-semibold transition-all duration-300`}
              >
                <Brain className="w-4 h-4 mr-2" />
                Get AI Insights
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
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className={`text-lg font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                        AI Insight
                      </h4>
                      <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                        Personalized for you
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30">
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    <span className={`text-sm font-medium ${theme === "dark" ? "text-purple-400" : "text-purple-600"}`}>
                      AI Generated
                    </span>
                  </div>
                </div>

                {/* Insights */}
                <div className="space-y-4">
                  {[
                    {
                      icon: Lightbulb,
                      title: "Pattern Recognition",
                      description: "I notice you feel most energized after morning walks. Consider making this a daily ritual.",
                      color: "yellow",
                      bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
                      borderColor: "border-yellow-200 dark:border-yellow-800"
                    },
                    {
                      icon: Heart,
                      title: "Gentle Nudge",
                      description: "You've been consistent with your check-ins this week. That's worth celebrating! 🎉",
                      color: "pink",
                      bgColor: "bg-pink-50 dark:bg-pink-900/20",
                      borderColor: "border-pink-200 dark:border-pink-800"
                    },
                    {
                      icon: TrendingUp,
                      title: "Growth Opportunity",
                      description: "Your stress levels tend to peak on Wednesdays. Consider scheduling self-care activities mid-week.",
                      color: "green",
                      bgColor: "bg-green-50 dark:bg-green-900/20",
                      borderColor: "border-green-200 dark:border-green-800"
                    }
                  ].map((insight, index) => (
                    <div key={index} className={`flex items-start space-x-3 p-4 rounded-xl border ${insight.bgColor} ${insight.borderColor}`}>
                      <div className={`w-8 h-8 bg-gradient-to-br from-${insight.color}-500 to-${insight.color}-600 rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <insight.icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium mb-1 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                          {insight.title}
                        </p>
                        <p className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                          {insight.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className={`text-sm font-medium ${theme === "dark" ? "text-amber-400" : "text-amber-600"}`}>
                        Personalized
                      </div>
                      <div className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                        Based on your patterns
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                      <MessageCircle className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className={`text-sm font-medium ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}>
                        Supportive
                      </div>
                      <div className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                        Gentle guidance
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

AIInsightsSection.displayName = 'AIInsightsSection';

export default AIInsightsSection; 