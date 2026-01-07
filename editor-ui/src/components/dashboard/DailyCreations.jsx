import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Calendar, TrendingUp } from 'lucide-react';

const DailyCreations = ({ dailyCreations }) => {
  const dailyData = dailyCreations || [];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{formatDate(label)}</p>
          <p className="text-sm text-gray-600">
            Campaigns Created: {data.count}
          </p>
        </div>
      );
    }
    return null;
  };

  const totalCreations = dailyData.reduce((sum, day) => sum + day.count, 0);
  const averageCreations = dailyData.length > 0 ? (totalCreations / dailyData.length).toFixed(1) : 0;
  const maxCreations = Math.max(...dailyData.map(day => day.count), 0);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Daily Campaign Creations</h3>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar className="h-4 w-4" />
          <span>Last {dailyData.length} days</span>
        </div>
      </div>
      
      {dailyData.length > 0 ? (
        <>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={dailyData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 20,
                }}
              >
                <defs>
                  <linearGradient id="colorCreations" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatDate}
                  stroke="#64748b"
                  fontSize={12}
                />
                <YAxis 
                  domain={[0, 'dataMax + 1']}
                  stroke="#64748b"
                  fontSize={12}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorCreations)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
        
        </>
      ) : (
        <div className="h-80 flex items-center justify-center">
          <div className="text-center">
            <div className="text-gray-400 mb-2">
              <Calendar className="w-16 h-16 mx-auto" />
            </div>
            <p className="text-gray-500 text-sm">No campaign creation data available</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyCreations;
