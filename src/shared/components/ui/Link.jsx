import { Link as RouterLink } from 'react-router-dom';
import { cn } from '@/shared/utils';

/**
 * Avec `target="_blank"`, `RouterLink` intercepte le clic et annule l'ouverture :
 * un `<a>` prend le relais, au prix d'un rechargement. Idem pour `mailto:`, `tel:`.
 */
export function Link({ href, target, replace, className, children, ref, ...rest }) {
  const isExternal =
    target === '_blank' ||
    /^(https?:|mailto:|tel:)/i.test(href ?? '') ||
    // Une ancre ou une query sans chemin ne peut pas passer par le routeur.
    (href != null && !String(href).startsWith('/'));

  if (isExternal)
    return (
      <a
        ref={ref}
        href={href}
        target={target}
        rel="noopener noreferrer"
        className={cn(className)}
        {...rest}
      >
        {children}
      </a>
    );

  return (
    <RouterLink ref={ref} to={href} replace={replace} className={cn(className)} {...rest}>
      {children}
    </RouterLink>
  );
}