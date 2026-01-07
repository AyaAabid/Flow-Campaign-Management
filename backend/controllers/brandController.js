// backend/controllers/brandController.js
import Brand from "../models/Brand.js";
import Campaign from "../models/Campaign.js";

export const addBrand = async (req, res) => {
  try {
    const brand = await Brand.create(req.body);
    res.status(201).json({ success: true, brand });
  } catch (error) {
    console.error("Add Brand Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getBrands = async (_req, res) => {
  try {
    const brands = await Brand.find().sort("brandName");
    
    // Get campaign counts for each brand
    const brandsWithCounts = await Promise.all(
      brands.map(async (brand) => {
        const campaignCount = await Campaign.countDocuments({ brand: brand._id });
        return {
          ...brand.toObject(),
          campaignCount,
          status: campaignCount > 0 ? 'Active' : 'Inactive'
        };
      })
    );
    
    res.json({ success: true, brands: brandsWithCounts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getBrandById = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand)
      return res.status(404).json({ success: false, message: "Not found" });
    
    const campaignCount = await Campaign.countDocuments({ brand: brand._id });
    const brandWithCount = {
      ...brand.toObject(),
      campaignCount,
      status: campaignCount > 0 ? 'Active' : 'Inactive'
    };
    
    res.json({ success: true, brand: brandWithCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateBrand = async (req, res) => {
  try {
    const brand = await Brand.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!brand)
      return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, brand });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteBrand = async (req, res) => {
  try {
    const brand = await Brand.findByIdAndDelete(req.params.id);
    if (!brand)
      return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, message: "Brand deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get brand details with campaigns
export const getBrandDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get brand information
    const brand = await Brand.findById(id);
    if (!brand) {
      return res.status(404).json({ success: false, message: "Brand not found" });
    }

    // Get campaigns for this brand with populated agency information
    const campaigns = await Campaign.find({ brand: id })
      .populate('agency', 'agencyName agencyEmail agencyPhone commission')
      .populate('createdBy', 'firstName lastName username email')
      .sort({ createdAt: -1 });

    // Get campaign statistics
    const campaignStats = await Campaign.aggregate([
      { $match: { brand: brand._id } },
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
      agency: campaign.agency?.agencyName || 'Unknown Agency',
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

    const brandDetails = {
      ...brand.toObject(),
      campaignCount: totalCampaigns,
      activeCampaigns,
      status: totalCampaigns > 0 ? 'Active' : 'Inactive',
      campaignStats: statusBreakdown,
      recentCampaigns,
      allCampaigns: campaigns.map(campaign => ({
        id: campaign._id,
        name: campaign.campaign_name,
        agency: campaign.agency?.agencyName || 'Unknown Agency',
        agencyEmail: campaign.agency?.agencyEmail || '',
        agencyPhone: campaign.agency?.agencyPhone || '',
        commission: campaign.agency?.commission || 0,
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

    res.json({ success: true, brand: brandDetails });
  } catch (error) {
    console.error("Get Brand Details Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
