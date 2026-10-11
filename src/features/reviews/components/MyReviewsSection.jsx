import { useAsyncData } from '@/shared/hooks/useAsyncData.js';
import { DataState } from '@/shared/components/ui/DataState.jsx';
import { EmptyState } from '@/shared/components/ui/EmptyState.jsx';
import { StarRating } from '@/shared/components/ui/StarRating.jsx';
import { formatDateFr } from '@/shared/utils';
import { getMyReviews } from '../services/reviews.service.js';

export function MyReviewsSection() {
  const { data, loading, error } = useAsyncData(async () => getMyReviews(), []);
  const items = data?.items ?? [];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-extrabold tracking-tight text-gray-900">Mes avis</h2>
      <DataState loading={loading} error={error} errorPrefix="Impossible de charger vos avis">
        {items.length === 0 ? (
          <EmptyState
            title="Aucun avis pour le moment"
            description="Les avis que vous laissez aux professionnels apparaîtront ici pour garder un historique."
          />
        ) : (
          <ul className="space-y-3">
            {items.map((review) => (
              <li key={review.id} className="rounded-2xl border border-gray-200 bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-gray-900">{review.professionalName}</p>
                  <span className="inline-flex items-center gap-1.5">
                    <StarRating value={review.rating} size="sm" />
                    <span className="text-sm text-gray-500">{review.rating}/5</span>
                  </span>
                </div>
                {review.comment && <p className="mt-2 text-sm leading-6 text-gray-600">{review.comment}</p>}
                <p className="mt-1 text-xs text-gray-400">{formatDateFr(review.createdAt)}</p>
              </li>
            ))}
          </ul>
        )}
      </DataState>
    </div>
  );
}