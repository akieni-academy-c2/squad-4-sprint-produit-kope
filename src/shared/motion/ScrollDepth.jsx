import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { useRef } from "react";

export function ScrollDepth({ text, visual, className }) {
  const target = useRef(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target,
    offset: ["start start", "end start"],
  });

  const textY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : -90]);
  const textOpacity = useTransform(
    scrollYProgress,
    [0, 0.6],
    [1, reduced ? 1 : 0],
  );
  const visualY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : 40]);
  const visualScale = useTransform(
    scrollYProgress,
    [0, 1],
    [1, reduced ? 1 : 1.06],
  );

  const { scrollYProgress: pageProgress } = useScroll();

  return (
    <>
      <motion.div
        aria-hidden
        style={{ scaleX: reduced ? 1 : pageProgress }}
        className="fixed inset-x-0 top-0 z-50 h-0.5 origin-left bg-primary-500"
      />

      <div ref={target} className={className}>
        <motion.div style={{ y: textY, opacity: textOpacity }}>
          {text}
        </motion.div>
        <motion.div style={{ y: visualY, scale: visualScale }}>
          {visual}
        </motion.div>
      </div>
    </>
  );
}
