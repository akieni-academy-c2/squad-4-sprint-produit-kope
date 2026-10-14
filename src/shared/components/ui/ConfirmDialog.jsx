import { Button, Modal } from '@/shared/components/ui';

/**
 * `title` porte l'objet, `description` la perte concrète. L'action est à droite,
 * jamais pré-sélectionnée ; dès l'enregistrement la modale ne se ferme plus.
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
