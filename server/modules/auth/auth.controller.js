import { SESSION_COOKIE } from "../../config/session.js";
import { currentUser } from "../../middlewares/identity.js";
import * as service from "./auth.service.js";

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
  const user = await service.becomeProfessional(
    currentUser(req).id,
    req.validated.body,
  );
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

export async function me(req, res, next) {
  const identity = currentUser(req);
  if (!identity) return res.json({ user: null });

  const user = await service.getCurrentUser(identity.id);

  if (!user) return logout(req, res, next);

  res.json({ user });
}

export async function updateAccount(req, res) {
  const user = await service.updateAccount(
    currentUser(req).id,
    req.validated.body,
  );
  res.json({ user });
}

export async function uploadAvatar(req, res) {
  res.json(await service.updateAvatar(currentUser(req).id, req.file));
}

export async function changePassword(req, res) {
  await service.changePassword(
    currentUser(req).id,
    req.validated.body,
    req.sessionID,
  );
  res.status(204).end();
}
