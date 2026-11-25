import type { Variants, Transition } from "framer-motion";

// Spring physics: stiffness 280, damping 28, mass 0.8
export const spring: Transition = {
  type: "spring",
  stiffness: 280,
  damping: 28,
  mass: 0.8,
};

// Out-quint cubic bezier for page transitions
export const outQuint = [0.22, 1, 0.36, 1] as const;

// Page transition variants
export const pageVariants: Variants = {
  initial: { opacity: 0, y: 6 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: outQuint as unknown as number[],
    },
  },
  exit: {
    opacity: 0,
    y: -4,
    transition: {
      duration: 0.25,
      ease: outQuint as unknown as number[],
    },
  },
};

// Stagger container for cards, table rows, alerts
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
    },
  },
};

// Stagger child item
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 280,
      damping: 28,
      mass: 0.8,
    },
  },
};

// Drawer slide from right
export const drawerVariants: Variants = {
  hidden: { x: "100%" },
  visible: {
    x: 0,
    transition: {
      type: "spring",
      stiffness: 280,
      damping: 28,
      mass: 0.8,
      staggerChildren: 0.02,
    },
  },
  exit: {
    x: "100%",
    transition: {
      duration: 0.25,
      ease: outQuint as unknown as number[],
    },
  },
};

// Drawer backdrop
export const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

// Drawer item stagger
export const drawerItemVariants: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 280,
      damping: 28,
      mass: 0.8,
    },
  },
};

// Micro-interaction (200ms)
export const microTransition: Transition = {
  duration: 0.2,
  ease: outQuint as unknown as number[],
};
