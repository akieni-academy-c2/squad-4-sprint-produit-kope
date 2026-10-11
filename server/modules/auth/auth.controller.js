import { SESSION_COOKIE } from '../../config/session.js';
import { ApiError } from '../../utils/ApiError.js';
import * as service from './auth.service.js';
import * as repository from './auth.repository.js';
import { processAvatar, saveAvatar } from './avatar.storage.js';
import { uploadUrl } from '../../utils/uploads.js';

function currentUser(req) {
  return req.user ?? req.session?.user ?? null;
}

/**
 * Ouvre la session : c'est elle qui porte l'authentification.
 * Le cookie `sid` (httpOnly) est renvoyé automatiquement par le navigateur.
 */
function startSession(req, user) {
  return new Promise((resolve, reject) => {
    req.session.regenerate((err) => {
      if (err) return reject(err);
      req.session.user = { id: user.id, role: user.role };
      req.session.save((saveErr) => (saveErr ? reject(saveErr) : resolve()));
    });
  });
}

export async function registerClient(req, res) {
  const user = await service.registerClient(req.validated.body);
  await startSession(req, user);
  res.status(201).json({ user });
}

export async function registerProfessional(req, res) {
  const user = await service.registerProfessional(req.validated.body);
  await startSession(req, user);
  res.status(201).json({ user });
}

export async function becomeProfessional(req, res) {
  const user = await service.becomeProfessional(currentUser(req).id, req.validated.body);
  req.session.user = { id: user.id, role: user.role };
  res.json({ user });
}

export async function login(req, res) {
  const user = await service.login(req.validated.body);
  await startSession(req, user);
  res.json({ user });
}

export async function logout(req, res, next) {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie(SESSION_COOKIE);
    res.status(204).end();
  });
}

/**
 * « Qui suis-je ? » — répond 200 avec `user: null` quand aucune session n'est
 * ouverte. Un 401 ici était le comportement normal d'un visiteur non connecté,
 * mais il affichait une erreur rouge dans la console du navigateur et le faisait
 * passer pour un défaut. Aucun risque : la route ne renvoie que la session de
 * l'appelant.
 */
export async function me(req, res, next) {
  const identity = currentUser(req);
  if (!identity) return res.json({ user: null });

  const user = await service.getCurrentUser(identity.id);
  // Compte supprimé depuis : on ferme la session.
  if (!user) return logout(req, res, next);

  res.json({ user });
}

export async function updateAccount(req, res) {
  const user = await service.updateAccount(currentUser(req).id, req.validated.body);
  res.json({ user });
}

export async function uploadAvatar(req, res) {
  if (!req.file) throw ApiError.badRequest('Aucun fichier envoyé');
  const userId = currentUser(req).id;
  const buffer = await processAvatar(req.file.buffer);
  const relativePath = await saveAvatar(buffer, userId);
  const avatarUrl = uploadUrl(relativePath);
  await repository.updateAvatarUrl(userId, avatarUrl);
  res.json({ avatarUrl });
}

export async function changePassword(req, res) {
  await service.changePassword(currentUser(req).id, req.validated.body, req.sessionID);
  res.status(204).end();
}
