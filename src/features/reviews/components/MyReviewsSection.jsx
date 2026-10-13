import { useState } from 'react';
import { useAsyncData } from '@/shared/hooks/useAsyncData.js';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/shared/components/ui/Dialog.jsx';
import { CustomSelect } from '@/shared/components/ui/CustomSelect.jsx';
import { SearchInput } from '@/shared/components/ui/SearchInput.jsx';
import { DataState } from '@/shared/components/ui/DataState.jsx';
import { EmptyState } from '@/shared/components/ui/EmptyState.jsx';
import { useNotification } from '@/shared/context/NotificationContext.jsx';
import { ReviewForm } from './ReviewForm.jsx';
import { ReviewCard } from './ReviewCard.jsx';
import { AccountSectionLayout } from '@/pages/dashboard/components/AccountSectionLayout.jsx';
import { AdminFilterGroup, AdminFilterPanel } from '@/features/admin/components/AdminSectionLayout.jsx';
import { deleteReview, getMyReviews, setReviewVisibility } from '../services/reviews.service.js';
import { PAGINATION_BAR, Pagination } from '@/shared/components/ui/Pagination.jsx';

// Page assez courte pour que la liste reste lisible sans défilement interminable,
// assez longue pour ne pas faire sautiller la pagination sur un écran de bureau.
const PAGE_SIZE = 10;

const VISIBILITY_OPTIONS = [
  { value: 'all', label: 'Tous mes avis' },
  { value: 'visible', label: 'Visibles seulement' },
  { value: 'hidden', label: 'Masqués seulement' },
];

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


export function MyReviewsSection({ rightContainer = null }) {
  const { toast } = useNotification();
  const [q, setQ] = useState('');
  const [rating, setRating] = useState('');
  const [visibility, setVisibility] = useState('all');
  const [sort, setSort] = useState('recent');
  const [page, setPage] = useState(1);
  const [reload, setReload] = useState(0);
  const [editingId, setEditingId] = useState(null);
  const [pendingId, setPendingId] = useState(null);

  const { data, loading, error } = useAsyncData(
    () =>
      getMyReviews({
        page,
        pageSize: PAGE_SIZE,
        q: q || undefined,
        rating: rating || undefined,
        visibility,
        sort,
      }),
    [page, q, rating, visibility, sort, reload],
  );
  const total = data?.total ?? 0;

  // Changer un filtre ramène en première page : rester sur la page 3 d'un
  // résultat filtré affiche un vide alors que des avis existent.
  const changeFilter = (setter) => (value) => {
    setter(value);
    setPage(1);
  };
  const items = data?.items ?? [];
  const editing = items.find((r) => r.id === editingId) ?? null;

  const refresh = () => setReload((n) => n + 1);

  // Un filtre est « sale » dès qu'il restreint la liste : c'est ce qui
  // conditionne l'affichage du bouton « Réinitialiser » du panneau.
  const dirty = Boolean(q || rating || visibility !== 'all' || sort !== 'recent');

  const resetFilters = () => {
    setQ('');
    setRating('');
    setVisibility('all');
    setSort('recent');
    setPage(1);
  };

  const toggleHidden = async (review) => {
    setPendingId(review.id);
    try {
      await setReviewVisibility(review.id, !review.isHidden);
      toast({
        message: review.isHidden ? 'Avis réaffiché.' : 'Avis masqué de la fiche publique.',
        type: 'success',
      });
      refresh();
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
      refresh();
    } catch (err) {
      toast({ message: err?.message || 'Suppression impossible.', type: 'error' });
    } finally {
      setPendingId(null);
    }
  };

  const filters = (searchId) => (
    <AdminFilterPanel dirty={dirty} onReset={resetFilters}>
      <div className="divide-y divide-gray-100">
        <AdminFilterGroup title="Recherche">
          <SearchInput
            id={searchId}
            value={q}
            onChange={(e) => changeFilter(setQ)(e.target.value)}
            onClear={() => changeFilter(setQ)('')}
            placeholder="Professionnel ou texte..."
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

        <AdminFilterGroup title="Visibilité">
          <CustomSelect
            value={visibility}
            onChange={changeFilter(setVisibility)}
            options={VISIBILITY_OPTIONS}
            className="w-full"
            aria-label="Filtrer par visibilité"
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
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-extrabold tracking-tight text-gray-900">Mes avis</h2>
        <p className="mt-1 text-sm text-gray-600">
          Modifiez, masquez ou retirez un avis.
        </p>
      </div>

      <AccountSectionLayout
        ariaLabel="de mes avis"
        rightContainer={rightContainer}
        searchId="my-reviews-search"
        filters={filters}
      >

        <DataState loading={loading} error={error} errorPrefix="Impossible de charger vos avis">
          {items.length === 0 ? (
            <EmptyState
              title="Aucun avis"
              description={
                dirty
                  ? 'Aucun avis ne correspond à ces filtres.'
                  : 'Les avis que vous laissez aux professionnels apparaîtront ici.'
              }
            />
          ) : (
            <>
            <ul className="space-y-3">
              {items.map((review) => (
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
              page={data?.page ?? 1}
              pageSize={PAGE_SIZE}
              total={total}
              onPageChange={setPage}
              variant="summary"
              className={PAGINATION_BAR}
            />
            </>
          )}
        </DataState>
      </AccountSectionLayout>

      <Dialog open={editingId != null} onOpenChange={(o) => !o && setEditingId(null)}>
        <DialogContent className="max-w-2xl p-5" onClose={() => setEditingId(null)}>
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
                refresh();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
