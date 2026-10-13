import { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react';

/**
 * Profondeur de la page, liée au défilement.
 *
 * ## Pourquoi ici, et nulle part ailleurs
 *
 * Le défilement est le seul mouvement que l'utilisateur **pilote lui-même**. Il
 * n'a pas à être masqué : c'est lui l'effet. Une animation de défilement n'a de
 * sens que là où elle **renseigne** sur la position dans la page, et pas là où
 * elle décore.
 *
 * Trois usages, trois justifications :
 *
 *   - le texte remonte plus vite que la page : repère de profondeur. On sent la
 *     page bouger sans avoir à lire ;
 *   - le visuel s'élève et grandit de 6 % : il est plus loin, donc plus petit —
 *     le rapport de taille d'une perspective, sans en simuler une. Au-delà de
 *     1.06, on voit l'image grossir en même temps qu'elle s'éloigne, et les
 *     deux mouvements se contredisent ;
 *   - la barre du haut : la seule information qu'aucun autre élément ne porte,
 *     et qui répond à « combien reste-t-il à lire ? ».
 *
 * ## Ce que ce composant ne fait pas
 *
 * **Aucun fondu à l'apparition.** Le contenu sous la ligne de flottaison est
 * voulu : l'utilisateur a fait défiler pour le voir. Le faire apparaître en
 * plus retarde sa lecture, et rien ne l'avertit. C'est l'effet le plus
 * identifiable des animations générées — il est ici, volontairement, absent.
 *
 * ## `useReducedMotion`
 *
 * Le parallaxe est **coupé** sous `prefers-reduced-motion`. C'est le seul
 * endroit du projet où la préférence s'applique autrement que par
 * `MotionConfig` : celui-là neutralise les animations d'entrée, mais un
 * parallaxe est un suivi continu de la position de défilement, pas une
 * transition — `MotionConfig` n'a rien à en dire.
 *
 * ## `offset`
 *
 * `['start start', 'end start']` mesure la course sur la **hauteur de la
 * section**. Sans lui, la progression se calcule sur toute la fenêtre : la
 * barre continuerait d'avancer alors que la section est déjà sortie de l'écran.
 */
export function ScrollDepth({ text, visual, className }) {
  const target = useScrollTarget();
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target,
    offset: ['start start', 'end start'],
  });

  const textY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : -90]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.6], [1, reduced ? 1 : 0]);
  const visualY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : 40]);
  const visualScale = useTransform(scrollYProgress, [0, 1], [1, reduced ? 1 : 1.06]);

  return (
    <>
      {/*
        La barre vit hors de la section mesurée : elle doit suivre la page
        entière, pas les `start`/`end` de cette section — d'où une seconde
        mesure, sur la fenêtre.
      */}
      <PageProgress reduced={reduced} />

      <div ref={target} className={className}>
        <motion.div style={{ y: textY, opacity: textOpacity }}>{text}</motion.div>
        <motion.div style={{ y: visualY, scale: visualScale }}>{visual}</motion.div>
      </div>
    </>
  );
}

/** Barre de progression de lecture : l'échelle est déjà une `MotionValue`. */
function PageProgress({ reduced }) {
  const { scrollYProgress } = useScroll();

  return (
    <motion.div
      aria-hidden
      style={{ scaleX: reduced ? 1 : scrollYProgress }}
      className="fixed inset-x-0 top-0 z-50 h-0.5 origin-left bg-primary-500"
    />
  );
}

/**
 * La section à mesurer.
 *
 * `useRef` est requis : `useScroll` a besoin de l'élément, et l'élément a
 * besoin de la mesure. Le state ferait une seconde passe de rendu.
 */
function useScrollTarget() {
  const ref = useRef(null);
  return ref;
}
