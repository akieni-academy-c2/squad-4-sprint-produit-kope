import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { sectionFromPathname, sectionHref } from "@/shared/lib/constants";

export function useSectionNav(base, sections, rootId) {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const active = sectionFromPathname(pathname, sections) || rootId;

  const goTo = useCallback(
    (id) => navigate(sectionHref(base, id, rootId)),
    [navigate, base, rootId],
  );

  return { active, goTo };
}
