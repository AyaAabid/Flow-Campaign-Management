import React from 'react';
import { 
  BarChart3, 
  Clock, 
  CheckCircle, 
  Play, 
  AlertCircle, 
  XCircle,
  FileText 
} from 'lucide-react';

const CampaignCounters = ({ totalCampaigns, campaignsByStatus }) => {
  console.log('CampaignCounters received:', { totalCampaigns, campaignsByStatus });
  
  // Handle case when data is not available
  if (!totalCampaigns && !campaignsByStatus) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Campaigns</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">-</p>
              <p className="text-xs text-gray-500 mt-1">Loading...</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-full">
              <BarChart3 className="h-6 w-6 text-gray-400" />
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  const total = totalCampaigns?.total || 0;
  const byStatus = campaignsByStatus?.reduce((acc, item) => {
    acc[item.status] = item.count;
    return acc;
  }, {}) || {};

  const statusConfig = {
    'Draft': {
      icon: FileText,
      color: 'text-slate-500',
      bgColor: 'bg-slate-50',
      borderColor: 'border-slate-200'
    },
    'Waiting_for_approval': {
      icon: Clock,
      color: 'text-amber-500',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200'
    },
    'Ready_to_go': {
      icon: AlertCircle,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    'Running': {
      icon: Play,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200'
    },
    'Completed': {
      icon: CheckCircle,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    'Aborted': {
      icon: XCircle,
      color: 'text-red-500',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    }
  };

  const formatStatusLabel = (status) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Campaigns Counter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Campaigns</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{total}</p>
            <p className="text-xs text-gray-500 mt-1">All time</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-full">
            <BarChart3 className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Status-based Counters */}
      {Object.entries(byStatus).map(([status, count]) => {
        const config = statusConfig[status];
        const Icon = config.icon;
        
        return (
          <div key={status} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {formatStatusLabel(status)}
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{count}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {((count / total) * 100).toFixed(1)}% of total
                </p>
              </div>
              <div className={`p-3 ${config.bgColor} rounded-full`}>
                <Icon className={`h-6 w-6 ${config.color}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CampaignCounters;
