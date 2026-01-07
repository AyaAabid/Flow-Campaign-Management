import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getMe,
  updateMe,
  changePassword,
  uploadAvatar,
} from "../controllers/userController.js";
import { avatarUpload } from "../middleware/uploadMiddleware.js"; // your existing multer config

const r = Router();
r.get("/me", protect, getMe);
r.put("/me", protect, updateMe);
r.put("/me/password", protect, changePassword);
r.post("/me/avatar", protect, avatarUpload.single("avatar"), uploadAvatar);
export default r;
