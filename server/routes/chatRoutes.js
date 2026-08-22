import express from "express";
import { clearAllChats, createChat, deleteChat, getChats } from "../controllers/chatController.js";
import { protect } from "../middlewares/auth.js";

const chatRouter = express.Router();

chatRouter.get('/create', protect, createChat);
chatRouter.get('/get', protect, getChats);
chatRouter.post('/delete', protect, deleteChat);
chatRouter.post('/clear-all', protect, clearAllChats);

export default chatRouter;