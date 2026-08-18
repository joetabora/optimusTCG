import type { Transition, Variants } from "framer-motion";

export const motionTransition: Transition = {
  type: "spring",
  stiffness: 420,
  damping: 32,
};

export const motionTransitionFast: Transition = {
  duration: 0.18,
  ease: [0.22, 1, 0.36, 1],
};

export const cardHoverVariants: Variants = {
  idle: {
    y: 0,
    scale: 1,
    rotateX: 0,
    rotateY: 0,
    zIndex: 1,
  },
  hover: {
    y: -14,
    scale: 1.06,
    rotateX: 4,
    rotateY: -4,
    zIndex: 20,
  },
  selected: {
    y: -22,
    scale: 1.1,
    rotateX: 0,
    rotateY: 0,
    zIndex: 30,
  },
  disabled: {
    y: 0,
    scale: 0.96,
    opacity: 0.55,
    zIndex: 0,
  },
};

export const cardEnterFieldVariants: Variants = {
  hidden: { opacity: 0, scale: 0.82, y: 24 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: motionTransition,
  },
};

export const cardDrawVariants: Variants = {
  hidden: { opacity: 0, x: -40, y: 30, scale: 0.8 },
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
    transition: motionTransition,
  },
};

export const damageFlashVariants: Variants = {
  idle: { filter: "brightness(1)" },
  flash: {
    filter: ["brightness(1)", "brightness(1.8)", "brightness(1)"],
    transition: { duration: 0.35 },
  },
};

export const deathDissolveVariants: Variants = {
  visible: { opacity: 1, scale: 1, filter: "blur(0px)" },
  exit: {
    opacity: 0,
    scale: 0.75,
    filter: "blur(6px)",
    transition: { duration: 0.45, ease: "easeIn" },
  },
};

export const abilityPulseVariants: Variants = {
  idle: { boxShadow: "0 0 0 0 rgba(56, 189, 248, 0)" },
  pulse: {
    boxShadow: [
      "0 0 0 0 rgba(56, 189, 248, 0.55)",
      "0 0 0 18px rgba(56, 189, 248, 0)",
    ],
    transition: { duration: 0.6 },
  },
};

export const attackLungeVariants: Variants = {
  idle: { x: 0, y: 0 },
  lunge: {
    x: [0, 0, 0],
    y: [0, -18, 0],
    transition: { duration: 0.35, ease: "easeOut" },
  },
};

export const overlayFadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

export const panelSlideVariants: Variants = {
  hidden: { opacity: 0, x: 24 },
  visible: { opacity: 1, x: 0, transition: motionTransitionFast },
  exit: { opacity: 0, x: 24, transition: motionTransitionFast },
};

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
