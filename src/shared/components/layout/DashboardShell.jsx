import { useCallback, useState } from 'react';
import { BottomNav } from '@/shared/components/ui/BottomNav.jsx';
import { SidebarNav } from '@/shared/components/ui/SidebarNav.jsx';
import { SectionSwap } from '@/shared/motion/SectionSwap.jsx';
import { useSectionNav } from '@/shared/hooks/useSectionNav.js';
import { STICKY_COLUMN } from '@/shared/lib/constants.js';
import { cn } from '@/shared/utils';

/**
 * Ossature commune des trois tableaux de bord : client, professionnel,
 * administration.
 *
 * ## Ce qui était recopié
 *
 * Les trois pages assemblaient à la main la même grille à trois colonnes, la
 * même colonne de filtres montée par portail, le même `SectionSwap` et le même
 * `BottomNav`. Trois copies, donc trois endroits à modifier pour changer la
 * largeur d'une colonne - et elles divergeaient déjà sur les classes du
 * conteneur extérieur.
 *
 * ## La colonne de filtres
 *
 * Elle est déclarée par la grille de la page, pas par la section : une section
 * ne dessine donc pas sa propre colonne, elle y projette ses filtres par
 * portail. Deux grilles imbriquées donnaient des largeurs de colonne
 * incohérentes entre les sections et désalignaient les deux barres collantes.
 *
 * La grille retombe à deux colonnes quand la section active ne porte pas de
 * filtres : garder la troisième laisserait un vide de 280 px à droite.
 *
 * @param {object} props
 * @param {Array}  props.items     entrées de navigation (`{ id, label, icon, … }`)
 * @param {string} props.basePath  préfixe d'URL des sections
 * @param {string} props.rootId    section racine, sélectionnée par défaut
 * @param {Set<string>} [props.filteredSections] sections qui portent des filtres
 * @param {Function} props.renderSection  `(active, rightContainer, navigate) => ReactNode`
 * @param {Function} [props.sidebar]      `(nav) => ReactNode`, sinon `SidebarNav`
 * @param {Function} [props.onNavigate]   enrichit la navigation (filtres d'ouverture)
 * @param {string}   [props.className]    classes du conteneur extérieur
 * @param {string}   [props.navAriaLabel] libellé de la navigation
 * @param {Node}     [props.header]       contenu au-dessus de la grille
 */
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

  // `onNavigate` permet à l'administration d'ouvrir une section déjà filtrée
  // depuis un indicateur. L'identifiant de section reste la seule source de
  // vérité sur ce qui est affiché.
  const navigate = useCallback(
    (id, ...rest) => (onNavigate ? onNavigate(id, ...rest) : goTo(id, ...rest)),
    [goTo, onNavigate],
  );

  // Le portail a besoin de l'élément cible comme valeur, pas comme ref : il doit
  // donc être mémorisé dans un état. La ref callback est stabilisée, React ne
  // la réinvoque donc qu'au montage et au démontage - une fois, pas à chaque
  // rendu.
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