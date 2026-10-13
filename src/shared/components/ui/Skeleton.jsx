import { cn } from '@/shared/utils';

/**
 * Emplacement réservé pendant le chargement.
 *
 * ## Pourquoi `gray-200` et pas `gray-100`
 *
 * `gray-100` était invisible sur les tableaux de bord et sur `/search`. Ces
 * pages portent le fond pointillé, et `bg-dots` pose
 * `background-color: var(--color-gray-100)` — la couleur exacte du squelette.
 * Le résultat n'était pas un squelette discret : c'était un carré de la même
 * teinte que le fond, donc rien du tout.
 *
 * Un cran plus bas que le fond suffit : il reste clairement un bloc réservé,
 * et il ne devient pas une barre de chargement trop lourde dans les cartes
 * blanches, où il se détache franchement.
 *
 * Le clignotement fait le reste — sur fond pointillé comme sur carte blanche,
 * c'est lui qui dit « ça arrive ».
 */
export function Skeleton({ className }) {
  return <div className={cn('animate-pulse rounded-xl bg-gray-200', className)} />;
}
