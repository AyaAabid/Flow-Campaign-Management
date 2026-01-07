import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const CampaignTimeline = ({ timeline }) => {
  const timelineData = timeline || [];

  // Handle empty data case
  if (timelineData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Campaign Timeline
          </h3>
        </div>

        <div className="h-80 flex items-center justify-center">
          <div className="text-center">
            <div className="text-gray-400 mb-2">
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
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <p className="text-gray-500 text-sm">No campaigns found</p>
            <p className="text-gray-400 text-xs mt-1">
              Create your first campaign to see the timeline
            </p>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    const colors = {
      Draft: "#94a3b8",
      Waiting_for_approval: "#f59e0b",
      Ready_to_go: "#3b82f6",
      Running: "#10b981",
      Completed: "#8b5cf6",
      Aborted: "#ef4444",
    };
    return colors[status] || "#6b7280";
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg max-w-xs">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getStatusColor(data.status) }}
              ></div>
              <p className="font-semibold text-gray-900">{data.name}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-500">Brand:</span>
                <p className="font-medium text-gray-900">{data.brand}</p>
              </div>
              <div>
                <span className="text-gray-500">Agency:</span>
                <p className="font-medium text-gray-900">{data.agency}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-500">Progress:</span>
                <p className="font-medium text-gray-900">{data.progress}%</p>
              </div>
              <div>
                <span className="text-gray-500">Status:</span>
                <p className="font-medium text-gray-900">
                  {data.status.replace("_", " ")}
                </p>
              </div>
            </div>

            {data.launchDate && (
              <div className="text-sm">
                <span className="text-gray-500">Launch:</span>
                <p className="font-medium text-gray-900">
                  {new Date(data.launchDate).toLocaleDateString()}
                </p>
              </div>
            )}

            {data.endDate && (
              <div className="text-sm">
                <span className="text-gray-500">End:</span>
                <p className="font-medium text-gray-900">
                  {new Date(data.endDate).toLocaleDateString()}
                </p>
              </div>
            )}

            {data.duration && (
              <div className="text-sm">
                <span className="text-gray-500">Duration:</span>
                <p className="font-medium text-gray-900">
                  {data.duration} days
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // Handle full data case
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Campaign Timeline
        </h3>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={timelineData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: timelineData.length > 3 ? 80 : 60,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="name"
              angle={timelineData.length > 2 ? -45 : 0}
              textAnchor={timelineData.length > 2 ? "end" : "middle"}
              height={timelineData.length > 2 ? 80 : 60}
              fontSize={11}
              stroke="#64748b"
              interval={0}
            />
            <YAxis
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
              stroke="#64748b"
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="progress" radius={[4, 4, 0, 0]}>
              {timelineData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getStatusColor(entry.status)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Status Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded"
            style={{ backgroundColor: "#94a3b8" }}
          ></div>
          <span>Draft</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded"
            style={{ backgroundColor: "#f59e0b" }}
          ></div>
          <span>Waiting for Approval</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded"
            style={{ backgroundColor: "#3b82f6" }}
          ></div>
          <span>Ready to Go</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded"
            style={{ backgroundColor: "#10b981" }}
          ></div>
          <span>Running</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded"
            style={{ backgroundColor: "#8b5cf6" }}
          ></div>
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded"
            style={{ backgroundColor: "#ef4444" }}
          ></div>
          <span>Aborted</span>
        </div>
      </div>

      {/* Timeline Summary */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <p className="text-gray-500">Total Campaigns</p>
            <p className="text-lg font-semibold text-gray-900">
              {timelineData.length}
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-500">Average Progress</p>
            <p className="text-lg font-semibold text-gray-900">
              {Math.round(
                timelineData.reduce(
                  (sum, campaign) => sum + campaign.progress,
                  0
                ) / timelineData.length
              )}
              %
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-500">Active Campaigns</p>
            <p className="text-lg font-semibold text-gray-900">
              {
                timelineData.filter((campaign) => campaign.status === "Running")
                  .length
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignTimeline;
