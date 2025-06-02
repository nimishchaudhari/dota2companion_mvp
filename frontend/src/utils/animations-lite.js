// frontend/src/utils/animations-lite.js
// Optimized animation utilities with only essential animations
// Significantly smaller bundle size compared to full animations.js

// Core animation configurations
export const animationConfig = {
  fast: { duration: 0.15, ease: "easeOut" },
  standard: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
  smooth: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
};

// Essential page transitions
export const pageTransitions = {
  slideIn: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: animationConfig.smooth
  },
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: animationConfig.standard
  }
};

// Essential component animations
export const componentAnimations = {
  cardHover: {
    whileHover: { scale: 1.02, y: -2 },
    whileTap: { scale: 0.98 },
    transition: animationConfig.fast
  },
  buttonPress: {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 },
    transition: animationConfig.fast
  }
};

// Simple list animations
export const listAnimations = {
  container: {
    animate: { transition: { staggerChildren: 0.1 } }
  },
  item: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: animationConfig.standard
  }
};

// Reduced motion support
export const getReducedMotionVariant = (animation) => {
  const prefersReducedMotion = typeof window !== 'undefined' && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (prefersReducedMotion) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.15 }
    };
  }
  
  return animation;
};

export default {
  animationConfig,
  pageTransitions,
  componentAnimations,
  listAnimations,
  getReducedMotionVariant
};