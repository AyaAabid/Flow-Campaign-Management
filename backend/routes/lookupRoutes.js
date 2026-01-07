import express from "express";
import {
  getIndustries,
  getCountryCodes,
} from "../controllers/lookupController.js";

const router = express.Router();

// no protect here → public
router.get("/industries", getIndustries);
router.get("/country-codes", getCountryCodes);

export default router;
