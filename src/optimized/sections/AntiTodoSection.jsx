import React, { memo } from 'react';
import { gsap } from 'gsap';
import { useOptimizedInView } from '../../hooks/useOptimizedInView';
import { OptimizedMotionDiv, animateItem, animateCard } from '../OptimizedAnimations';
import { MemoizedCard, MemoizedButton } from '../MemoizedComponents';
import { Play, Pause, Target, Sparkles, Heart, Brain } from 'lucide-react';

const AntiTodoSection = memo(({ theme, themeColors, premiumGradients }) => {
  const { ref, inView } = useOptimizedInView();

  return (
    <div
      className={`py-16 md:py-24 ${
        theme === "dark"
          ? "bg-gradient-to-b from-slate-900 to-gray-900"
          : "bg-gradient-to-b from-blue-50 to-indigo-50"
      } relative overflow-hidden`}
      ref={ref}
      id="anti-todo"
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
                  ? `${premiumGradients.tertiary}/20 text-orange-300 border-orange-500/30`
                  : `${premiumGradients.tertiary}/20 text-orange-600 border-orange-400/50`
              } backdrop-blur-sm`}
            >
              🎯 Anti-Todo Lists
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
            Focus on what{" "}
            <span
              className={`bg-gradient-to-r ${premiumGradients.tertiary} bg-clip-text text-transparent`}
            >
              truly matters
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
            Instead of endless to-do lists, focus on meaningful activities that bring you joy and fulfillment.
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
              Intentional activities, not tasks
            </h3>

            <div
              className={`space-y-3 md:space-y-4 text-base md:text-lg ${themeColors.text.secondary}`}
            >
              {[
                "AI-generated activities based on your interests",
                "Track time spent on meaningful activities",
                "Celebrate progress, not just completion",
                "Build habits that align with your values",
              ].map((text, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <span
                    className={`${
                      theme === "dark" ? "text-orange-400" : "text-orange-600"
                    } mt-1 font-bold`}
                  >
                    ✓
                  </span>
                  <span>{text}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 md:mt-8 flex justify-center lg:justify-start">
              <MemoizedButton
                className={`bg-gradient-to-r ${premiumGradients.tertiary} hover:shadow-xl hover:shadow-orange-500/25 text-white font-semibold transition-all duration-300`}
              >
                <Target className="w-4 h-4 mr-2" />
                Discover Activities
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
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                      <Target className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className={`text-lg font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                        Today's Activities
                      </h4>
                      <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                        3 meaningful tasks
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30">
                    <Play className="w-4 h-4 text-orange-500" />
                    <span className={`text-sm font-medium ${theme === "dark" ? "text-orange-400" : "text-orange-600"}`}>
                      Active
                    </span>
                  </div>
                </div>

                {/* Activities List */}
                <div className="space-y-3">
                  {[
                    { activity: "Read a chapter of that book you love", time: "30 min", status: "active", icon: "📖" },
                    { activity: "Call a friend you haven't talked to", time: "15 min", status: "completed", icon: "📞" },
                    { activity: "Take a mindful walk in nature", time: "20 min", status: "pending", icon: "🌿" },
                  ].map((item, index) => (
                    <div key={index} className={`flex items-center space-x-3 p-3 rounded-xl ${
                      item.status === 'active' 
                        ? 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800' 
                        : item.status === 'completed'
                        ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                        : 'bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700'
                    }`}>
                      <div className="text-2xl">{item.icon}</div>
                      <div className="flex-1">
                        <p className={`font-medium text-sm ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                          {item.activity}
                        </p>
                        <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                          {item.time}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {item.status === 'active' && (
                          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                        )}
                        {item.status === 'completed' && (
                          <Sparkles className="w-4 h-4 text-green-500" />
                        )}
                        {item.status === 'pending' && (
                          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer Stats */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg flex items-center justify-center">
                      <Heart className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className={`text-sm font-medium ${theme === "dark" ? "text-pink-400" : "text-pink-600"}`}>
                        Meaningful time
                      </div>
                      <div className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                        Focus on what matters
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center">
                      <Brain className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className={`text-sm font-medium ${theme === "dark" ? "text-purple-400" : "text-purple-600"}`}>
                        AI curated
                      </div>
                      <div className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                        Personalized for you
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

AntiTodoSection.displayName = 'AntiTodoSection';

export default AntiTodoSection; 