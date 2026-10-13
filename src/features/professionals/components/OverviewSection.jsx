import { Image as ImageIcon, MapPin, Phone, Star } from 'lucide-react';
import { useAsyncData } from '@/shared/hooks/useAsyncData.js';
import { KpiCard, StatGroup } from '@/shared/components/ui';
import {
  ContactTile,
  OverviewEmpty,
  ReviewTile,
  TileSkeleton,
} from '@/shared/components/dashboard/ActivityTiles.jsx';
import { getMyContacts } from '@/features/contacts/services/contacts.service.js';
import { listReviews } from '@/features/reviews/services/reviews.service.js';

const RECENT_COUNT = 4;

/**
 * Vue d'ensemble de l'espace professionnel.
 *
 * Même construction que celle du client : des compteurs qui ouvrent la section
 * qu'ils résument, puis les dernières lignes de chaque section. Un aperçu
 * n'a pas à avoir deux rendus — celui du professionnel montrait quatre tuiles
 * statiques, sans aucun chiffre qui réponde à « où en suis-je ? » : ni mes
 * contacts, ni mes avis.
 */
export function OverviewSection({ profile, onNavigate }) {
  const professionalId = profile?.id;

  const { data, loading } = useAsyncData(async () => {
    if (!professionalId) return null;
    const [contacts, received] = await Promise.all([
      getMyContacts({ pageSize: RECENT_COUNT }),
      listReviews(professionalId, { pageSize: RECENT_COUNT }),
    ]);
    return {
      contacts: contacts?.items ?? [],
      contactsTotal: contacts?.total ?? 0,
      reviews: received?.items ?? [],
      reviewsTotal: received?.total ?? 0,
    };
  }, [professionalId]);

  const recentContacts = data?.contacts ?? [];
  const recentReviews = data?.reviews ?? [];

  return (
    <div className="space-y-4">
      <StatGroup title="Mon activité" tone="mint">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            label="Réalisations"
            value={profile?.photoCount ?? profile?.photos?.length ?? 0}
            hint="Photos de vos travaux"
            icon={<ImageIcon size={12} aria-hidden />}
            onClick={() => onNavigate?.('photos')}
          />
          <KpiCard
            label="Zones"
            value={profile?.zones?.length ?? 0}
            hint={profile?.cityName || 'Ville non renseignée'}
            icon={<MapPin size={12} aria-hidden />}
            onClick={() => onNavigate?.('profil')}
          />
          <KpiCard
            label="Contacts"
            value={loading ? '–' : data?.contactsTotal ?? 0}
            hint="Clients et professionnels"
            icon={<Phone size={12} aria-hidden />}
            onClick={() => onNavigate?.('contacts')}
          />
          <KpiCard
            label="Avis reçus"
            value={loading ? '–' : data?.reviewsTotal ?? 0}
            hint="Note moyenne et avis"
            icon={<Star size={12} aria-hidden />}
            onClick={() => onNavigate?.('avis')}
          />
        </div>
      </StatGroup>

      <div className="grid gap-4 lg:grid-cols-2 lg:items-stretch">
        <StatGroup title="Derniers avis reçus" className="flex w-full min-w-0 flex-col">
          {loading ? (
            <div className="grid w-full min-w-0 grid-cols-2 content-start gap-2" aria-busy="true">
              {[0, 1].map((i) => (
                <TileSkeleton key={i} />
              ))}
            </div>
          ) : recentReviews.length === 0 ? (
            <OverviewEmpty>Aucun avis reçu pour l'instant.</OverviewEmpty>
          ) : (
            <ul className="grid w-full min-w-0 flex-1 grid-cols-2 content-start gap-2">
              {recentReviews.map((review) => (
                <ReviewTile
                  key={review.id}
                  name={
                    review.client?.displayName ||
                    [review.client?.firstName, review.client?.lastName].filter(Boolean).join(' ') ||
                    'Client'
                  }
                  avatarUrl={review.client?.avatarUrl}
                  subtitle={review.comment}
                  rating={review.rating}
                  createdAt={review.createdAt}
                  actionLabel={`Ouvrir mes avis — avis reçu`}
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
            <OverviewEmpty>Aucun contact pour l'instant.</OverviewEmpty>
          ) : (
            <ul className="grid w-full min-w-0 flex-1 grid-cols-2 content-start gap-2">
              {recentContacts.map((contact) => (
                <ContactTile
                  key={contact.id}
                  contact={contact}
                  actionLabel={`Ouvrir mes contacts — ${contact.displayName || 'Utilisateur'}`}
                  onClick={() => onNavigate?.('contacts')}
                />
              ))}
            </ul>
          )}
        </StatGroup>
      </div>
    </div>
  );
}