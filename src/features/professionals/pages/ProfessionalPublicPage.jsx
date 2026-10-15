import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  MessageCircle,
  MessageSquarePlus,
  Phone,
  Star,
  User,
} from "lucide-react";
import { useAsyncData } from "@/shared/hooks/useAsyncData.js";
import {
  getPublishedDetail,
  canReview,
} from "../services/professionals.service.js";
import { ReviewForm, ReviewList } from "@/features/reviews/components/index.js";
import { listReviews } from "@/features/reviews/services/reviews.service.js";
import {
  ReportProfessionalDialog,
  ReportTrigger,
} from "../components/ReportDialog.jsx";
import { DataState } from "@/shared/components/ui/DataState.jsx";
import { Button } from "@/shared/components/ui/Button.jsx";
import { PromoCard } from "@/shared/components/ui/PromoCard.jsx";
import { BottomNav } from "@/shared/components/ui/BottomNav.jsx";
import { ResponsiveSection } from "@/shared/components/ui/ResponsiveSection.jsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/Dialog.jsx";
import { useAuthContext } from "@/shared/context/AuthContext.jsx";
import { useAuthModal } from "@/shared/context/AuthModalContext.jsx";
import { ROLES, STICKY_BAND } from "@/shared/lib/constants.js";
import { usePageTitle } from "@/shared/hooks/usePageTitle.js";
import { PhotoLightbox } from "../components/public/PhotoLightbox.jsx";
import { PublicProfileMobileIntro } from "../components/public/PublicProfileMobileIntro.jsx";
import { PublicProfileSidebar } from "../components/public/PublicProfileSidebar.jsx";
import { RealizationsSection } from "../components/public/RealizationsSection.jsx";
import { ReviewsBlock } from "../components/public/ReviewsBlock.jsx";
import { CITY, getProfileView } from "../components/public/profileView.js";

const NAV_SECTIONS = [
  { id: "profile", label: "Profil", icon: User },
  { id: "avis", label: "Avis", icon: Star, isAction: true },
  { id: "contact", label: "Contact", icon: MessageCircle, isAction: true },
];

const TRADE_FALLBACK = "Artisan";

