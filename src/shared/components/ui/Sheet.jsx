import { useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import { cn } from '@/shared/utils';
import { overlayBackdrop, sheetPanel, sidePanel } from '@/shared/motion/variants.js';
import { useOverlay } from './useOverlay.js';

/**
 * Feuille superposée, par le bas ou par le côté.
 *
 * ## Le mouvement
 *
 * La feuille **entre en se poussant** : ressort, et non courbe. Un ressort
 * conserve sa vitesse quand il est interrompu - refermer une feuille à
 * mi-parcours puis la rouvrir repart de là où elle était, au lieu de
 * recommencer à chaque fois. C'est ce qui la fait lire comme un objet et non
 * comme une transition CSS.
 *
 * Elle arrive aussi légèrement **en dessous de sa taille** (`scale: 0.98`) :
 * à l'échelle 1, elle monte à plat et sans épaisseur ; en dessous, elle grandit
 * en même temps qu'elle monte, et le geste se lit comme un tirage vers soi.
 *
 * ## Le retour
 *
 * `AnimatePresence` gère la présence, plus un minuteur. Une feuille fermée puis
 * rouverte dans la foulée ne peut plus être démontée par le minuteur de la
 * fermeture précédente : `useOverlay` ne s'occupe plus que du comportement
 * (Échap, focus, scroll).
 */
export function Sheet({ open, onOpenChange, side = 'right', id, children }) {
  const innerRef = useRef(null);
  const { panelRef } = useOverlay({ open, onClose: () => onOpenChange?.(false) });

  // Le hook expose une ref unique : on la relaie vers le panneau rendu.
  const setRefs = (node) => {
    panelRef.current = node;
    innerRef.current = node;
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-90 bg-checkers backdrop-blur-sm"
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
              // Même contrat que Modal : hauteur bornée et défilement interne.
              // Sans cela, un formulaire long est tronqué sur iOS, qui ne réduit
              // pas la page sous le clavier.
              side === 'bottom'
                ? 'absolute inset-x-0 bottom-0 flex max-h-[90dvh] w-full flex-col overflow-y-auto overscroll-contain rounded-t-3xl bg-white p-4 pb-[calc(0.5rem+env(safe-area-inset-bottom))] shadow-2xl'
                : 'absolute inset-y-0 right-0 flex w-[85%] max-w-sm flex-col overflow-y-auto overscroll-contain bg-white shadow-2xl',
            )}
            // La variante n'est pas propagée depuis le fond : elle dépend du
            // bord d'entrée, que le parent ignore.
            variants={side === 'bottom' ? sheetPanel : sidePanel}
            // États nommés explicites plutôt qu'hérités du fond.
            //
            // La propagation implicite fonctionne - mais elle est implicite.
            // Une refonte du fond, un `variants` oublié, une réorganisation du
            // JSX suffisaient à faire disparaître la sortie, **sans erreur et
            // sans avertissement** : la feuille se refermait d'un coup. Nommer
            // les trois états rend la sortie visible à la lecture, et impossible
            // à perdre par accident.
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
