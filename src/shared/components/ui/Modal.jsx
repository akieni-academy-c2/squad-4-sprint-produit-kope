import { useId } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '@/shared/utils';
import { useIsDesktop } from '@/shared/hooks/useMediaQuery.js';
import { dialogPanel, overlayBackdrop } from '@/shared/motion/variants.js';
import { useOverlay } from './useOverlay.js';

/**
 * Feuille ancrée en bas sur mobile, boîte centrée sur desktop : la même entrée
 * aux deux paliers ferait tomber la boîte ou rétrécir la feuille sur elle-même.
 */
const WIDTHS = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
  full: 'max-w-5xl',
};

/** Course de 40 % : à 100 %, la feuille cheminerait devant toute la page. */
const SHEET_PANEL = {
  initial: { y: '40%', scale: 1 },
  animate: { y: '0%', scale: 1, transition: dialogPanel.animate.transition },
  exit: { y: '40%', scale: 1, transition: dialogPanel.exit.transition },
};

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
  const { panelRef } = useOverlay({ open, onClose, dismissable });
  const isDesktop = useIsDesktop();

  if (typeof document === 'undefined') return null;
  const widths = WIDTHS[size] || WIDTHS.md;

  // Moins de 4 sections (titre, description, contenu, actions) : réduire le rayon des coins.
  const sections = [title, description, children, actions].filter(Boolean).length;
  const radiusTop = sections < 4 ? 'rounded-t-xl' : 'rounded-t-2xl';
  const radiusMain = sections < 4 ? 'sm:rounded-xl' : 'sm:rounded-2xl';

  // Constante de module et non littéral dans le corps : `motion` compare
  // l'identité de `variants` à chaque rendu, et un objet reconstruit ici
  // invalidait la comparaison à chaque ouverture.
  const panelVariants = isDesktop ? dialogPanel : SHEET_PANEL;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-overlay flex items-end justify-center bg-checkers backdrop-blur-sm p-0 sm:items-center sm:p-4"
          variants={overlayBackdrop}
          initial="initial"
          animate="animate"
          exit="exit"
          onClick={() => dismissable && onClose?.()}
        >
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              // Sur mobile la modale est une feuille ancrée en bas : elle grandit
              // avec le contenu jusqu'à 90dvh et laisse une bande de page
              // visible au-dessus, le repère qui dit « surcouche ». Le
              // breakpoint `sm` reste inchangé : desktop centre et libère
              // la hauteur.
              'w-full max-h-[90dvh] overflow-y-auto overscroll-contain bg-white shadow-[var(--shadow-pop)] sm:max-h-none',
              radiusTop,
              radiusMain,
              widths,
            )}
            variants={panelVariants}
            // États nommés explicites : voir `Sheet`. La propagation implicite
            // fonctionne, mais disparaît sans erreur si le fond change.
            initial="initial"
            animate="animate"
            exit="exit"
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
            {children && <div className="px-4 py-3 pb-safe sm:px-5 sm:py-4">{children}</div>}
            {actions && (
              <div className="flex flex-col-reverse gap-2 border-t border-gray-100 px-5 py-3 sm:flex-row sm:justify-end">
                {actions}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
