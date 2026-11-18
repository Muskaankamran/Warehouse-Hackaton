import express from "express";
import { getWarehouses, getWarehouseById, createWarehouse, updateWarehouse, deleteWarehouse } from "../controllers/warehouse.controller.js";
import { authenticateToken, requireAdmin, requireRole } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(authenticateToken);

router.get("/", getWarehouses);
router.get("/:id", getWarehouseById);
router.post("/", requireAdmin, createWarehouse);
router.put("/:id", requireAdmin, updateWarehouse);
router.delete("/:id", requireAdmin, deleteWarehouse);

export default router;
