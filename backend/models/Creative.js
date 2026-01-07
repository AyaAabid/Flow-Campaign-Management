import mongoose from "mongoose";

const creativeSchema = new mongoose.Schema({
  originalname: { type: String, required: true },
  filename: { type: String, required: true },
  url: { type: String, required: true },
  mimeType: { type: String, required: true },
  size: { type: Number, required: true },
  resolution: {
    width: { type: Number, required: true },
    height: { type: Number, required: true },
  },
  campaign: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Campaign", 
    default: null 
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
}, { timestamps: true });

export default mongoose.model("Creative", creativeSchema);
