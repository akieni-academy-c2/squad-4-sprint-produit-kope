import { TriangleAlert } from 'lucide-react';
import { Button } from './Button.jsx';
import { cn } from '@/shared/utils';


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