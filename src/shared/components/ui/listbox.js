import { useEffect } from 'react';

export function toOption(raw) {
  return typeof raw === 'string' ? { value: raw, label: raw } : raw;
}

/**
 * Navigation clavier commune aux listes déroulantes (listbox).
 * Garantit ArrowDown / ArrowUp / Home / End / Enter / Espace / Échap / Tab,
 * quel que soit le composant qui l'utilise.
 */
export function useListboxNavigation({
  open,
  itemCount,
  activeIndex,
  setActiveIndex,
  onOpen,
  onClose,
  onSelect,
  disabled = false,
}) {
  return (event) => {
    if (disabled) return;
    const last = itemCount - 1;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!open) onOpen?.();
        else setActiveIndex((i) => Math.min(i + 1, last));
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (!open) onOpen?.();
        else setActiveIndex((i) => Math.max(i - 1, 0));
        break;
      case 'Home':
        if (open) {
          event.preventDefault();
          setActiveIndex(0);
        }
        break;
      case 'End':
        if (open) {
          event.preventDefault();
          setActiveIndex(last);
        }
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (!open) onOpen?.();
        else if (itemCount > 0) onSelect?.(activeIndex);
        break;
      case 'Escape':
        if (open) {
          event.preventDefault();
          onClose?.();
        }
        break;
      case 'Tab':
        if (open) onClose?.();
        break;
      default:
    }
  };
}

export function useScrollActiveIntoView({ open, activeIndex, optionId, enabled = true }) {
  useEffect(() => {
    if (!open || !enabled) return;
    document.getElementById(optionId)?.scrollIntoView?.({ block: 'nearest' });
  }, [open, activeIndex, optionId, enabled]);
}
