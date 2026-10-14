import { Children, Fragment } from 'react';
import { cn } from '@/shared/utils';

/**
 * Séparateurs verticaux entre les enfants valides seulement : un enfant
 * conditionnel qui rend `false` laisserait un trait orphelin.
 */
export function ActionGroup({ children, className, separatorClassName, label }) {
  const items = Children.toArray(children).filter((child) => child !== null && child !== undefined && child !== false);

  // Un groupe d'une seule action n'a plus de groupe : la bordure
  // enferme le bouton sans rien séparer.
  if (items.length === 0) return null;

  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        'inline-flex items-center gap-0.5 rounded-lg border border-gray-200 bg-gray-200/20 p-1',
        className,
      )}
    >
      {items.map((child, index) => (
        <Fragment key={child.key ?? index}>
          {index > 0 && (
            <span aria-hidden className={cn('mx-0.5 h-4 w-px bg-gray-300', separatorClassName)} />
          )}
          {child}
        </Fragment>
      ))}
    </div>
  );
}