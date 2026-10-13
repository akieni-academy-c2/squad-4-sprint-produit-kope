import { useMemo, useState } from 'react';
import { useAsyncData } from '@/shared/hooks/useAsyncData.js';
import { CustomSelect } from '@/shared/components/ui/CustomSelect.jsx';
import { SearchInput } from '@/shared/components/ui/SearchInput.jsx';
import { DataState } from '@/shared/components/ui/DataState.jsx';
import { EmptyState } from '@/shared/components/ui/EmptyState.jsx';
import { Skeleton } from '@/shared/components/ui/Skeleton.jsx';
import { useNotification } from '@/shared/context/NotificationContext.jsx';
import { fullNameInitials } from '@/shared/utils';
import { REVIEW_REPORT_REASON_OPTIONS } from '@/shared/constants/reports.js';
import { listReviews } from '../services/reviews.service.js';
import {
  deleteReview,
  getMyReviews,
  setReviewVisibility,
} from '../services/reviews.service.js';
import { reportReview } from '@/features/reports/services/reports.service.js';
import { ReportDialog } from '@/features/reports/components/ReportDialog.jsx';
import { ReviewCard } from './ReviewCard.jsx';
import { ReviewForm } from './ReviewForm.jsx';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/shared/components/ui/Dialog.jsx';
import { AccountSectionLayout } from '@/pages/dashboard/components/AccountSectionLayout.jsx';
import { AdminFilterGroup, AdminFilterPanel } from '@/features/admin/components/AdminSectionLayout.jsx';
import { PAGINATION_BAR, Pagination } from '@/shared/components/ui/Pagination.jsx';

const RATING_OPTIONS = [
  { value: '', label: 'Toutes les notes' },
  { value: '5', label: '5 étoiles' },
  { value: '4', label: '4 étoiles' },
  { value: '3', label: '3 étoiles' },
  { value: '2', label: '2 étoiles' },
  { value: '1', label: '1 étoile' },
];

const SORT_OPTIONS = [
  { value: 'recent', label: 'Du plus récent' },
  { value: 'oldest', label: 'Du plus ancien' },
  { value: 'rating_desc', label: 'Meilleures notes' },
  { value: 'rating_asc', label: 'Notes les plus basses' },
];

const SORTERS = {
  recent: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  oldest: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
  rating_desc: (a, b) => b.rating - a.rating || new Date(b.createdAt) - new Date(a.createdAt),
  rating_asc: (a, b) => a.rating - b.rating || new Date(b.createdAt) - new Date(a.createdAt),
};

// Plafond de la liste reçue. Ces avis viennent de l'endpoint **public** de la
// fiche, qui n'a pas de filtres : tout est donc filtré et trié côté client sur
// la page téléchargée. Au-delà de ce nombre, les résultats seraient filtrés
// sur un sous-ensemble en silence — un professionnel qui filtre ses avis
// croirait voir « aucun avis 1 étoile » alors que les plus anciens n'ont pas
// été chargés. La limite est donc affichée quand elle est atteinte.
const FETCH_LIMIT = 100;

const clientName = (review) =>
  review.client?.displayName ||
  fullNameInitials(review.client?.firstName, review.client?.lastName) ||
  'Client';

const ORIGIN_OPTIONS = [
  { value: 'recus', label: 'Avis reçus' },
  { value: 'donnes', label: 'Avis donnés' },
];

// Page assez courte pour que la liste reste lisible sans défilement interminable,
// assez longue pour ne pas faire sautiller la pagination sur un écran de bureau.
const PAGE_SIZE = 10;

/**
 * Onglet « Mes avis » de l'espace professionnel.
 *
 * Deux ensembles, parce qu'un professionnel est deux rôles sur la plateforme :
 * il reçoit des avis sur sa fiche, et il en dépose sur celle des autres. Les
 * premiers ne se gèrent pas — il les consulte et les conteste — les seconds
 * sont les siens, donc modifiables, masquables et supprimables.
 *
 * Les deux listes partagent `ReviewCard` avec le compte client : même carte,
 * mêmes gestes, même design.
 */
