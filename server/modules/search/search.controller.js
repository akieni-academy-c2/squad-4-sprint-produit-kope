import * as service from "./search.service.js";
import * as professionalsService from "../professionals/professionals.service.js";
import * as reviewsService from "../reviews/reviews.service.js";
export async function search(req, res) {
  res.json(await service.search(req.validated.query));
}
export async function getPublishedDetail(req, res) {
  const id = req.validated?.params?.id ?? Number(req.params.id);
  const result = await professionalsService.getPublishedDetail(id);
  res.json(result);
}
export async function getCanReview(req, res) {
  const viewer = req.user || req.session?.user || null;
  const id = req.validated?.params?.id ?? Number(req.params.id);
  const canReview = await reviewsService.canReview(viewer, id);
  res.json({ canReview });
}
