import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const BrandDistribution = ({ activeCampaignsByBrand, timeline }) => {

  // If activeCampaignsByBrand is empty, create data from timeline
  const getBrandData = () => {
    if (activeCampaignsByBrand && activeCampaignsByBrand.length > 0) {
      // Convert API data structure to chart format
      return activeCampaignsByBrand.map(item => ({
        name: item.brandName,
        value: item.count,
        brandId: item.brandId
      }));
    }
    
    // Create brand distribution from timeline data
    if (timeline && timeline.length > 0) {
      const brandCounts = timeline.reduce((acc, campaign) => {
        acc[campaign.brand] = (acc[campaign.brand] || 0) + 1;
        return acc;
      }, {});
      
      return Object.entries(brandCounts).map(([name, value]) => ({
        name,
        value
      }));
    }
    
    return [];
  };

  const chartData = getBrandData();

  const COLORS = [
    '#3b82f6', // blue
    '#10b981', // emerald
    '#f59e0b', // amber
    '#ef4444', // red
    '#8b5cf6', // purple
    '#06b6d4', // cyan
    '#84cc16', // lime
    '#f97316', // orange
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const total = chartData.reduce((sum, item) => sum + item.value, 0);
      const percentage = ((data.value / total) * 100).toFixed(1);
      
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: data.color }}
              ></div>
              <p className="font-semibold text-gray-900">{data.name}</p>
            </div>
            
            {data.payload.brandId && (
              <div className="text-xs text-gray-500">
                ID: {data.payload.brandId}
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-500">Campaigns:</span>
                <p className="font-medium text-gray-900">{data.value}</p>
              </div>
              <div>
                <span className="text-gray-500">Percentage:</span>
                <p className="font-medium text-gray-900">{percentage}%</p>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }) => {
    const total = chartData.reduce((sum, item) => sum + item.value, 0);
    
    return (
      <div className="space-y-2">
        {payload.map((entry, index) => {
          const percentage = ((entry.payload.value / total) * 100).toFixed(1);
          return (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: entry.color }}
                ></div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-gray-900 text-sm truncate">{entry.value}</div>
                  {entry.payload.brandId && (
                    <div className="text-xs text-gray-500 truncate">ID: {entry.payload.brandId}</div>
                  )}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-sm font-semibold text-gray-900">{entry.payload.value}</div>
                <div className="text-xs text-gray-500">({percentage}%)</div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Remove labels from pie chart to prevent display issues


  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Campaigns by Brand</h3>
          <div className="text-sm text-gray-500 mt-1">
            Distribution of All Campaigns
          </div>
        </div>
      </div>
      
      {chartData.length > 0 ? (
        <div className="space-y-4">
          {/* Chart Section */}
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Legend Section */}
          <div className="mt-4">
            <CustomLegend payload={chartData.map((entry, index) => ({
              value: entry.name,
              color: COLORS[index % COLORS.length],
              payload: entry
            }))} />
          </div>
        </div>
      ) : (
        <div className="h-80 flex items-center justify-center">
          <div className="text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">No Campaigns</h4>
            <p className="text-gray-500 text-sm mb-4">
              There are currently no campaigns to display brand distribution.
            </p>
            <div className="text-xs text-gray-400">
              <p>• Create campaigns to see brand distribution</p>
              <p>• Check your campaign data</p>
            </div>
          </div>
        </div>
      )}
      
   
    </div>
  );
};

export default BrandDistribution;
