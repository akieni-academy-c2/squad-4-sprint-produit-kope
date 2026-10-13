import { useState } from 'react';
import { Eye, EyeOff, Flag, Pencil, Trash2 } from 'lucide-react';
import { Card } from '@/shared/components/ui/Card.jsx';
import { ActionGroup } from '@/shared/components/ui/ActionGroup.jsx';
import { IconButton } from '@/shared/components/ui/IconButton.jsx';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog.jsx';
import { StarRating } from '@/shared/components/ui/StarRating.jsx';
import { UserAvatar } from '@/shared/components/ui/UserAvatar.jsx';
import { formatDateFr } from '@/shared/utils';

/**
 * Carte d'un avis, partagée par le compte client et l'espace professionnel.
 *
 * Un professionnel est aussi un client : il dépose des avis sur d'autres
 * professionnels et doit les retrouver dans le même espace, avec les mêmes
 * gestes. Deux implémentations auraient divergé au premier ajustement - et
 * c'est ce qui s'était produit avant que ce composant existe.
 *
 * Les actions sont adaptatives :
 *   - un avis masqué se démasque ou se supprime, il ne se modifie plus. Un
 *     avis absent de la fiche publique n'a plus d'affichage à corriger, et
 *     garder « Modifier » laisserait croire qu'on peut encore travailler un
 *     texte que personne ne voit ;
 *   - « Signaler » n'a de sens que sur un avis reçu, jamais sur le sien.
 *
 * ## Pourquoi la confirmation vit ici, et pas chez l'appelant
 *
 * Masquer et supprimer sont les deux seules actions de cette carte qu'on ne
 * peut pas reprendre : le texte d'un avis supprimé n'existe plus, celui d'un
 * avis masqué disparaît de toutes les fiches publiques.
 *
 * Tant que la demande de confirmation était laissée aux sections qui rendent la
 * carte, chacune pouvait l'oublier - et il suffisait d'en oublier une pour que
 * la règle ne vaille plus nulle part. Elle est donc appliquée **dans** la carte :
 * un nouvel appelant reçoit la garantie sans avoir à la réécrire, et le test qui
 * vérifie la règle porte sur le composant qui l'applique.
 *
 * « Réafficher » reste immédiat : l'avis est déjà dans l'espace du lecteur, on
 * ne fait que le remettre en ligne, et une confirmation là serait un obstacle
 * à corriger une erreur de clic.
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
  // null | 'hide' | 'reveal' | 'delete' - ce qui attend une confirmation.
  const [asking, setAsking] = useState(null);

  const confirm = () => {
    if (asking === 'delete') onDelete?.();
    if (asking === 'hide') onToggleHidden?.();
    if (asking === 'reveal') onToggleHidden?.();
    setAsking(null);
  };

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

        <ActionGroup label={`Actions sur l'avis de ${name}`}>
          {onEdit && !isHidden && (
            <IconButton
              icon={Pencil}
              label={`Modifier l'avis sur ${name}`}
              title="Modifier"
              disabled={pending}
              onClick={onEdit}
            />
          )}

          {onToggleHidden && (
            <IconButton
              icon={isHidden ? Eye : EyeOff}
              label={isHidden ? `Réafficher l'avis sur ${name}` : `Masquer l'avis sur ${name}`}
              title={isHidden ? 'Réafficher' : 'Masquer'}
              disabled={pending}
              onClick={() => setAsking(isHidden ? 'reveal' : 'hide')}
            />
          )}

          {onReport &&
            (reported ? (
              <span className="px-1.5 text-[11px] font-medium text-gray-400">Signalé</span>
            ) : (
              <IconButton
                icon={Flag}
                tone="report"
                label={`Signaler l'avis laissé par ${name}`}
                title="Signaler cet avis"
                onClick={onReport}
              />
            ))}

          {onDelete && (
            <IconButton
              icon={Trash2}
              tone="danger"
              label={`Supprimer l'avis sur ${name}`}
              title="Supprimer"
              disabled={pending}
              onClick={() => setAsking('delete')}
            />
          )}
        </ActionGroup>
      </div>

      {/*
        Le titre porte l'objet et non le verbe : « Supprimer » seul ne dit pas
        ce qui disparaît. La description dit ce que la perte est concrète, pour
        qu'on puisse décider - « définitivement » pour une suppression, ce qui
        n'est pas vrai d'un masquage.
      */}
      <ConfirmDialog
        open={asking === 'delete'}
        danger
        title={`Supprimer l'avis sur ${name} ?`}
        description="Cet avis sera définitivement effacé. Cette action est irréversible."
        confirmLabel="Supprimer"
        onCancel={() => setAsking(null)}
        onConfirm={confirm}
      />

      <ConfirmDialog
        open={asking === 'hide'}
        title={`Masquer l'avis sur ${name} ?`}
        description="Il n'apparaîtra plus sur la fiche publique. Vous pourrez le réafficher à tout moment."
        confirmLabel="Masquer"
        onCancel={() => setAsking(null)}
        onConfirm={confirm}
      />

      <ConfirmDialog
        open={asking === 'reveal'}
        title={`Réafficher l'avis sur ${name} ?`}
        description="Il redeviendra visible sur la fiche publique et dans les recherches."
        confirmLabel="Réafficher"
        onCancel={() => setAsking(null)}
        onConfirm={confirm}
      />
    </Card>
  );
}
