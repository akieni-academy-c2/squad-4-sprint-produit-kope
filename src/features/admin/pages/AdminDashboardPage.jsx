import { useCallback, useState } from 'react';
import { BarChart3, Flag, Hammer, MapPin, ShieldCheck, Star, Users } from 'lucide-react';
import { ROUTES } from '@/shared/lib/constants.js';
import { useSectionNav } from '@/shared/hooks/useSectionNav.js';
import { cn } from '@/shared/utils';
import { SidebarNav } from '@/shared/components/ui/SidebarNav.jsx';
import { BottomNav } from '@/shared/components/ui/BottomNav.jsx';
import { AdminStats } from '../components/AdminStats.jsx';
import { AdminProfessionalsGrid } from '../components/AdminProfessionalsGrid.jsx';
import { AdminReviewsTable } from '../components/AdminReviewsTable.jsx';
import { AdminReportsTable } from '../components/AdminReportsTable.jsx';
import { AdminTradesBoard } from '../components/AdminTradesBoard.jsx';
import { AdminZonesBoard } from '../components/AdminZonesBoard.jsx';
import { AdminUsersTable } from '../components/AdminUsersTable.jsx';

const SECTIONS = [
  { id: 'overview', label: "Vue d'ensemble", shortLabel: 'Aperçu', icon: BarChart3 },
  { id: 'professionals', label: 'Professionnels', shortLabel: 'Pros', icon: ShieldCheck },
  { id: 'reviews', label: 'Avis', shortLabel: 'Avis', icon: Star },
  { id: 'reports', label: 'Signalements', shortLabel: 'Signal.', icon: Flag },
  { id: 'trades', label: 'Métiers', shortLabel: 'Métiers', icon: Hammer },
  { id: 'zones', label: 'Zones', shortLabel: 'Zones', icon: MapPin },
  { id: 'users', label: 'Utilisateurs', shortLabel: 'Users', icon: Users },
];

const TITLES = {
  overview: "Vue d'ensemble",
  professionals: 'Gestion des professionnels',
  reviews: 'Modération des avis',
  reports: 'Signalements de profils',
  trades: 'Métiers',
  zones: 'Zones / quartiers',
  users: 'Utilisateurs',
};

const FILTERED_SECTIONS = ['professionals', 'reviews', 'reports', 'trades', 'zones', 'users'];

const ROOT_ID = 'overview';
const SECTION_IDS = SECTIONS.map((s) => s.id);

export function AdminDashboardPage() {
  // La section vit dans l'URL : rechargement, bouton « retour » et lien de
  // partage restent corrects, comme dans les espaces client et professionnel.
  const { active: urlSection, goTo: goToSection } = useSectionNav(ROUTES.ADMIN, SECTION_IDS, ROOT_ID);
  const section = urlSection || ROOT_ID;

  const [sectionFilters, setSectionFilters] = useState({});
  const [rightEl, setRightEl] = useState(null);
  const withFilters = FILTERED_SECTIONS.includes(section);

  // Une vue d'ensemble n'a de valeur que si elle mène au travail à faire :
  // chaque KPI ouvre sa section déjà filtrée. `key` force le remontage, sinon
  // les filtres d'initialisation ne s'appliqueraient jamais au second passage.
  const openSection = useCallback((id, filters = {}) => {
    setSectionFilters(filters);
    goToSection(id);
  }, [goToSection]);

  const mountKey = `${section}:${JSON.stringify(sectionFilters)}`;

  return (
    <div className="container-kop page-padding pb-24 lg:pb-8">

      <div
        className={cn(
          'grid gap-6 lg:items-start',
          withFilters
            ? 'lg:grid-cols-[minmax(0,260px)_minmax(0,1fr)_minmax(0,280px)]'
            : 'lg:grid-cols-[minmax(0,260px)_minmax(0,1fr)]',
        )}
      >
        <aside className="hidden lg:block lg:sticky lg:top-(--header-height)">
          <SidebarNav items={SECTIONS} active={section} onChange={openSection} ariaLabel="Sections d'administration" />
        </aside>

        <section className="min-w-0">
          <h2 className="mb-4 text-lg font-bold text-gray-900">{TITLES[section]}</h2>
          {section === 'overview' && <AdminStats onNavigate={openSection} />}
          {section === 'professionals' && (
            <AdminProfessionalsGrid key={mountKey} rightContainer={rightEl} initialFilters={sectionFilters} />
          )}
          {section === 'reviews' && (
            <AdminReviewsTable key={mountKey} rightContainer={rightEl} initialFilters={sectionFilters} />
          )}
          {section === 'reports' && (
            <AdminReportsTable key={mountKey} rightContainer={rightEl} initialFilters={sectionFilters} />
          )}
          {section === 'trades' && <AdminTradesBoard key={mountKey} rightContainer={rightEl} />}
          {section === 'zones' && <AdminZonesBoard key={mountKey} rightContainer={rightEl} />}
          {section === 'users' && (
            <AdminUsersTable key={mountKey} rightContainer={rightEl} initialFilters={sectionFilters} />
          )}
        </section>

        <aside
          ref={setRightEl}
          aria-label="Filtres"
          className={cn('lg:sticky lg:top-(--header-height)', withFilters ? 'hidden lg:block' : 'hidden')}
        />
      </div>

      <BottomNav items={SECTIONS} active={section} onChange={openSection} ariaLabel="Sections d'administration" />
    </div>
  );
}
