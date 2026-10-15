import { useCallback, useState } from "react";
import { BottomNav } from "@/shared/components/ui/BottomNav.jsx";
import { SidebarNav } from "@/shared/components/ui/SidebarNav.jsx";
import { SectionSwap } from "@/shared/motion/SectionSwap.jsx";
import { useSectionNav } from "@/shared/hooks/useSectionNav.js";
import { STICKY_COLUMN, sectionHref } from "@/shared/lib/constants.js";
import { cn } from "@/shared/utils";

export function DashboardShell({
  items,
  basePath,
  rootId,
  filteredSections,
  renderSection,
  sidebar,
  className,
  navAriaLabel = "Navigation",
  header = null,
}) {
  const sectionIds = items.map((item) => item.id);
  const { active, hrefFor } = useSectionNav(basePath, sectionIds, rootId);

  /**
   * Chaque entrée reçoit son URL. Les onglets deviennent ainsi de vrais liens :
   * le clic droit, le ctrl+clic et le partage d'une section précise
   * fonctionnent, et l'URL reste la seule source de vérité sur la position.
   */
  const linkedItems = items.map((item) => ({
    ...item,
    href: sectionHref(basePath, item.id, rootId),
  }));

  const [rightContainer, setRightContainer] = useState(null);
  const rightEl = useCallback(
    (node) => setRightContainer((prev) => (node === prev ? prev : node)),
    [],
  );

  const withFilters = filteredSections ? filteredSections.has(active) : false;

  return (
    <div className={className ?? "container-kop py-10 lg:py-16"}>
      {header}

      <div
        className={cn(
          "grid gap-6 lg:items-start",
          withFilters
            ? "lg:grid-cols-[minmax(0,260px)_minmax(0,1fr)_minmax(0,280px)]"
            : "lg:grid-cols-[minmax(0,260px)_minmax(0,1fr)]",
        )}
      >
        {sidebar ? (
          sidebar({ items: linkedItems, active })
        ) : (
          <aside className={`hidden lg:block ${STICKY_COLUMN}`}>
            <SidebarNav
              items={linkedItems}
              active={active}
              ariaLabel={navAriaLabel}
            />
          </aside>
        )}

        <SectionSwap sectionKey={active} className="min-w-0">
          {renderSection(active, rightContainer, hrefFor)}
        </SectionSwap>

        <aside
          ref={rightEl}
          aria-label="Filtres"
          className={cn(
            STICKY_COLUMN,
            withFilters ? "hidden lg:block" : "hidden",
          )}
        />
      </div>

      <BottomNav
        items={linkedItems}
        active={active}
        ariaLabel={`${navAriaLabel} (mobile)`}
      />
    </div>
  );
}
