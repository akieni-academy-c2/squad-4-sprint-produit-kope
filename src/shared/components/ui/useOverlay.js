import { useEffect, useRef } from 'react';

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * Comportement d'une surface superposée (Modal, Dialog, Sheet) :
 * touche Échap, blocage du scroll, piégeage du focus et restitution du focus
 * à l'élément déclencheur.
 *
 * ## Ce que ce hook ne fait plus, et pourquoi
 *
 * Il portait jusqu'ici l'animation : un état `show` basculé sur
 * `requestAnimationFrame` et un `setTimeout` de 300 ms qui démontrait le
 * portail à la fin. Deux problèmes.
 *
 * Le premier est que la durée d'une animation CSS **vit dans la classe** -
 * `transition-* duration-300` - tandis que le délai de démontage vit dans le
 * hook. Les deux chiffres sont écrits à deux endroits, à 60 lignes de distance,
 * et divergent au premier changement : la surface disparaît avant d'avoir fini
 * de partir, ou reste 300 ms dans le vide.
 *
 * Le second est qu'un `setTimeout` ne connaît pas l'interruption. Si
 * l'utilisateur rouvre la feuille pendant qu'elle se referme, l'ancien minuteur
 * la démonte 300 ms plus tard, en plein milieu de l'ouverture. `AnimatePresence`
 * fait le même travail en connaissant l'état réel : tant qu'un élément est dans
 * l'arbre, il reste.
 *
 * Le mouvement appartient donc à `AnimatePresence` et aux variantes de
 * `@/shared/motion` ; ce hook ne garde que le **comportement**.
 */
export function useOverlay({ open, onClose, dismissable = true }) {
  const panelRef = useRef(null);
  // `onClose` est presque toujours une flèche recréée à chaque rendu du parent.
  // Le garder en dépendance relançait l'effet à chaque rendu : le focus était
  // rendu au déclencheur puis immédiatement repris par un requestAnimationFrame,
  // en plein milieu d'une saisie. La ref lit la valeur courante sans jamais
  // ré-abonner l'effet.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement;
    const { body } = document;
    const previousOverflow = body.style.overflow;
    body.style.overflow = 'hidden';

    const onKeyDown = (event) => {
      if (event.key === 'Escape' && dismissable) {
        event.stopPropagation();
        onCloseRef.current?.();
        return;
      }
      if (event.key !== 'Tab') return;

      // Piégeage : la tabulation ne doit jamais sortir de la surface ouverte.
      const panel = panelRef.current;
      if (!panel) return;
      const items = [...panel.querySelectorAll(FOCUSABLE)].filter((el) => el.offsetParent !== null);
      if (items.length === 0) {
        event.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || !panel.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown, true);
    // Focus initial sur le premier élément interactif de la surface.
    const frame = requestAnimationFrame(() => {
      const target = panelRef.current?.querySelector(FOCUSABLE);
      target?.focus();
    });

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('keydown', onKeyDown, true);
      body.style.overflow = previousOverflow;
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    };
  }, [open, dismissable]);

  return { panelRef };
}
