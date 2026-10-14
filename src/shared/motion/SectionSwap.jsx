import { AnimatePresence, motion } from 'motion/react';
import { sectionSwap } from './variants.js';

/**
 * Le décalage de 8 px porte la lecture, pas la durée : un fondu de 220 ms ne se
 * perçoit pas. `initial={false}` évite un blanc au premier rendu.
 */
export function SectionSwap({ sectionKey, className, children }) {
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.div
        key={sectionKey}
        className={className}
        variants={sectionSwap}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
