import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { MessageCircle, MessageSquarePlus, Phone, Star, User } from 'lucide-react';
import { useAsyncData } from '@/shared/hooks/useAsyncData.js';
import { getPublishedDetail, canReview } from '../services/professionals.service.js';
import { ReviewForm, ReviewList } from '@/features/reviews/components/index.js';
import { listReviews } from '@/features/reviews/services/reviews.service.js';
import { ReportProfessionalDialog, ReportTrigger } from '../components/ReportDialog.jsx';
import { DataState } from '@/shared/components/ui/DataState.jsx';
import { Button } from '@/shared/components/ui/Button.jsx';
import { Card } from '@/shared/components/ui/Card.jsx';
import { BottomNav } from '@/shared/components/ui/BottomNav.jsx';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/shared/components/ui/Dialog.jsx';
import { useAuthContext } from '@/shared/context/AuthContext.jsx';
import { useAuthModal } from '@/shared/context/AuthModalContext.jsx';
import { ROLES, STICKY_BAND } from '@/shared/lib/constants.js';
import { usePageTitle } from '@/shared/hooks/usePageTitle.js';
import { PhotoLightbox } from '../components/public/PhotoLightbox.jsx';
import { PublicProfileMobileIntro } from '../components/public/PublicProfileMobileIntro.jsx';
import { PublicProfileSidebar } from '../components/public/PublicProfileSidebar.jsx';
import { RealizationsSection } from '../components/public/RealizationsSection.jsx';
import { ReviewsBlock } from '../components/public/ReviewsBlock.jsx';
import { CITY, getProfileView } from '../components/public/profileView.js';

/** `isAction` : ces entrées ouvrent une fenêtre, elles ne naviguent pas.
 *  La barre ne doit donc jamais les marquer comme actives - ni visuellement,
 *  ni via `aria-current`, qui signifie « vous êtes ici ». */
const NAV_SECTIONS = [
  { id: 'profile', label: 'Profil', icon: User },
  { id: 'avis', label: 'Avis', icon: Star, isAction: true },
  { id: 'contact', label: 'Contact', icon: MessageCircle, isAction: true },
];

