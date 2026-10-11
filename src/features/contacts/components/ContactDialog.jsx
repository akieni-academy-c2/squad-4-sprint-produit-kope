import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/Dialog.jsx';
import { Button } from '@/shared/components/ui/Button.jsx';
import { FormField } from '@/shared/components/ui/FormField.jsx';
import { Textarea } from '@/shared/components/ui/Textarea.jsx';
import { useNotification } from '@/shared/context/NotificationContext.jsx';
import { createContactSchema } from '@/shared/utils/validators.js';
import { useFormReadiness } from '@/shared/hooks/useFormReadiness.js';
import { createContact } from '../services/contacts.service.js';

const MESSAGE_MAX = 500;

export function ContactDialog({ open, onOpenChange, toUserId, recipientName }) {
  const { toast } = useNotification();
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);

  const close = () => {
    setMessage('');
    setError(null);
    onOpenChange?.(false);
  };

  // Bouton actif seulement si le message respecte les règles de longueur.
  const { ready } = useFormReadiness(createContactSchema, { toUserId, message }, {
    ignore: ['toUserId'],
  });

  const submit = async (e) => {
    e.preventDefault();
    if (!ready) return;
    const parsed = createContactSchema.safeParse({ toUserId, message });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Message invalide');
      return;
    }
    setSending(true);
    setError(null);
    try {
      await createContact(parsed.data);
      toast({ message: `Message envoyé à ${recipientName}.`, type: 'success' });
      close();
    } catch (err) {
      setError(err?.message || "Impossible d'envoyer le message.");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? onOpenChange?.(true) : close())}>
      <DialogContent className="max-w-lg p-5" onClose={close}>
        <DialogHeader>
          <DialogTitle>Contacter {recipientName}</DialogTitle>
          <DialogDescription>
            Votre message et vos coordonnées seront visibles par ce professionnel dans « Mes contacts ».
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} noValidate className="space-y-4">
          <FormField
            id="contact-message"
            label="Votre message"
            required
            as="textarea"
            error={error}
            help={`10 à ${MESSAGE_MAX} caractères : décrivez votre besoin, vos disponibilités, votre zone...`}
            counter={
              <span className={message.length < 10 || message.length > MESSAGE_MAX ? 'text-danger-500 font-semibold' : ''}>
                {message.length}/{MESSAGE_MAX}
              </span>
            }
          >
            <Textarea
              id="contact-message"
              rows={3}
              maxLength={MESSAGE_MAX}
              placeholder="Décrivez votre besoin, vos disponibilités, votre zone..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              error={error}
            />
          </FormField>

          <DialogFooter>
            <Button type="button" variant="ghost" size="md" onClick={close}>
              Annuler
            </Button>
            <Button type="submit" loading={sending} disabled={!ready} size="md">
              Envoyer le message
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
