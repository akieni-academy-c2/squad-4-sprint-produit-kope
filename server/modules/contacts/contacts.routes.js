import { Router } from "express";
import { validate } from "../../middlewares/validate.js";
import { requireRole } from "../../middlewares/requireRole.js";
import { rateLimit } from "../../middlewares/rateLimit.js";
import { paginationSchema, idParamSchema } from "../../utils/commonSchemas.js";
import { createContactSchema } from "./contacts.schemas.js";
import * as controller from "./contacts.controller.js";

const router = Router();

router.post(
  "/contacts",
  requireRole("client", "professional"),
  rateLimit({ max: 5, key: "contacts" }),
  validate(createContactSchema),
  controller.create,
);

router.get(
  "/contacts",
  requireRole("client", "professional"),
  validate(paginationSchema, "query"),
  controller.list,
);

/**
 * La transition `new` → `seen` passe par ici, sur un geste de l'utilisateur.
 * Elle ne se déclenche plus au chargement de la liste : sinon le statut était
 * déjà consommé avant le premier rendu, et le badge n'avait rien à afficher.
 *
 * La route littérale est déclarée avant celle à paramètre pour ne jamais être
 * capturée par un `:id`.
 */
router.patch(
  "/contacts/seen",
  requireRole("client", "professional"),
  controller.markAllSeen,
);

router.patch(
  "/contacts/:id/seen",
  requireRole("client", "professional"),
  validate(idParamSchema, "params"),
  controller.markSeen,
);

export default router;
