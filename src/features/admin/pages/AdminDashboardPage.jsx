import { useCallback, useState } from 'react';
import { BarChart3, Flag, Hammer, MapPin, ShieldCheck, Star, Users } from 'lucide-react';
import { DashboardShell } from '@/shared/components/layout/DashboardShell.jsx';
import { ROUTES } from '@/shared/lib/constants.js';
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

const FILTERED_SECTIONS = new Set(['professionals', 'reviews', 'reports', 'trades', 'zones', 'users']);

export function AdminDashboardPage() {
  // Filtres d'ouverture, attachés à la section qui les a demandés.
  //
  // Un simple `useState` survivrait au changement de section : ouvrir
  // « Signalements » depuis un KPI, puis revenir par l'URL ou le bouton
  // « retour » afficherait encore ce filtre-là. La portée suit donc la section
  // qui l'a demandé - pas d'effet pour la purger, la valeur cesse simplement
  // d'être lue dès que la section change.
  const [pendingFilters, setPendingFilters] = useState(null);

  const openSection = useCallback((id, filters = {}) => {
    setPendingFilters(Object.keys(filters).length ? { section: id, filters } : null);
    return id;
  }, []);

  return (
    <DashboardShell
      items={SECTIONS}
      basePath={ROUTES.ADMIN}
      rootId="overview"
      filteredSections={FILTERED_SECTIONS}
      navAriaLabel="Sections d’administration"
      className="container-kop page-padding pb-24 lg:pb-8"
      // `onNavigate` ne renvoie rien : `DashboardShell` appelle ensuite `goTo`,
      // qui est la seule chose qui écrit dans l'URL.
      onNavigate={(id, filters) => {
        openSection(id, filters);
        return id;
      }}
      renderSection={(active, rightContainer) => {
        const section = active || 'overview';
        const sectionFilters = pendingFilters?.section === section ? pendingFilters.filters : {};
        // `key` force le remontage, sinon les filtres d'initialisation ne
        // s'appliqueraient jamais au second passage dans la même section.
        const mountKey = `${section}:${JSON.stringify(sectionFilters)}`;

        return (
          <>
            <h2 className="mb-4 text-lg font-bold text-gray-900">{TITLES[section]}</h2>
            {section === 'overview' && <AdminStats onNavigate={openSection} />}
            {section === 'professionals' && (
              <AdminProfessionalsGrid
                key={mountKey}
                rightContainer={rightContainer}
                initialFilters={sectionFilters}
              />
            )}
            {section === 'reviews' && (
              <AdminReviewsTable key={mountKey} rightContainer={rightContainer} initialFilters={sectionFilters} />
            )}
            {section === 'reports' && (
              <AdminReportsTable key={mountKey} rightContainer={rightContainer} initialFilters={sectionFilters} />
            )}
            {section === 'trades' && <AdminTradesBoard key={mountKey} rightContainer={rightContainer} />}
            {section === 'zones' && <AdminZonesBoard key={mountKey} rightContainer={rightContainer} />}
            {section === 'users' && (
              <AdminUsersTable key={mountKey} rightContainer={rightContainer} initialFilters={sectionFilters} />
            )}
          </>
        );
      }}
    />
  );
}