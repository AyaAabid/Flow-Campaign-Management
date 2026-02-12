import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import brandRoutes from "./routes/brandRoutes.js";
import agencyRoutes from "./routes/agencyRoutes.js";
import campaignRoutes from "./routes/campaignRoutes.js";
import creativeRoutes from "./routes/creativeRoutes.js";
import lookupRoutes from "./routes/lookupRoutes.js";
import dashRoutes from "./routes/dashRoutes.js";

dotenv.config();
connectDB();
//origin: true, credentials: true
const app = express();
app.use(
  cors({
    origin: "*",
    methods: ["POST", "GET", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);
app.use(express.json());

// Health
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/lookups", lookupRoutes);

// Mount same router at plural & singular paths
app.use("/api/brands", brandRoutes);
app.use("/api/brand", brandRoutes);

app.use("/api/agencies", agencyRoutes);
app.use("/api/agency", agencyRoutes);

app.use("/api/campaigns", campaignRoutes);
app.use("/api/creatives", creativeRoutes);
app.use("/api/dashboard", dashRoutes);

app.use("/uploads", express.static("uploads")); // serve avatars
app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API on :${PORT}`));
