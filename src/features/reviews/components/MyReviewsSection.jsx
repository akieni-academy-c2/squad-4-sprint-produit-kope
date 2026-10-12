import { useState } from 'react';
import { EyeOff, Pencil, Trash2 } from 'lucide-react';
import { useAsyncData } from '@/shared/hooks/useAsyncData.js';
import { Button } from '@/shared/components/ui/Button.jsx';
import { Card } from '@/shared/components/ui/Card.jsx';
import { Badge } from '@/shared/components/ui/Badge.jsx';
import { StarInput, StarRating } from '@/shared/components/ui/StarRating.jsx';
import { Textarea } from '@/shared/components/ui/Textarea.jsx';
import { CustomSelect } from '@/shared/components/ui/CustomSelect.jsx';
import { SearchInput } from '@/shared/components/ui/SearchInput.jsx';
import { DataState } from '@/shared/components/ui/DataState.jsx';
import { EmptyState } from '@/shared/components/ui/EmptyState.jsx';
import { useNotification } from '@/shared/context/NotificationContext.jsx';
import { formatDateFr } from '@/shared/utils';
import { AccountSectionLayout } from '@/pages/dashboard/components/AccountSectionLayout.jsx';
import { AdminFilterGroup, AdminFilterPanel } from '@/features/admin/components/AdminSectionLayout.jsx';
import {
  deleteReview,
  getMyReviews,
  setReviewVisibility,
  updateReview,
} from '../services/reviews.service.js';

const MAX = 300;

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

/** Ligne en cours de correction : note et texte, comme au dépôt. */
function EditRow({ review, onCancel, onSaved }) {
  const { toast } = useNotification();
  const [rating, setRating] = useState(review.rating);
  const [comment, setComment] = useState(review.comment ?? '');
  const [saving, setSaving] = useState(false);

  const tooLong = comment.length > MAX;

  const save = async (e) => {
    e.preventDefault();
    if (tooLong) return;
    setSaving(true);
    try {
      await updateReview(review.id, { rating, comment: comment.trim() || null });
      toast({ message: 'Avis mis à jour.', type: 'success' });
      onSaved();
    } catch (err) {
      toast({ message: err?.message || 'Impossible de modifier cet avis.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save} className="space-y-3 border-t border-gray-100 pt-4" noValidate>
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-gray-600">Note</label>
        <StarInput value={rating} onChange={setRating} size="md" count={5} />
      </div>
      <Textarea
        rows={3}
        value={comment}
        onChange={(e) => setComment(e.target.value.slice(0, MAX + 10))}
        placeholder="Votre commentaire"
        aria-label="Modifier le commentaire"
      />
      <div className="flex items-center justify-between gap-3">
        <span className={tooLong ? 'text-xs font-semibold text-danger-500' : 'text-xs text-gray-400'}>
          {comment.length}/{MAX}
        </span>
        <div className="flex gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            Annuler
          </Button>
          <Button type="submit" size="sm" loading={saving} disabled={tooLong || rating < 1}>
            Enregistrer
          </Button>
        </div>
      </div>
    </form>
  );
}

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
          Corrigez, masquez ou retirez un avis que vous avez déposé. Un avis masqué reste
          dans cette liste et disparaît seulement de la fiche du professionnel.
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
                      <p className="truncate font-semibold text-gray-900">{review.professionalName}</p>
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
                  <p className="mt-1 text-xs text-gray-400">{formatDateFr(review.createdAt)}</p>

                  {editingId === review.id ? (
                    <EditRow
                      review={review}
                      onCancel={() => setEditingId(null)}
                      onSaved={() => {
                        setEditingId(null);
                        refresh();
                      }}
                    />
                  ) : (
                    <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingId(review.id)}
                        className="text-gray-600 hover:bg-gray-100"
                      >
                        <Pencil size={16} aria-hidden />
                        Modifier
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        loading={pendingId === review.id}
                        onClick={() => toggleHidden(review)}
                        className="text-gray-600 hover:bg-gray-100"
                      >
                        <EyeOff size={16} aria-hidden />
                        {review.isHidden ? 'Réafficher' : 'Masquer'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        loading={pendingId === review.id}
                        onClick={() => remove(review)}
                        className="text-gray-500 hover:bg-rose-50 hover:text-danger-500"
                      >
                        <Trash2 size={16} aria-hidden />
                        Supprimer
                      </Button>
                    </div>
                  )}
                </Card>
              </li>
            ))}
          </ul>
        )}
      </DataState>
      </AccountSectionLayout>
    </div>
  );
}