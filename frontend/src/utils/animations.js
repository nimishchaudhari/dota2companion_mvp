// frontend/src/utils/animations.js
// Comprehensive animation utilities for the Dota 2 Companion app
// Uses Framer Motion for smooth, game-like animations

// Core animation configurations
export const animationConfig = {
  // Fast animations for UI feedback
  fast: {
    duration: 0.15,
    ease: "easeOut"
  },
  // Standard animations for most UI elements
  standard: {
    duration: 0.3,
    ease: [0.4, 0, 0.2, 1] // Material Design cubic-bezier
  },
  // Smooth animations for page transitions
  smooth: {
    duration: 0.5,
    ease: [0.25, 0.46, 0.45, 0.94] // Custom easing for elegant feel
  },
  // Bouncy animations for interactive elements
  bouncy: {
    duration: 0.6,
    ease: [0.68, -0.55, 0.265, 1.55] // Back ease for playful effect
  }
};

// Spring configurations for more natural motion
export const springConfig = {
  gentle: {
    type: "spring",
    stiffness: 120,
    damping: 14
  },
  wobbly: {
    type: "spring",
    stiffness: 180,
    damping: 12
  },
  stiff: {
    type: "spring",
    stiffness: 400,
    damping: 30
  }
};

// Page transition animations
export const pageTransitions = {
  // Slide transitions for main navigation
  slideIn: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: animationConfig.smooth
  },
  
  // Fade transitions for subtle changes
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: animationConfig.standard
  },
  
  // Scale transitions for modal-like content
  scale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: animationConfig.standard
  },
  
  // Slide up for mobile-friendly transitions
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: animationConfig.smooth
  }
};

// Component-level animations
export const componentAnimations = {
  // Card hover effects
  cardHover: {
    whileHover: {
      scale: 1.02,
      y: -2,
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
    },
    whileTap: { scale: 0.98 },
    transition: animationConfig.fast
  },
  
  // Button interactions
  buttonPress: {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 },
    transition: animationConfig.fast
  },
  
  // Subtle glow effect for active elements
  glow: {
    whileHover: {
      boxShadow: "0 0 20px rgba(59, 130, 246, 0.3)"
    },
    transition: animationConfig.standard
  },
  
  // Floating animation for important elements
  float: {
    animate: {
      y: [-2, 2, -2],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  },
  
  // Pulse animation for notifications
  pulse: {
    animate: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }
};

// Loading animations
export const loadingAnimations = {
  // Spinning loader
  spin: {
    animate: {
      rotate: 360,
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: "linear"
      }
    }
  },
  
  // Pulsing dots
  dots: {
    animate: {
      scale: [1, 1.2, 1],
      opacity: [1, 0.5, 1],
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  },
  
  // Skeleton shimmer effect
  shimmer: {
    animate: {
      backgroundPosition: ["200% 0", "-200% 0"],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "linear"
      }
    }
  }
};

// List item animations with staggering
export const listAnimations = {
  container: {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  },
  item: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: animationConfig.standard
  }
};

// Modal and overlay animations
export const overlayAnimations = {
  backdrop: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: animationConfig.fast
  },
  
  modal: {
    initial: { opacity: 0, scale: 0.9, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.9, y: 20 },
    transition: animationConfig.standard
  },
  
  drawer: {
    initial: { x: "100%" },
    animate: { x: 0 },
    exit: { x: "100%" },
    transition: animationConfig.smooth
  }
};

// Gaming-inspired visual effects
export const gameEffects = {
  // Critical hit effect
  criticalHit: {
    animate: {
      scale: [1, 1.2, 1],
      rotate: [0, 2, -2, 0],
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  },
  
  // Level up celebration
  levelUp: {
    animate: {
      scale: [1, 1.3, 1],
      y: [0, -10, 0],
      transition: {
        duration: 0.6,
        ease: [0.68, -0.55, 0.265, 1.55]
      }
    }
  },
  
  // Achievement unlock
  achievement: {
    initial: { scale: 0, rotate: 180 },
    animate: { scale: 1, rotate: 0 },
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 15
    }
  }
};

// Utility functions for animation variants
export const createStaggerContainer = (staggerDelay = 0.1) => ({
  animate: {
    transition: {
      staggerChildren: staggerDelay
    }
  }
});

export const createSlideInVariant = (direction = "right", distance = 20) => {
  const directions = {
    right: { x: distance },
    left: { x: -distance },
    up: { y: -distance },
    down: { y: distance }
  };
  
  return {
    initial: { opacity: 0, ...directions[direction] },
    animate: { opacity: 1, x: 0, y: 0 },
    transition: animationConfig.standard
  };
};

export const createScaleVariant = (fromScale = 0.9, toScale = 1) => ({
  initial: { opacity: 0, scale: fromScale },
  animate: { opacity: 1, scale: toScale },
  transition: animationConfig.standard
});

// Reduced motion support
export const getReducedMotionVariant = (animation) => {
  // Check if user prefers reduced motion
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

// Preset combinations for common use cases
export const presets = {
  // Card component with all effects
  gameCard: {
    ...componentAnimations.cardHover,
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: animationConfig.standard
  },
  
  // Page with slide transition
  gamePage: {
    ...pageTransitions.slideIn,
    variants: {
      initial: pageTransitions.slideIn.initial,
      animate: pageTransitions.slideIn.animate,
      exit: pageTransitions.slideIn.exit
    }
  },
  
  // Interactive button
  gameButton: {
    ...componentAnimations.buttonPress,
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    transition: animationConfig.standard
  }
};

export default {
  animationConfig,
  springConfig,
  pageTransitions,
  componentAnimations,
  loadingAnimations,
  listAnimations,
  overlayAnimations,
  gameEffects,
  presets,
  createStaggerContainer,
  createSlideInVariant,
  createScaleVariant,
  getReducedMotionVariant
};