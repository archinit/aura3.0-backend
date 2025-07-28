import { createChatSession, getChatHistory, getChatSession, sendMessage, getAllChatSessions } from "../controllers/chatController";
import { authMiddleware } from "../middlewares/auth.middleware";
import express from "express";

const router = express.Router();

router.use(authMiddleware);

router.post("/sessions", createChatSession);

router.get("/sessions", getAllChatSessions);

// Get a specific chat session
router.get("/sessions/:sessionId", getChatSession);

// Send a message in a chat session
router.post("/sessions/:sessionId/messages", sendMessage);

// Get chat history for a session
router.get("/sessions/:sessionId/history", getChatHistory);



export default router;