import { ApiError } from '../../utils/ApiError.js';
import { offsetOf, paginateSafely } from '../../utils/pagination.js';
import * as repository from './contacts.repository.js';
import * as authRepository from '../auth/auth.repository.js';

export async function createContact(senderId, { toUserId, message }) {
  if (Number(senderId) === Number(toUserId))
    throw ApiError.badRequest('Vous ne pouvez pas vous contacter vous-même', {
      toUserId: 'Choisissez un autre interlocuteur',
    });


  const recipient = await authRepository.findById(toUserId);
  if (!recipient) throw ApiError.notFound('Utilisateur introuvable');

  if (await repository.existsPair(senderId, toUserId))
    throw ApiError.conflict('Vous avez déjà contacté cette personne');


  try {
    return await repository.create({ senderId, recipientId: toUserId, message });
  } catch (err) {
    if (err.code === '23505') throw ApiError.conflict('Vous avez déjà contacté cette personne');
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
