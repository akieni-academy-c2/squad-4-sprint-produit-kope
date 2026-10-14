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
 * Aucune animation ici : durée dans la classe CSS, délai de démontage dans le
 * hook, et les deux divergeaient. Le mouvement relève de `@/shared/motion`.
 */
export function useOverlay({ open, onClose, dismissable = true }) {
  const panelRef = useRef(null);
  // `onClose` est recréé à chaque rendu du parent : le garder en dépendance
  // relançait l'effet et le focus revenait au déclencheur en pleine saisie. La
  // ref lit la valeur courante sans ré-abonner l'effet.
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
