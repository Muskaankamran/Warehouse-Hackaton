import express from "express";
import { getUploadAuth, deleteFile } from "../controllers/upload.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(authenticateToken);

router.get("/auth", getUploadAuth);
router.post("/delete", deleteFile);

export default router;
