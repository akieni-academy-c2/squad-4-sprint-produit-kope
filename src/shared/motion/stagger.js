import { DURATION, EASE } from './timing.js';

/**
 * Cadençage borné trois fois : au-delà de `MAX_STAGGERED` les excédentaires
 * partent ensemble, le total ne dépasse jamais `TOTAL_CASCADE`, l'écart jamais
 * `MAX_STEP`.
 */

/** Nombre d'éléments réellement cadencés. */
export const MAX_STAGGERED = 12;

/** Durée totale que doit occuper la cascade. */
const TOTAL_CASCADE = 0.34;

/** Au-delà de l'intervalle d'un clignement, l'enchaînement se lit comme un effet. */
const MAX_STEP = 0.05;

/**
 * @param {number} count nombre d'enfants dans le groupe
 * @returns {object} `variants` pour un `motion.*`
 */
export const staggerParent = (count) => {
  const paced = Math.min(Math.max(count, 0), MAX_STAGGERED);
  // Une cascade n'a rien à cadencer sur un groupe vide ou d'un élément.
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

/**
 * L'indice n'est pas passé en paramètre : le cadencement vit dans
 * `staggerChildren` du parent, qui connaît déjà ses enfants.
 */
export const staggerChild = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: DURATION.standard, ease: EASE.enter } },
};
