import Creative from "../models/Creative.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import sharp from "sharp";

// Configure multer for creative uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(process.cwd(), "uploads", "creatives");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `creative_${Date.now()}_${Math.random().toString(36).substr(2, 9)}${ext}`;
    cb(null, filename);
  },
});

export const creativeUpload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/jpg", 
      "image/png",
      "image/gif",
      "image/webp",
      "video/mp4",
      "video/avi",
      "video/mov",
      "video/wmv"
    ];
    const ok = allowedTypes.includes(file.mimetype);
    cb(ok ? null : new Error("Invalid file type"), ok);
  },
});

// Upload creative
export const uploadCreative = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const file = req.file;
    const filePath = file.path;
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const url = `${baseUrl}/uploads/creatives/${file.filename}`;

    // Get file dimensions
    let width, height;
    if (file.mimetype.startsWith('image/')) {
      const metadata = await sharp(filePath).metadata();
      width = metadata.width;
      height = metadata.height;
    } else {
      // For videos, we'll use default dimensions or extract from metadata
      width = 1920; // Default width
      height = 1080; // Default height
    }

    const creative = new Creative({
      originalname: file.originalname,
      filename: file.filename,
      url: url,
      mimeType: file.mimetype,
      size: file.size,
      resolution: { width, height },
      campaign: req.body.campaignId || null,
      createdBy: req.user._id,
    });

    await creative.save();

    res.json({
      success: true,
      creative: {
        id: creative._id,
        url: creative.url,
        mimeType: creative.mimeType,
        originalname: creative.originalname,
        resolution: creative.resolution
      }
    });
  } catch (error) {
    console.error("Upload Creative Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get creatives by campaign
export const getCreativesByCampaign = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const creatives = await Creative.find({ campaign: campaignId })
      .populate("createdBy", "name email")
      .lean();

    const baseUrl = `${req.protocol}://${req.get('host')}`;

    res.json({
      success: true,
      creatives: creatives.map(c => ({
        id: c._id,
        url: c.url.startsWith('http') ? c.url : `${baseUrl}${c.url}`,
        mimeType: c.mimeType,
        originalname: c.originalname,
        resolution: c.resolution,
        createdAt: c.createdAt
      }))
    });
  } catch (error) {
    console.error("Get Creatives Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete creative
export const deleteCreative = async (req, res) => {
  try {
    const { id } = req.params;
    const creative = await Creative.findById(id);
    
    if (!creative) {
      return res.status(404).json({ success: false, message: "Creative not found" });
    }

    // Delete file from filesystem
    const filePath = path.join(process.cwd(), "uploads", "creatives", creative.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Creative.findByIdAndDelete(id);

    res.json({ success: true, message: "Creative deleted successfully" });
  } catch (error) {
    console.error("Delete Creative Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
