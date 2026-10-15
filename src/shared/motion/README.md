# Mouvement

Le mouvement n'est pas une décoration qu'on ajoute à la fin : c'est une
information. Il dit d'où vient un objet, où il va, et s'il est disponible.

Ce dossier contient le système. Les composants ne l'animent pas librement - ils
puisent dans ces trois fichiers.

```
timing.js     combien de temps, et avec quelle courbe
variants.js   quoi animer, et dans quel but
stagger.js    comment un groupe arrive ensemble
```

Plus `MotionRoot.jsx` (préférence système, courbe par défaut),
`SectionSwap.jsx` (la colonne centrale des tableaux de bord) et
`ScrollDepth.jsx` (profondeur liée au défilement).

## Le paquet

`motion`, importé depuis `motion/react`. C'est le nom officiel depuis le
renommage : `framer-motion` reste publié et fonctionne, mais la documentation
et le type-check pointent sur `motion`. Même version, même API.

## La règle qui décide de tout

**Ce qui peut être interrompu, ou qui a une sortie, passe par Motion.
Tout le reste est du CSS.**

|                             | interruption | sortie | CSS suffit ?        |
| --------------------------- | ------------ | ------ | ------------------- |
| feuille, dialogue           | oui          | oui    | non                 |
| onglet d'un tableau de bord | -            | oui    | non                 |
| message éphémère            | -            | oui    | non                 |
| parallaxe du héros          | non          | -      | non, `useScroll`    |
| icône d'action (28 px)      | non          | non    | **non**, `whileTap` |
| bouton de texte (44 px)     | non          | non    | **oui**, `:active`  |
| survol, couleur, opacité    | non          | non    | **oui**             |

Un bouton ne peut pas être interrompu : au relâchement le doigt est déjà parti,
et personne ne voit la vitesse de retour. Le remplacer par une instance
`motion` coûte un type à construire, une instance à abonner et une prop à
propager à travers `as={Link}`, pour 30 ms que `:active` rend sur le
compositeur, en JavaScript zéro.

Une icône de 28 px est dans l'autre cas : elle est **sous le doigt**, donc le
retour se voit, et il n'y en a jamais assez pour que la facture compte. Ce qui
la distingue d'un bouton de texte n'est pas sa taille - c'est le **nombre
d'occurrences**.

Une feuille, si : on la rouvre à mi-parcours, elle doit repartir de sa vitesse.
Une transition CSS ne connaît ni l'interruption, ni l'état suivant.

## Les trois règles que le code applique

1. **La courbe suit le sens du mouvement.** Un élément qui arrive décélère,
   un élément qui part accélère, un élément qui se déplace à l'écran reste
   symétrique.
2. **La sortie est plus courte que l'entrée** - 70 %, et par construction :
   `exitOf()` la dérive, elle n'est jamais écrite à la main.
3. **On n'anime que `transform` et `opacity`.** Tout le reste force le
   navigateur à refaire la mise en page à chaque image.

Ces trois règles sont **vérifiées par les tests**, pas seulement écrites :
`tests/src/shared/motion/motion.test.js` recalcule le seuil critique de chaque
ressort, vérifie l'ordre de l'échelle des durées, mesure la cascade d'un groupe
de 2 et de 200 éléments, et parcourt chaque variante pour s'assurer qu'elle
n'anime rien qui force la mise en page.

## Ce qu'on n'anime pas, délibérément

- **Le contenu sous la ligne de flottaison.** L'utilisateur a fait défiler
  pour le voir ; le faire apparaître en plus retarde sa lecture. C'est la
  signature des animations générées : partout, toujours, dans le même sens.
- **Le premier rendu d'une page.** Ce qui est déjà là n'a pas besoin d'arriver.
  `initial={false}` sur les en-têtes de section et sur le héros.
- **Une liste de résultats.** Une grille de 24 cartes qui se met en place d'un
  bloc est plus rapide à lire qu'une grille qui se pose en cascade.
- **Le rebond.** Un objet qui dépasse sa cible se lit comme un jouet. Tous les
  ressorts du projet sont amortis au seuil critique, et un test le recalcule à
  chaque exécution.