export function ProfessionalPublicPage() {
  const { id } = useParams();
  const { user } = useAuthContext();
  const { open: openAuthModal } = useAuthModal();
  const [reviewSubmittedFor, setReviewSubmittedFor] = useState(null);
  const [openIndex, setOpenIndex] = useState(null);
  const [reviewsOpen, setReviewsOpen] = useState(false);
  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [tabContactOpen, setTabContactOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  const detail = useAsyncData(() => getPublishedDetail(id), [id]);
  const canReviewState = useAsyncData(
    () => (user ? canReview(id) : false),
    [id, user?.id],
  );
  const compactReviews = useAsyncData(
    () => listReviews(id, { page: 1, pageSize: 3 }),
    [id],
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpenIndex(null);
    setReviewsOpen(false);
    setReviewFormOpen(false);
    setTabContactOpen(false);
    setReportOpen(false);
  }, [id]);

  usePageTitle(
    detail.data
      ? `${detail.data.profile?.trade?.name || TRADE_FALLBACK} à ${CITY}`
      : "Professionnel",
  );

  if (detail.loading || detail.error)
    return (
      <div className="container-kop page-padding">
        <DataState
          loading={detail.loading}
          error={detail.error}
          errorPrefix="Fiche introuvable"
        >
          {null}
        </DataState>
      </div>
    );

  const { profile, photos, rating } = detail.data;
  const view = getProfileView(profile, rating);
  const { tradeName, firstName, localisation, breadcrumbTrade, whatsappUrl } =
    view;
  const reviewTotal = Number(compactReviews?.data?.total ?? 0);
  const phoneNumber = String(profile.phone ?? "").replace(/\D/g, "");

  const isSelf = user?.id != null && String(user.id) === String(profile.id);
  const isVisitorView = !isSelf && user?.role !== ROLES.ADMIN;

  const canLeaveReview =
    reviewSubmittedFor !== id &&
    Boolean(user) &&
    user.role !== ROLES.ADMIN &&
    canReviewState.data === true;

  const requireAuth = (action) => () => {
    if (!user) {
      openAuthModal("login");
      return;
    }
    action();
  };

  const onContactClick = requireAuth(() => setTabContactOpen(true));
  const onReportClick = requireAuth(() => setReportOpen(true));
  const onLeaveReviewClick = requireAuth(() => setReviewFormOpen(true));

  const refreshAfterReview = () => {
    setReviewSubmittedFor(id);
    detail.reload({ silent: true }).catch(() => {});
    compactReviews.reload({ silent: true }).catch(() => {});
  };

  const step = (offset) =>
    setOpenIndex((cur) =>
      cur == null || photos.length === 0
        ? null
        : (cur + offset + photos.length) % photos.length,
    );
  const goPrev = () => step(-1);
  const goNext = () => step(1);

  const onNavClick = (sectionId) => {
    if (sectionId === "avis") {
      setReviewsOpen(true);
      return;
    }
    if (user) setTabContactOpen(true);
    else openAuthModal("login");
  };

  return (
    <div className="container-kop page-padding pb-safe-nav lg:pb-8">
      <h1 className="sr-only">
        {profile.displayName} - {tradeName} à {CITY}
      </h1>

      {}
      <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,260px)_minmax(0,1fr)_minmax(0,280px)] lg:items-start">
        <PublicProfileSidebar
          profile={profile}
          view={view}
          isVisitorView={isVisitorView}
          onReportClick={onReportClick}
        />

        <section className="min-w-0 space-y-5">
          <ResponsiveSection variant="mobile">
            <PublicProfileMobileIntro
              profile={profile}
              view={view}
              breadcrumbTrade={breadcrumbTrade}
            />
          </ResponsiveSection>

          <RealizationsSection
            photos={photos}
            displayName={profile.displayName}
            tradeName={tradeName}
            localisation={localisation}
            breadcrumbTrade={breadcrumbTrade}
            onOpenPhoto={setOpenIndex}
          />

          <ResponsiveSection variant="mobile">
            <section className="space-y-4">
              <ReviewsBlock
                rating={rating}
                canReview={canLeaveReview || !user}
                onLeaveReview={onLeaveReviewClick}
                state={compactReviews}
                onViewAll={() => setReviewsOpen(true)}
                headingClassName="text-xl"
              />
            </section>
          </ResponsiveSection>
        </section>

        <aside className="min-w-0 space-y-4 lg:self-stretch">
          <ResponsiveSection variant="desktop">
            <section id="avis" className="space-y-4">
              <ReviewsBlock
                rating={rating}
                canReview={canLeaveReview || !user}
                onLeaveReview={onLeaveReviewClick}
                state={compactReviews}
                onViewAll={() => setReviewsOpen(true)}
              />
            </section>
          </ResponsiveSection>

          <PromoCard
            id="contact"
            seed={profile.id || 1}
            className={STICKY_BAND}
            title="Parlons de votre besoin."
            text="Décrivez votre projet, ses coordonnées apparaîtront ensuite."
            action={`Contacter ${firstName}`}
            onAction={onContactClick}
          />

          {isVisitorView && (
            <ResponsiveSection variant="mobile">
              <ReportTrigger onClick={onReportClick} />
            </ResponsiveSection>
          )}
        </aside>
      </div>

      {openIndex !== null && (
        <PhotoLightbox
          photos={photos}
          index={openIndex}
          onClose={() => setOpenIndex(null)}
          onPrev={goPrev}
          onNext={goNext}
        />
      )}

      <Dialog
        open={reviewsOpen}
        onOpenChange={(o) => !o && setReviewsOpen(false)}
      >
        <DialogContent
          className="max-w-3xl min-h-[50vh] p-5"
          onClose={() => setReviewsOpen(false)}
          footer={
            canLeaveReview || !user ? (
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={onLeaveReviewClick}
              >
                <MessageSquarePlus size={18} aria-hidden />
                Donner mon avis
              </Button>
            ) : null
          }
        >
          <DialogHeader>
            <DialogTitle>Avis ({reviewTotal})</DialogTitle>
            <DialogDescription>les avis laissés sur la fiche</DialogDescription>
          </DialogHeader>
          <ReviewList professionalId={profile.id} />
        </DialogContent>
      </Dialog>

      <Dialog
        open={reviewFormOpen}
        onOpenChange={(o) => !o && setReviewFormOpen(false)}
      >
        <DialogContent
          className="max-w-2xl min-h-[45vh] p-5"
          onClose={() => setReviewFormOpen(false)}
        >
          <DialogHeader>
            <DialogTitle>Donner votre avis</DialogTitle>
            <DialogDescription>
              Client ou professionnel, votre retour aide à faire leur choix.
            </DialogDescription>
          </DialogHeader>
          <ReviewForm
            professionalId={profile.id}
            onSuccess={() => {
              setReviewFormOpen(false);
              refreshAfterReview();
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={tabContactOpen}
        onOpenChange={(o) => !o && setTabContactOpen(false)}
      >
        <DialogContent
          className="max-w-lg min-h-[45vh] p-5"
          onClose={() => setTabContactOpen(false)}
        >
          <DialogHeader>
            <DialogTitle>Contacter {firstName}</DialogTitle>
            <DialogDescription>
              Vous pouvez joindre {firstName} directement par téléphone ou
              WhatsApp.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            {phoneNumber && (
              <Button as="a" href={`tel:${phoneNumber}`} variant="secondary">
                <Phone size={16} aria-hidden /> Appeler
              </Button>
            )}
            {whatsappUrl && (
              <Button
                as="a"
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                variant="secondary"
              >
                <MessageCircle size={16} aria-hidden /> WhatsApp
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {reportOpen && (
        <ReportProfessionalDialog
          open
          onClose={() => setReportOpen(false)}
          professionalId={profile.id}
        />
      )}

      <BottomNav
        items={NAV_SECTIONS}
        active="profile"
        onChange={onNavClick}
        ariaLabel="Sections de la fiche"
      />
    </div>
  );
}
