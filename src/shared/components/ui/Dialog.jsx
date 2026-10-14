import { isValidElement, cloneElement, useId, useContext, createContext, Children } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import { cn } from '@/shared/utils';
import { dialogPanel, overlayBackdrop } from '@/shared/motion/variants.js';
import { useOverlay } from './useOverlay.js';

/**
 * `role="dialog"` sans `aria-labelledby` est annoncé comme « dialogue » tout
 * court. Le contexte fournit l'id sans le propager à la main.
 */
const DialogLabelContext = createContext(null);

/**
 * Une surface qui apparaît à sa taille exacte n'a pas de direction : ici elle
 * arrive par le bas et se pose.
 */
export function Dialog({ open, onOpenChange, children }) {
  const { panelRef } = useOverlay({ open, onClose: () => onOpenChange?.(false) });

  if (typeof document === 'undefined') return null;

  let body = children;
  if (isValidElement(children))
    body = cloneElement(children, {
      ref: panelRef,
      // La variante se propage depuis le fond : le panneau n'a pas à répéter
      // `initial`/`animate`, et l'état de sortie reste cohérent si le dialogue
      // est fermé au milieu de son ouverture.
      variants: dialogPanel,
    });

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-overlay flex items-end justify-center bg-checkers backdrop-blur p-0 sm:items-center sm:p-2"
          variants={overlayBackdrop}
          initial="initial"
          animate="animate"
          exit="exit"
          onClick={() => onOpenChange?.(false)}
        >
          {body}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

/**
 * `variants` est énuméré et non passé par `...rest` : `Dialog` l'injecte par
 * `cloneElement`, l'oubli se voyait à la lecture.
 */
export function DialogContent({
  className,
  children,
  footer,
  onClose,
  variants,
  ref: forwardedRef,
}) {
  const labelId = useId();

  // Le panneau est une colonne flex : le header sort de la zone de défilement,
  // donc Fermer et titre ne bougent plus. `sticky` se calculait sur une largeur
  // mal déduite et laissait le contenu passer sur les côtés. Seul le corps défile.
  const childArray = Children.toArray(children);
  const headerIndex = childArray.findIndex((child) => child.type === DialogHeader);
  const header = headerIndex >= 0 ? childArray.splice(headerIndex, 1)[0] : null;

  return (
    <motion.div
      ref={forwardedRef}
      // La variante est réinjectée : c'est elle qui fait monter la boîte. Sans
      // cette ligne, seul le fond est animé.
      variants={variants}
      // États nommés explicites : voir `Sheet`. La propagation implicite
      // fonctionne, mais une réorganisation du JSX suffit à la faire
      // disparaître, et le dialogue se referme alors d'un coup, sans erreur.
      initial="initial"
      animate="animate"
      exit="exit"
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelId}
      className={cn(
        'relative flex max-h-[90dvh] flex-col overflow-hidden rounded-t-3xl bg-white p-2 shadow-(--shadow-pop) sm:max-h-none sm:rounded-3xl',
        className,
      )}
      onClick={(e) => e.stopPropagation()}
    >
      <DialogLabelContext.Provider value={labelId}>
        {header ? (
          <div className="mb-3 flex shrink-0 items-start gap-3">
            {cloneElement(header, { className: cn(header.props.className, 'mb-0 min-w-0 flex-1') })}
            <button
              type="button"
              aria-label="Fermer"
              className="inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 focus-ring"
              onClick={() => onClose?.()}
            >
              <X size={16} aria-hidden />
            </button>
          </div>
        ) : (
          <button
            type="button"
            aria-label="Fermer"
            className="absolute right-4 top-4 z-10 inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-gray-200 bg-white/80 text-gray-500 backdrop-blur-sm hover:bg-gray-50 focus-ring"
            onClick={() => onClose?.()}
          >
            <X size={16} aria-hidden />
          </button>
        )}


        <div
          className={cn(
            'min-h-0 flex-1 overflow-y-auto overscroll-contain',
            !header && 'pr-11',
          )}
        >
          {childArray}

          // Footer `sticky` dans le parent qui défile, conteneur transparent : un fond
          // ici poserait une bande opaque sur la liste.
          {footer && (
            <div className="sticky bottom-0 border-t border-gray-100 pt-3 pb-1">
              {footer}
            </div>
          )}
        </div>
      </DialogLabelContext.Provider>
    </motion.div>
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
