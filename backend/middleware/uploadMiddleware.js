// import multer from "multer";
// import path from "path";
// import fs from "fs";

// const uploadsDir = path.join(process.cwd(), "uploads");
// if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

// const storage = multer.diskStorage({
//   destination: (_req, _file, cb) => cb(null, uploadsDir),
//   filename: (req, file, cb) => {
//     const ext = path.extname(file.originalname) || ".png";
//     cb(null, `avatar_${req.user._id}_${Date.now()}${ext}`);
//   },
// });

// export const avatarUpload = multer({
//   storage,
//   limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
//   fileFilter: (_req, file, cb) => {
//     const ok = ["image/png", "image/jpeg", "image/jpg", "image/webp"].includes(
//       file.mimetype
//     );
//     cb(ok ? null : new Error("Invalid file type"), ok);
//   },
// });
import multer from "multer";
import path from "path";
import fs from "fs";

const uploadsDir =
  process.env.NODE_ENV === "production"
    ? path.join("/tmp", "uploads") // serverless-safe
    : path.join(process.cwd(), "uploads"); // local dev

// Make sure directory exists
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || ".png";
    cb(null, `avatar_${req.user._id}_${Date.now()}${ext}`);
  },
});

export const avatarUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    const ok = ["image/png", "image/jpeg", "image/jpg", "image/webp"].includes(
      file.mimetype,
    );
    cb(ok ? null : new Error("Invalid file type"), ok);
  },
});
