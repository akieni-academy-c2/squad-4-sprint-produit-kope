import { requiredUserId } from '../../middlewares/identity.js';
import * as service from './professionals.service.js';

export async function getMyProfile(req, res) {
  res.json({ profile: await service.getOwnProfile(requiredUserId(req)) });
}

export async function updateMyProfile(req, res) {
  res.json({ profile: await service.updateOwnProfile(requiredUserId(req), req.validated.body) });
}

export async function setAvailability(req, res) {
  const { isAvailable } = req.validated.body;
  await service.setAvailability(requiredUserId(req), isAvailable);
  res.json({ isAvailable });
}