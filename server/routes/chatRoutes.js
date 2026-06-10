import express from "express";
import {
  createChat,
  deleteChat,
  getChat,
} from "../controllers/chatController.js";
import { protect } from "../middleware/auth.js";

const chatRouter = express.Router();

chatRouter.get("/create", protect, createChat);
chatRouter.get("/get", protect, getChat);
chatRouter.post("/delete", protect, deleteChat);

export default chatRouter;
