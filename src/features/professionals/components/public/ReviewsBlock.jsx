import { RatingSummary } from '@/features/reviews/components/RatingSummary.jsx';
import { ReviewCards } from '@/features/reviews/components/ReviewCards.jsx';


export function ReviewsBlock({ rating, canReview, onLeaveReview, state, onViewAll, headingClassName = '' }) {
  return (
    <>
      <RatingSummary rating={rating} canReview={canReview} onLeaveReview={onLeaveReview} />
      <h2 className={`text-base font-bold text-gray-900 ${headingClassName}`}>Les retours de ses clients</h2>
      <ReviewCards state={state} onViewAll={onViewAll} />
    </>
  );
}