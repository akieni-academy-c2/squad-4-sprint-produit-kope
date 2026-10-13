import { Button, Modal } from '@/shared/components/ui';

/**
 * Confirmation avant une action qu'on ne peut pas reprendre.
 *
 * ## Pourquoi une modale et non `window.confirm`
 *
 * `window.confirm` affiche deux boutons nommés OK / Annuler, dans la langue du
 * navigateur, sans style, et **fige le thread** : le rendu s'arrête pendant
 * l'affichage. Sur une action destructive, c'est le moment le moins bien placé
 * pour saccader - et c'est souvent le moment où l'utilisateur vient de cliquer
 * ailleurs.
 *
 * ## Ce que ce composant exige du dialogue qui l'appelle
 *
 * **Un nom, pas un verbe.** « Supprimer » ne dit pas ce qui va disparaître.
 * `title` porte l'objet - « Supprimer cet avis ? » - et `description` dit ce
 * que la perte est concrète, pour qu'on puisseClickedь Decide.
 *
 * L'action proposée est à droite - celle que le clavier atteint par défaut -
 * et n'est jamais pré-sélectionnée : un `Entrée` pressé par réflexe ne doit
 * pas effacer.
 *
 * Pendant l'enregistrement, la modale n'est plus fermable : c'est le moment où
 * l'action est déjà partie, et une fermeture laisserait croire qu'elle a été
 * annulée.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  danger = false,
  saving = false,
  onCancel,
  onConfirm,
}) {
  return (
    <Modal
      open={open}
      onClose={() => !saving && onCancel?.()}
      dismissable={!saving}
      size="sm"
      title={title}
      description={description}
      actions={
        <>
          <Button variant="secondary" onClick={onCancel} disabled={saving}>
            {cancelLabel}
          </Button>
          <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm} loading={saving}>
            {confirmLabel}
          </Button>
        </>
      }
    />
  );
}
