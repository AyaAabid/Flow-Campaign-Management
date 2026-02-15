// frontend/editor-ui/src/features/campaigns/CampaignList.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Dropdown,
  Input,
  Select,
  Table,
  Tag,
  message,
  Space,
  Card,
  Modal,
  List,
} from "antd";
import { PlusOutlined, MoreOutlined, EyeOutlined } from "@ant-design/icons";
import {
  fetchCampaigns,
  deleteCampaign,
  updateCampaignStatus,
} from "../../services/campaigns";
import SummaryStrip from "./SummaryStrip";
import { CAMPAIGN_STATUS_OPTIONS } from "../../constants/campaigns";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

const tagFor = (status) => {
  switch (status) {
    case "Running":
      return <Tag color="processing">Running</Tag>;
    case "Completed":
      return <Tag color="blue">Completed</Tag>;
    case "Ready_to_go":
      return <Tag color="green">Ready to go</Tag>;
    case "Waiting_for_approval":
      return <Tag color="gold">Waiting for approval</Tag>;
    case "Aborted":
      return <Tag color="red">Aborted</Tag>;
    case "Draft":
    default:
      return <Tag>Draft</Tag>;
  }
};

/* MapPreview: uses react-leaflet if available, otherwise fallback box */
let MapPreview = ({ coords = null, height = 220 }) => (
  <div
    style={{
      height,
      border: "1px solid #e6e6e6",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#777",
      background: "#fafafa",
    }}
  >
    {coords
      ? `Coordinates: ${coords.lat}, ${coords.lng}`
      : "No location coords"}
  </div>
);

try {
  // try to require react-leaflet & leaflet dynamically (works if installed)
  // eslint-disable-next-line global-require
  const { MapContainer, TileLayer, Marker } = require("react-leaflet");
  // eslint-disable-next-line global-require
  const L = require("leaflet");
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
    iconUrl: require("leaflet/dist/images/marker-icon.png"),
    shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
  });

  MapPreview = ({ coords = null, height = 220 }) => {
    const center = coords ? [coords.lat, coords.lng] : [24.8607, 67.0011];
    return (
      <div style={{ height, border: "1px solid #e6e6e6" }}>
        return (
        <MapContainer
          center={center}
          zoom={coords ? 13 : 6}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {coords ? <Marker position={[coords.lat, coords.lng]} /> : null}
        </MapContainer>
        );
      </div>
    );
  };
} catch (err) {
  // leaflet not installed -> keep fallback MapPreview above
}

