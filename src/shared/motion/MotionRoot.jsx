import { MotionConfig } from 'motion/react';
import { DURATION, EASE } from './timing.js';

/**
 * Seule prise en compte du réglage système : Motion neutralise alors les
 * transformations et ne garde que l'opacité.
 */
export function MotionRoot({ children }) {
  return (
    <MotionConfig reducedMotion="user" transition={{ duration: DURATION.standard, ease: EASE.enter }}>
      {children}
    </MotionConfig>
  );
}
