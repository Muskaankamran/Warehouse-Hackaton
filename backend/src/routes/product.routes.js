import express from "express";
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct } from "../controllers/product.controller.js";
import { authenticateToken, requireRole } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(authenticateToken);

router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/", requireRole("admin", "warehouseManager"), createProduct);
router.put("/:id", requireRole("admin", "warehouseManager"), updateProduct);
router.delete("/:id", requireRole("admin"), deleteProduct);

export default router;
