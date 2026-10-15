import { useCallback } from "react";
import { useLocation } from "react-router-dom";
import { sectionFromPathname, sectionHref } from "@/shared/lib/constants";

export function useSectionNav(base, sections, rootId) {
  const { pathname } = useLocation();

  const active = sectionFromPathname(pathname, sections) || rootId;

  /**
   * Construit l'URL d'une section. Onglets et raccourcis l'utilisent comme
   * `href` : la navigation est portée par le lien lui-même, donc la destination
   * n'est écrite qu'ici et chaque écran reste partageable.
   * @param {string} id section visée
   * @param {Record<string, string|number>} [filters] filtres de la section
   * @returns {string} le chemin complet, requête comprise
   */
  const hrefFor = useCallback(
    (id, filters) => {
      const query = filters ? new URLSearchParams(filters).toString() : "";
      return `${sectionHref(base, id, rootId)}${query ? `?${query}` : ""}`;
    },
    [base, rootId],
  );

  return { active, hrefFor };
}
