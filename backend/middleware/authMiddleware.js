// backend/middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    const h = req.headers.authorization || "";
    const token = h.startsWith("Bearer ") ? h.slice(7) : null;
    if (!token)
      return res.status(401).json({ success: false, message: "No token" });

    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(id).select("-password");
    if (!user)
      return res
        .status(401)
        .json({ success: false, message: "User not found" });

    req.user = user; // safe user
    next();
  } catch {
    res.status(401).json({ success: false, message: "Unauthorized" });
  }
};
