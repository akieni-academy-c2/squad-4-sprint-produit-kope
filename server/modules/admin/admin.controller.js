import * as service from './admin.service.js';

export async function listProfessionals(req, res) {
  res.json(await service.listProfessionals(req.validated.query));
}

export async function setProfessionalHidden(req, res) {
  res.json(await service.setProfessionalHidden(req.validated.params.id, req.validated.body.hidden));
}

export async function listReviews(req, res) {
  res.json(await service.listReviews(req.validated.query));
}

export async function setReviewHidden(req, res) {
  res.json(await service.setReviewHidden(req.validated.params.id, req.validated.body.hidden));
}

export async function listUsers(req, res) {
  res.json(await service.listUsers(req.validated.query));
}

export async function setUserBlocked(req, res) {
  res.json(
    await service.setUserBlocked(req.user.id, req.validated.params.id, req.validated.body.blocked),
  );
}

export async function setUserSuspended(req, res) {
  res.json(
    await service.setUserSuspended(req.user.id, req.validated.params.id, req.validated.body.suspended),
  );
}

export async function createAdmin(req, res) {
  res.status(201).json(await service.createAdmin(req.validated.body));
}

export async function getStats(req, res) {
  res.json(await service.getStats());
}

export async function listTrades(req, res) {
  res.json(await service.listTrades());
}

export async function createTrade(req, res) {
  res.status(201).json(await service.createTrade(req.validated.body));
}

export async function updateTrade(req, res) {
  res.json(await service.updateTrade(req.validated.params.id, req.validated.body));
}

export async function deleteTrade(req, res) {
  res.json(await service.deleteTrade(req.validated.params.id));
}

export async function reorderTrades(req, res) {
  res.json(await service.reorderTrades(req.validated.body.ids));
}

export async function listTradeCategories(req, res) {
  res.json(await service.listTradeCategories());
}

export async function createTradeCategory(req, res) {
  res.status(201).json(await service.createTradeCategory(req.validated.body));
}

export async function updateTradeCategory(req, res) {
  res.json(await service.updateTradeCategory(req.validated.params.id, req.validated.body));
}

export async function deleteTradeCategory(req, res) {
  res.json(await service.deleteTradeCategory(req.validated.params.id));
}

export async function reorderTradeCategories(req, res) {
  res.json(await service.reorderTradeCategories(req.validated.body.ids));
}

export async function listZones(req, res) {
  res.json(await service.listZones());
}

export async function createZone(req, res) {
  res.status(201).json(await service.createZone(req.validated.body));
}

export async function updateZone(req, res) {
  res.json(await service.updateZone(req.validated.params.id, req.validated.body));
}

export async function deleteZone(req, res) {
  res.json(await service.deleteZone(req.validated.params.id));
}

export async function reorderZones(req, res) {
  res.json(await service.reorderZones(req.validated.body.ids));
}

export async function listCities(req, res) {
  res.json(await service.listCities());
}

export async function createCity(req, res) {
  res.status(201).json(await service.createCity(req.validated.body));
}

export async function updateCity(req, res) {
  res.json(await service.updateCity(req.validated.params.id, req.validated.body));
}

export async function deleteCity(req, res) {
  res.json(await service.deleteCity(req.validated.params.id));
}

export async function reorderCities(req, res) {
  res.json(await service.reorderCities(req.validated.body.ids));
}
