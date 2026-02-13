// backend/controllers/campaignController.js
import Campaign from "../models/Campaign.js";
import { computeStatus, needsStatusUpdate } from "../utils/CampaignStatus.js";

// Create
export const createCampaign = async (req, res) => {
  try {
    const payload = { ...req.body, createdBy: req.user._id };
    const c = await Campaign.create(payload);
    const doc = await Campaign.findById(c._id)
      .populate("brand agency createdBy")
      .lean();
    res
      .status(201)
      .json({
        success: true,
        campaign: { ...doc, status: computeStatus(doc) },
      });
  } catch (error) {
    console.error("Create Campaign Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update (excluding status which is handled by PATCH /status)
export const updateCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, ...rest } = req.body;
    const doc = await Campaign.findByIdAndUpdate(id, rest, { new: true })
      .populate("brand agency createdBy")
      .lean();
    if (!doc)
      return res.status(404).json({ success: false, message: "Not found" });
    res.json({
      success: true,
      campaign: { ...doc, status: computeStatus(doc) },
    });
  } catch (error) {
    console.error("Update Campaign Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCampaignById = async (req, res) => {
  try {
    const doc = await Campaign.findById(req.params.id)
      .populate("brand agency createdBy")
      .lean();
    if (!doc)
      return res.status(404).json({ success: false, message: "Not found" });
    res.json({
      success: true,
      campaign: { ...doc, status: computeStatus(doc) },
    });
  } catch (error) {
    console.error("Get Campaign Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const listCampaigns = async (_req, res) => {
  try {
    const docs = await Campaign.find({})
      .populate("brand agency createdBy")
      .lean();
    
    // Check and update campaigns that need status changes
    for (const campaign of docs) {
      const newStatus = needsStatusUpdate(campaign);
      if (newStatus) {
        await Campaign.findByIdAndUpdate(campaign._id, { status: newStatus });
        campaign.status = newStatus;
      }
    }
    
    res.json({
      success: true,
      campaigns: docs.map((c) => ({ ...c, status: computeStatus(c) })),
    });
  } catch (error) {
    console.error("List Campaigns Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await Campaign.findByIdAndDelete(id);
    if (!doc)
      return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, message: "Deleted" });
  } catch (error) {
    console.error("Delete Campaign Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCampaignStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const manual = ["Draft", "Waiting_for_approval", "Ready_to_go", "Aborted"];
    if (!manual.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Status must be one of: Draft, Waiting_for_approval, Ready_to_go, Aborted",
      });
    }
    const doc = await Campaign.findByIdAndUpdate(id, { status }, { new: true })
      .populate("brand agency createdBy")
      .lean();
    if (!doc)
      return res.status(404).json({ success: false, message: "Not found" });
    res.json({
      success: true,
      campaign: { ...doc, status: computeStatus(doc) },
    });
  } catch (error) {
    console.error("Update Status Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
