import { ApiError } from '../../utils/ApiError.js';
import { currentUser, requiredUserId } from '../../middlewares/identity.js';
import * as service from './reviews.service.js';

export async function create(req, res) {
  const review = await service.createReview(requiredUserId(req), req.validated.params.id, req.validated.body);
  res.status(201).json({ review });
}

export async function list(req, res) {
  res.json(await service.listReviews(currentUser(req), req.validated.params.id, req.validated.query));
}

export async function mine(req, res) {
  res.json(await service.mine(requiredUserId(req), req.validated.query));
}

export async function byClient(req, res) {
  const viewer = currentUser(req);
  const isSelf = viewer && String(viewer.id) === String(req.validated.params.id);
  if (!isSelf && viewer?.role !== 'admin')
    throw ApiError.forbidden();

  res.json(await service.byClient(req.validated.params.id, req.validated.query));
}