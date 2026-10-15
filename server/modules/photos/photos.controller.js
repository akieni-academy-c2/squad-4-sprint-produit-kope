import { requiredUserId } from "../../middlewares/identity.js";
import * as service from "./photos.service.js";

export async function add(req, res) {
  const photo = await service.addPhoto(
    requiredUserId(req),
    req.file,
    req.validated.body,
  );
  res.status(201).json({ photo });
}

export async function update(req, res) {
  const photo = await service.updatePhoto(
    requiredUserId(req),
    req.validated.params.id,
    req.validated.body,
  );
  res.json({ photo });
}

export async function remove(req, res) {
  await service.removePhoto(requiredUserId(req), req.validated.params.id);
  res.status(204).end();
}
