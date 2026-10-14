import { useMediaQuery } from '@/shared/hooks/useMediaQuery.js';

/**
 * Affiche une version selon la largeur, et n'en monte qu'une.
 *
 * Un media query CSS agit sur `display`, pas sur le montage : les deux versions
 * restaient dans l'arbre. Ici il n'y en a qu'une, donc un seul `h2` indexable.
 */
export function ResponsiveSection({ variant, desktop = '(min-width: 1024px)', children }) {
  const isDesktop = useMediaQuery(desktop);
  return (variant === 'desktop') === isDesktop ? children : null;
}