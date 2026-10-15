import { AdminConfirmModal } from "../AdminConfirmModal.jsx";

export function ReportModals({
  confirm,
  onCancelConfirm,
  onConfirmReport,
  unblock,
  onCancelUnblock,
  onConfirmUnblock,
  unsuspend,
  onCancelUnsuspend,
  onConfirmUnsuspend,
  saving,
}) {
  const resolving = confirm?.action === "resolve";

  return (
    <>
      <AdminConfirmModal
        open={Boolean(confirm)}
        onCancel={onCancelConfirm}
        onConfirm={onConfirmReport}
        danger={!resolving}
        title={
          resolving
            ? "Marquer ce signalement comme traité ?"
            : "Rejeter ce signalement ?"
        }
        description={
          resolving
            ? "Le signalement sera archivé et retiré de la file en attente."
            : "Le signalement sera rejeté. Le profil ne sera pas sanctionné."
        }
        confirmLabel={resolving ? "Marquer traité" : "Rejeter"}
      />

      <AdminConfirmModal
        open={Boolean(unblock)}
        onCancel={onCancelUnblock}
        onConfirm={onConfirmUnblock}
        saving={saving}
        title="Débloquer ce compte ?"
        description={
          unblock
            ? `${unblock.name} pourra de nouveau se connecter. Les signalements resteront visibles.`
            : ""
        }
        confirmLabel="Débloquer"
      />

      <AdminConfirmModal
        open={Boolean(unsuspend)}
        onCancel={onCancelUnsuspend}
        onConfirm={onConfirmUnsuspend}
        saving={saving}
        title="Lever la suspension ?"
        description={
          unsuspend
            ? `${unsuspend.name} pourra de nouveau se connecter et réapparaîtra dans l'annuaire public.`
            : ""
        }
        confirmLabel="Lever la suspension"
      />
    </>
  );
}
