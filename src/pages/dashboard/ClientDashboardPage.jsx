import { Flag, LayoutDashboard, Phone, Star, User } from 'lucide-react';
import { useAuthContext } from '@/shared/context/AuthContext.jsx';
import { DashboardShell } from '@/shared/components/layout/DashboardShell.jsx';
import { ROUTES } from '@/shared/lib/constants.js';
import { ContactsSection } from '@/features/contacts/components/ContactsSection.jsx';
import { MyReviewsSection } from '@/features/reviews/components/MyReviewsSection.jsx';
import { MyReportsSection } from '@/features/reports/components/MyReportsSection.jsx';
import { ClientDashboardSidebar } from './components/ClientDashboardSidebar.jsx';
import { ClientProfileSection } from './components/ClientProfileSection.jsx';
import { ClientOverviewSection } from './components/ClientOverviewSection.jsx';

// L'aperçu ouvre la liste, le profil la ferme : le compte se parcourt du plus
// utile au plus administratif, comme la sidebar de l'espace pro.
const NAV_ITEMS = [
  { id: 'apercu', label: 'Vue d’ensemble', shortLabel: 'Aperçu', icon: LayoutDashboard },
  { id: 'avis', label: 'Mes avis', shortLabel: 'Avis', icon: Star },
  { id: 'contacts', label: 'Mes contacts', shortLabel: 'Contacts', icon: Phone },
  { id: 'signalements', label: 'Mes signalements', shortLabel: 'Signal.', icon: Flag },
  { id: 'profil', label: 'Mon profil', shortLabel: 'Profil', icon: User },
];

// Sections qui portent des filtres : seules celles-là occupent la colonne de
// droite. Les autres la laissent vide, comme l'admin masque la sienne hors des
// sections filtrables.
const WITH_FILTERS = new Set(['avis', 'contacts', 'signalements']);

export function ClientDashboardPage() {
  const { user } = useAuthContext();

  // La section vit dans l'URL, pas dans un état local. C'est ce qui rend le
  // rechargement, le bouton « retour » du navigateur et un lien de partage
  // corrects - trois choses qu'un `useState` ne sait pas faire.
  return (
    <DashboardShell
      items={NAV_ITEMS}
      basePath={ROUTES.DASHBOARD_CLIENT}
      rootId="apercu"
      filteredSections={WITH_FILTERS}
      navAriaLabel="Navigation du profil"
      sidebar={({ items, active, onChange }) => (
        <ClientDashboardSidebar
          items={items}
          active={active}
          onChange={onChange}
          userId={user?.id}
        />
      )}
      renderSection={(active, rightContainer, navigate) => (
        <>
          {active === 'apercu' && <ClientOverviewSection onNavigate={navigate} />}
          {active === 'profil' && <ClientProfileSection user={user} />}
          {active === 'avis' && <MyReviewsSection rightContainer={rightContainer} />}
          {active === 'contacts' && <ContactsSection rightContainer={rightContainer} />}
          {active === 'signalements' && <MyReportsSection rightContainer={rightContainer} />}
        </>
      )}
    />
  );
}