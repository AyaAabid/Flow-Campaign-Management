import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Card, 
  Button, 
  Tag, 
  Statistic, 
  Row, 
  Col, 
  Space, 
  Table, 
  message,
  Skeleton,
  Empty
} from "antd";
import { 
  EditOutlined, 
  DeleteOutlined, 
  ArrowLeftOutlined, 
  PlusOutlined,
  TeamOutlined,
  BarChartOutlined,
  CheckCircleOutlined,
  DollarOutlined
} from "@ant-design/icons";
import { fetchAgencies, deleteAgency } from "../../services/agencies";
import { fetchCampaigns } from "../../services/campaigns";

export default function AgencyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [agency, setAgency] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [campaignsLoading, setCampaignsLoading] = useState(false);

  const loadAgency = async () => {
    try {
      setLoading(true);
      const agencies = await fetchAgencies();
      const foundAgency = agencies.find(a => a._id === id);
      if (foundAgency) {
        setAgency(foundAgency);
      } else {
        message.error("Agency not found");
        navigate("/agencies");
      }
    } catch (error) {
      console.error("Error loading agency:", error);
      message.error("Failed to load agency details");
    } finally {
      setLoading(false);
    }
  };

  const loadCampaigns = async () => {
    try {
      setCampaignsLoading(true);
      const allCampaigns = await fetchCampaigns();
      const agencyCampaigns = allCampaigns.filter(c => c.agency === agency?.agencyName);
      setCampaigns(agencyCampaigns);
    } catch (error) {
      console.error("Error loading campaigns:", error);
      message.error("Failed to load campaigns");
    } finally {
      setCampaignsLoading(false);
    }
  };

  useEffect(() => {
    loadAgency();
  }, [id]);

  useEffect(() => {
    if (agency) {
      loadCampaigns();
    }
  }, [agency]);

  const handleDelete = async () => {
    try {
      await deleteAgency(id);
      message.success("Agency deleted successfully");
      navigate("/agencies");
    } catch (error) {
      console.error("Error deleting agency:", error);
      message.error("Failed to delete agency");
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'green';
      case 'inactive': return 'red';
      default: return 'default';
    }
  };

  const getCampaignStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'running': return 'green';
      case 'completed': return 'blue';
      case 'waiting_for_approval': return 'orange';
      case 'draft': return 'gray';
      case 'aborted': return 'red';
      default: return 'default';
    }
  };

  const campaignColumns = [
    {
      title: "Campaign Name",
      dataIndex: "campaign_name",
      key: "campaign_name",
      render: (text, record) => (
        <Button 
          type="link" 
          onClick={() => navigate(`/campaigns/${record.id}/edit`)}
          className="p-0 h-auto"
        >
          {text || record.name || "Unnamed Campaign"}
        </Button>
      ),
    },
    {
      title: "Brand",
      dataIndex: "brand",
      key: "brand",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={getCampaignStatusColor(status)}>
          {status?.replace(/_/g, ' ').toUpperCase() || 'Unknown'}
        </Tag>
      ),
    },
    {
      title: "Launch Date",
      dataIndex: "launchDate",
      key: "launchDate",
      render: (date) => date ? new Date(date).toLocaleDateString() : "—",
    },
    {
      title: "End Date",
      dataIndex: "endDate",
      key: "endDate",
      render: (date) => date ? new Date(date).toLocaleDateString() : "—",
    },
  ];

  if (loading) {
    return <Skeleton active />;
  }

  if (!agency) {
    return (
      <div className="p-6">
        <Empty description="Agency not found" />
      </div>
    );
  }

  const totalCampaigns = campaigns.length;
  const activeCampaigns = campaigns.filter(c => c.status === 'Running').length;
  const completedCampaigns = campaigns.filter(c => c.status === 'Completed').length;

  return (
    <div className="p-4 md:p-6">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <TeamOutlined className="text-blue-500 text-2xl" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{agency.agencyName}</h1>
              <p className="text-gray-600">Agency ID: {agency._id}</p>
            </div>
          </div>
          <Space>
            <Button 
              type="primary" 
              icon={<EditOutlined />}
              onClick={() => navigate(`/agencies/${id}/edit`)}
            >
              Edit Agency
            </Button>
            <Button 
              danger 
              icon={<DeleteOutlined />}
              onClick={handleDelete}
            >
              Delete
            </Button>
          </Space>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Agency Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card 
            title={<span className="text-blue-600 font-semibold">Agency Information</span>}
            className="h-fit"
          >
            <div className="space-y-6">
              {/* Statistics Row */}
              <Row gutter={16}>
                <Col span={8}>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Statistic
                      title="Total Campaigns"
                      value={totalCampaigns}
                      valueStyle={{ color: '#1890ff', fontSize: '24px' }}
                      prefix={<BarChartOutlined />}
                    />
                  </div>
                </Col>
                <Col span={8}>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Statistic
                      title="Status"
                      value={agency.status || (agency.campaignCount > 0 ? 'Active' : 'Inactive')}
                      valueStyle={{ color: '#52c41a', fontSize: '24px' }}
                      prefix={<CheckCircleOutlined />}
                    />
                  </div>
                </Col>
                <Col span={8}>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <Statistic
                      title="Commission"
                      value={`${(agency.commission * 100).toFixed(1)}%`}
                      valueStyle={{ color: '#722ed1', fontSize: '24px' }}
                      prefix={<DollarOutlined />}
                    />
                  </div>
                </Col>
              </Row>

              {/* Agency Details Table */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="font-medium text-gray-600">Agency Name</span>
                    <span className="font-semibold">{agency.agencyName}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="font-medium text-gray-600">Agency ID</span>
                    <span className="font-mono text-red-600">{agency._id}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="font-medium text-gray-600">Email</span>
                    <span className="text-blue-600">{agency.agencyEmail || '—'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="font-medium text-gray-600">Phone</span>
                    <span>{agency.agencyPhone || '—'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="font-medium text-gray-600">Commission</span>
                    <Tag color="purple">{`${(agency.commission * 100).toFixed(1)}%`}</Tag>
                  </div>
                </div>
              </div>

              {/* Back Button */}
              <Button 
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate("/agencies")}
                className="w-full"
              >
                Back to List
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Column - Campaign Summary */}
        <div className="space-y-6">
          <Card 
            title={<span className="text-blue-600 font-semibold">Campaign Summary</span>}
            className="h-fit"
          >
            <div className="space-y-4">
              {/* Campaign Status Counters */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-700 mb-3">Campaign Status</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total</span>
                    <span className="font-bold text-lg">{totalCampaigns}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Active</span>
                    <span className="font-bold text-lg text-green-600">{activeCampaigns}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Completed</span>
                    <span className="font-bold text-lg text-blue-600">{completedCampaigns}</span>
                  </div>
                </div>
              </div>

              {/* Recent Campaigns */}
            <div>
                <h4 className="font-semibold text-gray-700 mb-3">Recent Campaigns</h4>
                {campaigns.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {campaigns.slice(0, 5).map((campaign, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{campaign.campaign_name || campaign.name || "Unnamed Campaign"}</p>
                            <p className="text-xs text-gray-500">{campaign.brand || "No Brand"}</p>
                          </div>
                          <Tag color={getCampaignStatusColor(campaign.status)} size="small">
                            {campaign.status?.replace(/_/g, ' ').toUpperCase() || 'Unknown'}
                          </Tag>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-2">
                      <BarChartOutlined className="text-4xl" />
                    </div>
                    <p className="text-gray-500 text-sm">No campaigns found</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
            </div>
          </div>

      {/* Campaigns Table Section */}
      {campaigns.length > 0 && (
        <Card 
          title={<span className="text-blue-600 font-semibold">All Campaigns</span>}
          className="mt-6"
          extra={
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => navigate("/campaigns/new")}
            >
              New Campaign
            </Button>
          }
        >
          <Table
            columns={campaignColumns}
            dataSource={campaigns.map((campaign, index) => ({
              ...campaign,
              key: campaign.id || index,
            }))}
            loading={campaignsLoading}
            pagination={{ pageSize: 10 }}
            size="middle"
          />
        </Card>
      )}

      {/* Floating Action Button */}
      <Button
        type="primary"
        shape="circle"
        size="large"
        icon={<PlusOutlined />}
        className="fixed bottom-6 right-6 shadow-lg"
        onClick={() => navigate("/campaigns/new")}
      />
    </div>
  );
}
