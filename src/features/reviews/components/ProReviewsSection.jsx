import { useAsyncData } from '@/shared/hooks/useAsyncData.js';
import { Card } from '@/shared/components/ui/Card.jsx';
import { DataState } from '@/shared/components/ui/DataState.jsx';
import { Skeleton } from '@/shared/components/ui/Skeleton.jsx';
import { UserAvatar } from '@/shared/components/ui/UserAvatar.jsx';
import { fullNameInitials } from '@/shared/utils';
import { listReviews } from '../services/reviews.service.js';
import { ReviewAuthorHistory } from './ReviewCardHeader.jsx';

/**
 * Onglet « Mes avis » de l'espace professionnel : les avis reçus,
 * avec l'historique des autres avis du même client.
 */
export function ProReviewsSection({ professionalId }) {
  // `error` est indispensable : sans lui, un échec réseau affichait « Aucun
  // avis pour le moment », faisant croire que le professionnel n'a aucun avis
  // alors que la liste n'a simplement pas pu être chargée.
  const { data, loading, error, reload } = useAsyncData(async () => {
    if (!professionalId) return null;
    return listReviews(professionalId);
  }, [professionalId]);

  const items = data?.items ?? [];

  return (
    <div className="space-y-4">
      <h3 className="text-base font-bold text-gray-900">Avis reçus</h3>
      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : error ? (
        <DataState error={error} onRetry={reload} />
      ) : items.length === 0 ? (
        <Card className="p-6">
          <p className="text-sm text-gray-500">Aucun avis pour le moment.</p>
        </Card>
      ) : (
        items.map((review) => {
          const name =
            review.client?.displayName || fullNameInitials(review.client?.firstName, review.client?.lastName) || 'Client';
          return (
            <Card key={review.id} className="space-y-2 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <UserAvatar
                    user={{
                      firstName: review.client?.firstName,
                      lastName: review.client?.lastName,
                      avatarUrl: review.client?.avatarUrl,
                    }}
                    name={name}
                    className="h-8 w-8"
                  />
                  <p className="font-semibold text-gray-900">{name}</p>
                </div>
                <span className="text-sm font-bold text-amber-500">★ {review.rating}/5</span>
              </div>
              {review.comment && <p className="text-sm leading-6 text-gray-600">{review.comment}</p>}
              <p className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString('fr-FR')}</p>
              <ReviewAuthorHistory review={review} />
            </Card>
          );
        })
      )}
    </div>
  );
}