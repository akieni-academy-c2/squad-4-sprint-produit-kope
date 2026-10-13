/**
 * Le temps du mouvement : courbes, durées, ressorts.
 *
 * Les variantes de `variants.js` disent *quoi* bouger ; ce fichier dit *combien
 * de temps* et *avec quelle courbe*. Le choix se fait ici, une fois.
 *
 * Deux invariants :
 *   - la courbe suit le sens du mouvement - une entrée décélère, une sortie
 *     accélère, un déplacement à l'écran reste symétrique ;
 *   - une sortie dure moins longtemps qu'une entrée, par construction (`exitOf`).
 */

/**
 * Courbes de référence. `cubic-bezier(x1, y1, x2, y2)`.
 */
export const EASE = {
  /** Entrée : départ franc, arrivée posée. */
  enter: [0.05, 0.7, 0.1, 1],

  /** Sortie : départ lent, fin franche. */
  exit: [0.3, 0, 0.8, 0.15],

  /** Déplacement à l'écran : neutre. */
  move: [0.4, 0, 0.2, 1],

  /** Accentuation, pour un élément qui doit attirer l'œil sans raison visible. */
  emphasized: [0.2, 0, 0, 1],

  /** Courte distance : un changement d'état sur un objet déjà en place. */
  short: [0.4, 0, 0.6, 1],
};

/**
 * L'échelle des durées, en secondes. Nommées d'après ce qui se passe.
 *
 * La durée suit la distance parcourue et le rayon de ce qui bouge, jamais son
 * importance : un bandeau qui traverse 400 px met plus de temps à s'installer
 * qu'un texte qui se décale de 8 px.
 */
export const DURATION = {
  /** Retour de pression, survol. En dessous de 90 ms, l'œil voit un clignotement. */
  instant: 0.09,
  /** Un objet déjà en place qui change d'état. */
  quick: 0.14,
  /** Infobulle, menu, badge. */
  standard: 0.22,
  /** Surface moyenne qui entre : une boîte de dialogue. */
  entrance: 0.32,
  /** Grande surface qui parcourt beaucoup de distance : une feuille par le bas. */
  deliberate: 0.42,
};

/**
 * Sous 60 ms, l'œil ne perçoit pas un mouvement mais un scintillement - deux
 * états séparés par du vide, c'est-à-dire un rechargement de page.
 *
 * Contrainte sur l'échelle, pas un cran de l'échelle : la mélanger aux durées
 * la rendrait non ordonnée, donc invérifiable.
 */
export const PERCEPTIBLE = 0.06;

/** Durée de sortie, déduite de l'entrée. 70 %, la proportion de Carbon. */
export const exitOf = (enterSeconds) => Number((enterSeconds * 0.7).toFixed(3));

/**
 * Ressorts, pour ce qui peut être interrompu et repris.
 *
 * Un ressort conserve sa vitesse courante quand l'animation est interrompue ;
 * une courbe CSS repart de zéro. D'où leur usage réservé aux surfaces et aux
 * réorganisations.
 *
 * Les amortissements sont **calculés**, pas choisis à l'œil : le seuil critique
 * vaut `2 × √(stiffness × masse)`, et tous sont juste au-dessus. Un objet qui
 * dépasse sa cible se lit comme un jouet.
 *
 * `visualDuration` aligne la durée ressentie : deux ressorts de paramètres
 * différents se terminent ensemble à l'œil.
 *
 * Vérifié à chaque exécution par `tests/src/shared/motion/motion.test.js`.
 */
export const SPRING = {
  /** Seuil critique : 2 × √(700 × 0.6) = 40.99. */
  press: { type: 'spring', stiffness: 700, damping: 41, mass: 0.6, visualDuration: 0.12, bounce: 0 },

  /** Seuil : 33.94. `stiffness 320` est l'emphasized spring de Material 3. */
  surface: { type: 'spring', stiffness: 320, damping: 34, mass: 0.9, visualDuration: 0.34, bounce: 0 },

  /** Seuil : 32.25. Plus mou : une tuile doit arriver avec ses voisines. */
  layout: { type: 'spring', stiffness: 260, damping: 33, mass: 1, visualDuration: 0.36, bounce: 0 },
};

/** En deçà de 8 px, l'œil ne voit pas de déplacement : animer coûte pour rien. */
export const isWorthAnimating = (pixels) => Math.abs(pixels) >= 8;
