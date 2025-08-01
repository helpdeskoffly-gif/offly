import React, { memo } from 'react';
import { gsap } from 'gsap';
import { useOptimizedInView } from '../../hooks/useOptimizedInView';
import { OptimizedMotionDiv, animateItem, animateCard } from '../OptimizedAnimations';
import { MemoizedCard, MemoizedButton } from '../MemoizedComponents';
import { Clock, Star, Sparkles, Check, Crown, Users } from 'lucide-react';

const PricingSection = memo(({ theme, themeColors, premiumGradients }) => {
  const { ref, inView } = useOptimizedInView();

  return (
    <div
      className={`py-16 md:py-24 ${
        theme === "dark"
          ? "bg-gradient-to-b from-gray-900 to-slate-900"
          : "bg-gradient-to-b from-blue-200 via-indigo-200 to-purple-200"
      } relative overflow-hidden`}
      ref={ref}
      id="pricing"
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
                  ? `${premiumGradients.tertiary}/20 text-amber-300 border-amber-500/30`
                  : `${premiumGradients.tertiary}/20 text-amber-600 border-amber-400/50`
              } backdrop-blur-sm`}
            >
              💎 Simple Pricing
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
            Pricing{" "}
            <span
              className={`bg-gradient-to-r ${premiumGradients.tertiary} bg-clip-text text-transparent`}
            >
              coming soon
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
            We're working on simple, transparent pricing that works for everyone. 
            Stay tuned for updates!
          </p>
        </OptimizedMotionDiv>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Free Plan */}
          <MemoizedCard
            ref={(el) => {
              if (el) {
                animateCard(el, { delay: 0.4 });
                el.addEventListener("mouseenter", () =>
                  gsap.to(el, { scale: 1.02, duration: 0.2 }),
                );
                el.addEventListener("mouseleave", () =>
                  gsap.to(el, { scale: 1, duration: 0.2 }),
                );
              }
            }}
            className={`rounded-2xl border shadow-xl p-6 md:p-8 h-full ${
              theme === "dark"
                ? "bg-slate-800/80 border-slate-700/50 backdrop-blur-xl"
                : "bg-gradient-to-br from-blue-50/90 via-white/95 to-indigo-50/80 border-blue-200/50 backdrop-blur-xl"
            }`}
          >
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
              </div>
              
              <div>
                <h3 className={`text-xl font-bold ${theme === "dark" ? "text-white" : "text-slate-800"} mb-2`}>
                  Free
                </h3>
              </div>

              <div className="space-y-3">
                {[
                  "Daily check-ins",
                  "Basic mood tracking",
                  "7-day streak tracking",
                  "Community access",
                  "Basic AI insights",
                ].map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <Check className={`w-4 h-4 ${theme === "dark" ? "text-emerald-400" : "text-green-600"}`} />
                    <span className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-slate-600"}`}>{feature}</span>
                  </div>
                ))}
              </div>

              <MemoizedButton
                className={`w-full bg-gradient-to-r ${premiumGradients.secondary} hover:shadow-xl hover:shadow-emerald-500/25 text-white font-semibold transition-all duration-300`}
              >
                Get Started Free
              </MemoizedButton>
            </div>
          </MemoizedCard>

                    {/* Pro Plan */}
          <MemoizedCard
            ref={(el) => {
              if (el) {
                animateCard(el, { delay: 0.5 });
                el.addEventListener("mouseenter", () =>
                  gsap.to(el, { scale: 1.02, duration: 0.2 }),
                );
                el.addEventListener("mouseleave", () =>
                  gsap.to(el, { scale: 1, duration: 0.2 }),
                );
              }
            }}
            className={`rounded-2xl border shadow-xl p-6 md:p-8 h-full ${
              theme === "dark"
                ? "bg-slate-800/80 border-slate-700/50 backdrop-blur-xl"
                : "bg-gradient-to-br from-purple-50/90 via-white/95 to-violet-50/80 border-purple-200/50 backdrop-blur-xl"
            } border-2 border-purple-500/30`}
          >
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <div className="bg-gradient-to-r from-purple-400 to-pink-400 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
                <Star className="w-3 h-3" />
                <span>Most Popular</span>
              </div>
            </div>

            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Crown className="w-6 h-6 text-white" />
                </div>
              </div>
              
              <div>
                <h3 className={`text-xl font-bold ${theme === "dark" ? "text-white" : "text-slate-800"} mb-2`}>
                  Pro
                </h3>
              </div>

              <div className="space-y-3">
                {[
                  "Everything in Free",
                  "Advanced AI insights",
                  "Unlimited anti-todo lists",
                  "Detailed analytics",
                  "Priority support",
                  "Custom reminders",
                  "Export your data",
                ].map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <Check className={`w-4 h-4 ${theme === "dark" ? "text-purple-400" : "text-purple-600"}`} />
                    <span className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-slate-600"}`}>{feature}</span>
                  </div>
                ))}
              </div>

              <MemoizedButton
                className={`w-full bg-gradient-to-r ${premiumGradients.primary} hover:shadow-xl hover:shadow-purple-500/25 text-white font-semibold transition-all duration-300`}
              >
                <Crown className="w-4 h-4 mr-2" />
                Start Pro Trial
              </MemoizedButton>
            </div>
          </MemoizedCard>

          {/* Teams Plan */}
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
            className={`rounded-2xl border shadow-xl p-6 md:p-8 h-full ${
              theme === "dark"
                ? "bg-slate-800/80 border-slate-700/50 backdrop-blur-xl"
                : "bg-gradient-to-br from-amber-50/90 via-white/95 to-orange-50/80 border-amber-200/50 backdrop-blur-xl"
            }`}
          >
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
              
              <div>
                <h3 className={`text-xl font-bold ${theme === "dark" ? "text-white" : "text-slate-800"} mb-2`}>
                  Teams
                </h3>
              </div>

              <div className="space-y-3">
                {[
                  "Everything in Pro",
                  "Team wellness tracking",
                  "Group challenges",
                  "Manager insights",
                  "Custom integrations",
                  "Dedicated support",
                  "Coming soon",
                ].map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <Check className={`w-4 h-4 ${theme === "dark" ? "text-amber-400" : "text-amber-600"}`} />
                    <span className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-slate-600"}`}>{feature}</span>
                  </div>
                ))}
              </div>

              <MemoizedButton
                className={`w-full bg-gradient-to-r ${premiumGradients.tertiary} hover:shadow-xl hover:shadow-amber-500/25 text-white font-semibold transition-all duration-300`}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Contact Sales
              </MemoizedButton>
            </div>
          </MemoizedCard>
        </div>
      </div>
    </div>
  );
});

PricingSection.displayName = 'PricingSection';

export default PricingSection; 