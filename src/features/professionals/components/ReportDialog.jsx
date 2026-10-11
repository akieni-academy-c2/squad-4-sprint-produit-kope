import { useState } from 'react';
import { Flag } from 'lucide-react';
import { Button, CustomSelect, FormField, Modal } from '@/shared/components/ui';
import { useNotification } from '@/shared/context/NotificationContext.jsx';
import { REPORT_REASON_OPTIONS } from '@/shared/constants/reports.js';
import { reportProfessional } from '../services/professionals.service.js';

export function ReportDialog({ open, onClose, professionalId }) {
  const { toast } = useNotification();
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const close = () => {
    setReason('');
    setMessage('');
    setError(null);
    onClose?.();
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!reason) {
      setError('Choisissez un motif.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await reportProfessional(professionalId, { reason, message: message.trim() || undefined });
      toast({ message: 'Signalement envoyé. Merci.', type: 'success' });
      close();
    } catch (err) {
      setError(err?.message || 'Erreur lors de l\'envoi du signalement.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title="Signaler ce profil"
      description={`Votre signalement est transmis à l'administration.`}
      actions={
        <>
          <Button variant="secondary" onClick={close} disabled={submitting}>
            Annuler
          </Button>
          <Button variant="danger" onClick={submit} disabled={submitting}>
            {submitting ? 'Envoi...' : 'Envoyer le signalement'}
          </Button>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <FormField
          id="report-reason"
          label="Motif du signalement"
          required
          help="Le motif aide l'administration à traiter le signalement."
        >
          <CustomSelect
            id="report-reason"
            value={reason}
            onChange={setReason}
            options={REPORT_REASON_OPTIONS}
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
          <p role="alert" className="flex items-center gap-2 rounded-sm bg-danger-50 px-3 py-2 text-sm text-danger-500">
            <Flag size={14} aria-hidden />
            {error}
          </p>
        )}

        <p className="text-xs text-gray-500">
          Un signalement par profil et par compte. Les signalements répétés ou abusifs peuvent entraîner le blocage
          du compte.
        </p>
      </form>
    </Modal>
  );
}

export function ReportTrigger({ onClick, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-gray-400 underline-offset-4 transition hover:text-danger-500 hover:underline ${className}`}
    >
      <Flag size={12} aria-hidden />
      Signaler ce profil
    </button>
  );
}