export function ProReviewsSection({ professionalId, rightContainer = null }) {
  const { toast } = useNotification();

  const [q, setQ] = useState("");
  const [rating, setRating] = useState("");
  const [sort, setSort] = useState("recent");
  const [origin, setOrigin] = useState("recus");
  const [page, setPage] = useState(1);
  const [givenReload, setGivenReload] = useState(0);
  const [reportingId, setReportingId] = useState(null);
  const [reportedIds, setReportedIds] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [pendingId, setPendingId] = useState(null);

  // `error` est indispensable : sans lui, un échec réseau affichait « Aucun
  // avis pour le moment », faisant croire que le professionnel n'a aucun avis
  // alors que la liste n'a simplement pas pu être chargée.
  const received = useAsyncData(async () => {
    if (!professionalId) return null;
    return listReviews(professionalId, { pageSize: FETCH_LIMIT });
  }, [professionalId]);

  // « Avis reçus » passe par l'endpoint public, sans filtres : le filtrage se
  // fait sur la portion chargée, puis on pagine cette portion. « Avis donnés »
  // passe par l'endpoint du compte, qui sait filtrer et paginer côté serveur —
  // les deux moitiés partagent donc les mêmes filtres, par des chemins
  // différents.
  const given = useAsyncData(
    () =>
      getMyReviews({
        page,
        pageSize: PAGE_SIZE,
        sort,
        ...(q ? { q } : {}),
        ...(rating ? { rating } : {}),
      }),
    [page, sort, q, rating, givenReload],
  );

  const dirty = Boolean(q || rating || sort !== 'recent' || origin !== 'recus');

  const resetFilters = () => {
    setQ('');
    setRating('');
    setSort('recent');
    setOrigin('recus');
  };

  // Changer un filtre ramène en première page : rester sur la page 3 d'un
  // résultat filtré affiche un vide alors que des avis existent.
  const changeFilter = (setter) => (value) => {
    setter(value);
    setPage(1);
  };

  const receivedItems = useMemo(() => received.data?.items ?? [], [received.data]);
  // Le dépassement se voit dans le nombre renvoyé, pas dans le champ `total` :
  // `total` est le compte réel, il peut dépasser sans que la page soit pleine.
  const truncated = receivedItems.length >= FETCH_LIMIT;

  const givenItems = useMemo(() => given.data?.items ?? [], [given.data]);
  const givenTotal = given.data?.total ?? 0;
  const isRecus = origin === 'recus';

  // « Avis reçus » passe par l'endpoint public, sans filtres : le filtrage se
  // fait sur la portion chargée, puis on pagine cette portion. « Avis donnés »
  // passe par l'endpoint du compte, qui sait filtrer et paginer côté serveur.
  const visibleReceived = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let rows = needle
      ? receivedItems.filter(
          (r) =>
            clientName(r).toLowerCase().includes(needle) ||
            (r.comment || '').toLowerCase().includes(needle),
        )
      : receivedItems;

    if (rating) rows = rows.filter((r) => String(r.rating) === rating);

    const sorted = [...rows].sort(SORTERS[sort] ?? SORTERS.recent);
    return sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  }, [receivedItems, q, rating, sort, page]);

  const visibleReceivedCount = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let rows = needle
      ? receivedItems.filter(
          (r) =>
            clientName(r).toLowerCase().includes(needle) ||
            (r.comment || '').toLowerCase().includes(needle),
        )
      : receivedItems;
    if (rating) rows = rows.filter((r) => String(r.rating) === rating);
    return rows.length;
  }, [receivedItems, q, rating]);

  const editing = givenItems.find((r) => r.id === editingId) ?? null;

  const refreshGiven = () => setGivenReload((n) => n + 1);

  const toggleHidden = async (review) => {
    setPendingId(review.id);
    try {
      await setReviewVisibility(review.id, !review.isHidden);
      toast({
        message: review.isHidden ? 'Avis réaffiché.' : 'Avis masqué de la fiche publique.',
        type: 'success',
      });
      refreshGiven();
    } catch (err) {
      toast({ message: err?.message || 'Action impossible.', type: 'error' });
    } finally {
      setPendingId(null);
    }
  };

  const remove = async (review) => {
    setPendingId(review.id);
    try {
      await deleteReview(review.id);
      toast({ message: 'Avis supprimé.', type: 'success' });
      refreshGiven();
    } catch (err) {
      toast({ message: err?.message || 'Suppression impossible.', type: 'error' });
    } finally {
      setPendingId(null);
    }
  };

  const filters = (searchId) => (
    <AdminFilterPanel dirty={dirty} onReset={resetFilters}>
      <div className="divide-y divide-gray-100">
        {/* L'origine est un filtre et non un onglet : les deux listes partagent
            la recherche, la note et le tri. En onglet, ces filtres
            s'appliqueraient à une seule moitié de l'écran sans le dire, et le
            retour à la première page serait perdu à chaque changement. */}
        <AdminFilterGroup title="Origine">
          <CustomSelect
            value={origin}
            onChange={changeFilter(setOrigin)}
            options={ORIGIN_OPTIONS}
            className="w-full"
            aria-label="Origine des avis"
          />
        </AdminFilterGroup>

        <AdminFilterGroup title="Recherche">
          <SearchInput
            id={searchId}
            value={q}
            onChange={(e) => changeFilter(setQ)(e.target.value)}
            onClear={() => changeFilter(setQ)('')}
            placeholder="Professional ou client..."
            aria-label="Rechercher dans mes avis"
          />
        </AdminFilterGroup>

        <AdminFilterGroup title="Note">
          <CustomSelect
            value={rating}
            onChange={changeFilter(setRating)}
            options={RATING_OPTIONS}
            className="w-full"
            aria-label="Filtrer par note"
          />
        </AdminFilterGroup>

        <AdminFilterGroup title="Trier par">
          <CustomSelect
            value={sort}
            onChange={changeFilter(setSort)}
            options={SORT_OPTIONS}
            className="w-full"
            aria-label="Trier les avis"
          />
        </AdminFilterGroup>
      </div>
    </AdminFilterPanel>
  );

  return (
    <div className="space-y-4">
      <h3 className="text-base font-bold text-gray-900">Mes avis</h3>

      <AccountSectionLayout
        ariaLabel="de mes avis"
        rightContainer={rightContainer}
        searchId="pro-reviews-search"
        filters={filters}
      >
        {isRecus ? (
          received.loading ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : received.error ? (
            <DataState error={received.error} onRetry={received.reload} />
          ) : visibleReceived.length === 0 ? (
            <EmptyState
              title={dirty ? 'Aucun avis ne correspond' : 'Aucun avis pour le moment'}
              description={
                dirty
                  ? 'Aucun avis reçu ne correspond à ces filtres.'
                  : 'Les avis laissés par vos clients apparaîtront ici.'
              }
            />
          ) : (
            <>
              <ul className="space-y-3">
                {visibleReceived.map((review) => (
                  <li key={review.id}>
                    <ReviewCard
                      id={review.id}
                      name={clientName(review)}
                      avatarUrl={review.client?.avatarUrl}
                      rating={review.rating}
                      comment={review.comment}
                      createdAt={review.createdAt}
                      reported={reportedIds.includes(review.id)}
                      onReport={() => setReportingId(review.id)}
                    />
                  </li>
                ))}
              </ul>

              {/* L'avertissement ne s'affiche qu'au-delà d'une page : sans lui,
                  la liste est censée tout montrer, et le signaler serait une
                  information fausse. */}
              {truncated && visibleReceivedCount > PAGE_SIZE && (
                <>
                  <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                    Seuls les {FETCH_LIMIT} avis les plus récents sont chargés : la
                    recherche et le tri portent sur cette portion.
                  </p>
                  <Pagination
                    page={page}
                    pageSize={PAGE_SIZE}
                    total={visibleReceivedCount}
                    onPageChange={setPage}
                    variant="summary"
                    className={PAGINATION_BAR}
                  />
                </>
              )}
            </>
          )
        ) : given.loading ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : given.error ? (
          <DataState error={given.error} onRetry={given.reload} />
        ) : givenItems.length === 0 ? (
          <EmptyState
            title={dirty ? 'Aucun avis ne correspond' : 'Aucun avis déposé'}
            description={
              dirty
                ? 'Aucun avis déposé ne correspond à ces filtres.'
                : 'Les avis que vous laissez aux autres professionnels apparaîtront ici.'
            }
          />
        ) : (
          <>
            <ul className="space-y-3">
              {givenItems.map((review) => (
                <li key={review.id}>
                  <ReviewCard
                    id={review.id}
                    name={review.professionalName}
                    avatarUrl={review.professionalAvatarUrl}
                    tradeName={review.professionalTrade}
                    rating={review.rating}
                    comment={review.comment}
                    createdAt={review.createdAt}
                    isHidden={review.isHidden}
                    pending={pendingId === review.id}
                    onEdit={() => setEditingId(review.id)}
                    onToggleHidden={() => toggleHidden(review)}
                    onDelete={() => remove(review)}
                  />
                </li>
              ))}
            </ul>

            <Pagination
              page={given.data?.page ?? 1}
              pageSize={PAGE_SIZE}
              total={givenTotal}
              onPageChange={setPage}
              variant="summary"
              className={PAGINATION_BAR}
            />
          </>
        )}
      </AccountSectionLayout>

      {/* Retirer l'avis est une décision d'administration, pas du professionnel :
          le signalement ne produit aucun effet immédiat, et le formulaire le
          dit pour ne pas laisser croire à un retrait automatique. */}
      <ReportDialog
        open={reportingId != null}
        onClose={() => setReportingId(null)}
        title="Signaler cet avis"
        description="Votre signalement est transmis à l’administration."
        reasonOptions={REVIEW_REPORT_REASON_OPTIONS}
        reasonLabel="Motif du signalement"
        reasonHelp="Le motif aide l’administration à traiter le signalement."
        notice="L’avis reste visible en attendant la décision. Seul un administrateur peut le retirer."
        successMessage="Avis signalé. Merci."
        submitLabel="Signaler cet avis"
        submit={async (payload) => {
          const id = reportingId;
          await reportReview(id, payload);
          setReportedIds((prev) => [...prev, id]);
        }}
      />

      <Dialog open={editingId != null} onOpenChange={(o) => !o && setEditingId(null)}>
        <DialogContent className="max-w-lg p-5" onClose={() => setEditingId(null)}>
          <DialogHeader>
            <DialogTitle>Modifier mon avis</DialogTitle>
            <DialogDescription>{editing?.professionalName}</DialogDescription>
          </DialogHeader>
          {editing && (
            <ReviewForm
              review={editing}
              professionalId={editing.professionalId}
              onSuccess={() => {
                setEditingId(null);
                refreshGiven();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}