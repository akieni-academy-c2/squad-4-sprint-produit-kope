import { Button, Modal } from '@/shared/components/ui';

export function AdminConfirmModal({
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
