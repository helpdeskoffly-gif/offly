import React, { memo, useMemo, useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Reduced number of floating elements and optimized animations
const OptimizedBackground = memo(({ theme }) => {
  const bgRef = useRef(null);
  const floatingElements = useRef([]);
  const svgElements = useRef([]);
  const emojiElements = useRef([]);

  useEffect(() => {
    // Setup scroll-triggered animations for background elements
    const elements = floatingElements.current.filter(Boolean);

    elements.forEach((el, index) => {
      if (el) {
        // Floating animation
        gsap.to(el, {
          x: index === 0 ? 100 : index === 1 ? -80 : 60,
          y: index === 0 ? 0 : index === 1 ? 60 : -40,
          scale: index === 0 ? 1.2 : index === 1 ? 0.8 : 1.3,
          rotation: index === 0 ? 360 : index === 1 ? -360 : 180,
          duration: index === 0 ? 20 : index === 1 ? 15 : 25,
          repeat: -1,
          yoyo: true,
          ease: "power2.inOut",
        });

        // Scroll-triggered movement
        gsap.to(el, {
          y: index % 2 === 0 ? -50 : 50,
          scrollTrigger: {
            trigger: bgRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        });
      }
    });

    // SVG particle animations
    svgElements.current.forEach((el, index) => {
      if (el) {
        gsap.to(el, {
          x: index === 0 ? 30 : -25,
          y: index === 0 ? -20 : 15,
          rotation: index === 0 ? 360 : -360,
          scale: index === 0 ? 1 : 1.2,
          duration: index === 0 ? 8 : 12,
          repeat: -1,
          yoyo: true,
          ease: "power2.inOut",
          delay: index * 2,
        });
      }
    });

    // Emoji particle animations
    emojiElements.current.forEach((el, index) => {
      if (el) {
        gsap.to(el, {
          y: -40,
          opacity: 1,
          scale: 1.2,
          duration: 4 + index,
          repeat: -1,
          yoyo: true,
          ease: "power2.inOut",
          delay: index * 0.8,
        });
      }
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  const backgroundElements = useMemo(
    () => [
      {
        id: "orb1",
        className: `absolute top-20 left-10 w-64 h-64 ${
          theme === "dark"
            ? "bg-gradient-to-r from-violet-500/10 to-purple-500/10"
            : "bg-gradient-to-r from-amber-300/20 to-orange-300/20"
        } rounded-full blur-3xl`,
      },
      {
        id: "orb2",
        className: `absolute top-40 right-20 w-48 h-48 ${
          theme === "dark"
            ? "bg-gradient-to-r from-emerald-500/10 to-teal-500/10"
            : "bg-gradient-to-r from-yellow-300/20 to-amber-300/20"
        } rounded-full blur-3xl`,
      },
      {
        id: "orb3",
        className: `absolute bottom-20 left-1/3 w-72 h-72 ${
          theme === "dark"
            ? "bg-gradient-to-r from-fuchsia-500/10 to-pink-500/10"
            : "bg-gradient-to-r from-rose-300/20 to-pink-300/20"
        } rounded-full blur-3xl`,
      },
    ],
    [theme],
  );

  // Reduced SVG particles
  const svgParticles = useMemo(
    () => [
      {
        id: "star",
        className: "absolute top-1/4 left-1/4",
        svg: (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            className="text-violet-400/20"
          >
            <path
              d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"
              fill="currentColor"
            />
          </svg>
        ),
      },
      {
        id: "gear",
        className: "absolute top-2/3 right-1/4",
        svg: (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            className="text-emerald-400/30"
          >
            <circle cx="12" cy="12" r="3" fill="currentColor" />
            <path
              d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
              fill="currentColor"
            />
          </svg>
        ),
      },
    ],
    [],
  );

  // Minimal emoji particles (only 2 for ultra-smooth performance)
  const emojiParticles = useMemo(
    () =>
      [...Array(2)].map((_, i) => ({
        id: `emoji-${i}`,
        style: {
          left: `${20 + i * 25}%`,
          top: `${30 + (i % 2) * 40}%`,
        },
        emoji: i % 3 === 0 ? "💜" : i % 3 === 1 ? "✨" : "🌟",
      })),
    [],
  );

  return (
    <div
      ref={bgRef}
      className="fixed inset-0 overflow-hidden pointer-events-none"
    >
      {/* Background gradient orbs */}
      {backgroundElements.map((element, index) => (
        <div
          key={element.id}
          ref={(el) => (floatingElements.current[index] = el)}
          className={element.className}
        />
      ))}

      {/* SVG particles */}
      {svgParticles.map((particle, index) => (
        <div
          key={particle.id}
          ref={(el) => (svgElements.current[index] = el)}
          className={particle.className}
        >
          {particle.svg}
        </div>
      ))}

      {/* Floating emojis */}
      {emojiParticles.map((particle, index) => (
        <div
          key={particle.id}
          ref={(el) => (emojiElements.current[index] = el)}
          className="absolute opacity-50"
          style={particle.style}
        >
          <div className="text-pink-400/20 text-lg">{particle.emoji}</div>
        </div>
      ))}
    </div>
  );
});

OptimizedBackground.displayName = "OptimizedBackground";

export default OptimizedBackground;
