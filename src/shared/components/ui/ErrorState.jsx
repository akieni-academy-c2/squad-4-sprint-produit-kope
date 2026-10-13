import { TriangleAlert } from 'lucide-react';
import { Button } from './Button.jsx';
import { cn } from '@/shared/utils';

/**
 * Panneau d'erreur, style du système de design.
 *
 * L'erreur est un **état**, pas une alerte : elle occupe une place dans la
 * page et se lit comme le reste de l'interface. La sprayed everywhere - texte
 * rouge sur fond rouge, bordure rouge - transformait chaque écran qui échouait
 * en affiche d'alerte, et deux implémentations cohabitaient déjà
 * (`DataState` et `ProfileErrorState`) avec des couleurs différentes.
 *
 * La hiérarchie reprend celle des autres panneaux de l'application
 * (`PublicationStatus`, `MissingChecklist`) :
 *   - une pastille d'icône qui donne le ton sans colorer le texte ;
 *   - un **titre** en gras, sémantique, bref ;
 *   - le **détail** en texte courant, jamais en rouge - le rouge attire
 *     l'œil, et c'est le titre qui doit l'attirer, pas la phrase d'erreur ;
 *   - l'action, alignée sur le bord du texte.
 *
 * Le rôle `alert` est conservé : l'erreur doit être annoncée aux lecteurs
 * d'écran au moment où elle apparaît, pas seulement être visible.
 */
export function ErrorState({
  title = 'Erreur de chargement',
  message,
  action,
  onAction,
  actionLabel = 'Réessayer',
  className,
  compact = false,
}) {
  return (
    <div
      role="alert"
      className={cn(
        'rounded-md border border-gray-200 bg-gray-50/70',
        compact ? 'px-3 py-2.5' : 'p-5',
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="flex size-8 shrink-0 items-center justify-center rounded-md bg-danger-50 text-danger-500"
        >
          <TriangleAlert size={16} />
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-gray-900">{title}</p>
          {message && <p className="mt-0.5 text-sm text-gray-600">{message}</p>}

          {onAction && (
            <div className="mt-3">
              <Button variant="secondary" size="sm" onClick={onAction}>
                {actionLabel}
              </Button>
            </div>
          )}
          {action}
        </div>
      </div>
    </div>
  );
}