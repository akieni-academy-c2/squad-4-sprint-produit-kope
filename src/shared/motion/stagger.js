import { DURATION, EASE } from './timing.js';

/**
 * Cadencement d'un groupe.
 *
 * Le décalage entre éléments se rate vite : `staggerChildren: 0.08` sur 24
 * cartes étale la dernière à près de deux secondes, pendant que l'utilisateur a
 * déjà commencé à lire. Sur 200 résultats, à seize secondes.
 *
 * Trois bornes, donc trois règles :
 *   - au-delà de `MAX_STAGGERED` éléments, les excédentaires partent ensemble ;
 *   - le total ne dépasse jamais `TOTAL_CASCADE`, quelle que soit la taille ;
 *   - l'écart entre deux éléments ne dépasse jamais `MAX_STEP`.
 *
 * La troisième borne est celle qui compte sur les petits groupes : borné par
 * le total seul, un groupe de **deux** éléments étirerait son unique écart sur
 * 340 ms. Le total serait respecté, la cadence non - et le résultat pire que
 * sans animation.
 */

/** Nombre d'éléments réellement cadencés. */
export const MAX_STAGGERED = 12;

/** Durée totale que doit occuper la cascade. */
const TOTAL_CASCADE = 0.34;

/**
 * Écart maximal entre deux éléments.
 *
 * 50 ms : au-delà de l'intervalle d'un clignement, l'enchaînement se lit comme
 * un effet et non comme une arrivée.
 */
const MAX_STEP = 0.05;

/**
 * Parent d'une cascade.
 *
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
 * Enfant d'une cascade.
 *
 * L'indice n'est pas passé en paramètre : le cadencement vit dans
 * `staggerChildren` du parent, qui connaît déjà ses enfants.
 */
export const staggerChild = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: DURATION.standard, ease: EASE.enter } },
};
