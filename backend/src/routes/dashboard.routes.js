import express from "express";
import { getDashboardStats } from "../controllers/dashboard.controller.js";
import { authenticateToken, requireAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/stats", authenticateToken, requireAdmin, getDashboardStats);

export default router;
