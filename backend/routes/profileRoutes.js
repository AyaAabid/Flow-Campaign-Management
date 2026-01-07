import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";
import {
  getUserProfile,
  updateUserProfile,
  changePassword,
} from "../controllers/profileController.js";

const router = express.Router();

router.get("/:id", protect, getUserProfile);

router.put("/:id", protect, upload.single("profilePicture"), updateUserProfile);

router.put("/change-password", protect, changePassword);

export default router;
