import { useCallback, useEffect, useState } from 'react';
import { Flag, Image as ImageIcon, LayoutDashboard, Phone, Star, User } from 'lucide-react';
import { useAuthContext } from '@/shared/context/AuthContext.jsx';
import { useNotification } from '@/shared/context/NotificationContext.jsx';
import { BottomNav } from '@/shared/components/ui/BottomNav.jsx';
import { ROUTES } from '@/shared/lib/constants.js';
import { SectionSwap } from '@/shared/motion/SectionSwap.jsx';
import { useSectionNav } from '@/shared/hooks/useSectionNav.js';
import { cn } from '@/shared/utils';
import { getMyProfile, setAvailability } from '../services/professionals.service.js';
import { AvailabilityToggle } from '../components/AvailabilityToggle.jsx';
import { OverviewSection } from '../components/OverviewSection.jsx';
import { PhotoManager } from '../components/PhotoManager.jsx';
import { ProfileEditor } from '../components/ProfileEditor.jsx';
import { ProfileErrorState, ProfileLoadingState } from '../components/ProfileStates.jsx';
import { ProSidebar } from '../components/ProSidebar.jsx';
import { PublicationStatus } from '../components/PublicationStatus.jsx';
import { ContactsSection } from '@/features/contacts/components/ContactsSection.jsx';
import { MyReportsSection } from '@/features/reports/components/MyReportsSection.jsx';
import { ProReviewsSection } from '@/features/reviews/components/ProReviewsSection.jsx';

// Le profil ferme la liste, comme dans l'espace client : le compte se parcourt
// du plus utile au plus administratif.
const NAV_ITEMS = [
  { id: 'overview', label: 'Vue d’ensemble', shortLabel: 'Aperçu', icon: LayoutDashboard },
  { id: 'photos', label: 'Mes réalisations', shortLabel: 'Réalis.', icon: ImageIcon },
  { id: 'contacts', label: 'Mes contacts', shortLabel: 'Contacts', icon: Phone },
  { id: 'avis', label: 'Mes avis', shortLabel: 'Avis', icon: Star },
  { id: 'signalements', label: 'Mes signalements', shortLabel: 'Signal.', icon: Flag },
  { id: 'profil', label: 'Mon profil', shortLabel: 'Profil', icon: User },
];

// Sections qui portent des filtres : seules celles-là occupent la colonne de
// droite, comme dans l'espace client et l'espace admin. Aperçu et profil n'en
// ont pas, la grille retombe alors à deux colonnes. Les photos n'ont pas de
// panneau : elles se parcourent d'un regard, un filtre n'y apporterait rien.
const WITH_FILTERS = new Set(['contacts', 'avis', 'signalements']);

const ROOT_ID = 'overview';
const SECTIONS = NAV_ITEMS.map((item) => item.id);

export function ProProfilePage() {
  const { user } = useAuthContext();
  const { toast } = useNotification();

  // La section vit dans l'URL : rechargement, bouton « retour » et lien de
  // partage restent corrects, ce qu'un état local ne permet pas.
  const { active, goTo } = useSectionNav(ROUTES.DASHBOARD_PRO, SECTIONS, ROOT_ID);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingAvailability, setSavingAvailability] = useState(false);
  const [rightEl, setRightEl] = useState(null);
  const withFilters = WITH_FILTERS.has(active);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setProfile(await getMyProfile());
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const handleAvailabilityChange = async (next) => {
    setSavingAvailability(true);
    try {
      const res = await setAvailability(Boolean(next));
      setProfile((p) => ({ ...(p || {}), isAvailable: res }));
      toast({ message: `Disponibilité : ${res ? 'Disponible' : 'Indisponible'}`, type: 'info' });
    } catch (err) {
      toast({ message: err?.message || 'Erreur.', type: 'error' });
    } finally {
      setSavingAvailability(false);
    }
  };

  const updatePhotos = (photos) => {
    setProfile((p) => ({ ...(p || {}), photos }));
    load();
  };

  if (loading) return <ProfileLoadingState />;
  if (error && !profile) return <ProfileErrorState error={error} onRetry={load} />;

  const displayName = user?.displayName || profile?.displayName || 'Professionnel';

  return (
    <div className="container-kop py-10 lg:py-16">
      {/* Une seule grille pour les trois colonnes, comme les espaces client et
          admin : navigation à gauche, contenu au centre, filtres à droite. Les
          sections ne creusent pas leur propre colonne, elles y projettent
          leurs filtres par portail — sans quoi la colonne de droite n'a pas la
          même largeur que dans les deux autres espaces, et les deux barres
          sticky ne s'alignent plus. */}
      <div
        className={cn(
          'grid gap-6 lg:items-start',
          withFilters
            ? 'lg:grid-cols-[minmax(0,260px)_minmax(0,1fr)_minmax(0,280px)]'
            : 'lg:grid-cols-[minmax(0,260px)_minmax(0,1fr)]',
        )}
      >
        <ProSidebar
          user={user}
          profile={profile}
          displayName={displayName}
          items={NAV_ITEMS}
          active={active}
          onChange={goTo}
        />

        <SectionSwap sectionKey={active} className="min-w-0 space-y-6">
          {active === 'overview' && (
            <>
              <div className="grid gap-5 sm:grid-cols-2">
                <PublicationStatus status={profile?.status} missing={profile?.missing || []} />
                <AvailabilityToggle
                  isAvailable={profile?.isAvailable}
                  onChange={handleAvailabilityChange}
                  loading={savingAvailability}
                />
              </div>
              <OverviewSection profile={profile} onNavigate={goTo} />
            </>
          )}

          {active === 'profil' && <ProfileEditor profile={profile} user={user} onUpdated={setProfile} />}

          {active === 'photos' && <PhotoManager photos={profile?.photos || []} onChange={updatePhotos} />}

          {active === 'contacts' && <ContactsSection rightContainer={rightEl} />}

          {active === 'avis' && (
            <ProReviewsSection professionalId={profile?.id} rightContainer={rightEl} />
          )}

          {active === 'signalements' && (
            <MyReportsSection rightContainer={rightEl} />
          )}
        </SectionSwap>

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
        ariaLabel="Navigation de l'espace pro (mobile)"
      />
    </div>
  );
}