import * as service from './reference.service.js';

export async function listTrades(req, res) {
  res.json({ trades: await service.listTrades() });
}

export async function listZones(req, res) {
  res.json({ zones: await service.listZones() });
}

export async function listCities(req, res) {
  res.json({ cities: await service.listCities() });
}