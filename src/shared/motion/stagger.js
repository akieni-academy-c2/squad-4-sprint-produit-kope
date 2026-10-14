import { DURATION, EASE } from './timing.js';




export const MAX_STAGGERED = 12;


const TOTAL_CASCADE = 0.34;


const MAX_STEP = 0.05;


export const staggerParent = (count) => {
  const paced = Math.min(Math.max(count, 0), MAX_STAGGERED);
  if (paced < 2) return { animate: {} };

  return {
    animate: {
      transition: {
        staggerChildren: Math.min(MAX_STEP, TOTAL_CASCADE / (paced - 1)),
        delayChildren: 0.02,
      },
    },
  };
};


export const staggerChild = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: DURATION.standard, ease: EASE.enter } },
};
