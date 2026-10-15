import { ApiError } from "../../utils/ApiError.js";
import { offsetOf, paginateSafely } from "../../utils/pagination.js";
import * as repository from "./contacts.repository.js";
import * as authRepository from "../auth/auth.repository.js";

export async function createContact(
  senderId,
  { toUserId, message, channel = "message" },
) {
  if (Number(senderId) === Number(toUserId))
    throw ApiError.badRequest("Vous ne pouvez pas vous contacter vous-même", {
      toUserId: "Choisissez un autre interlocuteur",
    });

  const recipient = await authRepository.findById(toUserId);
  if (!recipient) throw ApiError.notFound("Utilisateur introuvable");

  try {
    return await repository.create({
      senderId,
      recipientId: toUserId,
      message: message ?? null,
      channel,
    });
  } catch (err) {
    if (err.code === "23514")
      throw ApiError.badRequest("Données invalides", {
        message: "Le message doit contenir entre 10 et 500 caractères",
      });

    throw err;
  }
}

export async function markAllContactsSeen(userId) {
  return repository.markAllSeen(userId);
}

/**
 * Ne renvoie pas d'erreur si la demande était déjà vue ou n'appartient pas à
 * l'appelant : l'opération est idempotente, et l'appelant n'a rien à faire
 * dans les deux cas.
 */
export async function markContactSeen(userId, contactId) {
  return repository.markSeen(contactId, userId);
}

/**
 * Lecture pure : cette liste ne marque plus les demandes entrantes comme vues.
 *
 * Le faire ici coûtait un aller-retour base à chaque affichage, pour un statut
 * qu'aucun écran ne lit et qui devenait illisible de toute façon : la transition
 * se déclenchait à la lecture, donc au moment du rendu tout était déjà `seen`.
 */
export async function listContacts(userId, pagination) {
  const rows = await repository.listForUser(userId, {
    limit: pagination.pageSize,
    offset: offsetOf(pagination),
  });
  return paginateSafely(rows, pagination, () =>
    repository.countForUser(userId),
  );
}
