import { ApiError } from '../utils/ApiError.js';
import { getAccountState } from '../modules/auth/auth.repository.js';

const ACCOUNT_BLOCKED = 'Ce compte a été bloqué par un administrateur.';
const ACCOUNT_SUSPENDED = 'Votre compte a été suspendu.';

/**
 * L'authentification repose uniquement sur la session serveur (cookie `sid`).
 * Renvoie null si aucune session n'est ouverte.
 */
export function resolveUser(req) {
  return req.session?.user ?? null;
}

/**
 * Relit l'état du compte en base et refuse la requête si le compte a été
 * bloqué ou suspendu. Renvoie l'utilisateur avec son rôle réellement courant :
 * le rôle mémorisé en session peut être périmé après une rétrogradation.
 */
export async function loadActiveUser(userId) {
  const state = await getAccountState(userId);
  if (!state) throw ApiError.unauthorized();
  if (state.suspendedAt) throw ApiError.forbidden(ACCOUNT_SUSPENDED);
  if (state.blockedAt) throw ApiError.forbidden(ACCOUNT_BLOCKED);

  return { id: userId, role: state.role };
}
