import { login, logout, register } from "../controllers/authController";
import { authMiddleware } from "../middlewares/auth.middleware";
import express from "express";

const router = express.Router()

router.post("/register", register);
router.post("/login", login);
router.post("/logout", authMiddleware ,logout);
router.get("/me", authMiddleware, (req, res) => {
    res.json({
        user: req.user
    });
});

export default router;