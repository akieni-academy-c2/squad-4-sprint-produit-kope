import { useCallback, useState } from 'react';

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

export function useAdminPage(initial = 1) {
  const [page, setPage] = useState(initial);
  const changePage = useCallback((next) => {
    setPage(next);
    scrollToTop();
  }, []);

  return [page, changePage, setPage];
}
