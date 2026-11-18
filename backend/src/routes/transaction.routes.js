import express from "express";
import { getTransactions } from "../controllers/transaction.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(authenticateToken);

router.get("/", getTransactions);

export default router;
