// backend/routes/campaignRoutes.js
import express from "express";
import {
  createCampaign,
  updateCampaign,
  getCampaignById,
  listCampaigns,
  deleteCampaign,
  updateCampaignStatus,
} from "../controllers/campaignController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(protect, listCampaigns).post(protect, createCampaign);

router
  .route("/:id")
  .get(protect, getCampaignById)
  .put(protect, updateCampaign)
  .delete(protect, deleteCampaign);

router.route("/:id/status").patch(protect, updateCampaignStatus);

export default router;
