import { StarRating } from '@/shared/components/ui/StarRating.jsx';
import { UserAvatar } from '@/shared/components/ui/UserAvatar.jsx';
import { formatDateFr } from '@/shared/utils';

/**
 * Tuiles d'aperçu, partagées par les deux tableaux de bord.
 *
 * Un aperçu n'a pas à avoir deux rendus : le client et le professionnel
 * regardent les mêmes choses — un contact, un avis — et une différence de
 * dessin entre les deux espaces ferait croire à une différence de données.
 *
 * Colonne et non rangée : les items sont posés sur deux colonnes jusqu'à `lg`,
 * donc chacun ne dispose que de la moitié de la largeur du groupe. Une ligne
 * avatar / texte / meta y garderait le texte à une quarantaine de pixels, la
 * moitié de ce qu'il avait déjà en pleine largeur. Empilé, le même contenu tient
 * sur cinq lignes courtes.
 *
 * `mt-auto` sur la meta la colle au bas de la tuile : sans elle, deux items
 * voisins d'une hauteur différente aligneraient leurs dates sur des lignes
 * différentes et la grille apparaîtrait bancale.
 */
export function ActivityTile({ onClick, label, children }) {
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

/**
 * Un avis dans un aperçu.
 *
 * `subtitle` porte la ligne sous le nom — métier pour un avis donné, extrait
 * pour un avis reçu. Le composant ne suppose pas lequel : les deux espaces ont
 * des informations différentes à montrer sous le même nom.
 */
export function ReviewTile({ name, avatarUrl, subtitle, rating, createdAt, onClick, actionLabel }) {
  return (
    <ActivityTile onClick={onClick} label={actionLabel}>
      <UserAvatar
        src={avatarUrl}
        name={name}
        className="h-12 w-12 shrink-0"
        iconSize={20}
        fallbackClassName="bg-primary-100 text-primary-700"
      />
      <span className="w-full min-w-0">
        <span className="block truncate text-sm font-semibold text-gray-900">{name}</span>
        {subtitle && <span className="mt-0.5 block truncate text-xs text-gray-500">{subtitle}</span>}
      </span>
      <span className="mt-auto flex flex-col items-center gap-1 pt-1">
        <StarRating value={rating} size="sm" />
        <span className="text-[11px] leading-tight text-gray-400">
          {formatDateFr(createdAt)}
        </span>
      </span>
    </ActivityTile>
  );
}

/**
 * Un contact dans un aperçu.
 *
 * La ligne basse dit qui a pris l'initiative : c'est elle qui change la lecture
 * d'un contact, un professionnel qui m'a écrit et moi qui l'ai joint ne se
 * relisent pas de la même façon.
 */
export function ContactTile({ contact, onClick, actionLabel }) {
  const name = contact.displayName || 'Utilisateur';

  return (
    <ActivityTile onClick={onClick} label={actionLabel}>
      <UserAvatar
        user={{ firstName: contact.firstName, lastName: contact.lastName }}
        src={contact.avatarUrl}
        name={name}
        className="h-12 w-12 shrink-0"
        iconSize={20}
        fallbackClassName="bg-primary-100 text-primary-700"
      />
      <span className="w-full min-w-0">
        <span className="block truncate text-sm font-semibold text-gray-900">{name}</span>
        <span className="mt-0.5 block truncate text-xs text-gray-500">
          {contact.tradeName ?? (contact.role === 'professional' ? 'Professionnel' : 'Client')}
        </span>
      </span>
      <span className="mt-auto flex flex-col items-center gap-0.5 pt-1">
        <span className="text-[11px] font-semibold text-primary-700">
          {contact.outgoing ? 'Vous l’avez contacté' : 'Vous a contacté'}
        </span>
        <span className="text-[11px] leading-tight text-gray-400">
          {formatDateFr(contact.createdAt)}
        </span>
      </span>
    </ActivityTile>
  );
}

/** État vide des listes : bordure pointillée, comme dans l'espace admin. */
export function OverviewEmpty({ children }) {
  return (
    <p className="w-full min-w-0 rounded-[14px] border border-dashed border-gray-200 bg-[#f7faf8] p-6 text-center text-sm text-gray-500">
      {children}
    </p>
  );
}

/**
 * Décalage sous la barre de navigation collante.
 *
 * Toutes les colonnes latérales d'un tableau de bord s'y alignent, sinon la
 * colonne de filtres se décale de quelques pixels par rapport à la navigation
 * et le décalage s'accroît avec la hauteur de l'écran.
 *
 * La valeur vient de la même variable CSS que l'en-tête : `lg:top-23` avait l'air
 * d'être un décalage d'en-tête, mais 23 n'existe pas dans l'échelle Tailwind.
 * La classe n'était jamais générée, `position: sticky` se retrouvait avec
 * `top: auto` et rien ne collait — la colonne de filtres était la seule touchée,
 * ce qui la faisait contrairement à la navigation qui, elle, était correcte.
 */
export const STICKY_OFFSET = 'lg:top-(--header-height)';

/** Squelette de tuile : la hauteur réelle d'une tuile, pas celle d'une ligne. */
export function TileSkeleton() {
  return (
    <div className="h-[152px] animate-pulse rounded-[14px] border border-[#e2e8e5] bg-white" />
  );
}