import { useCallback, useState } from 'react';
import { BottomNav } from '@/shared/components/ui/BottomNav.jsx';
import { SidebarNav } from '@/shared/components/ui/SidebarNav.jsx';
import { SectionSwap } from '@/shared/motion/SectionSwap.jsx';
import { useSectionNav } from '@/shared/hooks/useSectionNav.js';
import { STICKY_COLUMN } from '@/shared/lib/constants.js';
import { cn } from '@/shared/utils';


export function DashboardShell({
  items,
  basePath,
  rootId,
  filteredSections,
  renderSection,
  sidebar,
  onNavigate,
  className,
  navAriaLabel = 'Navigation',
  header = null,
}) {
  const sectionIds = items.map((item) => item.id);
  const { active, goTo } = useSectionNav(basePath, sectionIds, rootId);

  const navigate = useCallback(
    (id, ...rest) => (onNavigate ? onNavigate(id, ...rest) : goTo(id, ...rest)),
    [goTo, onNavigate],
  );

  const [rightContainer, setRightContainer] = useState(null);
  const rightEl = useCallback((node) => setRightContainer((prev) => (node === prev ? prev : node)), []);

  const withFilters = filteredSections ? filteredSections.has(active) : false;

  return (
    <div className={className ?? 'container-kop py-10 lg:py-16'}>
      {header}

      <div
        className={cn(
          'grid gap-6 lg:items-start',
          withFilters
            ? 'lg:grid-cols-[minmax(0,260px)_minmax(0,1fr)_minmax(0,280px)]'
            : 'lg:grid-cols-[minmax(0,260px)_minmax(0,1fr)]',
        )}
      >
        {sidebar ? (
          sidebar({ items, active, onChange: navigate })
        ) : (
          <aside className={`hidden lg:block ${STICKY_COLUMN}`}>
            <SidebarNav
              items={items}
              active={active}
              onChange={navigate}
              ariaLabel={navAriaLabel}
            />
          </aside>
        )}

        <SectionSwap sectionKey={active} className="min-w-0">
          {renderSection(active, rightContainer, navigate)}
        </SectionSwap>

        <aside
          ref={rightEl}
          aria-label="Filtres"
          className={cn(STICKY_COLUMN, withFilters ? 'hidden lg:block' : 'hidden')}
        />
      </div>

      <BottomNav items={items} active={active} onChange={navigate} ariaLabel={`${navAriaLabel} (mobile)`} />
    </div>
  );
}