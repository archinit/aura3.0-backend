import { login, logout, register } from "../controllers/authController";
import { authMiddleware } from "../middlewares/auth.middleware";
import express, { Request, Response } from "express";

const router = express.Router()

router.post("/register", register);
router.post("/login", login);
router.post("/logout", authMiddleware ,logout);
router.get("/me", authMiddleware, (req: Request, res: Response) => {
    res.json({
        user: req.user
    });
});

export default router;