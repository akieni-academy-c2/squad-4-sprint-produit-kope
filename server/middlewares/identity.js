import { ApiError } from '../utils/ApiError.js';
import { getAccountState } from '../modules/auth/auth.repository.js';

const ACCOUNT_BLOCKED = 'Ce compte a été bloqué par un administrateur.';
const ACCOUNT_SUSPENDED = 'Votre compte a été suspendu.';
export function currentUser(req) {
  return req.user ?? req.session?.user ?? null;
}

export function requiredUserId(req) {
  return currentUser(req).id;
}
export async function loadActiveUser(userId) {
  const state = await getAccountState(userId);
  if (!state) throw ApiError.unauthorized();
  if (state.suspendedAt) throw ApiError.forbidden(ACCOUNT_SUSPENDED);
  if (state.blockedAt) throw ApiError.forbidden(ACCOUNT_BLOCKED);

  return { id: userId, role: state.role };
}