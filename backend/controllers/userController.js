import bcrypt from "bcrypt";
import User from "../models/User.js";

// GET /api/users/me
export const getMe = async (req, res) =>
  res.json({ success: true, user: req.user });

// PUT /api/users/me  (fullName split on front-end → first/last here already)
export const updateMe = async (req, res) => {
  const allowed = ["firstName", "lastName", "email"]; // username/position immutable
  const patch = {};
  allowed.forEach((k) => {
    if (k in req.body) patch[k] = req.body[k];
  });
  const user = await User.findByIdAndUpdate(req.user._id, patch, {
    new: true,
  }).select("-password");
  res.json({ success: true, user });
};

// PUT /api/users/me/password
export const changePassword = async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body || {};
  if (!currentPassword || !newPassword || !confirmPassword)
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  if (newPassword !== confirmPassword)
    return res
      .status(400)
      .json({ success: false, message: "New passwords do not match" });
  if (newPassword.length < 8)
    return res
      .status(400)
      .json({
        success: false,
        message: "Password must be at least 8 characters",
      });

  const user = await User.findById(req.user._id);
  if (!user)
    return res.status(404).json({ success: false, message: "User not found" });

  const ok = await user.comparePassword(currentPassword);
  if (!ok)
    return res
      .status(401)
      .json({ success: false, message: "Current password is incorrect" });

  const same = await bcrypt.compare(newPassword, user.password);
  if (same)
    return res
      .status(400)
      .json({ success: false, message: "New password must be different" });

  user.password = await bcrypt.hash(newPassword, 10); // hash here (no pre-save hook)
  await user.save();
  res.json({ success: true, message: "Password updated" });
};

// POST /api/users/me/avatar  (multer middleware already in your project)
export const uploadAvatar = async (req, res) => {
  if (!req.file)
    return res
      .status(400)
      .json({ success: false, message: "No file uploaded" });
  const url = `/uploads/${req.file.filename}`;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { profilePicture: url },
    { new: true }
  ).select("-password");
  res.json({ success: true, user, url });
};
