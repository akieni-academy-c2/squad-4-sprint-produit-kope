import {
  isValidElement,
  cloneElement,
  useId,
  useContext,
  createContext,
  Children,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { cn } from "@/shared/utils";
import { dialogPanel, overlayBackdrop } from "@/shared/motion/variants.js";
import { useOverlay } from "./useOverlay.js";

const DialogLabelContext = createContext(null);

export function Dialog({ open, onOpenChange, children }) {
  const { panelRef } = useOverlay({
    open,
    onClose: () => onOpenChange?.(false),
  });

  if (typeof document === "undefined") return null;

  let body = children;
  if (isValidElement(children))
    body = cloneElement(children, {
      ref: panelRef,
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

export function DialogContent({
  className,
  children,
  footer,
  onClose,
  variants,
  ref: forwardedRef,
}) {
  const labelId = useId();

  const childArray = Children.toArray(children);
  const headerIndex = childArray.findIndex(
    (child) => child.type === DialogHeader,
  );
  const header = headerIndex >= 0 ? childArray.splice(headerIndex, 1)[0] : null;

  return (
    <motion.div
      ref={forwardedRef}
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelId}
      className={cn(
        "relative flex max-h-[90dvh] flex-col overflow-hidden rounded-t-3xl bg-white p-2 shadow-(--shadow-pop) sm:max-h-none sm:rounded-3xl",
        className,
      )}
      onClick={(e) => e.stopPropagation()}
    >
      <DialogLabelContext.Provider value={labelId}>
        {header ? (
          <div className="mb-3 flex shrink-0 items-start gap-3">
            {cloneElement(header, {
              className: cn(header.props.className, "mb-0 min-w-0 flex-1"),
            })}
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
            "min-h-0 flex-1 overflow-y-auto overscroll-contain",
            !header && "pr-11",
          )}
        >
          {childArray}

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
  return <div className={cn("mb-4 space-y-1", className)}>{children}</div>;
}

export function DialogTitle({ className, children }) {
  const labelId = useContext(DialogLabelContext);

  return (
    <h2
      id={labelId ?? undefined}
      className={cn(
        "text-lg font-semibold leading-none tracking-tight text-gray-900",
        className,
      )}
    >
      {children}
    </h2>
  );
}

export function DialogDescription({ className, children }) {
  return <p className={cn("text-sm text-gray-500", className)}>{children}</p>;
}

export function DialogFooter({ className, children }) {
  return (
    <div
      className={cn(
        "mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className,
      )}
    >
      {children}
    </div>
  );
}
