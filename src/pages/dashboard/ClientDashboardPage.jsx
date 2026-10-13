import { useState } from 'react';
import { Flag, LayoutDashboard, Phone, Star, User } from 'lucide-react';
import { useAuthContext } from '@/shared/context/AuthContext.jsx';
import { BottomNav } from '@/shared/components/ui/BottomNav.jsx';
import { DASHBOARD_FRAME, ROUTES } from '@/shared/lib/constants.js';
import { useSectionNav } from '@/shared/hooks/useSectionNav.js';
import { cn } from '@/shared/utils';
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

const ROOT_ID = 'apercu';
const SECTIONS = NAV_ITEMS.map((item) => item.id);

// Sections qui portent des filtres : seules celles-là occupent la colonne de
// droite. Les autres la laissent vide, comme l'admin masque la sienne hors des
// sections filtrables.
const WITH_FILTERS = new Set(['avis', 'contacts', 'signalements']);

export function ClientDashboardPage() {
  const { user } = useAuthContext();

  // La section vit dans l'URL, pas dans un état local. C'est ce qui rend le
  // rechargement, le bouton « retour » du navigateur et un lien de partage
  // corrects — trois choses qu'un `useState` ne sait pas faire.
  const { active, goTo } = useSectionNav(ROUTES.DASHBOARD_CLIENT, SECTIONS, ROOT_ID);

  const [rightEl, setRightEl] = useState(null);
  const withFilters = WITH_FILTERS.has(active);

  return (
    <div className="container-kop py-10 lg:py-16">
      {/* Une seule grille pour les trois colonnes, comme `AdminDashboardPage` :
          navigation à gauche, contenu au centre, filtres à droite. Les sections
          ne creusent pas leur propre colonne, elles y projettent leurs filtres
          par portail. Sans filtres, la grille retombe à deux colonnes : garder la
          troisième laisserait un vide de 280px à droite de l'aperçu et du profil. */}
      <div
        className={cn(
          'grid gap-6 lg:items-start',
          withFilters
            ? 'lg:grid-cols-[minmax(0,260px)_minmax(0,1fr)_minmax(0,280px)]'
            : 'lg:grid-cols-[minmax(0,260px)_minmax(0,1fr)]',
        )}
      >
        <ClientDashboardSidebar items={NAV_ITEMS} active={active} onChange={goTo} />

        <section className={cn('min-w-0', DASHBOARD_FRAME)}>
          {active === 'apercu' && <ClientOverviewSection onNavigate={goTo} />}
          {active === 'profil' && <ClientProfileSection user={user} />}
          {active === 'avis' && <MyReviewsSection rightContainer={rightEl} />}
          {active === 'contacts' && <ContactsSection rightContainer={rightEl} />}
          {active === 'signalements' && <MyReportsSection rightContainer={rightEl} />}
        </section>

        <aside
          ref={setRightEl}
          aria-label="Filtres"
          className={cn('lg:sticky lg:top-(--header-height)', withFilters ? 'hidden lg:block' : 'hidden')}
        />
      </div>

      <BottomNav
        items={NAV_ITEMS}
        active={active}
        onChange={goTo}
        ariaLabel="Navigation du profil (mobile)"
      />
    </div>
  );
}