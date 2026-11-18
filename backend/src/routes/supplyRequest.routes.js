import express from "express";
import { createSupplyRequest, getSupplyRequests, updateSupplyRequestStatus } from "../controllers/supplyRequest.controller.js";
import { authenticateToken, requireAdmin, requireRole } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(authenticateToken);

router.post("/", requireRole("admin", "supplier"), createSupplyRequest);
router.get("/", getSupplyRequests);
router.put("/:id/status", requireAdmin, updateSupplyRequestStatus);

export default router;
