/**
 * Le temps du mouvement : courbes, durées, ressorts.
 *
 * Ce fichier ne décrit pas d'animations, il décrit **comment le temps passe**.
 * Le choix se fait ici, une fois, et les variantes de `variants.js` n'ont plus
 * qu'à dire *quoi* bouger.
 *
 * ## Les deux règles qui gouvernent tout
 *
 * **1. La courbe dit le sens du mouvement.**
 *
 * Un élément qui arrive décélère — il part vite et se pose. Un élément qui
 * part accélère. Une chose qui se déplace à l'écran, sans entrer ni sortir,
 * reste symétrique. Utiliser la même courbe partout produit cette animation
 * « livelihood » et sans poids où rien n'a l'air de se poser vraiment.
 *
 * Les courbes ci-dessous viennent des systèmes de mouvement qui ont été
 * éprouvés sur des millions d'écrans — Material 3 (`emphasized*`) et la
 * famille `easeOutExpo` — et non d'un essai au réglage.
 *
 * **2. La sortie est plus courte que l'entrée.**
 *
 * L'utilisateur a déjà choisi de partir. Lui faire attendre la même durée
 * qu'à l'arrivée est la façon la plus sûre de le faire regretter. C'est la
 * règle de Carbon (`exit` = 70 % de `enter`) et elle est appliquée par
 * construction dans `exitOf()`, jamais à la main.
 */

/**
 * Courbes de référence.
 *
 * `cubic-bezier(x1, y1, x2, y2)` : les deux premiers points sont la courbe
 * entrante, les deux derniers la sortante. `y > 1` ou `y < 0` est autorisé et
 * produit le dépassement — c'est volontaire ici, et rare.
 */
export const EASE = {
  /**
   * Décélération marquée — pour un élément qui **arrive**.
   * Départ franc, arrivée longue et posée. Le `y1 = 0.7` donne sa vitesse
   * initiale ; le `y2 = 1` garantit une arrivée à vitesse nulle, donc sans
   * micro-rebond en fin de course.
   */
  enter: [0.05, 0.7, 0.1, 1],

  /**
   * Accélération — pour un élément qui **part**.
   * Départ lent, sortie franche. Plus courte que `enter` : voir `exitOf`.
   */
  exit: [0.3, 0, 0.8, 0.15],

  /**
   * Symétrique — pour ce qui **se déplace à l'écran** sans entrer ni sortir
   * (une tuile qui se réordonne, un panneau qui se réduit).
   * `0.4 0 0.2 1` est la courbe « standard » de Material : neutre, lisible,
   * et ne suggère ni urgence ni poids.
   */
  move: [0.4, 0, 0.2, 1],

  /**
   * Courbe d'accentuation, la plus spectaculaire du jeu : à n'employer que
   * lorsqu'un seul élément doit attirer l'attention sans qu'on puisse dire
   * pourquoi. Rare — le plus souvent il faut un ressort, pas une courbe plus
   * raide.
   */
  emphasized: [0.2, 0, 0, 1],

  /**
   * Courte distance — un changement d'état sur un objet déjà à sa place
   * (couleur d'un onglet, fond d'une carte survolée). Ici la durée fait le
   * travail ; une courbe spectaculaire sur 8 px se remarque et fatigue.
   */
  short: [0.4, 0, 0.6, 1],
};

/**
 * L'échelle des durées, en secondes.
 *
 * Nommée d'après **ce qui se passe**, pas d'après une valeur. C'est ce qui
 * permet de dire « cette durée est fausse » en regardant le nom.
 *
 * La règle qui sous-tend l'échelle : la durée suit la *distance parcourue* et
 * le *rayon* de ce qui bouge, jamais son importance. Un bandeau de notification
 * qui traverse 400 px met plus de temps à s'installer qu'un texte qui se
 * décale de 8 px — même s'il est bien plus important.
 */
export const DURATION = {
  /** Retour de pression, changement de couleur d'un survol. 90 ms : en dessous, l'œil ne voit plus le mouvement, il voit un clignotement. */
  instant: 0.09,

  /** Un objet déjà à sa place qui change d'état. */
  quick: 0.14,

  /** Le standard : une infobulle, un menu, un badge. */
  standard: 0.22,

  /** Une surface de taille moyenne qui entre : une boîte de dialogue. */
  entrance: 0.32,

  /** Une grande surface qui parcourt beaucoup de distance : une feuille par le bas, qui vient du hors-cadre. */
  deliberate: 0.42,
};

