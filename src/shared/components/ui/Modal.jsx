import { useId } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '@/shared/utils';
import { useIsDesktop } from '@/shared/hooks/useMediaQuery.js';
import { dialogPanel, overlayBackdrop } from '@/shared/motion/variants.js';
import { useOverlay } from './useOverlay.js';

/**
 * Modale : une feuille ancrée en bas sur mobile, une boîte centrée sur desktop.
 *
 * ## Deux mouvements, pas un
 *
 * La feuille et la boîte ne partagent pas la même géométrie, donc pas la même
 * entrée. Une boîte centrée qui glisse depuis le bas **tombe** ; une feuille de
 * pleine largeur qui se met à l'échelle **se rétrécit sur elle-même**. Choisir
 * une seule variante pour les deux paliers, c'est rater la moitié des usages.
 *
 * D'où `useIsDesktop()` : la variante suit la forme réelle de la boîte.
 *
 * Sur mobile, le fond est décalé de 40 px et non de 100 %. La modale occupe
 * 90 dvh ; partir du bas exact la ferait cheminer devant toute la page, et le
 * retour n'était plus un retour. Le reste de la course — jusqu'au bord — est un
 * glissement que l'on ne voit pas, pas une distance d'animation.
 *
 * ## Le fond est flouté, comme les deux autres surfaces
 *
 * `Sheet` et `Dialog` l'étaient ; seule la modale ne l'était pas. Trois surfaces
 * qui se recouvrent de la même façon ne peuvent pas lectures différemment —
 * celle qui n'est pas floutée paraît posée sur la page au lieu de devant.
 */
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

  const panelVariants = isDesktop
    ? dialogPanel
    : {
        initial: { y: '40%', scale: 1 },
        animate: { y: '0%', scale: 1, transition: dialogPanel.animate.transition },
        exit: { y: '40%', scale: 1, transition: dialogPanel.exit.transition },
      };

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-end justify-center bg-checkers backdrop-blur-sm p-0 sm:items-center sm:p-4"
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
              // Sur mobile la modale est une feuille ancrée en bas, comme les sheets Apple :
              // elle grandit avec le contenu jusqu'à 90dvh et laisse toujours une bande de
              // page visible au-dessus - le repère visuel qui dit « c'est une surcouche ».
              // Le breakpoint `sm` reste inchangé : sur desktop la modale est centrée et
              // sa hauteur suit son contenu, sans plafond.
              'w-full max-h-[90dvh] overflow-y-auto overscroll-contain bg-white shadow-[var(--shadow-pop)] sm:max-h-none',
              radiusTop,
              radiusMain,
              widths,
            )}
            variants={panelVariants}
            // États nommés explicites : voir `Sheet`. La propagation implicite
            // depuis le fond fonctionne, mais disparait sans erreur si le fond
            // change — et la fermeture de la modale devient instantanée.
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
            {children && <div className="px-4 py-3 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:px-5 sm:py-4">{children}</div>}
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
