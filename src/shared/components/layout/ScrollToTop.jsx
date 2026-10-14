import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * `pathname` seul : un changement de query string est interne à la page.
 * `behavior: 'instant'`, sinon un `scroll-behavior: smooth` étire le retour.
 */
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}
