import { z } from 'zod';
import { idSchema } from '../../utils/commonSchemas.js';

/**
 * Un contact est un événement, plus une saisie.
 *
 * `channel` est la seule information réellement nécessaire : elle dit comment
 * le contact a été pris, et `created_at` dit quand. `message` reste accepté
 * pour le formulaire historique, mais n'est plus exigé - un appel n'a pas de
 * texte, et l'imposer rendait le clic sur « Appeler » impossible à enregistrer.
 */
export const contactChannels = {
  message: { label: 'Message' },
  call: { label: 'Appel' },
  whatsapp: { label: 'WhatsApp' },
};

const emptyToUndefined = (value) => (value === '' || value == null ? undefined : value);

export const createContactSchema = z
  .object({
    toUserId: idSchema('Identifiant invalide'),
    channel: z.enum(['message', 'call', 'whatsapp'], { error: 'Canal invalide' }).default('message'),
    message: z.preprocess(
      emptyToUndefined,
      z.string().trim().min(10, 'Le message doit contenir au moins 10 caractères').max(500, 'Le message ne doit pas dépasser 500 caractères').optional(),
    ),
  })
  // Un message doit être fourni quand on en a envoyé un, et ne doit pas
  // l'être pour un appel : la règle dépend donc du canal, pas du corps.
  .superRefine((data, ctx) => {
    if (data.channel === 'message' && !data.message)
      ctx.addIssue({ code: 'custom', path: ['message'], message: 'Le message est obligatoire' });
  })
  .transform((data) => ({ ...data, message: data.message ?? null }));