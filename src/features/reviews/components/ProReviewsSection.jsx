import { useMemo, useState } from 'react';
import { useAsyncData } from '@/shared/hooks/useAsyncData.js';
import { Card } from '@/shared/components/ui/Card.jsx';
import { CustomSelect } from '@/shared/components/ui/CustomSelect.jsx';
import { SearchInput } from '@/shared/components/ui/SearchInput.jsx';
import { DataState } from '@/shared/components/ui/DataState.jsx';
import { EmptyState } from '@/shared/components/ui/EmptyState.jsx';
import { Skeleton } from '@/shared/components/ui/Skeleton.jsx';
import { UserAvatar } from '@/shared/components/ui/UserAvatar.jsx';
import { fullNameInitials } from '@/shared/utils';
import { REVIEW_REPORT_REASON_OPTIONS } from '@/shared/constants/reports.js';
import { listReviews } from '../services/reviews.service.js';
import { reportReview } from '@/features/reports/services/reports.service.js';
import { ReportDialog } from '@/features/reports/components/ReportDialog.jsx';
import { ReviewAuthorHistory } from './ReviewCardHeader.jsx';
import { AccountSectionLayout } from '@/pages/dashboard/components/AccountSectionLayout.jsx';
import { AdminFilterGroup, AdminFilterPanel } from '@/features/admin/components/AdminSectionLayout.jsx';

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

// Plafond de la liste chargée. Ces avis sont ceux de la fiche publique, dont
// l'endpoint n'a pas de filtres : tout est donc filtré et trié côté client sur
// la page téléchargée. Au-delà de ce nombre, les résultats seraient filtrés
// sur un sous-ensemble en silence — un professionnel qui filtre ses avis
// croirait voir « aucun avis 1 étoile » alors que les plus anciens n'ont pas
// été chargés. La limite est donc affichée quand elle est atteinte.
const FETCH_LIMIT = 100;

const clientName = (review) =>
  review.client?.displayName ||
  fullNameInitials(review.client?.firstName, review.client?.lastName) ||
  'Client';

/**
 * Onglet « Mes avis » de l'espace professionnel : les avis reçus, filtrables,
 * avec l'historique des autres avis du même client.
 */
export function ProReviewsSection({ professionalId, rightContainer = null }) {
  // `error` est indispensable : sans lui, un échec réseau affichait « Aucun
  // avis pour le moment », faisant croire que le professionnel n'a aucun avis
  // alors que la liste n'a simplement pas pu être chargée.
  const { data, loading, error, reload } = useAsyncData(async () => {
    if (!professionalId) return null;
    return listReviews(professionalId, { pageSize: FETCH_LIMIT });
  }, [professionalId]);

  const [q, setQ] = useState('');
  const [rating, setRating] = useState('');
  const [sort, setSort] = useState('recent');
  const [reportingId, setReportingId] = useState(null);
  const [reportedIds, setReportedIds] = useState([]);

  const dirty = Boolean(q || rating || sort !== 'recent');

  const resetFilters = () => {
    setQ('');
    setRating('');
    setSort('recent');
  };

  // Mémoïsé : sans cela, `items` serait un nouveau tableau à chaque rendu et
  // le `useMemo` du filtrage se recalculerait à chaque frappe ailleurs.
  const items = useMemo(() => data?.items ?? [], [data]);
  // `data.total` est le nombre réel côté serveur ; le dépassement se voit
  // dans le nombre renvoyé, pas dans le champ `total`.
  const truncated = items.length >= FETCH_LIMIT;

  const visible = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let rows = needle
      ? items.filter(
          (r) =>
            clientName(r).toLowerCase().includes(needle) ||
            (r.comment || '').toLowerCase().includes(needle),
        )
      : items;

    if (rating) rows = rows.filter((r) => String(r.rating) === rating);

    return [...rows].sort(SORTERS[sort] ?? SORTERS.recent);
  }, [items, q, rating, sort]);

  const filters = (searchId) => (
    <AdminFilterPanel dirty={dirty} onReset={resetFilters}>
      <div className="divide-y divide-gray-100">
        <AdminFilterGroup title="Recherche">
          <SearchInput
            id={searchId}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onClear={() => setQ('')}
            placeholder="Client ou texte de l’avis..."
            aria-label="Rechercher dans mes avis reçus"
          />
        </AdminFilterGroup>

        <AdminFilterGroup title="Note">
          <CustomSelect
            value={rating}
            onChange={setRating}
            options={RATING_OPTIONS}
            className="w-full"
            aria-label="Filtrer par note reçue"
          />
        </AdminFilterGroup>

        <AdminFilterGroup title="Trier par">
          <CustomSelect
            value={sort}
            onChange={setSort}
            options={SORT_OPTIONS}
            className="w-full"
            aria-label="Trier les avis reçus"
          />
        </AdminFilterGroup>
      </div>
    </AdminFilterPanel>
  );

  return (
    <div className="space-y-4">
      <h3 className="text-base font-bold text-gray-900">Avis reçus</h3>

      <AccountSectionLayout
        ariaLabel="de mes avis reçus"
        rightContainer={rightContainer}
        searchId="pro-reviews-search"
        filters={filters}
      >
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : error ? (
          <DataState error={error} onRetry={reload} />
        ) : visible.length === 0 ? (
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
            {/* L'avertissement ne s'affiche qu'avec les filtres actifs : sans
                eux, la liste est censée tout montrer, et le signaler serait
                une information fausse. */}
            {truncated && dirty && (
              <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                Seuls les {FETCH_LIMIT} avis les plus récents sont chargés : la
                recherche et le tri portent sur cette portion.
              </p>
            )}
            <div className="space-y-3">
              {visible.map((review) => (
                <Card key={review.id} className="space-y-2 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <UserAvatar
                        user={{
                          firstName: review.client?.firstName,
                          lastName: review.client?.lastName,
                          avatarUrl: review.client?.avatarUrl,
                        }}
                        name={clientName(review)}
                        className="h-8 w-8 shrink-0"
                      />
                      <p className="truncate font-semibold text-gray-900">{clientName(review)}</p>
                    </div>
                    <span className="shrink-0 text-sm font-bold text-amber-500">
                      ★ {review.rating}/5
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-sm leading-6 text-gray-600">{review.comment}</p>
                  )}
                  <p className="text-xs text-gray-400">
                    {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                  </p>

                  {/* Signaler l'avis, et rien d'autre : le professionnel
                      consulte et conteste, il ne modifie ni ne supprime. Faire
                      ou refaire un avis sur sa propre fiche n'aurait aucun sens
                      et fausserait sa note moyenne. */}
                  {reportedIds.includes(review.id) ? (
                    <p className="text-xs font-medium text-gray-400">
                      Avis signalé — en attente de traitement
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setReportingId(review.id)}
                      className="cursor-pointer self-start text-xs font-medium text-gray-400 underline-offset-4 transition hover:text-danger-500 hover:underline"
                    >
                      Signaler cet avis
                    </button>
                  )}

                  <ReviewAuthorHistory review={review} />
                </Card>
              ))}
            </div>
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
    </div>
  );
}