export default function CampaignsList() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(null);
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState("All Status");
  const [search, setSearch] = useState("");

  // modal state for locations preview
  const [locationsModalOpen, setLocationsModalOpen] = useState(false);
  const [modalCampaign, setModalCampaign] = useState(null);
  const [modalHighlightedLocation, setModalHighlightedLocation] =
    useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const items = await fetchCampaigns();
      const normalized = (items || []).map((c, idx) => {
        const internalId =
          c.internalId || c._id || String(idx).padStart(5, "0");
        // const venueTypes =
        //   (Array.isArray(c.locations) && c.locations.length > 0
        //     ? Array.from(new Set(c.locations.map((l) => l.venueType || l.type || "Unknown")))
        //     : []);
        return {
          key: c._id || c.id || idx,
          id: c._id || c.id,
          internalId,
          campaign_name: c.campaign_name,
          campaign_type: c.campaign_type,
          status: c.status || "Draft",
          brand: c.brand?.brandName || c.brandName || "—",
          agency: c.agency?.agencyName || c.agencyName || "—",
          submittedBy: c.createdBy?.email || c.createdBy?.username || "—",
          createdAt: c.createdAt,
          updatedAt: c.updatedAt,
          dateRange: [c.launchDate, c.endDate].filter(Boolean),
          raw: c,
          // venueTypes,
        };
      });
      setRows(normalized);
    } catch (e) {
      console.error(e);
      message.error("Failed to load campaigns");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // optionally poll for updates (to reflect auto-running/completed) — uncomment if needed:
    // const t = setInterval(load, 60_000);
    // return () => clearInterval(t);
  }, []);

  const filtered = useMemo(() => {
    let data = rows;
    if (status !== "All Status") data = data.filter((r) => r.status === status);
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(
        (r) =>
          (r.campaign_name || "").toLowerCase().includes(q) ||
          (r.campaign_type || "").toLowerCase().includes(q) ||
          (r.submittedBy || "").toLowerCase().includes(q) ||
          (`${r.internalId}` || "").toLowerCase().includes(q),
      );
    }
    return data;
  }, [rows, status, search]);

  const manualStatuses = [
    "Draft",
    "Waiting_for_approval",
    "Ready_to_go",
    "Aborted",
  ];

  const handleStatusChange = async (id, val) => {
    try {
      if (!manualStatuses.includes(val)) {
        message.warning("This status is not editable manually.");
        return;
      }
      setSaving(id);
      await updateCampaignStatus(id, val);
      await load();
      message.success("Status updated");
    } catch (err) {
      console.error(err);
      message.error("Failed to update status");
    } finally {
      setSaving(null);
    }
  };

  const handleApprove = async (record) => {
    try {
      setSaving(record.id);
      await updateCampaignStatus(record.id, "Ready_to_go");
      await load();
      message.success("Campaign approved (Ready to go)");
    } catch (err) {
      console.error(err);
      message.error("Failed to approve campaign");
    } finally {
      setSaving(null);
    }
  };

  const handleAbort = async (record) => {
    try {
      setSaving(record.id);
      await updateCampaignStatus(record.id, "Aborted");
      await load();
      message.success("Campaign aborted");
    } catch (err) {
      console.error(err);
      message.error("Failed to abort campaign");
    } finally {
      setSaving(null);
    }
  };

  const openLocationsModal = (record) => {
    setModalCampaign(record.raw);
    // highlight first location by default
    const first = (record.raw?.locations && record.raw.locations[0]) || null;
    setModalHighlightedLocation(first);
    setLocationsModalOpen(true);
  };

  const columns = [
    { title: "ID", dataIndex: "internalId", width: 100 },
    {
      title: "Name",
      dataIndex: "campaign_name",
      width: 220,
      render: (v, r) => (
        <div>
          <div style={{ fontWeight: 600 }}>{v}</div>
          <div style={{ fontSize: 12, color: "#666" }}>
            {r.dateRange?.length === 2
              ? `${new Date(r.dateRange[0]).toLocaleDateString()} - ${new Date(r.dateRange[1]).toLocaleDateString()}`
              : ""}
          </div>
        </div>
      ),
    },
    { title: "Type", dataIndex: "campaign_type", width: 120 },
    {
      title: "Status",
      dataIndex: "status",
      width: 280,
      render: (s, record) => {
        // keep Running/Completed as tags only (non-editable). Only allow manual statuses in select.
        return (
          <Space size="small">
            {tagFor(s)}
            <Select
              size="small"
              style={{ width: 200 }}
              placeholder="Change status"
              value={manualStatuses.includes(s) ? s : undefined}
              options={CAMPAIGN_STATUS_OPTIONS}
              onChange={(val) => handleStatusChange(record.id, val)}
            />
          </Space>
        );
      },
    },

    // {

    //   title: "Venue Types",
    //   dataIndex: "venueTypes",
    //   width: 140,
    //   render: (vt = []) =>
    //     vt.length ? vt.map((t) => <Tag key={t}>{t}</Tag>) : <span>No venues</span>,
    // },
    { title: "Submitted By", dataIndex: "submittedBy", width: 160 },
    {
      title: "Created",
      dataIndex: "createdAt",
      width: 160,
      render: (d) => (d ? new Date(d).toLocaleString() : "—"),
    },
    {
      title: "Updated",
      dataIndex: "updatedAt",
      width: 160,
      render: (d) => (d ? new Date(d).toLocaleString() : "—"),
    },
    {
      title: "Action",
      key: "action",
      width: 160,
      render: (_, record) => {
        const items = [
          {
            key: "edit",
            label: "Edit",
            onClick: () => navigate(`/campaigns/${record.id}/edit`),
          },
          {
            key: "approve",
            label: "Approve (Ready to go)",
            onClick: () => handleApprove(record),
          },
          {
            key: "abort",
            label: "Abort",
            danger: true,
            onClick: () => handleAbort(record),
          },
          {
            key: "delete",
            label: "Delete",
            danger: true,
            onClick: async () => {
              try {
                setSaving(record.id);
                await deleteCampaign(record.id);
                message.success("Campaign deleted");
                await load();
              } catch {
                message.error("Failed to delete");
              } finally {
                setSaving(null);
              }
            },
          },
        ];
        return (
          <Space direction="horizontal">
            <Dropdown
              menu={{
                items: items.map((it) => ({
                  key: it.key,
                  label: it.label,
                  danger: it.danger,
                  onClick: it.onClick,
                })),
              }}
            >
              <Button icon={<MoreOutlined />} loading={saving === record.id} />
            </Dropdown>
          </Space>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Campaigns</h2>
          <p className="text-gray-500">Manage campaigns and their lifecycle.</p>
        </div>

        <div className="flex items-center gap-2">
          <Select
            style={{ width: 200 }}
            value={status}
            onChange={setStatus}
            options={[
              { label: "All Status", value: "All Status" },
              ...CAMPAIGN_STATUS_OPTIONS.filter((o) => !o.disabled),
            ]}
          />
          <Input.Search
            allowClear
            placeholder="Search by name, type, id, or submitted by"
            style={{ width: 320 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate("/campaigns/new")}
          >
            New Campaign
          </Button>
        </div>
      </div>

      <SummaryStrip rows={rows} />

      <Table
        loading={loading}
        columns={columns}
        dataSource={filtered}
        pagination={{ pageSize: 10, showSizeChanger: true }}
        bordered
        size="middle"
      />

      <Modal
        visible={locationsModalOpen}
        title={
          modalCampaign
            ? `Locations for ${modalCampaign.campaign_name || modalCampaign.name || ""}`
            : "Locations"
        }
        onCancel={() => setLocationsModalOpen(false)}
        footer={
          <Space>
            <Button onClick={() => setLocationsModalOpen(false)}>Close</Button>
          </Space>
        }
        width={900}
      >
        {modalCampaign ? (
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1, maxHeight: 420, overflow: "auto" }}>
              <List
                itemLayout="horizontal"
                dataSource={modalCampaign.locations || []}
                renderItem={(loc) => (
                  <List.Item
                    style={{ cursor: "pointer", padding: 12 }}
                    onClick={() => setModalHighlightedLocation(loc)}
                  >
                    <List.Item.Meta
                      title={
                        loc.name || loc.assetName || loc.asset?.name || "Asset"
                      }
                      description={
                        <>
                          <div style={{ fontSize: 12, color: "#666" }}>
                            {loc.network || loc.meta || ""}
                          </div>
                          <div style={{ fontSize: 12, color: "#666" }}>
                            {loc.coords
                              ? `Coords: ${loc.coords.lat}, ${loc.coords.lng}`
                              : "No coordinates"}
                          </div>
                        </>
                      }
                    />
                    <div>
                      {loc.previewCreative ? (
                        /\.(jpg|jpeg|png|gif)$/i.test(loc.previewCreative) ? (
                          <img
                            src={loc.previewCreative}
                            alt=""
                            style={{
                              width: 120,
                              height: 70,
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <video
                            src={loc.previewCreative}
                            style={{ width: 120, height: 70 }}
                          />
                        )
                      ) : (
                        <div
                          style={{
                            width: 120,
                            height: 70,
                            background: "#fafafa",
                            border: "1px solid #eee",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#999",
                          }}
                        >
                          No preview
                        </div>
                      )}
                    </div>
                  </List.Item>
                )}
              />
            </div>

            <div style={{ width: 360 }}>
              <div style={{ marginBottom: 8, fontWeight: 600 }}>
                Map / Preview
              </div>
              <MapPreview
                coords={modalHighlightedLocation?.coords || null}
                height={360}
              />
              <div style={{ marginTop: 8, fontSize: 12, color: "#666" }}>
                Click a location on the left to preview it on the map. Creatives
                assigned to locations are shown as small previews.
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
