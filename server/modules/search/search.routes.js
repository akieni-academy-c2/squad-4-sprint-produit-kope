import { Router } from "express";
import { validate } from "../../middlewares/validate.js";
import { searchQuerySchema } from "./search.schemas.js";
import { idParamSchema } from "../../utils/commonSchemas.js";
import * as controller from "./search.controller.js";
const router = Router();
router.get(
  "/professionals",
  validate(searchQuerySchema, "query"),
  controller.search,
);
router.get(
  "/professionals/:id",
  validate(idParamSchema, "params"),
  controller.getPublishedDetail,
);
router.get(
  "/professionals/:id/can-review",
  validate(idParamSchema, "params"),
  controller.getCanReview,
);
export default router;
