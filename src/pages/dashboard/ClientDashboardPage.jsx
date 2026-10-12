import { useState } from 'react';
import { Flag, LayoutDashboard, Phone, Star, User } from 'lucide-react';
import { useAuthContext } from '@/shared/context/AuthContext.jsx';
import { BottomNav } from '@/shared/components/ui/BottomNav.jsx';
import { ContactsSection } from '@/features/contacts/components/ContactsSection.jsx';
import { MyReviewsSection } from '@/features/reviews/components/MyReviewsSection.jsx';
import { MyReportsSection } from '@/features/reports/components/MyReportsSection.jsx';
import { ClientDashboardSidebar } from './components/ClientDashboardSidebar.jsx';
import { ClientProfileSection } from './components/ClientProfileSection.jsx';
import { ClientOverviewSection } from './components/ClientOverviewSection.jsx';

// L'aperçu arrive en premier : c'est le point d'entrée, les sections suivent.
const NAV_ITEMS = [
  { id: 'apercu', label: 'Vue d’ensemble', shortLabel: 'Aperçu', icon: LayoutDashboard },
  { id: 'profil', label: 'Mon profil', shortLabel: 'Profil', icon: User },
  { id: 'avis', label: 'Mes avis', shortLabel: 'Avis', icon: Star },
  { id: 'contacts', label: 'Mes contacts', shortLabel: 'Contacts', icon: Phone },
  { id: 'signalements', label: 'Mes signalements', shortLabel: 'Signal.', icon: Flag },
];

export function ClientDashboardPage() {
  const { user } = useAuthContext();
  const [active, setActive] = useState('apercu');

  return (
    <div className="container-kop py-10 lg:py-16">
      <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-x-8">
        <ClientDashboardSidebar items={NAV_ITEMS} active={active} onChange={setActive} />

        <div className="lg:col-start-2 lg:row-start-1">
          {active === 'apercu' && (
            <ClientOverviewSection user={user} onNavigate={setActive} />
          )}
          {active === 'profil' && <ClientProfileSection user={user} />}
          {active === 'avis' && <MyReviewsSection />}
          {active === 'contacts' && <ContactsSection />}
          {active === 'signalements' && <MyReportsSection />}
        </div>
      </div>

      <BottomNav
        items={NAV_ITEMS}
        active={active}
        onChange={setActive}
        ariaLabel="Navigation du profil (mobile)"
      />
    </div>
  );
}