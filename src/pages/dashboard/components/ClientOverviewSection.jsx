import { Flag, Phone, Star } from 'lucide-react';
import { useAsyncData } from '@/shared/hooks/useAsyncData.js';
import { KpiCard, StatGroup } from '@/shared/components/ui';
import {
  ContactTile,
  OverviewEmpty,
  ReviewTile,
  TileSkeleton,
} from '@/shared/components/dashboard/ActivityTiles.jsx';
import { getMyReviews } from '@/features/reviews/services/reviews.service.js';
import { getMyContacts } from '@/features/contacts/services/contacts.service.js';
import { getMyReports } from '@/features/reports/services/reports.service.js';

const RECENT_COUNT = 4;


export function ClientOverviewSection({ onNavigate }) {
  const { data, loading, error } = useAsyncData(async () => {
    const [reviews, contacts, reports] = await Promise.all([
      getMyReviews({ pageSize: RECENT_COUNT }),
      getMyContacts({ pageSize: RECENT_COUNT }),
      getMyReports({ pageSize: RECENT_COUNT }),
    ]);
    return {
      reviews: reviews?.items ?? [],
      reviewsTotal: reviews?.total ?? 0,
      contacts: contacts?.items ?? [],
      contactsTotal: contacts?.total ?? 0,
      reportsTotal: reports?.total ?? 0,
    };
  }, []);


  const recentReviews = data?.reviews ?? [];
  const recentContacts = data?.contacts ?? [];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-extrabold tracking-tight text-gray-900">Vue d'ensemble</h2>

      <StatGroup title="Mon activité" tone="mint">
         <div className="grid gap-3 sm:grid-cols-3">
          <KpiCard
            label="Avis déposés"
            value={loading ? '-' : data?.reviewsTotal ?? 0}
            hint="Modifiables et masquables"
            icon={<Star size={12} aria-hidden />}
            onClick={() => onNavigate?.('avis')}
          />
          <KpiCard
            label="Professionnels"
            value={loading ? '-' : data?.contactsTotal ?? 0}
            hint="Rencontrés par appel ou WhatsApp"
            icon={<Phone size={12} aria-hidden />}
            onClick={() => onNavigate?.('contacts')}
          />
          <KpiCard
            label="Signalements"
            value={loading ? '-' : data?.reportsTotal ?? 0}
            hint="Suivi de traitement"
            icon={<Flag size={12} aria-hidden />}
            onClick={() => onNavigate?.('signalements')}
          />
        </div>
      </StatGroup>

      <div className="grid gap-4 lg:grid-cols-2 lg:items-stretch">
        <StatGroup title="Derniers avis" className="flex w-full min-w-0 flex-col">
          {loading ? (
            <div className="grid w-full min-w-0 grid-cols-2 content-start gap-2" aria-busy="true">
              {[0, 1].map((i) => (
                <TileSkeleton key={i} />
              ))}
            </div>
          ) : recentReviews.length === 0 ? (
            <OverviewEmpty>Aucun avis déposé pour l'instant.</OverviewEmpty>
          ) : (
            <ul className="grid w-full min-w-0 flex-1 grid-cols-2 content-start gap-2">
              {recentReviews.map((review) => (
                <ReviewTile
                  key={review.id}
                  name={review.professionalName}
                  avatarUrl={review.professionalAvatarUrl}
                  subtitle={review.professionalTrade}
                  rating={review.rating}
                  createdAt={review.createdAt}
                  actionLabel={`Ouvrir mes avis - avis sur ${review.professionalName}`}
                  onClick={() => onNavigate?.('avis')}
                />
              ))}
            </ul>
          )}
        </StatGroup>

        <StatGroup title="Derniers contacts" className="flex w-full min-w-0 flex-col">
          {loading ? (
            <div className="grid w-full min-w-0 grid-cols-2 content-start gap-2" aria-busy="true">
              {[0, 1].map((i) => (
                <TileSkeleton key={i} />
              ))}
            </div>
          ) : recentContacts.length === 0 ? (
            <OverviewEmpty>Aucun professionnel contacté pour l'instant.</OverviewEmpty>
          ) : (
            <ul className="grid w-full min-w-0 flex-1 grid-cols-2 content-start gap-2">
              {recentContacts.map((contact) => (
                <ContactTile
                  key={contact.id}
                  contact={contact}
                  actionLabel={`Ouvrir mes contacts - ${contact.displayName || 'Utilisateur'}`}
                  onClick={() => onNavigate?.('contacts')}
                />
              ))}
            </ul>
          )}
        </StatGroup>
      </div>

      {error && (
        <p className="text-sm text-gray-500">
          L'aperçu n'a pas pu être chargé, mais les sections restent accessibles.
        </p>
      )}
    </div>
  );
}