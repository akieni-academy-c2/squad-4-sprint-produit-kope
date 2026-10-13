import { StarRating } from '@/shared/components/ui/StarRating.jsx';
import { formatDateFr } from '@/shared/utils';
import { ReviewAuthor } from './ReviewAuthor.jsx';

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