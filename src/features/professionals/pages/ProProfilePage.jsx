import { useCallback, useState } from "react";
import {
  Flag,
  Image as ImageIcon,
  LayoutDashboard,
  Phone,
  Star,
  User,
} from "lucide-react";
import { useAuthContext } from "@/shared/context/AuthContext.jsx";
import { useNotification } from "@/shared/context/NotificationContext.jsx";
import { DashboardShell } from "@/shared/components/layout/DashboardShell.jsx";
import { ROUTES } from "@/shared/lib/constants.js";
import { useAsyncData } from "@/shared/hooks/useAsyncData.js";
import { ContactsSection } from "@/features/contacts/components/ContactsSection.jsx";
import { MyReportsSection } from "@/features/reports/components/MyReportsSection.jsx";
import { ProReviewsSection } from "@/features/reviews/components/ProReviewsSection.jsx";
import {
  getMyProfile,
  setAvailability,
} from "../services/professionals.service.js";
import { AvailabilityToggle } from "../components/AvailabilityToggle.jsx";
import { OverviewSection } from "../components/OverviewSection.jsx";
import { PhotoManager } from "../components/PhotoManager.jsx";
import { ProfileEditor } from "../components/ProfileEditor.jsx";
import {
  ProfileErrorState,
  ProfileLoadingState,
} from "../components/ProfileStates.jsx";
import { ProSidebar } from "../components/ProSidebar.jsx";
import { PublicationStatus } from "../components/PublicationStatus.jsx";

const NAV_ITEMS = [
  {
    id: "overview",
    label: "Vue d’ensemble",
    shortLabel: "Aperçu",
    icon: LayoutDashboard,
  },
  {
    id: "photos",
    label: "Mes réalisations",
    shortLabel: "Réalis.",
    icon: ImageIcon,
  },
  {
    id: "contacts",
    label: "Mes contacts",
    shortLabel: "Contacts",
    icon: Phone,
  },
  { id: "avis", label: "Mes avis", shortLabel: "Avis", icon: Star },
  {
    id: "signalements",
    label: "Mes signalements",
    shortLabel: "Signal.",
    icon: Flag,
  },
  { id: "profil", label: "Mon profil", shortLabel: "Profil", icon: User },
];

const WITH_FILTERS = new Set(["contacts", "avis", "signalements"]);

export function ProProfilePage() {
  const { user } = useAuthContext();
  const { toast } = useNotification();
  const [savingAvailability, setSavingAvailability] = useState(false);

  const loadProfile = useCallback(() => getMyProfile(), []);
  const {
    data: profile,
    loading,
    error,
    reload,
    mutate,
  } = useAsyncData(loadProfile, []);

  const handleAvailabilityChange = async (next) => {
    setSavingAvailability(true);
    try {
      const isAvailable = await setAvailability(Boolean(next));
      mutate((p) => ({ ...(p ?? {}), isAvailable }));
      toast({
        message: `Disponibilité : ${isAvailable ? "Disponible" : "Indisponible"}`,
        type: "info",
      });
    } catch (err) {
      toast({ message: err?.message || "Erreur.", type: "error" });
    } finally {
      setSavingAvailability(false);
    }
  };

  if (loading) return <ProfileLoadingState />;
  if (error && !profile)
    return <ProfileErrorState error={error} onRetry={reload} />;

  const displayName =
    user?.displayName || profile?.displayName || "Professionnel";

  return (
    <DashboardShell
      items={NAV_ITEMS}
      basePath={ROUTES.DASHBOARD_PRO}
      rootId="overview"
      filteredSections={WITH_FILTERS}
      navAriaLabel="Navigation de l’espace pro"
      sidebar={({ items, active, onChange }) => (
        <ProSidebar
          user={user}
          profile={profile}
          displayName={displayName}
          items={items}
          active={active}
          onChange={onChange}
        />
      )}
      renderSection={(active, rightContainer, navigate) => (
        <div className="space-y-6">
          {active === "overview" && (
            <>
              <div className="grid gap-5 sm:grid-cols-2">
                <PublicationStatus
                  status={profile?.status}
                  missing={profile?.missing || []}
                />
                <AvailabilityToggle
                  isAvailable={profile?.isAvailable}
                  onChange={handleAvailabilityChange}
                  loading={savingAvailability}
                />
              </div>
              <OverviewSection profile={profile} onNavigate={navigate} />
            </>
          )}

          {active === "profil" && (
            <ProfileEditor profile={profile} user={user} onUpdated={reload} />
          )}

          {active === "photos" && (
            <PhotoManager photos={profile?.photos || []} onChange={reload} />
          )}

          {active === "contacts" && (
            <ContactsSection rightContainer={rightContainer} />
          )}

          {active === "avis" && (
            <ProReviewsSection
              professionalId={profile?.id}
              rightContainer={rightContainer}
            />
          )}

          {active === "signalements" && (
            <MyReportsSection rightContainer={rightContainer} />
          )}
        </div>
      )}
    />
  );
}
