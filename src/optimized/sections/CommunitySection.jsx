import React, { memo } from 'react';
import { gsap } from 'gsap';
import { useOptimizedInView } from '../../hooks/useOptimizedInView';
import { OptimizedMotionDiv, animateItem, animateCard } from '../OptimizedAnimations';
import { MemoizedCard, MemoizedButton } from '../MemoizedComponents';
import { Users, Heart, MessageCircle, Share2, TrendingUp, Globe } from 'lucide-react';

const CommunitySection = memo(({ theme, themeColors, premiumGradients }) => {
  const { ref, inView } = useOptimizedInView();

  return (
    <div
      className={`py-16 md:py-24 ${
        theme === "dark"
          ? "bg-gradient-to-b from-slate-900 to-gray-900"
          : "bg-gradient-to-b from-purple-50 to-indigo-50"
      } relative overflow-hidden`}
      ref={ref}
      id="community"
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
                  ? `${premiumGradients.secondary}/20 text-blue-300 border-blue-500/30`
                  : `${premiumGradients.secondary}/20 text-blue-600 border-blue-400/50`
              } backdrop-blur-sm`}
            >
              🌍 Community & Connection
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
            Connect with{" "}
            <span
              className={`bg-gradient-to-r ${premiumGradients.secondary} bg-clip-text text-transparent`}
            >
              like-minded souls
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
            Share your wellness journey, find support, and celebrate each other's growth in a safe, supportive community.
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
              A supportive community
            </h3>

            <div
              className={`space-y-3 md:space-y-4 text-base md:text-lg ${themeColors.text.secondary}`}
            >
              {[
                "Share your wins and struggles anonymously",
                "Find people on similar wellness journeys",
                "Get inspired by others' progress and insights",
                "Build meaningful connections without pressure",
              ].map((text, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <span
                    className={`${
                      theme === "dark" ? "text-blue-400" : "text-blue-600"
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
                className={`bg-gradient-to-r ${premiumGradients.secondary} hover:shadow-xl hover:shadow-blue-500/25 text-white font-semibold transition-all duration-300`}
              >
                <Users className="w-4 h-4 mr-2" />
                Join Community
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
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className={`text-lg font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                        Community Feed
                      </h4>
                      <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                        Real people, real stories
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30">
                    <Globe className="w-4 h-4 text-blue-500" />
                    <span className={`text-sm font-medium ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}>
                      Live
                    </span>
                  </div>
                </div>

                {/* Posts */}
                <div className="space-y-4">
                  {[
                    { 
                      user: "Sarah M.", 
                      content: "Just completed my 30-day meditation streak! 🧘‍♀️ Feeling so much more centered.", 
                      likes: 24, 
                      time: "2h ago",
                      avatar: "S"
                    },
                    { 
                      user: "Alex K.", 
                      content: "Had a rough day but remembered to check in. Small wins matter. 💪", 
                      likes: 18, 
                      time: "4h ago",
                      avatar: "A"
                    },
                    { 
                      user: "Maya R.", 
                      content: "This community has been such a support during my healing journey. Thank you all! ❤️", 
                      likes: 42, 
                      time: "6h ago",
                      avatar: "M"
                    },
                  ].map((post, index) => (
                    <div key={index} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-sm font-bold">
                            {post.avatar}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className={`font-medium text-sm ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                              {post.user}
                            </span>
                            <span className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                              {post.time}
                            </span>
                          </div>
                          <p className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"} mb-3`}>
                            {post.content}
                          </p>
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                              <Heart className="w-4 h-4 text-red-500" />
                              <span className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                                {post.likes}
                              </span>
                            </div>

                            <Share2 className="w-4 h-4 text-gray-400" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className={`text-sm font-medium ${theme === "dark" ? "text-green-400" : "text-green-600"}`}>
                        Growing
                      </div>
                      <div className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                        Active community
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className={`text-sm font-medium ${theme === "dark" ? "text-purple-400" : "text-purple-600"}`}>
                        Supportive
                      </div>
                      <div className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                        Real connections
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

CommunitySection.displayName = 'CommunitySection';

export default CommunitySection; 