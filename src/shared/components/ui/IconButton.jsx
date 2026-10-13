import { motion } from 'motion/react';
import { SPRING } from '@/shared/motion/timing.js';
import { cn } from '@/shared/utils';

/**
 * Bouton d'icône : un carré de 28 à 36 px, une seule icône, une seule action.
 *
 * ## Pourquoi celui-ci a une instance Motion, et `Button` non
 *
 * La règle du système de mouvement est « ce qui peut être interrompu ou qui a
 * une sortie passe par Motion ». Ni l'un ni l'autre n'est vrai ici — et c'est
 * justement ce qui les sépare de `Button` :
 *
 * | | instances par page | surface | retour lisible ? |
 * |---|---|---|---|
 * | `Button` | 40 à 200 | 44 × 110 px | non, 30 ms |
 * | `IconButton` | 4 à 30 | 28 × 28 px | **oui**, le doigt le couvre |
 *
 * Un bouton large qui s'enfonce de 3 % se voit à peine et coûte une instance
 * par occurrence. Une icône de 28 px est **sous le doigt** : ce que
 * l'utilisateur touche, il le voit bouger. Et il n'y en a jamais assez pour
 * que la facture compte.
 *
 * ## Pourquoi `whileHover` et pas `:hover`
 *
 * La documentation de Motion le formule : les événements `:hover` CSS sont
 * **faux sur appareil tactile**. Un navigateur tactile synthétise un survol au
 * toucher, puis le laisse collé — l'icône resterait survolée après le tap, et
 * le fond y resterait aussi. `whileHover` se désengage au `pointerleave`, que
 * le tactile produit correctement.
 *
 * ## Les amplitudes
 *
 * `0.9` au tap, pas `0.97`. Un carré de 28 px perd 2,8 px de côté à 0.97 :
 * l'icône semble vibrer plutôt que s'appuyer. Sous 0.85, elle disparaît dans le
 * doigt et l'action semble ne pas répondre.
 *
 * Le survol agrandit de 4 %, pas plus : au-delà, l'icône quitte la grille du
 * groupe d'actions et les separates ne sont plus alignés.
 */
export function IconButton({
  icon: Icon,
  label,
  onClick,
  disabled = false,
  className,
  tone = 'default',
  title,
}) {
  return (
    <motion.button
      type="button"
      // `hover` plutôt que `focus-visible` : le survol est un retour immédiat,
      // le focus est un retour de clavier. Les deux cohabitent.
      whileHover={disabled ? undefined : { scale: 1.04 }}
      whileTap={disabled ? undefined : { scale: 0.9 }}
      transition={SPRING.press}
      onClick={onClick}
      disabled={disabled}
      title={title ?? label}
      aria-label={label}
      className={cn(
        'inline-flex cursor-pointer items-center justify-center rounded p-1.5 transition-colors focus-ring',
        disabled && 'cursor-not-allowed opacity-50',
        TONES[tone] ?? TONES.default,
        className,
      )}
    >
      <Icon size={16} aria-hidden />
    </motion.button>
  );
}

const TONES = {
  default:
    'text-gray-600 hover:bg-white hover:text-primary-600 disabled:hover:bg-transparent disabled:hover:text-gray-600',
  danger: 'text-gray-500 hover:bg-white hover:text-danger-500 disabled:hover:bg-transparent',
  report:
    'text-gray-600 hover:bg-white hover:text-danger-500 disabled:hover:bg-transparent disabled:hover:text-gray-600',
};
