import { MotionConfig } from 'motion/react';
import { DURATION, EASE } from './timing.js';

/**
 * Contexte de mouvement de l'application.
 *
 * `reducedMotion="user"` est la seule prise en compte du réglage système, et
 * elle est ici plutôt que répétée dans chaque composant : sous
 * `prefers-reduced-motion: reduce`, Motion neutralise les transformations et ne
 * garde que l'opacité. L'utilisateur sensible aux grands déplacements conserve
 * la hiérarchie visuelle sans subir le trajet.
 *
 * La `transition` par défaut remplace `easeInOut` - bonne courbe pour un objet
 * qui se déplace en continu, mauvaise pour une interface faite d'objets qui
 * arrivent et qui partent. Une animation écrite sans `transition` explicite se
 * pose au lieu de glisser.
 */
export function MotionRoot({ children }) {
  return (
    <MotionConfig reducedMotion="user" transition={{ duration: DURATION.standard, ease: EASE.enter }}>
      {children}
    </MotionConfig>
  );
}
