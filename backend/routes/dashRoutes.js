// backend/routes/dashRoutes.js
import express from "express";
import { getDashboardData } from "../controllers/dashboardController.js";

const router = express.Router();

// Get all dashboard data in one request
router.get("/", getDashboardData);

export default router;
