import express from "express";
import { protectRoute } from "../middlewares/auth.middleware";
import { getMessages, getUsersForSidebar, sendMessage, markMessagesAsRead } from "../controllers/message.controller";

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);
router.get("/:id", protectRoute, getMessages);

router.post("/send/:id", protectRoute, sendMessage);
router.put("/read/:id", protectRoute, markMessagesAsRead);

export default router;