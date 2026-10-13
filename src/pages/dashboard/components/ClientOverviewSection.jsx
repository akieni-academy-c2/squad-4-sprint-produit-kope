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
    <p className="w-full min-w-0 rounded-[14px] border border-dashed border-gray-200 bg-[#f7faf8] p-6 text-center text-sm text-gray-500">
      {children}
    </p>
  );
}

/**
 * Tuile d'aperçu.
 *
 * Colonne et non rangée : les items sont posés sur deux colonnes jusqu'à `lg`,
 * donc chacun ne dispose que de la moitié de la largeur du groupe. Une ligne
 * avatar / texte / meta y garderait le texte à une quarantaine de pixels, la
 * moitié de ce qu'elle avait déjà sur mobile en pleine largeur. Empilé, le même
 * contenu tient sur cinq lignes courtes.
 *
 * `mt-auto` sur la meta la colle au bas de la tuile : sans elle, deux items
 * voisins d'une hauteur différente aligneraient leurs dates sur des lignes
 * différentes et la grille apparaît bancale.
 */
function Tile({ onClick, children, label }) {
  return (
    <li className="min-w-0">
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        className="flex h-full w-full cursor-pointer flex-col items-center gap-2 rounded-[14px] border border-[#e2e8e5] bg-white p-3 text-center transition hover:border-primary-200 hover:shadow-sm focus-ring"
      >
        {children}
      </button>
    </li>
  );
}

function ReviewLine({ review, onClick }) {
  return (
    <Tile onClick={onClick} label={`Ouvrir mes avis - avis de ${review.professionalName}`}>
      <UserAvatar
        src={review.professionalAvatarUrl}
        name={review.professionalName}
        className="h-12 w-12 shrink-0"
        iconSize={20}
        fallbackClassName="bg-primary-100 text-primary-700"
      />
      <span className="w-full min-w-0">
        <span className="block truncate text-sm font-semibold text-gray-900">
          {review.professionalName}
        </span>
        <span className="mt-0.5 block truncate text-xs text-gray-500">
          {review.professionalTrade ?? 'Professionnel'}
        </span>
      </span>
      {/* Filet pleine largeur entre l'identité et la note : il coupe la tuile en
          deux bandes - « qui » puis « quoi ». Un simple `·` ne_SEPARE que deux
          mots et laissait lire « Plombier ★★★★★ » comme une seule ligne. */}
      <span aria-hidden className="h-px w-full shrink-0 bg-gray-200" />
      <span className="mt-auto flex flex-col items-center gap-1 pt-1">
        <StarRating value={review.rating} size="sm" />
        <span className="text-[11px] leading-tight text-gray-400">
          {formatDateFr(review.createdAt)}
        </span>
      </span>
    </Tile>
  );
}

function ContactLine({ contact, onClick }) {
  return (
    <Tile onClick={onClick} label={`Ouvrir mes contacts - ${contact.displayName || 'Utilisateur'}`}>
      <UserAvatar
        user={{ firstName: contact.firstName, lastName: contact.lastName }}
        src={contact.avatarUrl}
        name={contact.displayName}
        className="h-12 w-12 shrink-0"
        iconSize={20}
        fallbackClassName="bg-primary-100 text-primary-700"
      />
      <span className="w-full min-w-0">
        <span className="block truncate text-sm font-semibold text-gray-900">
          {contact.displayName || 'Utilisateur'}
        </span>
        <span className="mt-0.5 block truncate text-xs text-gray-500">
          {contact.tradeName ?? (contact.role === 'professional' ? 'Professionnel' : 'Client')}
        </span>
      </span>
      {/* Même filet que sur la tuile d'avis. */}
      <span aria-hidden className="h-px w-full shrink-0 bg-gray-200" />
      {/* Qui a pris l'initiative : c'est l'information qui change la lecture
          d'un contact, elle occupe la ligne basse mieux qu'un téléphone. */}
      <span className="mt-auto flex flex-col items-center gap-0.5 pt-1">
        <span className="text-[11px] font-semibold text-primary-700">
          {contact.outgoing ? 'Vous l’avez contacté' : 'Vous a contacté'}
        </span>
        <span className="text-[11px] leading-tight text-gray-400">
          {formatDateFr(contact.createdAt)}
        </span>
      </span>
    </Tile>
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

      <StatGroup title="Mon activité" tone="mint">
        {/* Colonne et non rangée : chaque compteur porte une phrase qui ne
            tient pas sur un tiers de largeur. Le libellé reste court - deux
            mots comme ses voisins - et le « détail » qui dépassait se retrouve
            dans l'indice sous le chiffre. */}
        <div className="grid gap-3 sm:grid-cols-3">
          <KpiCard
            label="Avis déposés"
            value={loading ? '–' : data?.reviewsTotal ?? 0}
            hint="Modifiables et masquables"
            icon={<Star size={12} aria-hidden />}
            onClick={() => onNavigate?.('avis')}
          />
          <KpiCard
            label="Professionnels"
            value={loading ? '–' : data?.contactsTotal ?? 0}
            hint="Rencontrés par appel ou WhatsApp"
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
          coup d'œil ses avis et ses contacts. En dessous, elles s'empilent -
          deux colonnes de lignes tronquées n'apporteraient rien.

          `min-w-0` sur chaque groupe est la vraie protection contre le
          débordement, pas `w-full`. Un élément de grille a `min-width: auto` :
          il refuse de descendre sous la largeur minimale de son contenu. Les
          lignes portent des dates et des notes en `shrink-0`, cette plancher
          pushing la carte hors de l'écran sur un mobile étroit. `w-full` ne
          change rien à ce calcul - le parent mesure déjà trop large. */}
      <div className="grid gap-4 lg:grid-cols-2 lg:items-stretch">
        <StatGroup title="Derniers avis" className="flex w-full min-w-0 flex-col">
          {loading ? (
            <div className="w-full min-w-0 space-y-2" aria-busy="true">
              {[0, 1].map((i) => (
                <div key={i} className="h-[152px] animate-pulse rounded-[14px] border border-[#e2e8e5] bg-white" />
              ))}
            </div>
          ) : recentReviews.length === 0 ? (
            <Empty>Aucun avis déposé pour l'instant.</Empty>
          ) : (
            // `flex-1` sur la liste : sans elle, le groupe le plus court gardait
            // sa hauteur naturelle et les deux cadres ne s'alignaient pas.
            // `min-w-0` : le groupe est une colonne flex, et une liste qui garde
            // la largeur de sa plus longue ligne déborde du cadre.
            // `grid-cols-2` : quatre items en colonnes se voient d'un coup sur
            // mobile. Empilés, ils demandaient quatre défilements pour un
            // aperçu dont le but est justement de ne pas en demander.
            <ul className="grid w-full min-w-0 flex-1 grid-cols-2 content-start gap-2">
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

        <StatGroup title="Derniers contacts" className="flex w-full min-w-0 flex-col">
          {loading ? (
            <div className="w-full min-w-0 space-y-2" aria-busy="true">
              {[0, 1].map((i) => (
                <div key={i} className="h-[152px] animate-pulse rounded-[14px] border border-[#e2e8e5] bg-white" />
              ))}
            </div>
          ) : recentContacts.length === 0 ? (
            <Empty>Aucun professionnel contacté pour l'instant.</Empty>
          ) : (
            <ul className="grid w-full min-w-0 flex-1 grid-cols-2 content-start gap-2">
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