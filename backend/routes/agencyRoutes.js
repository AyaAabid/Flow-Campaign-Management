import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  addAgency,
  getAgencies,
  getAgencyById,
  updateAgency,
  deleteAgency,
  getAgencyDetails,
} from "../controllers/agencyController.js";

const router = express.Router();

router.get("/", protect, getAgencies);
router.post("/", protect, addAgency);
router.post("/add", protect, addAgency);

router.get("/:id", protect, getAgencyById);
router.get("/:id/details", protect, getAgencyDetails);
router.put("/:id", protect, updateAgency);
router.delete("/:id", protect, deleteAgency);

export default router;
