import { Router } from "express";
import { validate } from "../../middlewares/validate.js";
import { requireRole } from "../../middlewares/requireRole.js";
import { rateLimit } from "../../middlewares/rateLimit.js";
import { paginationSchema } from "../../utils/commonSchemas.js";
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

export default router;
