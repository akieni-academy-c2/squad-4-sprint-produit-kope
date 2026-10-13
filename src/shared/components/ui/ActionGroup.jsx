import { Children, Fragment } from 'react';
import { cn } from '@/shared/utils';

/**
 * Groupe d'actions d'une fiche.
 *
 * Le fond translucide et la bordure extérieure portent le groupe : les actions
 * d'une fiche ne sont pas des boutons de page, ils sont un jeu d'outils
 * greffé au contenu. Le séparateur vertical entre chaque bouton remplace les
 * espaces : sans lui, trois icônes alignées se lisent comme un texte
 * continu, alors que `|·|` marque trois gestes distincts.
 *
 * Les séparateurs sont insérés entre les enfants valides uniquement : un
 * enfant conditionnel (`cond && <Button/>`) qui rend `false` ne doit pas
 * laisser un trait orphelin au bord du groupe.
 */
export function ActionGroup({ children, className, separatorClassName, label }) {
  const items = Children.toArray(children).filter((child) => child !== null && child !== undefined && child !== false);

  // Un groupe d'une seule action n'a plus de groupe : la bordure autour
  // d'un bouton isolé l'enferme sans rien séparer.
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