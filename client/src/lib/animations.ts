/**
 * Animation Library - Apple & Huawei Design Principles
 * Premium, physics-based animations for delightful user experiences
 */

import { Transition, Variants } from "framer-motion";

/**
 * Spring Animation Presets
 * Based on Apple's spring animation curves for natural, fluid motion
 */
export const spring = {
  /** Gentle spring - Smooth, comfortable motion for large elements */
  gentle: {
    type: "spring" as const,
    stiffness: 300,
    damping: 30,
    mass: 1,
  },
  /** Bouncy spring - Playful motion for celebrations and feedback */
  bouncy: {
    type: "spring" as const,
    stiffness: 400,
    damping: 15,
    mass: 0.8,
  },
  /** Snappy spring - Quick, responsive motion for interactive elements */
  snappy: {
    type: "spring" as const,
    stiffness: 500,
    damping: 35,
    mass: 0.5,
  },
  /** Soft spring - Subtle, delicate motion for secondary elements */
  soft: {
    type: "spring" as const,
    stiffness: 200,
    damping: 25,
    mass: 1.2,
  },
  /** Energetic spring - Bold motion for primary actions */
  energetic: {
    type: "spring" as const,
    stiffness: 600,
    damping: 40,
    mass: 0.4,
  },
} as const;

/**
 * Duration Presets (milliseconds)
 * Consistent timing for non-spring animations
 */
export const duration = {
  instant: 100,
  fast: 200,
  normal: 300,
  slow: 500,
  slower: 700,
  slowest: 1000,
} as const;

/**
 * Easing Curves
 * Custom bezier curves for smooth, natural motion
 */
export const easing = {
  /** Standard ease out - Most common for exits and expansions */
  easeOut: [0.33, 1, 0.68, 1] as [number, number, number, number],
  /** Ease in out - Symmetrical for transitions */
  easeInOut: [0.65, 0, 0.35, 1] as [number, number, number, number],
  /** Bounce - Playful overshoot for celebrations */
  bounce: [0.68, -0.55, 0.265, 1.55] as [number, number, number, number],
  /** Emphasized - Strong deceleration for focus moments */
  emphasized: [0.05, 0.7, 0.1, 1] as [number, number, number, number],
  /** Sharp - Quick start, slow end for urgent actions */
  sharp: [0.4, 0, 0.6, 1] as [number, number, number, number],
} as const;

/**
 * Common Animation Variants
 * Reusable animation patterns for consistency
 */

/** Fade animations */
export const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: duration.normal / 1000, ease: easing.easeOut },
  },
  exit: {
    opacity: 0,
    transition: { duration: duration.fast / 1000, ease: easing.easeIn },
  },
};

/** Slide up animations (for modals, sheets) */
export const slideUpVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: spring.gentle,
  },
  exit: {
    opacity: 0,
    y: 10,
    transition: { duration: duration.fast / 1000, ease: easing.easeOut },
  },
};

/** Scale animations (for buttons, cards) */
export const scaleVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: spring.snappy,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: duration.fast / 1000 },
  },
};

/** Stagger parent variants (for lists) */
export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

/** Stagger child variants */
export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: spring.gentle,
  },
};

/**
 * Gesture Response Presets
 * For tap, hover, and drag interactions
 */

/** Button press animation */
export const buttonPress = {
  scale: 0.97,
  transition: spring.snappy,
};

/** Button hover animation */
export const buttonHover = {
  scale: 1.02,
  y: -2,
  transition: spring.gentle,
};

/** Card hover animation */
export const cardHover = {
  y: -4,
  scale: 1.01,
  transition: spring.gentle,
};

/** Icon bounce animation */
export const iconBounce = {
  scale: [1, 1.2, 1],
  rotate: [0, -10, 10, 0],
  transition: {
    duration: duration.slow / 1000,
    ease: easing.bounce,
  },
};

/**
 * Loading & Skeleton Animations
 */

/** Shimmer effect for skeleton loaders */
export const shimmerVariants: Variants = {
  shimmer: {
    backgroundPosition: ["200% 0", "-200% 0"],
    transition: {
      duration: 2,
      ease: "linear",
      repeat: Infinity,
    },
  },
};