/**
 * Le seuil en dessous duquel une animation est un défaut.
 *
 * 60 ms : sous cette durée, l'œil ne perçoit pas un mouvement mais un
 * scintillement — deux états séparés par du vide, ce qui est exactement la
 * signature d'un rechargement de page. Animer à cette vitesse coûte du temps de
 * de calcul pour produire un clignotement.
 *
 * Ce n'est **pas** une entrée de `DURATION` : c'est une contrainte sur
 * l'échelle, pas un cran de l'échelle. Le mélanger à une valeur de durée rend
 * l'ordre de l'échelle illisible — c'est à dire, il devient impossible de
 * vérifier qu'elle est croissante.
 */
export const PERCEPTIBLE = 0.06;

/**
 * Durée de sortie, déduite de celle d'entrée.
 *
 * 70 %, la proportion de Carbon. Écrit comme une fonction et jamais appelé à la
 * main : le seul moyen fiable d'éviter un dialogue où l'entrée est à 320 ms et
 * la sortie à 500 ms.
 *
 * @param {number} enterSeconds durée d'entrée
 * @returns {number} durée de sortie correspondante
 */
export const exitOf = (enterSeconds) => Number((enterSeconds * 0.7).toFixed(3));

/**
 * Ressorts.
 *
 * Un ressort, à la différence d'une courbe, peut être **interrompu et repris**
 * sans discontinuité : si l'utilisateur reclique pendant que la feuille se
 * referme, la vitesse courante est conservée. C'est pour ça qu'on l'utilise
 * pour tout ce qui suit un geste ou une donnée — et pas pour une simple
 * apparition.
 *
 * ## Pourquoi ces nombres
 *
 * Un ressort est défini par sa stiffness, sa masse et son amortissement. Le
 * seuil critique — celui au-delà duquel le système ne dépasse jamais sa cible —
 * vaut `2 × √(stiffness × masse)`. Les amortissements ci-dessous sont choisis
 * **juste en dessous** de ce seuil : la surface arrive vite et se pose sans
 * rebond.
 *
 * C'est un choix, et il est esthétique : dans une interface professionnelle,
 * un élément qui rebondit lit comme un jouet. Le rebond se garde pour ce que
 * l'utilisateur manipule en continu — une carte qu'il déplace au doigt.
 *
 * `visualDuration` fixe la durée *ressentie* indépendamment des paramètres :
 * deux ressorts de paramètres différents mais de même durée visuelle se
 * terminent ensemble à l'œil, ce qui est impossible avec des courbes.
 *
 * ## Les amortissements
 *
 * Tous ont été **calculés**, pas choisis à l'œil, et
 * `tests/src/shared/motion/motion.test.js` revérifie le calcul à chaque
 * exécution. Un amortissement trop bas — même de 2 % — se lit sur les grandes
 * surfaces : la feuille dépasse son cadre et revient.
 */
export const SPRING = {
  /**
   * Retour immédiat du doigt. Seuil critique : `2 × √(700 × 0.6) = 40.99`.
   */
  press: { type: 'spring', stiffness: 700, damping: 41, mass: 0.6, visualDuration: 0.12, bounce: 0 },

  /**
   * Surface qui entre en se poussant : feuille, dialogue.
   * Seuil critique : `2 × √(320 × 0.9) = 33.94`. `stiffness 320` est la valeur
   * de l'« emphasized spring » de Material 3, aujourd'hui la référence la plus
   * citée sur ce type de surface.
   */
  surface: { type: 'spring', stiffness: 320, damping: 34, mass: 0.9, visualDuration: 0.34, bounce: 0 },

  /**
   * Réorganisation d'une grille, d'un panneau qui se replie.
   * Plus mou : une tuile qui change de place n'a pas besoin d'arriver aussi sec
   * qu'une feuille — elle doit arriver **ensemble** avec ses voisines.
   * Seuil critique : `2 × √(260 × 1) = 32.25`.
   */
  layout: { type: 'spring', stiffness: 260, damping: 33, mass: 1, visualDuration: 0.36, bounce: 0 },
};

/**
 * Vrai si le mouvement vaut d'être animé.
 *
 * En deçà de 8 px, l'œil ne perçoit pas de déplacement : il perçoit un
 * scintillement. Animer coûte alors du temps de calcul pour un défaut.
 */
export const isWorthAnimating = (pixels) => Math.abs(pixels) >= 8;
