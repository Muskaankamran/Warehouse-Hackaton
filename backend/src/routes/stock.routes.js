import express from "express";
import { stockIn, stockOut, getStock, getLowStock } from "../controllers/stock.controller.js";
import { authenticateToken, requireRole } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(authenticateToken);

router.get("/", getStock);
router.get("/low", getLowStock);
router.post("/in", requireRole("admin", "warehouseManager"), stockIn);
router.post("/out", requireRole("admin", "warehouseManager"), stockOut);

export default router;
