import { memo, useRef, useEffect, forwardRef } from "react";
import { gsap } from "gsap";

// GSAP animation utilities
export const animateContainer = (element, options = {}) => {
  const { delay = 0, duration = 0.5 } = options;
  return gsap.fromTo(
    element,
    { opacity: 0, y: 20 },
    {
      opacity: 1,
      y: 0,
      duration,
      delay,
      ease: "power2.out",
    },
  );
};

export const animateItem = (element, options = {}) => {
  const { delay = 0, duration = 0.4 } = options;
  return gsap.fromTo(
    element,
    { y: 20, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      duration,
      delay,
      ease: "power2.out",
    },
  );
};

export const animateCard = (element, options = {}) => {
  const { delay = 0, duration = 0.4 } = options;
  return gsap.fromTo(
    element,
    { opacity: 0, y: 15 },
    {
      opacity: 1,
      y: 0,
      duration,
      delay,
      ease: "power2.out",
    },
  );
};

export const animateFloating = (element, options = {}) => {
  const { duration = 6 } = options;
  return gsap.to(element, {
    y: -20,
    rotation: 360,
    scale: 1.1,
    duration,
    repeat: -1,
    yoyo: true,
    ease: "power2.inOut",
  });
};

export const animateFade = (element, options = {}) => {
  const { duration = 0.3 } = options;
  return gsap.fromTo(
    element,
    { opacity: 0 },
    { opacity: 1, duration, ease: "power2.out" },
  );
};

// Optimized div component with GSAP animations
export const OptimizedMotionDiv = memo(
  forwardRef(
    (
      {
        children,
        className = "",
        initial = "hidden",
        animate = "visible",
        variants = null,
        ...props
      },
      ref,
    ) => {
      const elementRef = useRef(null);
      const finalRef = ref || elementRef;

      useEffect(() => {
        if (finalRef.current && animate === "visible") {
          // Use container animation by default
          animateContainer(finalRef.current);
        }
      }, [animate, finalRef]);

      return (
        <div ref={finalRef} className={className} {...props}>
          {children}
        </div>
      );
    },
  ),
);

// Optimized section component with GSAP animations
export const OptimizedMotionSection = memo(
  forwardRef(
    (
      {
        children,
        className = "",
        initial = "hidden",
        animate = "visible",
        variants = null,
        ...props
      },
      ref,
    ) => {
      const elementRef = useRef(null);
      const finalRef = ref || elementRef;

      useEffect(() => {
        if (finalRef.current && animate === "visible") {
          animateContainer(finalRef.current);
        }
      }, [animate, finalRef]);

      return (
        <section ref={finalRef} className={className} {...props}>
          {children}
        </section>
      );
    },
  ),
);

// Optimized button component with GSAP animations
export const OptimizedMotionButton = memo(
  forwardRef(
    (
      {
        children,
        className = "",
        whileHover = null,
        whileTap = null,
        onClick,
        ...props
      },
      ref,
    ) => {
      const elementRef = useRef(null);
      const finalRef = ref || elementRef;

      const handleMouseEnter = () => {
        if (whileHover && finalRef.current) {
          gsap.to(finalRef.current, {
            scale: whileHover.scale || 1.05,
            duration: 0.2,
            ease: "power2.out",
          });
        }
      };

      const handleMouseLeave = () => {
        if (whileHover && finalRef.current) {
          gsap.to(finalRef.current, {
            scale: 1,
            duration: 0.2,
            ease: "power2.out",
          });
        }
      };

      const handleMouseDown = () => {
        if (whileTap && finalRef.current) {
          gsap.to(finalRef.current, {
            scale: whileTap.scale || 0.95,
            duration: 0.1,
            ease: "power2.out",
          });
        }
      };

      const handleMouseUp = () => {
        if (whileTap && finalRef.current) {
          gsap.to(finalRef.current, {
            scale: whileHover?.scale || 1,
            duration: 0.1,
            ease: "power2.out",
          });
        }
      };

      return (
        <button
          ref={finalRef}
          className={className}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onClick={onClick}
          {...props}
        >
          {children}
        </button>
      );
    },
  ),
);

// Helper hook for scroll-triggered animations
export const useScrollAnimation = (callback, dependency = []) => {
  const elementRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && callback) {
            callback(entry.target);
          }
        });
      },
      { threshold: 0.1 },
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, dependency);

  return elementRef;
};

// Legacy variant objects (for easier migration)
export const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

export const fastCardVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 },
};

export const floatingVariants = {
  animate: { y: -20, rotate: 360, scale: 1.1 },
};

export const fastFadeVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};
