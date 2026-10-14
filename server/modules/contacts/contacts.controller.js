import { requiredUserId } from '../../middlewares/identity.js';
import * as service from './contacts.service.js';

export async function create(req, res) {
  const contact = await service.createContact(requiredUserId(req), req.validated.body);
  res.status(201).json({ contact });
}

export async function list(req, res) {
  res.json(await service.listContacts(requiredUserId(req), req.validated.query));
}