import React from 'react';
import { User, Award, TrendingUp } from 'lucide-react';

const CampaignCreators = ({ campaignCreators }) => {
  const sortedCreators = (campaignCreators || [])
    .map(creator => ({ 
      name: creator.name, 
      count: creator.campaignCount,
      username: creator.username 
    }))
    .sort((a, b) => b.count - a.count);

  const getCreatorRank = (index) => {
    if (index === 0) return { icon: Award, color: 'text-yellow-500', bgColor: 'bg-yellow-50' };
    if (index === 1) return { icon: TrendingUp, color: 'text-gray-400', bgColor: 'bg-gray-50' };
    if (index === 2) return { icon: TrendingUp, color: 'text-amber-600', bgColor: 'bg-amber-50' };
    return { icon: User, color: 'text-blue-500', bgColor: 'bg-blue-50' };
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const totalCampaigns = sortedCreators.reduce((sum, creator) => sum + creator.count, 0);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Campaign Creators</h3>
        <div className="text-sm text-gray-500">
          {sortedCreators.length} creators
        </div>
      </div>
      
      <div className="space-y-4">
        {sortedCreators.map((creator, index) => {
          const rank = getCreatorRank(index);
          const RankIcon = rank.icon;
          const percentage = ((creator.count / totalCampaigns) * 100).toFixed(1);
          
          return (
            <div key={creator.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`p-2 ${rank.bgColor} rounded-full`}>
                  <RankIcon className={`h-5 w-5 ${rank.color}`} />
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-blue-700">
                      {getInitials(creator.name)}
                    </span>
                  </div>
                  
                  <div>
                    <p className="font-medium text-gray-900">{creator.name}</p>
                    <p className="text-sm text-gray-500">@{creator.username}</p>
                    <p className="text-sm text-gray-500">
                      {creator.count} campaign{creator.count !== 1 ? 's' : ''} created
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-900">{creator.count}</p>
                  <p className="text-xs text-gray-500">{percentage}%</p>
                </div>
                
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Total Campaigns Created:</span>
          <span className="font-semibold text-gray-900">{totalCampaigns}</span>
        </div>
        
        <div className="flex justify-between items-center text-sm mt-1">
          <span className="text-gray-600">Average per Creator:</span>
          <span className="font-semibold text-gray-900">
            {(totalCampaigns / sortedCreators.length).toFixed(1)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CampaignCreators;
