// backend/controllers/agencyController.js
import Agency from "../models/Agency.js";
import Campaign from "../models/Campaign.js";

export const addAgency = async (req, res) => {
  try {
    const payload = { ...req.body };
    if (payload.commission == null) payload.commission = 0.01;
    if (Number(payload.commission) < 0.01)
      return res
        .status(400)
        .json({ success: false, message: "Commission must be ≥ 0.01" });

    const doc = await Agency.create(payload);
    res.json({ success: true, agency: doc });
  } catch (e) {
    res
      .status(500)
      .json({ success: false, message: "Failed to create agency" });
  }
};

export const getAgencies = async (_req, res) => {
  try {
    const agencies = await Agency.find().sort("agencyName");
    
    // Get campaign counts for each agency
    const agenciesWithCounts = await Promise.all(
      agencies.map(async (agency) => {
        const campaignCount = await Campaign.countDocuments({ agency: agency._id });
        return {
          ...agency.toObject(),
          campaignCount,
          status: campaignCount > 0 ? 'Active' : 'Inactive'
        };
      })
    );
    
    res.json({ success: true, agencies: agenciesWithCounts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAgency = async (req, res) => {
  try {
    const payload = { ...req.body };
    if (payload.commission != null && Number(payload.commission) < 0.01)
      return res
        .status(400)
        .json({ success: false, message: "Commission must be ≥ 0.01" });

    const doc = await Agency.findByIdAndUpdate(req.params.id, payload, {
      new: true,
    });
    if (!doc)
      return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, agency: doc });
  } catch (e) {
    res
      .status(500)
      .json({ success: false, message: "Failed to update agency" });
  }
};

export const getAgencyById = async (req, res) => {
  try {
    const doc = await Agency.findById(req.params.id);
    if (!doc)
      return res.status(404).json({ success: false, message: "Not found" });
    
    const campaignCount = await Campaign.countDocuments({ agency: doc._id });
    const agencyWithCount = {
      ...doc.toObject(),
      campaignCount,
      status: campaignCount > 0 ? 'Active' : 'Inactive'
    };
    
    res.json({ success: true, agency: agencyWithCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteAgency = async (req, res) => {
  try {
    const agency = await Agency.findByIdAndDelete(req.params.id);
    if (!agency)
      return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, message: "Agency deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get agency details with campaigns
export const getAgencyDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get agency information
    const agency = await Agency.findById(id);
    if (!agency) {
      return res.status(404).json({ success: false, message: "Agency not found" });
    }

    // Get campaigns for this agency with populated brand information
    const campaigns = await Campaign.find({ agency: id })
      .populate('brand', 'brandName brandIndustry')
      .populate('createdBy', 'firstName lastName username email')
      .sort({ createdAt: -1 });

    // Get campaign statistics
    const campaignStats = await Campaign.aggregate([
      { $match: { agency: agency._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Calculate total campaigns and active campaigns
    const totalCampaigns = campaigns.length;
    const activeCampaigns = campaigns.filter(c => ['Running', 'Ready_to_go'].includes(c.status)).length;

    // Get recent campaigns (last 5)
    const recentCampaigns = campaigns.slice(0, 5).map(campaign => ({
      id: campaign._id,
      name: campaign.campaign_name,
      brand: campaign.brand?.brandName || 'Unknown Brand',
      status: campaign.status,
      launchDate: campaign.launchDate,
      endDate: campaign.endDate,
      createdBy: {
        name: `${campaign.createdBy?.firstName || ''} ${campaign.createdBy?.lastName || ''}`.trim() || campaign.createdBy?.username,
        email: campaign.createdBy?.email
      },
      createdAt: campaign.createdAt
    }));

    // Format campaign statistics
    const statusBreakdown = campaignStats.map(stat => ({
      status: stat._id,
      count: stat.count
    }));

    const agencyDetails = {
      ...agency.toObject(),
      campaignCount: totalCampaigns,
      activeCampaigns,
      status: totalCampaigns > 0 ? 'Active' : 'Inactive',
      campaignStats: statusBreakdown,
      recentCampaigns,
      allCampaigns: campaigns.map(campaign => ({
        id: campaign._id,
        name: campaign.campaign_name,
        brand: campaign.brand?.brandName || 'Unknown Brand',
        brandIndustry: campaign.brand?.brandIndustry || '',
        status: campaign.status,
        launchDate: campaign.launchDate,
        endDate: campaign.endDate,
        createdBy: {
          name: `${campaign.createdBy?.firstName || ''} ${campaign.createdBy?.lastName || ''}`.trim() || campaign.createdBy?.username,
          email: campaign.createdBy?.email
        },
        createdAt: campaign.createdAt,
        updatedAt: campaign.updatedAt
      }))
    };

    res.json({ success: true, agency: agencyDetails });
  } catch (error) {
    console.error("Get Agency Details Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

