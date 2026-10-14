import { useEffect } from 'react';


export function useDismissOnOutside(ref, onDismiss, { active = true, escape = true } = {}) {
  useEffect(() => {
    if (!active) return undefined;

    const onPointerDown = (event) => {
      if (!ref.current?.contains(event.target)) onDismiss();
    };
    const onKeyDown = (event) => {
      if (escape && event.key === 'Escape') onDismiss();
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [ref, onDismiss, active, escape]);
}