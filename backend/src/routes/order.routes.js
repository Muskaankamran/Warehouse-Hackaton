import express from "express";
import { createOrder, getOrders, getOrderById, updateOrderStatus, cancelOrder } from "../controllers/order.controller.js";
import { authenticateToken, requireRole } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(authenticateToken);

router.post("/", requireRole("admin", "salesRepresentative"), createOrder);
router.get("/", getOrders);
router.get("/:id", getOrderById);
router.put("/:id/status", requireRole("admin", "warehouseManager"), updateOrderStatus);
router.put("/:id/cancel", requireRole("admin", "salesRepresentative"), cancelOrder);

export default router;
