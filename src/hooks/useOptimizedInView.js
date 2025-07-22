import { useInView } from 'react-intersection-observer';
import { useMemo } from 'react';

// Optimized intersection observer hook
export const useOptimizedInView = (options = {}) => {
  const defaultOptions = useMemo(() => ({
    triggerOnce: true,
    threshold: 0.1,
    rootMargin: '50px 0px',
    ...options
  }), [options]);

  return useInView(defaultOptions);
};

// Hook for staggered animations
export const useStaggeredInView = (delay = 0) => {
  const { ref, inView } = useOptimizedInView({
    triggerOnce: true,
    threshold: 0.1,
    rootMargin: '100px 0px'
  });

  const variants = useMemo(() => ({
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay,
        ease: 'easeOut'
      }
    }
  }), [delay]);

  return { ref, inView, variants };
};

// Hook for reduced animations
export const useReducedMotionInView = () => {
  const { ref, inView } = useOptimizedInView();
  
  const variants = useMemo(() => ({
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.3 }
    }
  }), []);

  return { ref, inView, variants };
};
