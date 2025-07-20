import { createMood } from "../controllers/moodController";
import { authMiddleware } from "../middlewares/auth.middleware";
import express from "express";

const router = express.Router();

router.use(authMiddleware);

router.post("/", createMood);

export default router;