/** Pulse animation for loading states */
export const pulseVariants: Variants = {
  pulse: {
    opacity: [0.6, 1, 0.6],
    transition: {
      duration: 1.5,
      ease: easing.easeInOut,
      repeat: Infinity,
    },
  },
};

/**
 * Progress & Growth Animations
 */

/** Circular progress ring animation */
export const circularProgressVariants = (progress: number): Variants => ({
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: progress / 100,
    opacity: 1,
    transition: {
      pathLength: { duration: 1.5, ease: easing.easeOut },
      opacity: { duration: 0.3 },
    },
  },
});

/** Number counter animation */
export const counterVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: spring.gentle,
  },
};

/**
 * Celebration Animations
 */

/** Confetti burst animation */
export const confettiBurst = {
  initial: { scale: 0, opacity: 1 },
  animate: {
    scale: [0, 1.5, 1],
    opacity: [1, 1, 0],
    transition: {
      duration: duration.slower / 1000,
      ease: easing.easeOut,
    },
  },
};

/** Achievement unlock animation */
export const achievementUnlock: Variants = {
  hidden: { scale: 0, rotate: -180, opacity: 0 },
  visible: {
    scale: 1,
    rotate: 0,
    opacity: 1,
    transition: spring.bouncy,
  },
};

/** Level up animation */
export const levelUpVariants: Variants = {
  hidden: { scale: 0.8, opacity: 0, y: 20 },
  visible: {
    scale: [0.8, 1.1, 1],
    opacity: 1,
    y: 0,
    transition: {
      duration: duration.slow / 1000,
      ease: easing.bounce,
    },
  },
};

/**
 * Motion Preferences Support
 * Respect user's reduced motion preferences
 */
export const getReducedMotionVariants = (variants: Variants): Variants => {
  if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return Object.keys(variants).reduce((acc, key) => {
      const variant = variants[key];
      if (typeof variant === "object" && variant !== null) {
        acc[key] = {
          ...variant,
          transition: { duration: 0 },
        };
      }
      return acc;
    }, {} as Variants);
  }
  return variants;
};

/**
 * Utility: Create responsive spring based on element size
 */
export const responsiveSpring = (size: "small" | "medium" | "large"): Transition => {
  const config = {
    small: { stiffness: 600, damping: 40, mass: 0.3 },
    medium: { stiffness: 400, damping: 30, mass: 0.8 },
    large: { stiffness: 200, damping: 25, mass: 1.5 },
  };
  return { type: "spring" as const, ...config[size] };
};

/**
 * Utility: Delay helper for sequential animations
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Page Transition Variants
 * For smooth navigation between pages
 */
export const pageTransitionVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: spring.gentle,
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: duration.fast / 1000 },
  },
};

/**
 * Modal/Dialog Variants
 * For overlays and modals
 */
export const modalOverlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: duration.fast / 1000 },
  },
  exit: {
    opacity: 0,
    transition: { duration: duration.fast / 1000 },
  },
};

export const modalContentVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: spring.gentle,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: { duration: duration.fast / 1000 },
  },
};

/**
 * Drag & Swipe Variants
 */
export const swipeConfig = {
  /** Swipe threshold to trigger action (pixels) */
  threshold: 80,
  /** Velocity threshold (pixels/second) */
  velocityThreshold: 500,
  /** Drag constraints */
  constraints: {
    left: -100,
    right: 0,
    top: -100,
    bottom: 0,
  },
  /** Drag transition */
  dragTransition: {
    bounceStiffness: 600,
    bounceDamping: 20,
  },
};

/**
 * Export all animations as default for convenience
 */
export default {
  spring,
  duration,
  easing,
  variants: {
    fade: fadeVariants,
    slideUp: slideUpVariants,
    scale: scaleVariants,
    staggerContainer: staggerContainerVariants,
    staggerItem: staggerItemVariants,
    shimmer: shimmerVariants,
    pulse: pulseVariants,
    achievementUnlock,
    levelUp: levelUpVariants,
    pageTransition: pageTransitionVariants,
    modalOverlay: modalOverlayVariants,
    modalContent: modalContentVariants,
  },
  gestures: {
    buttonPress,
    buttonHover,
    cardHover,
    iconBounce,
  },
  swipeConfig,
  utils: {
    getReducedMotionVariants,
    responsiveSpring,
    delay,
    circularProgressVariants,
  },
};
