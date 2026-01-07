// backend/controllers/dashboardController.js
import Campaign from "../models/Campaign.js";
import Brand from "../models/Brand.js";
import User from "../models/User.js";
import { CampaignStatus } from "../models/CampaignStatus.js";

// Get comprehensive dashboard data (all endpoints combined)
export const getDashboardData = async (req, res) => {
  try {
    const [
      timelineData,
      totalCampaigns,
      statusCounts,
      brandDistribution,
      creators,
      dailyCreations
    ] = await Promise.all([
      Campaign.find({})
        .populate('brand', 'brandName')
        .populate('agency', 'agencyName')
        .sort({ launchDate: 1 }),
      Campaign.countDocuments(),
      Campaign.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Campaign.aggregate([
        { $match: { status: { $in: ['Running', 'Ready_to_go'] } } },
        { $lookup: { from: 'brands', localField: 'brand', foreignField: '_id', as: 'brandInfo' } },
        { $unwind: '$brandInfo' },
        { $group: { _id: '$brand', brandName: { $first: '$brandInfo.brandName' }, count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Campaign.aggregate([
        { $lookup: { from: 'users', localField: 'createdBy', foreignField: '_id', as: 'creatorInfo' } },
        { $unwind: '$creatorInfo' },
        { $group: { _id: '$createdBy', firstName: { $first: '$creatorInfo.firstName' }, lastName: { $first: '$creatorInfo.lastName' }, username: { $first: '$creatorInfo.username' }, campaignCount: { $sum: 1 } } },
        { $sort: { campaignCount: -1 } }
      ]),
      Campaign.aggregate([
        { $match: { createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
        { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' }, day: { $dayOfMonth: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
      ])
    ]);

    // Process timeline data
    const processedTimeline = timelineData.map(campaign => {
      const now = new Date();
      const launchDate = new Date(campaign.launchDate);
      const endDate = new Date(campaign.endDate);
      const totalDuration = endDate - launchDate;
      const elapsed = now - launchDate;
      
      let progress = 0;
      let status = 'upcoming';
      
      if (now < launchDate) {
        progress = 0;
        status = 'upcoming';
      } else if (now > endDate) {
        progress = 100;
        status = 'completed';
      } else {
        progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
        status = campaign.status === 'Running' ? 'active' : 'paused';
      }

      return {
        id: campaign._id,
        name: campaign.campaign_name,
        brand: campaign.brand?.brandName || 'Unknown',
        agency: campaign.agency?.agencyName || 'Unknown',
        launchDate: campaign.launchDate,
        endDate: campaign.endDate,
        status: campaign.status,
        progress: Math.round(progress),
        timelineStatus: status,
        duration: Math.ceil(totalDuration / (1000 * 60 * 60 * 24))
      };
    });

    // Process status counts
    const allStatuses = Object.values(CampaignStatus);
    const processedStatusCounts = allStatuses.map(status => {
      const found = statusCounts.find(item => item._id === status);
      return {
        status: status,
        count: found ? found.count : 0
      };
    });

    // Process brand distribution
    const processedBrandDistribution = brandDistribution.map(item => ({
      brandId: item._id,
      brandName: item.brandName,
      count: item.count
    }));

    // Process creators
    const processedCreators = creators.map(creator => ({
      userId: creator._id,
      name: `${creator.firstName || ''} ${creator.lastName || ''}`.trim() || creator.username,
      username: creator.username,
      campaignCount: creator.campaignCount
    }));

    // Process daily creations
    const result = [];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = new Date();
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const found = dailyCreations.find(item => {
        const itemDate = new Date(item._id.year, item._id.month - 1, item._id.day);
        return itemDate.toISOString().split('T')[0] === dateStr;
      });
      
      result.push({
        date: dateStr,
        count: found ? found.count : 0
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }

    res.status(200).json({
      success: true,
      data: {
        timeline: processedTimeline,
        totalCampaigns: { total: totalCampaigns },
        campaignsByStatus: processedStatusCounts,
        activeCampaignsByBrand: processedBrandDistribution,
        campaignCreators: processedCreators,
        dailyCreations: result
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching dashboard data",
      error: error.message
    });
  }
};
