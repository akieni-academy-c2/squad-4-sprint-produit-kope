import { StarRating } from '@/shared/components/ui/StarRating.jsx';
import { formatDateFr } from '@/shared/utils';
import { useClientReviewsExpansion } from '../hooks/useClientReviewsExpansion.js';
import { ReviewAuthor } from './ReviewAuthor.jsx';

/**
 * Ligne « les autres avis de cet auteur » : utilisée quand un avis
 * provient d'un client ayant déjà évalué d'autres professionnels.
 */
export function ReviewAuthorHistory({ review }) {
  const { expanded, items, toggle } = useClientReviewsExpansion();

  if (review.clientId == null) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => toggle(review.clientId)}
        className="text-xs font-bold text-primary-500 hover:underline"
      >
        {expanded === review.clientId ? 'Masquer les avis de ce client' : 'Voir tous les avis de ce client'}
      </button>

      {expanded === review.clientId && (
        <ul className="mt-2 space-y-2 border-t border-gray-100 pt-2">
          {items.map((other) => (
            <li key={other.id} className="text-xs text-gray-600">
              Sur « {other.professionalName} » : <span className="font-semibold text-gray-900">★ {other.rating}/5</span>{' '}
              {other.comment ? `- ${other.comment}` : ''}
            </li>
          ))}
          {items.length === 0 && <li className="text-xs text-gray-400">Aucun autre avis.</li>}
        </ul>
      )}
    </>
  );
}

export function ReviewCardHeader({ review }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <ReviewAuthor review={review} />
      <div className="flex items-center gap-2 text-xs">
        <StarRating value={review.rating} size="sm" />
        <span className="text-gray-400">·</span>
        <span className="text-gray-500">{formatDateFr(review.createdAt)}</span>
      </div>
    </div>
  );
}