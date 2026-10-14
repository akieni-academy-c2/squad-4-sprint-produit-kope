import { ApiError } from '../utils/ApiError.js';
import { currentUser, loadActiveUser } from './identity.js';

export function requireRole(...roles) {
  return async (req, res, next) => {
    try {
      const identity = currentUser(req);
      if (!identity) throw ApiError.unauthorized();
      const user = await loadActiveUser(identity.id);
      if (!roles.includes(user.role)) throw ApiError.forbidden();

      req.user = user;
      return next();
    } catch (err) {
      return next(err);
    }
  };
}