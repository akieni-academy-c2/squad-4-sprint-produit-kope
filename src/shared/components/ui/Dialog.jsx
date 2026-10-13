import { isValidElement, cloneElement, useId, useContext, createContext, Children } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/shared/utils';
import { useOverlay } from './useOverlay.js';

/**
 * Relie `DialogTitle` à son `DialogContent`.
 *
 * `role="dialog"` sans `aria-labelledby` est annoncé par un lecteur d'écran
 * comme « dialogue » tout court : l'utilisateur ne sait pas ce qui vient de
 * s'ouvrir. Le contexte fournit l'id sans obliger chaque appelant à le
 * propager à la main.
 */
const DialogLabelContext = createContext(null);

export function Dialog({ open, onOpenChange, children }) {
  const { render, show, panelRef } = useOverlay({ open, onClose: () => onOpenChange?.(false) });

  if (!render || typeof document === 'undefined') return null;

  let body = children;
  if (isValidElement(children))
    body = cloneElement(children, {
      ref: panelRef,
      className: cn(
        children.props.className,
        'transition-opacity duration-300',
        show ? 'opacity-100' : 'opacity-0',
      ),
    });

  return createPortal(
    <div
      className={cn(
        'fixed inset-0 z-90 flex items-end justify-center bg-checkers backdrop-blur p-0 sm:items-center sm:p-2 transition-opacity duration-300',
        show ? 'opacity-100' : 'opacity-0',
      )}
      onClick={() => onOpenChange?.(false)}
    >
      {body}
    </div>,
    document.body,
  );
}

export function DialogContent({ className, children, footer, onClose, ref: forwardedRef }) {
  const labelId = useId();

  // Le panneau est une colonne flex : le header est hors de la zone de
  // défilement, donc le bouton Fermer et le titre ne bougent plus sans
  // dépendre de `sticky` - lequel se calculait sur une largeur mal déduite et
  // laissait le contenu passer sur les côtés. Seul le corps défile.
  const childArray = Children.toArray(children);
  const headerIndex = childArray.findIndex((child) => child.type === DialogHeader);
  const header = headerIndex >= 0 ? childArray.splice(headerIndex, 1)[0] : null;

  return (
    <div
      ref={forwardedRef}
      role="dialog"
      aria-modal="true"
      // L'id est celui que `DialogTitle` reprend via le contexte. Tous les
      // usages déclarent un titre : sans lui, `aria-labelledby` pointerait
      // dans le vide et le dialogue n'aurait pas de nom du tout.
      aria-labelledby={labelId}
      className={cn(
        // Même contrat que Modal : sur mobile la boîte grandit avec le
        // contenu jusqu'à 90dvh puis défile. Sans plafond, un formulaire long
        // est coupé - iOS ne réduit pas la page sous le clavier, donc rien ne
        // viendrait le faire remonter. `sm:max-h-none` rend la hauteur libre
        // sur desktop, où le dialogue est centré.
        'relative flex max-h-[90dvh] flex-col overflow-hidden rounded-t-3xl bg-white p-2 shadow-(--shadow-pop) animate-scale-in sm:max-h-none sm:rounded-3xl',
        className,
      )}
      onClick={(e) => e.stopPropagation()}
    >
      <DialogLabelContext.Provider value={labelId}>
        {/* mb-3 et non mb-4 : la marge du panneau s'y ajoute. Sur le modal
            d'avis, p-5 + mb-4 laissait 36px sous le titre - le tiers de
            l'écran sur un sheet. */}
        <div className="mb-3 flex shrink-0 items-start gap-3">
          {header
            ? cloneElement(header, { className: cn(header.props.className, 'mb-0 min-w-0 flex-1') })
            : <span className="flex-1" />}
          <button
            type="button"
            aria-label="Fermer"
            className="inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 focus-ring"
            onClick={() => onClose?.()}
          >
            <X size={16} aria-hidden />
          </button>
        </div>

        {/* min-h-0 : sans lui, un enfant flex refuse de rétrécir sous sa
            hauteur naturelle et la colonne déborde au lieu de défiler. */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {childArray}

          {/* Le footer vit dans le parent qui défile, mais reste `sticky`
              en bas : le bouton d'action suit le défilement sans jamais
              sortir de l'écran. Le conteneur reste transparent - un fond
              ici poserait une bande opaque sur la liste. */}
          {footer && (
            <div className="sticky bottom-0 border-t border-gray-100 pt-3 pb-1">
              {footer}
            </div>
          )}
        </div>
      </DialogLabelContext.Provider>
    </div>
  );
}

export function DialogHeader({ className, children }) {
  return <div className={cn('mb-4 space-y-1', className)}>{children}</div>;
}

export function DialogTitle({ className, children }) {
  const labelId = useContext(DialogLabelContext);

  return (
    <h2
      id={labelId ?? undefined}
      className={cn('text-lg font-semibold leading-none tracking-tight text-gray-900', className)}
    >
      {children}
    </h2>
  );
}

export function DialogDescription({ className, children }) {
  return <p className={cn('text-sm text-gray-500', className)}>{children}</p>;
}

export function DialogFooter({ className, children }) {
  return (
    <div className={cn('mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)}>
      {children}
    </div>
  );
}
