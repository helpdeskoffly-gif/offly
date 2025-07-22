import React, { memo, useRef, useEffect } from "react";
import { gsap } from "gsap";
import { useOptimizedInView } from "../../hooks/useOptimizedInView.js";
import { MemoizedBadge, MemoizedButton } from "../MemoizedComponents";
import { animateContainer, animateItem } from "../OptimizedAnimations.jsx";

const CTASection = memo(({ handleJoinWaitlist, user }) => {
  const { ref, inView } = useOptimizedInView();
  const containerRef = useRef(null);
  const badgeRef = useRef(null);
  const titleRef = useRef(null);
  const descriptionRef = useRef(null);
  const buttonsRef = useRef(null);
  const featuresRef = useRef(null);

  useEffect(() => {
    if (inView) {
      // Animate elements with staggered timing
      animateItem(badgeRef.current, { delay: 0.1 });
      animateItem(titleRef.current, { delay: 0.2 });
      animateItem(descriptionRef.current, { delay: 0.3 });
      animateItem(buttonsRef.current, { delay: 0.4 });
      animateItem(featuresRef.current, { delay: 0.5 });
    }
  }, [inView]);

  return (
    <div className="py-32 bg-gray-900" ref={ref}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div ref={containerRef}>
          <div ref={badgeRef}>
            <MemoizedBadge className="mb-6 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-500/30">
              🚀 Early Access
            </MemoizedBadge>
          </div>

          <h2
            ref={titleRef}
            className="text-4xl sm:text-5xl font-bold text-white mb-6"
          >
            Ready to{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              track your joy?
            </span>
          </h2>

          <p
            ref={descriptionRef}
            className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto"
          >
            Join thousands who are building intentional habits and nurturing
            their emotional wellness with Offly.
          </p>

          <div
            ref={buttonsRef}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8"
          >
            <MemoizedButton
              size="lg"
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-12 py-4 text-lg shadow-lg hover:shadow-emerald-500/25 transition-all duration-300"
              onClick={handleJoinWaitlist}
            >
              {user ? "Go to Dashboard" : "Try Offly Free"}
            </MemoizedButton>

            <MemoizedButton
              variant="outline"
              size="lg"
              className="px-8 py-4 text-lg border-2 border-gray-700 text-gray-300 hover:bg-purple-500/10 hover:border-purple-500/50 transition-all duration-300"
            >
              Learn More
            </MemoizedButton>
          </div>

          <div
            ref={featuresRef}
            className="flex items-center justify-center space-x-2 text-gray-500"
          >
            <span>✓ Free forever</span>
            <span>•</span>
            <span>✓ No credit card required</span>
            <span>•</span>
            <span>✓ Cancel anytime</span>
          </div>
        </div>
      </div>
    </div>
  );
});

CTASection.displayName = "CTASection";

export default CTASection;