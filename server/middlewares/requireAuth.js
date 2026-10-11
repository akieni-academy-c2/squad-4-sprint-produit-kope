import { ApiError } from '../utils/ApiError.js';
import { currentUser, loadActiveUser } from './identity.js';

export async function requireAuth(req, res, next) {
  try {
    const identity = currentUser(req);
    if (!identity) throw ApiError.unauthorized();

    // Un compte bloqué ou suspendu remonte une 403 : on ne la transforme pas en 401.
    req.user = await loadActiveUser(identity.id);
    return next();
  } catch (err) {
    return next(err);
  }
}