import mongoose from "mongoose";

const agencySchema = new mongoose.Schema(
  {
    agencyName: { type: String, required: true, unique: true, trim: true },
    agencyEmail: { type: String, trim: true },
    agencyPhone: { type: String, trim: true },
    commission: { type: Number, default: 0.01, min: 0.0 }, // float >= 0.0
  },
  { timestamps: true }
);

export default mongoose.model("Agency", agencySchema);
