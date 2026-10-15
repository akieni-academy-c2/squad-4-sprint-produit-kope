import { DURATION, EASE, SPRING, exitOf } from "./timing.js";
export const overlayBackdrop = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: DURATION.standard, ease: EASE.enter },
  },
  exit: {
    opacity: 0,
    transition: { duration: exitOf(DURATION.standard), ease: EASE.exit },
  },
};
export const sheetPanel = {
  initial: { y: "100%", scale: 0.98 },
  animate: { y: "0%", scale: 1, transition: SPRING.surface },
  exit: {
    y: "100%",
    scale: 1,
    transition: { duration: exitOf(DURATION.deliberate), ease: EASE.exit },
  },
};
export const sidePanel = {
  initial: { x: "100%" },
  animate: { x: "0%", transition: SPRING.surface },
  exit: {
    x: "100%",
    transition: { duration: exitOf(DURATION.deliberate), ease: EASE.exit },
  },
};
export const dialogPanel = {
  initial: { opacity: 0, scale: 0.96, y: 8 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 34,
      mass: 0.7,
      visualDuration: 0.26,
      bounce: 0,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    y: 4,
    transition: { duration: exitOf(DURATION.entrance), ease: EASE.exit },
  },
};
export const sectionSwap = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.standard, ease: EASE.enter },
  },
  exit: { opacity: 0, transition: { duration: 0.09, ease: EASE.exit } },
};
export const toast = {
  initial: { opacity: 0, y: 16, scale: 0.98 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 420,
      damping: 35,
      mass: 0.7,
      visualDuration: 0.28,
      bounce: 0,
    },
  },
  exit: {
    opacity: 0,
    y: 8,
    scale: 0.98,
    transition: { duration: exitOf(DURATION.standard), ease: EASE.exit },
  },
};
