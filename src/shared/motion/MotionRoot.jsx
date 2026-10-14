import { MotionConfig } from 'motion/react';
import { DURATION, EASE } from './timing.js';


export function MotionRoot({ children }) {
  return (
    <MotionConfig reducedMotion="user" transition={{ duration: DURATION.standard, ease: EASE.enter }}>
      {children}
    </MotionConfig>
  );
}
