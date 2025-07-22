import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";

export function Loading() {
  const spinnerRef = useRef(null);
  const titleRef = useRef(null);
  const descriptionRef = useRef(null);
  const dotsRef = useRef([]);

  useEffect(() => {
    // Spinner rotation animation
    gsap.to(spinnerRef.current, {
      rotation: 360,
      duration: 2,
      repeat: -1,
      ease: "none",
    });

    // Title animation
    gsap.fromTo(
      titleRef.current,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.6, delay: 0.2, ease: "power2.out" },
    );

    // Description animation
    gsap.fromTo(
      descriptionRef.current,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.6, delay: 0.4, ease: "power2.out" },
    );

    // Dots animation
    dotsRef.current.forEach((dot, i) => {
      if (dot) {
        gsap.to(dot, {
          scale: 1.2,
          opacity: 1,
          duration: 1,
          repeat: -1,
          yoyo: true,
          delay: i * 0.2,
          ease: "power2.inOut",
        });
      }
    });
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block" ref={spinnerRef}>
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full"></div>
        </div>

        <h2
          ref={titleRef}
          className="mt-4 text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
        >
          Offly
        </h2>

        <p ref={descriptionRef} className="mt-2 text-muted-foreground">
          Preparing your wellness journey...
        </p>

        {/* Animated dots */}
        <div className="flex justify-center space-x-1 mt-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              ref={(el) => (dotsRef.current[i] = el)}
              className="w-2 h-2 bg-purple-400 rounded-full opacity-50"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
