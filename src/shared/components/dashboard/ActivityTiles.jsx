import { StarRating } from '@/shared/components/ui/StarRating.jsx';
import { UserAvatar } from '@/shared/components/ui/UserAvatar.jsx';
import { formatDateFr } from '@/shared/utils';

/**
 * Tuiles d'aperçu, partagées par les deux tableaux de bord : un même rendu
 * pour les deux espaces, sinon la différence de dessin ferait croire à une
 * différence de données.
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

/** `subtitle` : métier pour un avis donné, extrait pour un avis reçu. */
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

/** La ligne basse dit qui a pris l'initiative au contact. */
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


/** Squelette de tuile : la hauteur réelle d'une tuile, pas celle d'une ligne. */
export function TileSkeleton() {
  return (
    <div className="h-[152px] animate-pulse rounded-[14px] border border-[#e2e8e5] bg-white" />
  );
}