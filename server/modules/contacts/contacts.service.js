import { ApiError } from '../../utils/ApiError.js';
import { offsetOf, paginateSafely } from '../../utils/pagination.js';
import * as repository from './contacts.repository.js';
import * as authRepository from '../auth/auth.repository.js';

/**
 * Enregistre un contact pris.
 *
 * Un appel ou un message WhatsApp n'a pas de texte : la saisie n'est exigée
 * que pour le canal `message`. La paire n'étant plus unique, répéter un appel
 * ajoute une ligne au lieu d'échouer — c'est le cas normal, on appelle un
 * professionnel plusieurs fois.
 */
export async function createContact(senderId, { toUserId, message, channel = 'message' }) {
  if (Number(senderId) === Number(toUserId))
    throw ApiError.badRequest('Vous ne pouvez pas vous contacter vous-même', {
      toUserId: 'Choisissez un autre interlocuteur',
    });

  const recipient = await authRepository.findById(toUserId);
  if (!recipient) throw ApiError.notFound('Utilisateur introuvable');

  try {
    // `message ?? null` : un appel n'a pas de texte, et la colonne est
    // nullable. Sans cette normalisation, un appel sans `message` insertait
    // `undefined`, que le pilote PostgreSQL refuse.
    return await repository.create({
      senderId,
      recipientId: toUserId,
      message: message ?? null,
      channel,
    });
  } catch (err) {
    if (err.code === '23514')
      throw ApiError.badRequest('Données invalides', {
        message: 'Le message doit contenir entre 10 et 500 caractères',
      });

    throw err;
  }
}

export async function listContacts(userId, pagination) {
  await repository.markIncomingAsSeen(userId);
  const rows = await repository.listForUser(userId, {
    limit: pagination.pageSize,
    offset: offsetOf(pagination),
  });
  return paginateSafely(rows, pagination, () => repository.countForUser(userId));
}