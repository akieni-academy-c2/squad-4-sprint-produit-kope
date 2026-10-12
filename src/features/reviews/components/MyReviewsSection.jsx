import { useState } from 'react';
import { Eye, EyeOff, Pencil, Trash2 } from 'lucide-react';
import { useAsyncData } from '@/shared/hooks/useAsyncData.js';
import { Card } from '@/shared/components/ui/Card.jsx';
import { Badge } from '@/shared/components/ui/Badge.jsx';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/shared/components/ui/Dialog.jsx';
import { StarRating } from '@/shared/components/ui/StarRating.jsx';
import { CustomSelect } from '@/shared/components/ui/CustomSelect.jsx';
import { SearchInput } from '@/shared/components/ui/SearchInput.jsx';
import { DataState } from '@/shared/components/ui/DataState.jsx';
import { EmptyState } from '@/shared/components/ui/EmptyState.jsx';
import { useNotification } from '@/shared/context/NotificationContext.jsx';
import { ReviewForm } from './ReviewForm.jsx';
import { formatDateFr } from '@/shared/utils';
import { AccountSectionLayout } from '@/pages/dashboard/components/AccountSectionLayout.jsx';
import { AdminFilterGroup, AdminFilterPanel } from '@/features/admin/components/AdminSectionLayout.jsx';
import { deleteReview, getMyReviews, setReviewVisibility } from '../services/reviews.service.js';
import { UserAvatar } from '@/shared/components/ui/index.js';

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


export function MyReviewsSection({ rightContainer = null }) {
  const { toast } = useNotification();
  const [q, setQ] = useState('');
  const [rating, setRating] = useState('');
  const [visibility, setVisibility] = useState('all');
  const [reload, setReload] = useState(0);
  const [editingId, setEditingId] = useState(null);
  const [pendingId, setPendingId] = useState(null);

  const { data, loading, error } = useAsyncData(
    () =>
      getMyReviews({
        q: q || undefined,
        rating: rating || undefined,
        visibility,
        pageSize: 50,
      }),
    [q, rating, visibility, reload],
  );
  const items = data?.items ?? [];
  const editing = items.find((r) => r.id === editingId) ?? null;

  const refresh = () => setReload((n) => n + 1);

  // Un filtre est « sale » dès qu'il restreint la liste : c'est ce qui
  // conditionne l'affichage du bouton « Réinitialiser » du panneau.
  const dirty = Boolean(q || rating || visibility !== 'all');

  const resetFilters = () => {
    setQ('');
    setRating('');
    setVisibility('all');
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
            onChange={(e) => setQ(e.target.value)}
            onClear={() => setQ('')}
            placeholder="Professionnel ou texte..."
            aria-label="Rechercher dans mes avis"
          />
        </AdminFilterGroup>

        <AdminFilterGroup title="Note">
          <CustomSelect
            value={rating}
            onChange={setRating}
            options={RATING_OPTIONS}
            className="w-full"
            aria-label="Filtrer par note"
          />
        </AdminFilterGroup>

        <AdminFilterGroup title="Visibilité">
          <CustomSelect
            value={visibility}
            onChange={setVisibility}
            options={VISIBILITY_OPTIONS}
            className="w-full"
            aria-label="Filtrer par visibilité"
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
                q || rating || visibility !== 'all'
                  ? 'Aucun avis ne correspond à ces filtres.'
                  : 'Les avis que vous laissez aux professionnels apparaîtront ici.'
              }
            />
          ) : (
            <ul className="space-y-3">
              {items.map((review) => (
                <li key={review.id}>
                  <Card className={`p-4 ${review.isHidden ? 'opacity-70' : ''}`}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <div>
                          
                        <UserAvatar className="w-8 h-8" src={review.professionalAvatar} alt={review.professionalName} />
                        <p className="truncate font-semibold text-gray-900">{review.professionalName}</p>
                        </div>
                        {review.isHidden && (
                          <Badge variant="neutral" size="sm">
                            Masqué
                          </Badge>
                        )}
                      </div>
                      <span className="inline-flex items-center gap-1.5">
                        <StarRating value={review.rating} size="sm" />
                        <span className="text-sm text-gray-500">{review.rating}/5</span>
                      </span>
                    </div>

                    {review.comment && (
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-600">{review.comment}</p>
                    )}

                    <div className='flex items-center justify-between border-t border-gray-200 pt-3 mt-3'>
                      <p className=" text-xs text-gray-400">{formatDateFr(review.createdAt)}</p>


                      <div className=" w-fit flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-200/20 p-1">
                        <button
                          type="button"
                          onClick={() => setEditingId(review.id)}
                          title="Modifier"
                          aria-label={`Modifier l'avis sur ${review.professionalName}`}
                          className="cursor-pointer rounded p-1.5 text-gray-600 transition hover:bg-white hover:text-primary-600 focus-ring"
                        >
                          <Pencil size={16} aria-hidden />
                        </button>

                        <span aria-hidden className="h-4 w-px bg-gray-300" />

                        <button
                          type="button"
                          disabled={pendingId === review.id}
                          onClick={() => toggleHidden(review)}
                          title={review.isHidden ? 'Réafficher' : 'Masquer'}
                          aria-label={
                            review.isHidden
                              ? `Réafficher l'avis sur ${review.professionalName}`
                              : `Masquer l'avis sur ${review.professionalName}`
                          }
                          className="cursor-pointer rounded p-1.5 text-gray-600 transition hover:bg-white hover:text-primary-600 disabled:cursor-not-allowed disabled:opacity-50 focus-ring"
                        >
                          {review.isHidden ? <Eye size={16} aria-hidden /> : <EyeOff size={16} aria-hidden />}
                        </button>

                        <span aria-hidden className="h-4 w-px bg-gray-300" />

                        <button
                          type="button"
                          disabled={pendingId === review.id}
                          onClick={() => remove(review)}
                          title="Supprimer"
                          aria-label={`Supprimer l'avis sur ${review.professionalName}`}
                          className="cursor-pointer rounded p-1.5 text-gray-500 transition hover:bg-white hover:text-danger-500 disabled:cursor-not-allowed disabled:opacity-50 focus-ring"
                        >
                          <Trash2 size={16} aria-hidden />
                        </button>
                      </div>
                    </div>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </DataState>
      </AccountSectionLayout>

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
                refresh();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
