import { Flag, Phone, Star } from 'lucide-react';
import { useAsyncData } from '@/shared/hooks/useAsyncData.js';
import { KpiCard, StatGroup } from '@/shared/components/ui';
import { StarRating } from '@/shared/components/ui/StarRating.jsx';
import { UserAvatar } from '@/shared/components/ui/UserAvatar.jsx';
import { formatDateFr } from '@/shared/utils';
import { getMyReviews } from '@/features/reviews/services/reviews.service.js';
import { getMyContacts } from '@/features/contacts/services/contacts.service.js';
import { getMyReports } from '@/features/reports/services/reports.service.js';

const RECENT_COUNT = 4;

/** État vide des listes : bordure pointillée, comme dans l'espace admin. */
function Empty({ children }) {
  return (
    <p className="rounded-[14px] border border-dashed border-gray-200 bg-[#f7faf8] p-6 text-center text-sm text-gray-500">
      {children}
    </p>
  );
}

function ReviewLine({ review, onClick }) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className="flex w-full cursor-pointer items-center gap-3 rounded-[14px] border border-[#e2e8e5] bg-white p-3 text-left transition hover:border-primary-200 hover:shadow-sm focus-ring"
      >
        <UserAvatar
          src={review.professionalAvatarUrl}
          name={review.professionalName}
          className="h-10 w-10 shrink-0"
          iconSize={18}
          fallbackClassName="bg-primary-100 text-primary-700"
        />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-gray-900">
            {review.professionalName}
          </span>
          {/* Métier puis extrait de l'avis : le couple nom + métier identifie la
              fiche, le commentaire donne la raison de la ligne. */}
          <span className="mt-0.5 block truncate text-xs text-gray-500">
            {review.professionalTrade}
            {review.professionalTrade && review.comment ? ' · ' : ''}
            {review.comment}
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-1.5">
          <StarRating value={review.rating} size="sm" />
          <span className="text-xs text-gray-400">{formatDateFr(review.createdAt)}</span>
        </span>
      </button>
    </li>
  );
}

function ContactLine({ contact, onClick }) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className="flex w-full cursor-pointer items-center gap-3 rounded-[14px] border border-[#e2e8e5] bg-white p-3 text-left transition hover:border-primary-200 hover:shadow-sm focus-ring"
      >
        <UserAvatar
          user={{ firstName: contact.firstName, lastName: contact.lastName }}
          src={contact.avatarUrl}
          name={contact.displayName}
          className="h-10 w-10 shrink-0"
          iconSize={18}
          fallbackClassName="bg-primary-100 text-primary-700"
        />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-gray-900">
            {contact.displayName || 'Utilisateur'}
          </span>
          <span className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-gray-500">
            {contact.tradeName && <span className="truncate">{contact.tradeName}</span>}
            {contact.phone && (
              <>
                {contact.tradeName && <span aria-hidden>·</span>}
                <Phone size={12} className="shrink-0" aria-hidden />
                <span className="truncate">{contact.phone}</span>
              </>
            )}
          </span>
        </span>
        <span className="shrink-0 text-xs text-gray-400">{formatDateFr(contact.createdAt)}</span>
      </button>
    </li>
  );
}

/**
 * Vue d'ensemble du compte client.
 *
 * Même rythme que la vue d'ensemble de l'administration : des groupes titrés
 * (`StatGroup`) qui ouvrent la section qu'ils résument. Trois compteurs pour
 * savoir si une section mérite qu'on y aille, puis les dernières lignes de
 * chaque section pour voir de quoi il s'agit sans changer d'onglet.
 */
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

  // La limite est déjà portée par `pageSize` : le serveur ne renvoie que
  // RECENT_COUNT lignes. Le `slice` serait une seconde règle à maintenir.
  const recentReviews = data?.reviews ?? [];
  const recentContacts = data?.contacts ?? [];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-extrabold tracking-tight text-gray-900">Vue d'ensemble</h2>

      <StatGroup title="Mon activité">
        {/* Colonne et non rangée : chaque compteur porte une phrase qui ne
            tient pas sur un tiers de largeur. */}
        <div className="grid gap-3 sm:grid-cols-3">
          <KpiCard
            label="Avis déposés"
            value={loading ? '–' : data?.reviewsTotal ?? 0}
            hint="Modifiables et masquables"
            icon={<Star size={12} aria-hidden />}
            onClick={() => onNavigate?.('avis')}
          />
          <KpiCard
            label="Professionnels rencontrés"
            value={loading ? '–' : data?.contactsTotal ?? 0}
            hint="Appels et messages WhatsApp"
            icon={<Phone size={12} aria-hidden />}
            onClick={() => onNavigate?.('contacts')}
          />
          <KpiCard
            label="Signalements"
            value={loading ? '–' : data?.reportsTotal ?? 0}
            hint="Suivi de traitement"
            icon={<Flag size={12} aria-hidden />}
            onClick={() => onNavigate?.('signalements')}
          />
        </div>
      </StatGroup>

      {/* Sur desktop, les deux listes se répondent côte à côte : on compare d'un
          coup d'œil ses avis et ses contacts. En dessous, elles s'empilent —
          deux colonnes de lignes tronquées n'apporteraient rien. */}
      <div className="grid gap-4 lg:grid-cols-2 lg:items-stretch">
        <StatGroup title="Derniers avis" className="flex flex-col">
          {loading ? (
            <div className="space-y-2" aria-busy="true">
              {[0, 1].map((i) => (
                <div key={i} className="h-[66px] animate-pulse rounded-[14px] border border-[#e2e8e5] bg-white" />
              ))}
            </div>
          ) : recentReviews.length === 0 ? (
            <Empty>Aucun avis déposé pour l'instant.</Empty>
          ) : (
            // `flex-1` sur la liste : sans elle, le groupe le plus court gardait
            // sa hauteur naturelle et les deux cadres ne s'alignaient pas.
            <ul className="flex-1 space-y-2">
              {recentReviews.map((review) => (
                <ReviewLine
                  key={review.id}
                  review={review}
                  onClick={() => onNavigate?.('avis')}
                />
              ))}
            </ul>
          )}
        </StatGroup>

        <StatGroup title="Derniers contacts" className="flex flex-col">
          {loading ? (
            <div className="space-y-2" aria-busy="true">
              {[0, 1].map((i) => (
                <div key={i} className="h-[66px] animate-pulse rounded-[14px] border border-[#e2e8e5] bg-white" />
              ))}
            </div>
          ) : recentContacts.length === 0 ? (
            <Empty>Aucun professionnel contacté pour l'instant.</Empty>
          ) : (
            <ul className="flex-1 space-y-2">
              {recentContacts.map((contact) => (
                <ContactLine
                  key={contact.id}
                  contact={contact}
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