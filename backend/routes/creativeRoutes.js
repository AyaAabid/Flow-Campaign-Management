import express from "express";
import {
  uploadCreative,
  getCreativesByCampaign,
  deleteCreative,
  creativeUpload
} from "../controllers/creativeController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Upload creative
router.post("/upload", protect, creativeUpload.single("files"), uploadCreative);

// Get creatives by campaign
router.get("/campaign/:campaignId", protect, getCreativesByCampaign);

// Delete creative
router.delete("/:id", protect, deleteCreative);

export default router;
