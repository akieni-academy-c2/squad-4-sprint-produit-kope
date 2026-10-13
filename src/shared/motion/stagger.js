import { DURATION, EASE } from './timing.js';

/**
 * Cadencement d'un groupe.
 *
 * Le décalage entre éléments est l'effet le plus facile à mettre et le plus
 * facile à rater. Appliqué naïvement — `staggerChildren: 0.08` sur une grille —
 * il produit ceci : sur une page de 24 cartes, la dernière arrive à
 * `24 × 0.08 = 1.9 s`, l'utilisateur a déjà commencé à lire, et l'interface a
 * l'air d'être encore en train de charger. Sur 200 résultats de recherche,
 * c'est 16 secondes.
 *
 * ## Ce que fait ce module
 *
 * **Le délai est borné, pas cumulatif.** Les `MAX_STAGGERED` premiers éléments
 * sont cadencés ; tous les suivants partent **ensemble**. Un groupe long n'est
 * donc jamais plus lent qu'un groupe court.
 *
 * **Le pas se resserre quand le groupe s'allonge.** À 4 éléments, 50 ms se
 * voient. À 24, le même pas produirait une traîne interminable ; on divise
 * alors le pas par le nombre d'éléments cadencés, pour que **le groupe entier
 * soit posé dans le même temps** quelle que soit sa taille.
 *
 * **Rien n'est cadencé au-delà de 50 ms.** Au-delà de l'intervalle d'un
 * clignement, l'enchaînement se lit comme un effet, pas comme une arrivée.
 */

/** Nombre d'éléments réellement cadencés. Au-delà, ils arrivent ensemble. */
export const MAX_STAGGERED = 12;

/** Durée totale que doit occuper la cascade d'un groupe, quelle que soit sa taille. */
const TOTAL_CASCADE = 0.34;

/**
 * Écart maximal entre deux éléments.
 *
 * 50 ms : au-delà de l'intervalle d'un clignement, l'enchaînement se lit comme
 * un effet, pas comme une arrivée — on voit les éléments arriver *un par un*.
 *
 * C'est ce plafond qui corrige le cas limite. En bornant seulement le total —
 * « le groupe entier tient dans 340 ms » — un groupe de **deux** éléments
 * étire son unique écart sur 340 ms : le second arrive après la moitié de
 * seconde. Le total est respecté, la cadence ne l'est pas, et le résultat est
 * bien pire que sans rien.
 */
const MAX_STEP = 0.05;

/**
 * Parent d'une cascade.
 *
 * @param {number} count nombre d'enfants dans le groupe
 * @returns {object} `variants` transmissibles telles quelles à un `motion.div`
 */
export const staggerParent = (count) => {
  const paced = Math.min(Math.max(count, 0), MAX_STAGGERED);
  // Un seul élément, ou un groupe vide : une cascade n'a rien à cadencer.
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
 * La courbe est celle d'une **entrée** : décélération. Un groupe qui apparaît
 * doit se poser, pas se lancer.
 *
 * La position n'est pas passée en paramètre : le cadencement vit dans
 * `staggerChildren` du parent, qui connaît déjà tous ses enfants. Lui
 * repasser l'indice donnerait deux endroits où fixer la même chose.
 */
export const staggerChild = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: DURATION.standard, ease: EASE.enter } },
};
