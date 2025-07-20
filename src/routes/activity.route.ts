import { logActivity } from "../controllers/activityController";
import { authMiddleware } from "../middlewares/auth.middleware";
import express from "express";

const router = express.Router();

router.use(authMiddleware);

router.post("/log", logActivity)

export default router;