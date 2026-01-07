// backend/models/Campaign.js
import mongoose from "mongoose";
import { CampaignStatusArray } from "./CampaignStatus.js";

const campaignSchema = new mongoose.Schema(
  {
    campaign_name: { type: String, required: true, trim: true },

    campaign_type: { type: String, required: true, trim: true },
    comment: { type: String, default: "" },

    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
    },
    agency: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agency",
      required: true,
    },

    launchDate: { type: Date, required: true },
    endDate: { type: Date, required: true },

    status: { type: String, enum: CampaignStatusArray, default: "Draft" },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    creatives: [{ type: String }],
    locations: [{ type: Object }],
  },
  { timestamps: true }
);

export default mongoose.model("Campaign", campaignSchema);
