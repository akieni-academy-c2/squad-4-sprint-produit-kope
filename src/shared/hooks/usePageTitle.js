import { useEffect } from "react";

const SUFFIX = "KOP";

export function usePageTitle(title) {
  useEffect(() => {
    if (!title) return;
    document.title = title === SUFFIX ? SUFFIX : `${title} | ${SUFFIX}`;
  }, [title]);
}
