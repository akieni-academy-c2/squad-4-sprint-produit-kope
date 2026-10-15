import { AnimatePresence, motion } from "motion/react";
import { sectionSwap } from "./variants.js";

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
