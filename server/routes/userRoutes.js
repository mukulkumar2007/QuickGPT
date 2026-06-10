import express from "express";
import {
  getUser,
  loginUser,
  registerUser,
} from "../controllers/userController.js";
import { protect } from "../middleware/auth.js";
import { getPublishedImage } from "../controllers/messageController.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/data", protect, getUser);
userRouter.get("/published-images", getPublishedImage);

export default userRouter;
