import { useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/shared/utils';
import { useOverlay } from './useOverlay.js';

export function Sheet({ open, onOpenChange, side = 'right', children }) {
  const innerRef = useRef(null);
  const { render, show, panelRef } = useOverlay({
    open,
    onClose: () => onOpenChange?.(false),
  });

  // Le hook expose une ref unique : on la relaie vers le panneau rendu.
  const setRefs = (node) => {
    panelRef.current = node;
    innerRef.current = node;
  };

  if (!render || typeof document === 'undefined') return null;
  return createPortal(
    <div
      className={cn(
        'fixed inset-0 z-90 bg-checkers backdrop-blur-sm transition-opacity duration-300',
        show ? 'opacity-100' : 'opacity-0',
      )}
      onClick={() => onOpenChange?.(false)}
    >
      <div
        ref={setRefs}
        role="dialog"
        aria-modal="true"
        className={cn(
          // Même contrat que Modal : hauteur bornée et défilement interne.
          // Sans cela, un formulaire long est tronqué sur iOS, qui ne réduit
          // pas la page sous le clavier.
          side === 'bottom'
            ? 'absolute inset-x-0 bottom-0 flex max-h-[90dvh] w-full flex-col overflow-y-auto overscroll-contain rounded-t-3xl bg-white p-4 pb-[calc(0.5rem+env(safe-area-inset-bottom))] shadow-2xl transition-transform duration-300'
            : 'absolute inset-y-0 right-0 flex w-[85%] max-w-sm flex-col overflow-y-auto overscroll-contain bg-white shadow-2xl',
          show
            ? side === 'bottom' ? 'translate-y-0' : 'translate-x-0'
            : side === 'bottom' ? 'translate-y-full' : 'translate-x-full',
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Fermer"
          className="absolute cursor-pointer right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 focus-ring"
          onClick={() => onOpenChange?.(false)}
        >
          <X size={16} aria-hidden />
        </button>
        {children}
      </div>
    </div>,
    document.body,
  );
}