export function ProfessionalPublicPage() {
  const { id } = useParams();
  const { user } = useAuthContext();
  const { open: openAuthModal } = useAuthModal();
  const [reviewSubmittedFor, setReviewSubmittedFor] = useState(null);
  const [openIndex, setOpenIndex] = useState(null);
  const [activeSection, setActiveSection] = useState('profile');
  const [reviewsOpen, setReviewsOpen] = useState(false);
  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [tabContactOpen, setTabContactOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  const detail = useAsyncData(() => getPublishedDetail(id), [id]);
  const canReviewState = useAsyncData(() => canReview(id), [id, user?.id]);
  // Une seule requête pour les deux emplacements (desktop et mobile).
  const compactReviews = useAsyncData(() => listReviews(id, { page: 1, pageSize: 3 }), [id]);

  // Appelé avant le retour anticipé (un hook ne peut pas être conditionnel),
  // mais après detail : la vue dérivée n'existe qu'ensuite.
  usePageTitle(
    detail.data ? `${detail.data.profile?.trade?.name ?? 'Professionnel'} à Brazzaville` : 'Professionnel',
  );

  if (detail.loading || detail.error)
    return (
      <div className="container-kop page-padding">
        <DataState loading={detail.loading} error={detail.error} errorPrefix="Fiche introuvable">
          {null}
        </DataState>
      </div>
    );

  const { profile, photos, rating } = detail.data;
  const view = getProfileView(profile, rating);
  const { tradeName, count, firstName, localisation, breadcrumbTrade, whatsappUrl } = view;

  const isSelf = user?.id != null && String(user.id) === String(profile.id);
  const isVisitorView = !isSelf && user?.role !== ROLES.ADMIN;

  const canLeaveReview =
    reviewSubmittedFor !== id && Boolean(user) && user.role !== ROLES.ADMIN && canReviewState.data === true;

  /** Toute action réservée aux connectés ouvre d'abord la connexion. */
  const requireAuth = (action) => () => {
    if (!user) {
      openAuthModal('login');
      return;
    }
    action();
  };

  const onContactClick = requireAuth(() => setTabContactOpen(true));
  const onReportClick = requireAuth(() => setReportOpen(true));
  const onLeaveReviewClick = requireAuth(() => setReviewFormOpen(true));

  const refreshAfterReview = () => {
    setReviewSubmittedFor(id);
    detail.reload().catch(() => {});
    compactReviews.reload().catch(() => {});
  };

  const goPrev = () => setOpenIndex((cur) => (cur == null ? 0 : (cur - 1 + photos.length) % photos.length));
  const goNext = () => setOpenIndex((cur) => (cur == null ? 0 : (cur + 1) % photos.length));

  const scrollToSection = (sectionId) => {
    // `avis` et `contact` ouvrent une fenêtre : la page n'a pas changé de
    // section, marquer l'une d'elles comme active laisserait la barre sur une
    // destination quittée dès la fermeture du dialogue.
    if (sectionId === 'avis') {
      setReviewsOpen(true);
      return;
    }
    if (sectionId === 'contact') {
      if (user) setTabContactOpen(true);
      else openAuthModal('login');
      return;
    }
    setActiveSection(sectionId);
    if (sectionId === 'profile') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="container-kop page-padding space-y-6 pb-safe-nav lg:pb-0">
      <h1 className="sr-only">
        {profile.displayName} - {tradeName} à {CITY}
      </h1>

      <div className="grid min-w-0 gap-6 grid-cols-[minmax(0,1fr)] lg:grid-cols-[minmax(0,260px)_minmax(0,1fr)_minmax(0,280px)] lg:items-start">
        <PublicProfileSidebar
          profile={profile}
          view={view}
          isVisitorView={isVisitorView}
          onReportClick={onReportClick}
        />

        <div className="min-w-0 space-y-12">
          <PublicProfileMobileIntro profile={profile} view={view} breadcrumbTrade={breadcrumbTrade} />

          <RealizationsSection
            photos={photos}
            displayName={profile.displayName}
            tradeName={tradeName}
            localisation={localisation}
            breadcrumbTrade={breadcrumbTrade}
            onOpenPhoto={setOpenIndex}
          />

          {/* Sur mobile, la colonne de droite s'empile sous celle-ci : les avis y
              sont déjà rendus, leur version ici évite un second affichage. */}
          <section className="space-y-4 lg:hidden">
            <ReviewsBlock
              rating={rating}
              canReview={canLeaveReview || !user}
              onLeaveReview={onLeaveReviewClick}
              state={compactReviews}
              onViewAll={() => setReviewsOpen(true)}
              headingClassName="text-xl"
            />
          </section>
        </div>

        <aside className="min-w-0 space-y-5 lg:self-stretch">
          {/* Les avis apparaissent deux fois sur mobile : une fois ici, et une
              fois dans la colonne de droite. Le bloc de droite n'était masqué
              que sur ses liens internes, pas sur la colonne elle-même, qui
              s'empile sous la colonne centrale en une seule colonne. */}
          <section id="avis" className="hidden space-y-4 lg:block">
            <ReviewsBlock
              rating={rating}
              canReview={canLeaveReview || !user}
              onLeaveReview={onLeaveReviewClick}
              state={compactReviews}
              onViewAll={() => setReviewsOpen(true)}
            />
          </section>

          {/*
            Épinglée en haut **et** en bas - voir `STICKY_BAND`.

            Une carte qui ne se colle qu'en haut quitte l'écran dès qu'on arrive
            en bas de la fiche. Or « Contacter » est précisément l'action qu'on
            cherche une fois avoir lu : elle doit rester atteignable depuis le
            haut et depuis le bas, sans jamais flotter au milieu.
          */}
          <Card
            id="contact"
            className={`overflow-hidden border-0 p-0 text-white shadow-lg ${STICKY_BAND}`}
          >
            {/* Deux teintes en diagonale, pas un aplat. Un aplat vert qui couvre
                40 % de la page attire plus que la photo du professionnel, qui
                est le sujet de la fiche ; le dégradé le ramène au rang de fond. */}
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-br from-primary-500 to-primary-700"
            />

            <div className="relative flex flex-col gap-4 p-5">
              <div className="space-y-1.5">
                <h2 className="text-lg font-bold text-white">Parlons de votre besoin.</h2>
                <p className="text-sm leading-6 text-white/80">
                  Décrivez votre projet, ses coordonnées apparaîtront ensuite.
                </p>
              </div>

              {/* Le bouton se retourne sur la carte : blanc sur le vert. Le même
                  bouton vert, posé sur le vert, ne laisserait qu'un rectangle
                  plus clair, sans bord ni texte lisible. */}
              <Button
                className="w-full bg-white text-primary-700 hover:bg-white/90"
                size="lg"
                onClick={onContactClick}
              >
                Contacter {firstName}
              </Button>
            </div>
          </Card>


          {/* Dernier élément de la fiche sur mobile : signaler un profil est
              une action de recours, elle ne doit pas passer avant le bouton
              de contact. Sur desktop, `PublicProfileSidebar` porte déjà le
              sien, d'où le `lg:hidden`. */}
          {isVisitorView && (
            <div className="lg:hidden">
              <ReportTrigger onClick={onReportClick} />
            </div>
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

      <Dialog open={reviewsOpen} onOpenChange={(o) => !o && setReviewsOpen(false)}>
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
            <DialogTitle>Avis ({count})</DialogTitle>
            <DialogDescription>les avis laissés sur la fiche</DialogDescription>
          </DialogHeader>
          <ReviewList professionalId={profile.id} />
        </DialogContent>
      </Dialog>

      <Dialog open={reviewFormOpen} onOpenChange={(o) => !o && setReviewFormOpen(false)}>
        <DialogContent className="max-w-2xl min-h-[45vh] p-5" onClose={() => setReviewFormOpen(false)}>
          <DialogHeader>
            <DialogTitle>Donner votre avis</DialogTitle>
            <DialogDescription>Client ou professionnel, votre retour aide à faire leur choix.</DialogDescription>
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

      <Dialog open={tabContactOpen} onOpenChange={(o) => !o && setTabContactOpen(false)}>
        <DialogContent className="max-w-lg min-h-[45vh] p-5" onClose={() => setTabContactOpen(false)}>
          <DialogHeader>
            <DialogTitle>Contacter {firstName}</DialogTitle>
            <DialogDescription>
              Vous pouvez joindre {firstName} directement par téléphone ou WhatsApp.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <Button as="a" href={`tel:${String(profile.phone).replace(/\D/g, '')}`} variant="secondary">
              <Phone size={16} aria-hidden /> Appeler
            </Button>
            {whatsappUrl && (
              <Button as="a" href={whatsappUrl} target="_blank" rel="noopener noreferrer" variant="secondary">
                <MessageCircle size={16} aria-hidden /> WhatsApp
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {reportOpen && (
        <ReportProfessionalDialog open onClose={() => setReportOpen(false)} professionalId={profile.id} />
      )}

      <BottomNav
        items={NAV_SECTIONS}
        active={activeSection}
        onChange={scrollToSection}
        ariaLabel="Sections de la fiche"
      />
    </div>
  );
}