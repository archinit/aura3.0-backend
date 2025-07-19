import { login, logout, register } from "@/controllers/authController";
import express from "express";

const router = express.Router()

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

export default router;