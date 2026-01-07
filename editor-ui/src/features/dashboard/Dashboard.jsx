import React, { useState, useEffect } from "react";
import CampaignCounters from "../../components/dashboard/CampaignCounters";
import CampaignTimeline from "../../components/dashboard/CampaignTimeline";
import BrandDistribution from "../../components/dashboard/BrandDistribution";
import CampaignCreators from "../../components/dashboard/CampaignCreators";
import DailyCreations from "../../components/dashboard/DailyCreations";
import { getDashboardData } from "../../services/dashboard";
import {
  BarChart3,
  Users,
  PieChart,
  Calendar,
  TrendingUp,
  Loader2,
} from "lucide-react";

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const data = await getDashboardData();
        setDashboardData(data);
        setError(null);
      } catch (err) {
        setError("Failed to load dashboard data");
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Error Loading Dashboard
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          </div>
        </div>
      </div>

      {/* Campaign Counters */}
      <CampaignCounters
        totalCampaigns={dashboardData?.totalCampaigns}
        campaignsByStatus={dashboardData?.campaignsByStatus}
      />

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Campaign Timeline */}
        <div className="lg:col-span-2">
          <CampaignTimeline timeline={dashboardData?.timeline} />
        </div>

        {/* Brand Distribution */}
        <div>
          <BrandDistribution
            activeCampaignsByBrand={dashboardData?.activeCampaignsByBrand}
            timeline={dashboardData?.timeline}
          />
        </div>

        {/* Daily Creations */}
        <div>
          <DailyCreations dailyCreations={dashboardData?.dailyCreations} />
        </div>
      </div>

      {/* Campaign Creators */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <CampaignCreators campaignCreators={dashboardData?.campaignCreators} />
      </div>
    </div>
  );
};

export default Dashboard;
