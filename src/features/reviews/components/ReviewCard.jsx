import { Eye, EyeOff, Flag, Pencil, Trash2 } from 'lucide-react';
import { Card } from '@/shared/components/ui/Card.jsx';
import { ActionGroup } from '@/shared/components/ui/ActionGroup.jsx';
import { StarRating } from '@/shared/components/ui/StarRating.jsx';
import { UserAvatar } from '@/shared/components/ui/UserAvatar.jsx';
import { formatDateFr } from '@/shared/utils';

/**
 * Carte d'un avis, partagée par le compte client et l'espace professionnel.
 *
 * Un professionnel est aussi un client : il dépose des avis sur d'autres
 * professionnels et doit les retrouver dans le même espace, avec les mêmes
 * gestes. Deux implémentations auraient divergé au premier ajustement — et
 * c'est ce qui s'était produit avant que ce composant existe.
 *
 * Les actions sont adaptatives :
 *   - un avis masqué se démasque ou se supprime, il ne se modifie plus. Un
 *     avis absent de la fiche publique n'a plus d'affichage à corriger, et
 *     garder « Modifier » laisserait croire qu'on peut encore travailler un
 *     texte que personne ne voit ;
 *   - « Signaler » n'a de sens que sur un avis reçu, jamais sur le sien.
 */
export function ReviewCard({
  name,
  avatarUrl,
  tradeName,
  rating,
  comment,
  createdAt,
  isHidden = false,
  reported = false,
  pending = false,
  onEdit,
  onToggleHidden,
  onDelete,
  onReport,
}) {
  return (
    <Card className={`p-4 ${isHidden ? 'opacity-70' : ''}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <UserAvatar className="h-10 w-10 shrink-0" src={avatarUrl} name={name} />
          <div className="min-w-0">
            <p className="truncate font-semibold text-gray-900">{name}</p>
            {/* Le métier dit de qui on parle : deux professionnels peuvent
                porter le même prénom. */}
            {tradeName && <p className="truncate text-xs text-gray-500">{tradeName}</p>}
          </div>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5">
          <StarRating value={rating} size="sm" />
          <span className="text-sm text-gray-500">{rating}/5</span>
        </span>
      </div>

      {comment && <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-600">{comment}</p>}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-gray-200 pt-3">
        <p className="text-xs text-gray-400">{formatDateFr(createdAt)}</p>

        <ActionGroup label={`Actions sur l’avis de ${name}`}>
          {onEdit && !isHidden && (
            <button
              type="button"
              onClick={onEdit}
              disabled={pending}
              title="Modifier"
              aria-label={`Modifier l’avis sur ${name}`}
              className="cursor-pointer rounded p-1.5 text-gray-600 transition hover:bg-white hover:text-primary-600 disabled:cursor-not-allowed disabled:opacity-50 focus-ring"
            >
              <Pencil size={16} aria-hidden />
            </button>
          )}

          {onToggleHidden && (
            <button
              type="button"
              disabled={pending}
              onClick={onToggleHidden}
              title={isHidden ? 'Réafficher' : 'Masquer'}
              aria-label={
                isHidden ? `Réafficher l’avis sur ${name}` : `Masquer l’avis sur ${name}`
              }
              className="cursor-pointer rounded p-1.5 text-gray-600 transition hover:bg-white hover:text-primary-600 disabled:cursor-not-allowed disabled:opacity-50 focus-ring"
            >
              {isHidden ? <Eye size={16} aria-hidden /> : <EyeOff size={16} aria-hidden />}
            </button>
          )}

          {onReport &&
            (reported ? (
              <span className="px-1.5 text-[11px] font-medium text-gray-400">Signalé</span>
            ) : (
              <button
                type="button"
                onClick={onReport}
                title="Signaler cet avis"
                aria-label={`Signaler l’avis laissé par ${name}`}
                className="cursor-pointer rounded p-1.5 text-gray-600 transition hover:bg-white hover:text-danger-500 focus-ring"
              >
                <Flag size={16} aria-hidden />
              </button>
            ))}

          {onDelete && (
            <button
              type="button"
              disabled={pending}
              onClick={onDelete}
              title="Supprimer"
              aria-label={`Supprimer l’avis sur ${name}`}
              className="cursor-pointer rounded p-1.5 text-gray-500 transition hover:bg-white hover:text-danger-500 disabled:cursor-not-allowed disabled:opacity-50 focus-ring"
            >
              <Trash2 size={16} aria-hidden />
            </button>
          )}
        </ActionGroup>
      </div>
    </Card>
  );
}