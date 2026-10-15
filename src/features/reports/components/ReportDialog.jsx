import { useState } from "react";
import { Flag } from "lucide-react";
import { Button, CustomSelect, FormField, Modal } from "@/shared/components/ui";
import { ErrorState } from "@/shared/components/ui/ErrorState.jsx";
import { useNotification } from "@/shared/context/NotificationContext.jsx";

export function ReportDialog({
  open,
  onClose,
  title = "Signaler",
  description = "Votre signalement est transmis à l’administration.",
  reasonOptions,
  reasonLabel = "Motif du signalement",
  reasonHelp = "Le motif aide l’administration à traiter le signalement.",
  notice,
  submit,
  successMessage = "Signalement envoyé. Merci.",
  submitLabel = "Envoyer le signalement",
}) {
  const { toast } = useNotification();
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const close = () => {
    setReason("");
    setMessage("");
    setError(null);
    onClose?.();
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!reason) {
      setError("Choisissez un motif.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await submit({ reason, message: message.trim() || undefined });
      toast({ message: successMessage, type: "success" });
      close();
    } catch (err) {
      setError(err?.message || "Erreur lors de l’envoi du signalement.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title={title}
      description={description}
      actions={
        <>
          <Button variant="secondary" onClick={close} disabled={submitting}>
            Annuler
          </Button>
          <Button variant="danger" onClick={onSubmit} disabled={submitting}>
            {submitting ? "Envoi…" : submitLabel}
          </Button>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <FormField
          id="report-reason"
          label={reasonLabel}
          required
          help={reasonHelp}
        >
          <CustomSelect
            id="report-reason"
            value={reason}
            onChange={setReason}
            options={reasonOptions}
            placeholder="Choisir un motif"
            className="w-full"
          />
        </FormField>

        <FormField
          id="report-message"
          label="Précisions (facultatif)"
          as="textarea"
          rows={4}
          maxLength={500}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Décrivez le problème rencontré..."
          counter={`${message.length}/500`}
        />

        {error && (
          <ErrorState
            title="Signalement non envoyé"
            message={error}
            compact
            className="bg-danger-50/40"
          />
        )}

        {notice && <p className="text-xs text-gray-500">{notice}</p>}
      </form>
    </Modal>
  );
}

export function ReportTrigger({ onClick, label = "Signaler", className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-gray-500 underline-offset-4 transition hover:text-danger-500 hover:underline ${className}`}
    >
      <Flag size={12} aria-hidden />
      {label}
    </button>
  );
}
