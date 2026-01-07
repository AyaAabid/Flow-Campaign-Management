import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  addBrand,
  getBrands,
  getBrandById,
  updateBrand,
  deleteBrand,
  getBrandDetails,
} from "../controllers/brandController.js";

const router = express.Router();

// GET / -> list, POST / -> create (works for both /brands and /brand mounts)
router.get("/", protect, getBrands);
router.post("/", protect, addBrand);

// Legacy: POST /add (keeps older frontends working)
router.post("/add", protect, addBrand);

// GET/PUT/DELETE by id
router.get("/:id", protect, getBrandById);
router.get("/:id/details", protect, getBrandDetails);
router.put("/:id", protect, updateBrand);
router.delete("/:id", protect, deleteBrand);

export default router;
