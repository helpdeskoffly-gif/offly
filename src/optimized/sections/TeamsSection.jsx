import React, { memo } from "react";
import { gsap } from "gsap";
import { useRef, useEffect } from "react";
import { useOptimizedInView } from "../../hooks/useOptimizedInView.js";
import {
  MemoizedCard,
  MemoizedBadge,
  MemoizedButton,
} from "../MemoizedComponents";
import { containerVariants, itemVariants } from "../OptimizedAnimations.jsx";

const TeamsSection = memo(({ theme, themeColors }) => {
  const { ref, inView } = useOptimizedInView();
  const sectionRef = useRef(null);
  const statsRefs = useRef([]);
  const buttonRef = useRef(null);

  useEffect(() => {
    if (inView) {
      gsap.to(sectionRef.current, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power2.out",
      });
      statsRefs.current.forEach((el, i) => {
        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay: 0.2 + i * 0.1,
          ease: "power2.out",
        });
      });
      gsap.to(buttonRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        delay: 0.5,
        ease: "power2.out",
      });
    } else {
      gsap.set(sectionRef.current, { opacity: 0, y: 40 });
      statsRefs.current.forEach((el) => {
        gsap.set(el, { opacity: 0, y: 40 });
      });
      gsap.set(buttonRef.current, { opacity: 0, y: 40 });
    }
  }, [inView]);

  const stats = [
    {
      stat: "87%",
      label: "feel more supported at work",
      color: "from-emerald-400 to-teal-400",
      bgColor: "from-emerald-500/10 to-teal-500/10",
    },
    {
      stat: "92%",
      label: "report feeling more connected to teammates",
      color: "from-purple-400 to-pink-400",
      bgColor: "from-purple-500/10 to-pink-500/10",
    },
    {
      stat: "78%",
      label: "see improved team collaboration",
      color: "from-cyan-400 to-blue-400",
      bgColor: "from-cyan-500/10 to-blue-500/10",
    },
  ];

  return (
    <div
      className="py-32 bg-gradient-to-br from-gray-950 via-purple-950/20 to-emerald-950/20"
      ref={ref}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="text-center mb-16"
          ref={sectionRef}
          style={{ opacity: 0, transform: "translateY(40px)" }}
        >
          <MemoizedBadge className="mb-6 bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
            🏢 For Organizations
          </MemoizedBadge>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Built for{" "}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              teams
            </span>{" "}
            as well
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-12">
            Transform your workplace culture with shared emotional wellness
            insights.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {stats.map((item, index) => (
            <div
              key={index}
              ref={(el) => (statsRefs.current[index] = el)}
              style={{ opacity: 0, transform: "translateY(40px)" }}
            >
              <MemoizedCard
                className={`bg-gradient-to-br ${item.bgColor} border-gray-700 p-8 text-center backdrop-blur-sm`}
              >
                <div
                  className={`text-5xl font-bold bg-gradient-to-r ${item.color} bg-clip-text text-transparent mb-4`}
                >
                  {item.stat}
                </div>
                <p className="text-gray-300 text-lg">{item.label}</p>
              </MemoizedCard>
            </div>
          ))}
        </div>

        <div
          className="text-center"
          ref={buttonRef}
          style={{ opacity: 0, transform: "translateY(40px)" }}
        >
          <MemoizedButton
            variant="outline"
            size="lg"
            className="border-emerald-500/50 text-emerald-400 px-8 py-4 text-lg"
          >
            Learn about Teams
          </MemoizedButton>
        </div>
      </div>
    </div>
  );
});

TeamsSection.displayName = "TeamsSection";

export default TeamsSection;