import React, { memo } from 'react';
import { gsap } from 'gsap';
import { useOptimizedInView } from '../../hooks/useOptimizedInView';
import { OptimizedMotionDiv, animateItem, animateCard } from '../OptimizedAnimations';
import { MemoizedCard, MemoizedButton } from '../MemoizedComponents';
import { Heart, Users, Target, Sparkles } from 'lucide-react';

const AboutSection = memo(({ theme, themeColors, premiumGradients }) => {
  const { ref, inView } = useOptimizedInView();

  return (
    <div
      className={`py-16 md:py-24 ${
        theme === "dark"
          ? "bg-gradient-to-b from-slate-900 to-gray-900"
          : "bg-gradient-to-b from-purple-50 to-indigo-50"
      } relative overflow-hidden`}
      ref={ref}
      id="about"
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
                  ? `${premiumGradients.tertiary}/20 text-pink-300 border-pink-500/30`
                  : `${premiumGradients.tertiary}/20 text-pink-600 border-pink-400/50`
              } backdrop-blur-sm`}
            >
              ❤️ Our Mission
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
            Building a world where{" "}
            <span
              className={`bg-gradient-to-r ${premiumGradients.tertiary} bg-clip-text text-transparent`}
            >
              emotional wellness
            </span>{" "}
            comes first
          </h2>

          <p
            ref={(el) => {
              if (el) {
                animateItem(el, { delay: 0.3 });
              }
            }}
            className={`text-lg md:text-xl ${themeColors.text.secondary} max-w-3xl mx-auto px-4`}
          >
            We believe everyone deserves to understand and nurture their emotional health. 
            Offly is here to make that journey easier, more meaningful, and less lonely.
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
              Why we built Offly
            </h3>

            <div
              className={`space-y-4 text-base md:text-lg ${themeColors.text.secondary}`}
            >
              <p>
                In a world obsessed with productivity and optimization, we noticed something was missing: 
                the human element. People were tracking everything except their emotional well-being.
              </p>
              
              <p>
                We created Offly to fill that gap - to help people build a meaningful relationship 
                with their emotions, celebrate their progress, and find support in their journey.
              </p>

              <p>
                Our approach is simple: focus on what matters, celebrate small wins, and remember 
                that you're not alone in this journey.
              </p>
            </div>

            <div className="mt-6 md:mt-8 flex justify-center lg:justify-start">
              <MemoizedButton
                className={`bg-gradient-to-r ${premiumGradients.tertiary} hover:shadow-xl hover:shadow-pink-500/25 text-white font-semibold transition-all duration-300`}
              >
                <Heart className="w-4 h-4 mr-2" />
                Join Our Mission
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  icon: Heart,
                  title: "Human-Centered",
                  description: "Built with empathy and understanding of real emotional needs",
                  color: "pink"
                },
                {
                  icon: Users,
                  title: "Community-Driven",
                  description: "Supporting each other in our wellness journeys",
                  color: "blue"
                },
                {
                  icon: Target,
                  title: "Purposeful",
                  description: "Every feature designed with intention and meaning",
                  color: "green"
                },
                {
                  icon: Sparkles,
                  title: "Innovative",
                  description: "AI-powered insights that actually help and support",
                  color: "purple"
                }
              ].map((item, index) => (
                <MemoizedCard
                  key={index}
                  ref={(el) => {
                    if (el) {
                      animateCard(el, { delay: 0.6 + index * 0.1 });
                      el.addEventListener("mouseenter", () =>
                        gsap.to(el, { scale: 1.02, duration: 0.2 }),
                      );
                      el.addEventListener("mouseleave", () =>
                        gsap.to(el, { scale: 1, duration: 0.2 }),
                      );
                    }
                  }}
                  className={`rounded-2xl border shadow-xl p-6 ${
                    theme === "dark"
                      ? "bg-slate-800/80 border-slate-700/50 backdrop-blur-xl"
                      : "bg-white/90 border-gray-200/50 backdrop-blur-xl"
                  }`}
                >
                  <div className="text-center space-y-4">
                    <div className={`w-16 h-16 mx-auto bg-gradient-to-br from-${item.color}-500 to-${item.color}-600 rounded-2xl flex items-center justify-center`}>
                      <item.icon className="w-8 h-8 text-white" />
                    </div>
                    <h4 className={`font-semibold text-lg ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                      {item.title}
                    </h4>
                    <p className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                      {item.description}
                    </p>
                  </div>
                </MemoizedCard>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

AboutSection.displayName = 'AboutSection';

export default AboutSection; 