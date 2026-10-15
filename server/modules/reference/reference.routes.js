import { Router } from "express";
import * as controller from "./reference.controller.js";

const router = Router();

router.get("/trades", controller.listTrades);
router.get("/zones", controller.listZones);
router.get("/cities", controller.listCities);

export default router;
