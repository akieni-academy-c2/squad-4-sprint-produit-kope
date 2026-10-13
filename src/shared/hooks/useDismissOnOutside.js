import { useEffect } from 'react';

/**
 * Ferme un menu ou une liste quand l'interaction sort du cadre.
 *
 * La même paire d'écouteurs (pointerdown hors du cadre, Échap) était recopiée
 * dans le menu utilisateur, le sélecteur de rôle démo, la liste déroulante et
 * le multi-sélecteur. Quatre copies, donc quatre occasions d'oublier le
 * nettoyage des écouteurs ou de se tromper sur l'événement.
 *
 * `pointerdown` et non `click` : un clic qui commence à l'intérieur et se
 * termine à l'extérieur ne doit pas fermer, alors qu'un appui commencé dehors
 * doit le faire sans attendre le relâchement.
 *
 * @param {import('react').RefObject<HTMLElement>} ref   élément contenu
 * @param {() => void} onDismiss  appelé sur sortie de cadre ou Échap
 * @param {boolean} active  n'écoute que lorsque le menu est ouvert
 * @param {boolean} escape  false pour une surface qui ne se ferme pas à Échap
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