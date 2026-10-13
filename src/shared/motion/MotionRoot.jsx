import { MotionConfig } from 'framer-motion';
import { DURATION, EASE } from './timing.js';

/**
 * Contexte de mouvement de l'application.
 *
 * ## `reducedMotion="user"`
 *
 * C'est la seule prise en compte du réglage système, et elle est ici plutôt que
 * répétée dans chaque composant.
 *
 * Sous `prefers-reduced-motion: reduce`, Motion **neutralise les
 * transformations** et ne conserve que l'opacité. C'est exactement le bon
 * compromis : une personne sensible aux grands déplacements garde le contraste
 * et la hiérarchie visuelle — sinon les éléments entre deux écrans
 * apparaîtraient instantanément, sans explication — mais ne subit plus le trajet.
 * Écrire `useReducedMotion()` dans chaque composant serait dix fois le même
 * code, et dix occasions de l'oublier.
 *
 * ## `transition`
 *
 * Le mouvement par défaut de la bibliothèque est `easeInOut`. C'est la bonne
 * courbe pour un objet qui se déplace **continûment** à l'écran — une voiture
 * qui tourne, une caméra qui panoramique — et la mauvaise pour tout le reste.
 *
 * Une interface est faite d'objets qui **arrivent** et qui **partent**. La
 * courbe par défaut devient donc ici celle d'une entrée : décélération. Une
 * animation écrite sans `transition` explicite se pose au lieu de glisser.
 */
export function MotionRoot({ children }) {
  return (
    <MotionConfig reducedMotion="user" transition={{ duration: DURATION.standard, ease: EASE.enter }}>
      {children}
    </MotionConfig>
  );
}
