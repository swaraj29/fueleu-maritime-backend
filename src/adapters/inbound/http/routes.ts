import { Router } from "express";
import * as routeController from "./controllers/route.controller";
import * as complianceController from "./controllers/compliance.controller";
import * as bankingController from "./controllers/banking.controller";
import * as poolController from "./controllers/pool.controller";
import { validate } from "@shared/validation/middleware";
import {
  shipIdYearQuerySchema,
  setBaselineParamsSchema,
  bankSurplusSchema,
  applyBankSchema,
  createPoolSchema
} from "@shared/validation/schemas";

const router = Router();

// Routes
router.get("/routes", routeController.getAllRoutes);
router.post(
  "/routes/:id/baseline",
  validate(setBaselineParamsSchema, "params"),
  routeController.setRouteBaseline
);
router.get("/routes/comparison", routeController.compareRoutes);

// Compliance
router.get(
  "/compliance/cb",
  validate(shipIdYearQuerySchema, "query"),
  complianceController.calculateCB
);
router.get(
  "/compliance/adjusted-cb",
  validate(shipIdYearQuerySchema, "query"),
  complianceController.adjustedCB
);

// Banking
router.get(
  "/banking/records",
  validate(shipIdYearQuerySchema, "query"),
  bankingController.getRecords
);
router.post(
  "/banking/bank",
  validate(bankSurplusSchema, "body"),
  bankingController.bank
);
router.post(
  "/banking/apply",
  validate(applyBankSchema, "body"),
  bankingController.apply
);

// Pooling
router.post(
  "/pools",
  validate(createPoolSchema, "body"),
  poolController.create
);

export default router;