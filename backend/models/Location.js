import mongoose from "mongoose";

const locationSchema = new mongoose.Schema({
  asset: { type: mongoose.Schema.Types.ObjectId, ref: "Asset", required: true },
  venueType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "VenueType",
    required: true,
  },
  venueName: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "VenueName",
    required: true,
  },
  network: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Network",
    required: true,
  },
});

export default locationSchema;
