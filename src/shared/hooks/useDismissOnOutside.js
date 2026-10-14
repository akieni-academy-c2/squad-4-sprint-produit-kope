import { useEffect } from 'react';

/**
 * `pointerdown` et non `click` : un appui commencé à l'intérieur et relâché dehors ne ferme
 * pas, alors qu'un appui commencé dehors ferme sans attendre le relâchement.
 * `escape: false` pour une surface qui ne se ferme pas au clavier.
 */
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