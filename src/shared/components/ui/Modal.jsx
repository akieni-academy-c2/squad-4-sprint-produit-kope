import { useId } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/shared/utils';
import { useOverlay } from './useOverlay.js';

export function Modal({
  open,
  onClose,
  title,
  description,
  actions,
  children,
  size = 'md',
  dismissable = true,
}) {
  const titleId = useId();
  const { render, show, panelRef } = useOverlay({ open, onClose, dismissable });

  if (!render || typeof document === 'undefined') return null;
  const widths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
    full: 'max-w-5xl',
  }[size] || 'max-w-md';

  // Moins de 4 sections (titre, description, contenu, actions) : réduire le rayon des coins.
  const sections = [title, description, children, actions].filter(Boolean).length;
  const radiusTop = sections < 4 ? 'rounded-t-xl' : 'rounded-t-2xl';
  const radiusMain = sections < 4 ? 'sm:rounded-xl' : 'sm:rounded-2xl';

  return createPortal(
    <div
      className={cn(
        'fixed inset-0 z-[90] flex items-end justify-center bg-checkers p-0 sm:items-center sm:p-4 transition-opacity duration-300',
        show ? 'opacity-100' : 'opacity-0',
      )}
      onClick={() => dismissable && onClose?.()}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        onClick={(e) => e.stopPropagation()}
        className={cn(
// Sur mobile la modale est une feuille ancrée en bas, comme les sheets Apple :
// elle grandit avec le contenu jusqu'à 90dvh et laisse toujours une bande de
// page visible au-dessus - le repère visuel qui dit « c'est une surcouche ».
// Le breakpoint `sm` reste inchangé : sur desktop la modale est centrée et
// sa hauteur suit son contenu, sans plafond.
'w-full max-h-[90dvh] overflow-y-auto overscroll-contain bg-white shadow-[var(--shadow-pop)] transition-opacity duration-300 sm:max-h-none',
          radiusTop,
          radiusMain,
          show ? 'opacity-100' : 'opacity-0',
          widths,
        )}
      >
        {(title || description) && (
          <div className="border-b border-gray-100 px-5 py-4">
            {title && (
              <h2 id={titleId} className="text-lg font-semibold text-gray-900">
                {title}
              </h2>
            )}
            {description && <p className="mt-1 text-sm text-gray-600">{description}</p>}
          </div>
        )}
        {children && <div className="px-4 py-3 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:px-5 sm:py-4">{children}</div>}
        {actions && (
          <div className="flex flex-col-reverse gap-2 border-t border-gray-100 px-5 py-3 sm:flex-row sm:justify-end">
            {actions}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
