// backend/models/User.js
import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    firstName: String,
    lastName: String,
    email: { type: String, trim: true, lowercase: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // bcrypt hash
    position: String,
    role: { type: String, default: "Editor" },
    profilePicture: { type: String, default: "" },
  },
  { timestamps: true }
);

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model("User", userSchema);
