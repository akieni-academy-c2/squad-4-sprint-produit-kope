import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';

/**
 * Profondeur liée au défilement.
 *
 * Le défilement est le seul mouvement que l'utilisateur pilote : il n'a pas à
 * être masqué. Trois usages, tous informatifs :
 *
 *   - le texte remonte plus vite que la page - repère de profondeur ;
 *   - le visuel s'élève et grandit de 6 %, rapport de taille d'une perspective ;
 *   - la barre du haut, seule information que rien d'autre ne porte.
 *
 * Aucun fondu à l'apparition : le contenu sous la ligne de flottaison est
 * voulu, le faire apparaître en plus retarde sa lecture.
 *
 * `useReducedMotion` coupe le parallaxe. `MotionConfig` neutralise les
 * animations d'entrée, mais un parallaxe est un suivi continu de la position de
 * défilement, pas une transition - la configuration n'a rien à en dire.
 *
 * `offset` mesure la course sur la section : sans lui, la barre avancerait alors
 * que la section est sortie de l'écran.
 */
export function ScrollDepth({ text, visual, className }) {
  const target = useRef(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({ target, offset: ['start start', 'end start'] });

  const textY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : -90]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.6], [1, reduced ? 1 : 0]);
  const visualY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : 40]);
  const visualScale = useTransform(scrollYProgress, [0, 1], [1, reduced ? 1 : 1.06]);

  const { scrollYProgress: pageProgress } = useScroll();

  return (
    <>
      <motion.div
        aria-hidden
        style={{ scaleX: reduced ? 1 : pageProgress }}
        className="fixed inset-x-0 top-0 z-50 h-0.5 origin-left bg-primary-500"
      />

      <div ref={target} className={className}>
        <motion.div style={{ y: textY, opacity: textOpacity }}>{text}</motion.div>
        <motion.div style={{ y: visualY, scale: visualScale }}>{visual}</motion.div>
      </div>
    </>
  );
}
