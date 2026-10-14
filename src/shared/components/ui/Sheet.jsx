import { useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import { cn } from '@/shared/utils';
import { overlayBackdrop, sheetPanel, sidePanel } from '@/shared/motion/variants.js';
import { useOverlay } from './useOverlay.js';


export function Sheet({ open, onOpenChange, side = 'right', id, children }) {
  const innerRef = useRef(null);
  const { panelRef } = useOverlay({ open, onClose: () => onOpenChange?.(false) });

  const setRefs = (node) => {
    panelRef.current = node;
    innerRef.current = node;
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-overlay bg-checkers backdrop-blur-sm"
          variants={overlayBackdrop}
          initial="initial"
          animate="animate"
          exit="exit"
          onClick={() => onOpenChange?.(false)}
        >
          <motion.div
            ref={setRefs}
            id={id}
            role="dialog"
            aria-modal="true"
            className={cn(
              side === 'bottom'
                ? 'absolute inset-x-0 bottom-0 flex max-h-[90dvh] w-full flex-col overflow-y-auto overscroll-contain rounded-t-3xl bg-white p-4 pb-safe-sheet shadow-2xl'
                : 'absolute inset-y-0 right-0 flex w-[85%] max-w-sm flex-col overflow-y-auto overscroll-contain bg-white shadow-2xl',
            )}
            variants={side === 'bottom' ? sheetPanel : sidePanel}
            initial="initial"
            animate="animate"
            exit="exit"
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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
