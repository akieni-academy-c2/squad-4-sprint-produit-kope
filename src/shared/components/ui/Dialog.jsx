import { isValidElement, cloneElement, useId, useContext, createContext, Children } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import { cn } from '@/shared/utils';
import { dialogPanel, overlayBackdrop } from '@/shared/motion/variants.js';
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

/**
 * Le panneau reçoit la variante du dialogue, pas un fondu d'opacité.
 *
 * `animate-scale-in` — l'animation CSS du projet — ne faisait qu'un `scale` sur
 * 180 ms, sans ressort ni recul. Une surface qui apparaît à la taille exacte
 * n'a aucune direction : on ne sait pas d'où elle vient. Ici, elle arrive par
 * le bas et se pose.
 *
 * Le panneau est donc un `motion.div`, sans quoi la variante reçue par
 * `cloneElement` resterait une propriété inerte sur une balise qui ne sait pas
 * l'animer.
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
          className="fixed inset-0 z-90 flex items-end justify-center bg-checkers backdrop-blur p-0 sm:items-center sm:p-2"
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
 * `variants` est ici un paramètre à part entière, pas une propriété qu'on laisse
 * passer.
 *
 * `Dialog` l'injecte sur le panneau par `cloneElement`. Si `DialogContent`
 * destructurait ses props sans le nommer, la variante tomberait dans le vide :
 * le composant la recevrait, ne la relèverait pas, et le dialogue n'aurait
 * **que** le mouvement de son fond. Une signature qui énumère ses props vaut
 * mieux ici qu'un `...rest` : c'est ce qui rend le oubli visible à la lecture.
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

  // Le panneau est une colonne flex : le header est hors de la zone de
  // défilement, donc le bouton Fermer et le titre ne bougent plus sans
  // dépendre de `sticky` - lequel se calculait sur une largeur mal déduite et
  // laissait le contenu passer sur les côtés. Seul le corps défile.
  const childArray = Children.toArray(children);
  const headerIndex = childArray.findIndex((child) => child.type === DialogHeader);
  const header = headerIndex >= 0 ? childArray.splice(headerIndex, 1)[0] : null;

  return (
    <motion.div
      ref={forwardedRef}
      // La variante est réinjectée : c'est elle qui fait monter la boîte. Sans
      // cette ligne, seul le fond est animé.
      variants={variants}
      // États nommés explicites : voir `Sheet`. La propagation implicite depuis
      // le fond fonctionne, mais une réorganisation du JSX suffit à la faire
      // disparaître — et le dialogue se referme alors d'un coup, sans erreur.
      initial="initial"
      animate="animate"
      exit="exit"
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
        'relative flex max-h-[90dvh] flex-col overflow-hidden rounded-t-3xl bg-white p-2 shadow-(--shadow-pop) sm:max-h-none sm:rounded-3xl',
        className,
      )}
      onClick={(e) => e.stopPropagation()}
    >
      <DialogLabelContext.Provider value={labelId}>
        {/*
          Pas de bandeau quand le dialogue n'a pas d'en-tête.

          Les quatre modales d'authentification - connexion, inscription client,
          inscription pro, changement de mot de passe - n'en ont pas : leur titre
          est un `sr-only` destiné aux lecteurs d'écran. Elles affichaient
          malgré tout une rangée de 36 px ne contenant qu'un bouton Fermer, donc
          une bande vide au-dessus du premier champ.

          Le bouton devient alors **flottant**, hors du flux : il ne pousse plus
          le formulaire et reste visible quelle que soit la hauteur. `pr-11` sur
          le corps lui réserve la place, sinon le premier champ passe dessous.
        */}
        {header ? (
          // mb-3 et non mb-4 : la marge du panneau s'y ajoute. Sur le modal
          // d'avis, p-5 + mb-4 laissait 36px sous le titre - le tiers de
          // l'écran sur un sheet.
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


        {/* min-h-0 : sans lui, un enfant flex refuse de rétrécir sous sa
            hauteur naturelle et la colonne déborde au lieu de défiler. */}
        <div
          className={cn(
            'min-h-0 flex-1 overflow-y-auto overscroll-contain',
            // Réserve la place du bouton Fermer flottant, sans quoi le premier
            // champ du formulaire passe dessous.
            !header && 'pr-11',
          )}
        >
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
