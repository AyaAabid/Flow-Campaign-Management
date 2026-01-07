// frontend/editor-ui/src/features/campaigns/CampaignForm.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  Select,
  Upload,
  message,
  Space,
  Divider,
  List,
  Tag,
  Row,
  Col,
} from "antd";
import { InboxOutlined, PlusOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import {
  createCampaign,
  fetchCampaign,
  updateCampaign,
  updateCampaignStatus,
} from "../../services/campaigns";
import { fetchBrands } from "../../services/brands";
import { fetchAgencies } from "../../services/agencies";
import { CAMPAIGN_TYPES } from "../../constants/campaigns";
import dummyAssets from "../../data/dummyAssets.json";
import dayjs from "dayjs";
import GoogleMapPreview from "../../components/GoogleMapPreview";

const { RangePicker } = DatePicker;
const { Dragger } = Upload;
const asString = (v) => (v == null ? undefined : String(v));

// Optional: map preview using react-leaflet (install react-leaflet & leaflet)
let MapPreview = ({ coords = null }) => (
  <div
    style={{
      height: 220,
      border: "1px solid #e6e6e6",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#777",
      background: "#fafafa",
    }}
  >
    {coords
      ? `Map: ${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`
      : "Map preview (click an asset to view location)"}
  </div>
);

try {
  // only load leaflet map if installed & available
  // eslint-disable-next-line global-require
  const { MapContainer, TileLayer, Marker } = require("react-leaflet");
  // eslint-disable-next-line global-require
  const L = require("leaflet");
  // small fix for default icon path if using webpack CRA
  delete L.Icon.Default.prototype._getIconUrl;
  // these require calls will work after installing leaflet package
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
    iconUrl: require("leaflet/dist/images/marker-icon.png"),
    shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
  });

  MapPreview = ({ coords = null }) => {
    const center = coords ? [coords.lat, coords.lng] : [24.8607, 67.0011]; // default center
    return (
      <div style={{ height: 220, border: "1px solid #e6e6e6" }}>
        <MapContainer
          center={center}
          zoom={coords ? 13 : 6}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {coords ? <Marker position={[coords.lat, coords.lng]} /> : null}
        </MapContainer>
      </div>
    );
  };
} catch (err) {
  // leaflet not installed -> MapPreview remains placeholder above
}

export default function CampaignForm({ mode = "create" }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [brands, setBrands] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [availableAssets, setAvailableAssets] = useState([]); // assets fetched from DB
  const [filteredAvailableAssets, setFilteredAvailableAssets] = useState([]); // filtered available assets
  const [selectedAssets, setSelectedAssets] = useState([]); // assets chosen for this campaign (locations)
  const [filteredSelectedAssets, setFilteredSelectedAssets] = useState([]); // filtered selected assets
  const [creatives, setCreatives] = useState([]); // uploaded creatives { id, url, mimeType }
  const [highlightedAsset, setHighlightedAsset] = useState(null); // currently highlighted asset for map/preview
  const isEdit = mode === "edit";

  useEffect(() => {
    if (isEdit && !id) {
      message.error("No campaign id provided for editing.");
      navigate("/campaigns", { replace: true });
    }
  }, [isEdit, id, navigate]);

  // load brands, agencies, assets and existing campaign (if edit)
  const load = async () => {
    try {
      setLoading(true);
      const [bRaw, aRaw] = await Promise.all([fetchBrands(), fetchAgencies()]);
      setBrands(
        (Array.isArray(bRaw) ? bRaw : []).map((x) => ({
          label: x.brandName,
          value: String(x._id),
        }))
      );
      setAgencies(
        (Array.isArray(aRaw) ? aRaw : []).map((x) => ({
          label: x.agencyName,
          value: String(x._id),
        }))
      );

      // Load dummy assets (will be replaced with API call later)
      setAvailableAssets(dummyAssets || []);
      setFilteredAvailableAssets(dummyAssets || []);

      if (isEdit && id) {
        const c = await fetchCampaign(id);
        form.setFieldsValue({
          campaign_name: c.campaign_name,
          campaign_type: c.campaign_type,
          brand: asString(c.brand?._id ?? c.brand),
          agency: asString(c.agency?._id ?? c.agency),
          dateRange:
            c.launchDate && c.endDate
              ? [dayjs(c.launchDate), dayjs(c.endDate)]
              : undefined,
          comment: c.comment,
        });
        setSelectedAssets(c.locations || []);
        setFilteredSelectedAssets(c.locations || []);
        setCreatives(
          Array.isArray(c.creatives)
            ? c.creatives.map((u, idx) => ({ id: `existing-${idx}`, url: u }))
            : []
        );
      }
    } catch (err) {
      console.error(err);
      message.error("Failed to load form data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Upload creative to backend (custom request)
  const handleUpload = async ({ file, onSuccess, onError }) => {
    try {
      const formData = new FormData();
      formData.append("files", file);
      const apiUrl =
        import.meta.env.VITE_API_URL || "http://localhost:3000/api";
      const res = await fetch(`${apiUrl}/creatives/upload`, {
        method: "POST",
        body: formData,
        credentials: "include",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Upload failed");

      // Add the uploaded creative to the list
      setCreatives((prev) => [...prev, json.creative]);
      onSuccess && onSuccess("ok");
    } catch (err) {
      console.error("upload error", err);
      onError && onError(err);
      message.error("Upload failed");
    }
  };

  // pick/deselect asset in availableAssets list
  const toggleAssetSelection = (asset) => {
    const exists = selectedAssets.find(
      (a) => String(a.id || a._id) === String(asset.id || asset._id)
    );
    if (exists) {
      setSelectedAssets((prev) =>
        prev.filter(
          (p) => String(p.id || p._id) !== String(asset.id || asset._id)
        )
      );
      setFilteredSelectedAssets((prev) =>
        prev.filter(
          (p) => String(p.id || p._id) !== String(asset.id || asset._id)
        )
      );
      if (
        highlightedAsset &&
        String(highlightedAsset.id || highlightedAsset._id) ===
          String(asset.id || asset._id)
      ) {
        setHighlightedAsset(null);
      }
    } else {
      // normalize to { id, name, coords, meta... }
      const normalized = {
        id: asset._id ?? asset.id ?? Math.random().toString(36).slice(2, 9),
        name: asset.name || asset.assetName || asset.title || "Untitled asset",
        coords: asset.coords || asset.coordinates || asset.latLng || null,
        meta: asset,
        previewCreative: asset.previewCreative || null, // existing preview if any
      };
      setSelectedAssets((prev) => [...prev, normalized]);
      setFilteredSelectedAssets((prev) => [...prev, normalized]);
    }
  };

  const removeSelectedAsset = (id) => {
    setSelectedAssets((prev) =>
      prev.filter((a) => String(a.id) !== String(id))
    );
    setFilteredSelectedAssets((prev) =>
      prev.filter((a) => String(a.id) !== String(id))
    );
    if (highlightedAsset && String(highlightedAsset.id) === String(id))
      setHighlightedAsset(null);
  };

  // set preview creative for a selected asset (store creative url)
  const setPreviewForAsset = (assetId, creativeUrl) => {
    setSelectedAssets((prev) =>
      prev.map((a) =>
        String(a.id) === String(assetId)
          ? { ...a, previewCreative: creativeUrl }
          : a
      )
    );
  };

  // build payload and submit
  const onSubmit = async (targetStatus = "Waiting_for_approval") => {
    try {
      const values = await form.validateFields();
      if (!selectedAssets || selectedAssets.length === 0) {
        message.error("Please select at least one asset/location.");
        return;
      }

      const payload = {
        campaign_name: values.campaign_name,
        campaign_type: values.campaign_type,
        brand: values.brand,
        agency: values.agency,
        comment: values.comment || "",
        launchDate: values.dateRange?.[0]?.toDate() ?? null,
        endDate: values.dateRange?.[1]?.toDate() ?? null,
        creatives: creatives.map((c) => c.url || c), // store urls (or ids if your backend expects ids)
        locations: selectedAssets.map((a) => ({
          id: a.id,
          name: a.name,
          coords: a.coords,
          previewCreative: a.previewCreative || null,
        })),
      };

      setLoading(true);
      if (isEdit) {
        await updateCampaign(id, payload);
        // if saving as Draft or Submit
        await updateCampaignStatus(id, targetStatus);
        message.success(targetStatus === "Draft" ? "Saved as draft" : "Saved");
      } else {
        await createCampaign({ ...payload, status: targetStatus });
        message.success(targetStatus === "Draft" ? "Saved as draft" : "Saved");
      }
      navigate("/campaigns");
    } catch (err) {
      console.error(err);
      message.error("Failed to save campaign. Please check required fields.");
    } finally {
      setLoading(false);
    }
  };

  // convenience: choose a creative to attach to currently highlighted asset
  const attachCreativeToHighlighted = (creative) => {
    if (!highlightedAsset) {
      message.info(
        "Click a selected asset to choose its preview creative first."
      );
      return;
    }
    setPreviewForAsset(highlightedAsset.id, creative.url || creative);
  };

  // UI helpers - no longer needed since we use filtered states directly

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">
          {isEdit ? "Edit Campaign" : "New Campaign"}
        </h2>
        <p className="text-gray-500">
          {isEdit
            ? "Update your campaign settings."
            : "Set up your new campaign."}
        </p>
      </div>

      <Form form={form} layout="vertical" disabled={loading}>
        {/* Identification */}
        <Card className="mb-4" title="Campaign Identification">
          <Row gutter={16}>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                label="Campaign name"
                name="campaign_name"
                rules={[{ required: true }]}
              >
                <Input placeholder="e.g., Summer Launch DOOH" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Form.Item
                label="Type"
                name="campaign_type"
                rules={[{ required: true }]}
              >
                <Select options={CAMPAIGN_TYPES} placeholder="Select a type" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Form.Item
                label="Brand"
                name="brand"
                rules={[{ required: true }]}
              >
                <Select
                  showSearch
                  options={brands}
                  placeholder="Select a brand"
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Form.Item
                label="Agency"
                name="agency"
                rules={[{ required: true }]}
              >
                <Select
                  showSearch
                  options={agencies}
                  placeholder="Select an agency"
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Form.Item
                label="Campaign dates"
                name="dateRange"
                rules={[{ required: true }]}
              >
                <RangePicker className="w-full" />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Campaign files / comments */}
        <Card className="mb-4" title="Campaign Files & Comments">
          <Form.Item label="Comment" name="comment">
            <Input.TextArea
              rows={3}
              placeholder="Optional notes for this campaign..."
            />
          </Form.Item>
          <Divider />
          <div style={{ fontSize: 13, color: "#666" }}>
            Upload the campaign's BO files as essential documentation
          </div>
          <div style={{ marginTop: 8 }}>
            <Upload beforeUpload={() => false}>
              <Button type="default">Browse</Button>
            </Upload>
          </div>
        </Card>

        {/* Location / Assets (left: available, right: selected + map) */}
        <Card className="mb-4" title="Location">
          <Row gutter={16}>
            <Col xs={24} md={10}>
              <div style={{ marginBottom: 8 }}>
                <Input.Search
                  placeholder="Search assets by name..."
                  onSearch={(v) => {
                    if (!v) {
                      setFilteredAvailableAssets(availableAssets);
                    } else {
                      const filtered = availableAssets.filter(
                        (a) =>
                          (a.name || a.assetName || a.title || "")
                            .toLowerCase()
                            .includes(v.toLowerCase()) ||
                          (a.venue || a.meta?.venue || "")
                            .toLowerCase()
                            .includes(v.toLowerCase()) ||
                          (a.network || a.meta?.network || "")
                            .toLowerCase()
                            .includes(v.toLowerCase())
                      );
                      setFilteredAvailableAssets(filtered);
                    }
                  }}
                />
              </div>

              <List
                size="small"
                bordered
                dataSource={filteredAvailableAssets}
                style={{ maxHeight: 320, overflow: "auto" }}
                renderItem={(item) => {
                  const picked = selectedAssets.some(
                    (s) => String(s.id || s._id) === String(item._id || item.id)
                  );
                  return (
                    <List.Item
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        toggleAssetSelection(item);
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 13 }}>
                          {item.name || item.assetName || item.title}
                        </div>
                        <div style={{ fontSize: 11, color: "#888" }}>
                          {item.meta || item.network || item.venue || ""}
                        </div>
                      </div>
                      <div>
                        {picked ? (
                          <Tag color="blue">Selected</Tag>
                        ) : (
                          <Tag>{item.type || item.assetType || "Asset"}</Tag>
                        )}
                      </div>
                    </List.Item>
                  );
                }}
              />
              <div
                style={{
                  marginTop: 8,
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                <Button
                  style={{
                    backgroundColor: "#f5f5f5",
                    borderColor: "#d9d9d9",
                    flex: 1,
                  }}
                  onClick={() => {
                    // Add all currently filtered assets that aren't already selected
                    const toAdd = filteredAvailableAssets.filter(
                      (a) =>
                        !selectedAssets.some(
                          (s) => String(s.id || s._id) === String(a._id || a.id)
                        )
                    );
                    const norm = toAdd.map((a) => ({
                      id:
                        a._id ?? a.id ?? Math.random().toString(36).slice(2, 9),
                      name: a.name || a.assetName || a.title,
                      coords: a.coords || a.coordinates || null,
                      meta: a,
                    }));
                    setSelectedAssets((prev) => [...prev, ...norm]);
                    setFilteredSelectedAssets((prev) => [...prev, ...norm]);
                    message.success(`Added ${norm.length} assets to campaign`);
                  }}
                >
                  → Add Selected
                </Button>
                <Button
                  style={{
                    backgroundColor: "#f5f5f5",
                    borderColor: "#d9d9d9",
                    flex: 1,
                  }}
                  onClick={() => {
                    // Add all currently filtered assets that aren't already selected
                    const toAdd = filteredAvailableAssets.filter(
                      (a) =>
                        !selectedAssets.some(
                          (s) => String(s.id || s._id) === String(a._id || a.id)
                        )
                    );
                    const norm = toAdd.map((a) => ({
                      id:
                        a._id ?? a.id ?? Math.random().toString(36).slice(2, 9),
                      name: a.name || a.assetName || a.title,
                      coords: a.coords || a.coordinates || null,
                      meta: a,
                    }));
                    setSelectedAssets((prev) => [...prev, ...norm]);
                    setFilteredSelectedAssets((prev) => [...prev, ...norm]);
                    message.success(
                      `Added ${norm.length} filtered assets to campaign`
                    );
                  }}
                >
                  + Add Filtered Assets
                </Button>
                <Button
                  onClick={() => {
                    // Reset filters by reloading
                    setFilteredAvailableAssets(availableAssets);
                    setFilteredSelectedAssets(selectedAssets);
                  }}
                >
                  Reset
                </Button>
              </div>

              <div style={{ marginTop: 6, fontSize: 11, color: "#999" }}>
                Click on assets to select them, then click this button to add
                them to your campaign
              </div>
            </Col>

            <Col xs={24} md={14}>
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      border: "1px solid #e6e6e6",
                      padding: 8,
                      minHeight: 120,
                    }}
                  >
                    <div style={{ fontSize: 13, marginBottom: 8 }}>
                      Selected Assets ({selectedAssets.length})
                    </div>

                    {/* Search Selected Assets */}
                    <div style={{ marginBottom: 8 }}>
                      <Input.Search
                        placeholder="Search selected assets..."
                        size="small"
                        onSearch={(value) => {
                          // Filter selected assets based on search
                          if (!value) {
                            setFilteredSelectedAssets(selectedAssets);
                          } else {
                            const filtered = selectedAssets.filter(
                              (asset) =>
                                asset.name
                                  .toLowerCase()
                                  .includes(value.toLowerCase()) ||
                                (asset.meta?.venue || "")
                                  .toLowerCase()
                                  .includes(value.toLowerCase()) ||
                                (asset.meta?.network || "")
                                  .toLowerCase()
                                  .includes(value.toLowerCase())
                            );
                            setFilteredSelectedAssets(filtered);
                          }
                        }}
                        style={{ width: "100%" }}
                      />
                    </div>
                    <List
                      size="small"
                      bordered
                      dataSource={filteredSelectedAssets}
                      renderItem={(it) => (
                        <List.Item
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            cursor: "pointer",
                            backgroundColor:
                              highlightedAsset &&
                              String(highlightedAsset.id) === String(it.id)
                                ? "#e6f7ff"
                                : "transparent",
                          }}
                          onClick={() => setHighlightedAsset(it)}
                        >
                          <div
                            style={{
                              display: "flex",
                              gap: 8,
                              alignItems: "center",
                            }}
                          >
                            <div
                              style={{
                                width: 120,
                                height: 70,
                                background: "#fafafa",
                                border: "1px solid #eee",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              {/* small screen preview for this asset (use previewCreative or placeholder) */}
                              {it.previewCreative ? (
                                /\.(jpg|jpeg|png|gif)$/i.test(
                                  it.previewCreative
                                ) ? (
                                  <img
                                    src={it.previewCreative}
                                    alt=""
                                    style={{
                                      maxWidth: "100%",
                                      maxHeight: "100%",
                                      objectFit: "cover",
                                    }}
                                  />
                                ) : (
                                  // video preview
                                  <video
                                    src={it.previewCreative}
                                    style={{
                                      maxWidth: "100%",
                                      maxHeight: "100%",
                                    }}
                                    muted
                                  />
                                )
                              ) : (
                                <div
                                  style={{
                                    fontSize: 11,
                                    color: "#999",
                                    padding: 6,
                                    textAlign: "center",
                                  }}
                                >
                                  No creative selected
                                </div>
                              )}
                            </div>
                            <div>
                              <div style={{ fontSize: 13 }}>{it.name}</div>
                              <div style={{ fontSize: 11, color: "#777" }}>
                                {it.coords
                                  ? `${it.coords.lat?.toFixed?.(3) ?? ""}, ${
                                      it.coords?.lng?.toFixed?.(3) ?? ""
                                    }`
                                  : "No coords"}
                              </div>
                            </div>
                          </div>

                          <div style={{ display: "flex", gap: 8 }}>
                            <Button
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeSelectedAsset(it.id);
                              }}
                            >
                              Remove
                            </Button>
                          </div>
                        </List.Item>
                      )}
                    />

                    {/* Action Buttons */}
                    <div
                      style={{
                        marginTop: 12,
                        display: "flex",
                        gap: 8,
                        flexWrap: "wrap",
                      }}
                    >
                      <Button
                        size="small"
                        style={{
                          backgroundColor: "#f5f5f5",
                          borderColor: "#d9d9d9",
                        }}
                        onClick={() => {
                          if (highlightedAsset) {
                            removeSelectedAsset(highlightedAsset.id);
                          } else {
                            message.info("Please select an asset first");
                          }
                        }}
                      >
                        ← Remove
                      </Button>

                      <Button
                        size="small"
                        danger
                        onClick={() => {
                          setSelectedAssets([]);
                          setFilteredSelectedAssets([]);
                          setHighlightedAsset(null);
                        }}
                      >
                        ✕ Reset
                      </Button>

                      <Button
                        size="small"
                        style={{
                          backgroundColor: "#fff7e6",
                          borderColor: "#ffd591",
                          color: "#d46b08",
                        }}
                        onClick={() => {
                          // Remove all filtered assets
                          const filteredIds = filteredSelectedAssets.map(
                            (a) => a.id
                          );
                          setSelectedAssets((prev) =>
                            prev.filter((a) => !filteredIds.includes(a.id))
                          );
                          setFilteredSelectedAssets([]);
                          if (
                            highlightedAsset &&
                            filteredIds.includes(highlightedAsset.id)
                          ) {
                            setHighlightedAsset(null);
                          }
                        }}
                      >
                        ▼ Remove Filtered
                      </Button>

                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 2,
                        }}
                      >
                        <Button
                          size="small"
                          style={{
                            width: 24,
                            height: 20,
                            padding: 0,
                            minWidth: 24,
                          }}
                          onClick={() => {
                            if (highlightedAsset) {
                              const currentIndex = selectedAssets.findIndex(
                                (a) =>
                                  String(a.id) === String(highlightedAsset.id)
                              );
                              if (currentIndex > 0) {
                                const newAssets = [...selectedAssets];
                                [
                                  newAssets[currentIndex],
                                  newAssets[currentIndex - 1],
                                ] = [
                                  newAssets[currentIndex - 1],
                                  newAssets[currentIndex],
                                ];
                                setSelectedAssets(newAssets);
                                setFilteredSelectedAssets(newAssets);
                                setHighlightedAsset(
                                  newAssets[currentIndex - 1]
                                );
                              }
                            }
                          }}
                        >
                          ↑
                        </Button>
                        <Button
                          size="small"
                          style={{
                            width: 24,
                            height: 20,
                            padding: 0,
                            minWidth: 24,
                          }}
                          onClick={() => {
                            if (highlightedAsset) {
                              const currentIndex = selectedAssets.findIndex(
                                (a) =>
                                  String(a.id) === String(highlightedAsset.id)
                              );
                              if (currentIndex < selectedAssets.length - 1) {
                                const newAssets = [...selectedAssets];
                                [
                                  newAssets[currentIndex],
                                  newAssets[currentIndex + 1],
                                ] = [
                                  newAssets[currentIndex + 1],
                                  newAssets[currentIndex],
                                ];
                                setSelectedAssets(newAssets);
                                setFilteredSelectedAssets(newAssets);
                                setHighlightedAsset(
                                  newAssets[currentIndex + 1]
                                );
                              }
                            }
                          }}
                        >
                          ↓
                        </Button>
                      </div>
                    </div>

                    <div style={{ marginTop: 6, fontSize: 11, color: "#999" }}>
                      Click on a selected asset to highlight it before using
                      these buttons
                    </div>
                  </div>
                </div>

                <div style={{ width: 420 }}>
                  <div style={{ marginBottom: 8, fontSize: 13 }}>
                    Asset Locations
                  </div>
                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 12,
                      color: "#999",
                      marginBottom: 2,
                    }}
                  >
                    Geographic view of selected assets
                  </div>
                  {/* <MapPreview coords={highlightedAsset?.coords || null} /> */}
                  <GoogleMapPreview coords={highlightedAsset?.coords || null} />
                </div>
              </div>
            </Col>
          </Row>
        </Card>

        {/* Creatives Upload */}
        <Card className="mb-4" title="Creatives">
          <div style={{ marginBottom: 8, color: "#666" }}>
            Upload images/videos used as creatives.
          </div>
          <Dragger
            multiple
            customRequest={handleUpload}
            showUploadList={false}
            accept="image/*,video/*"
            style={{ padding: 12 }}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">
              Click or drag file to this area to upload
            </p>
          </Dragger>

          <div
            style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}
          >
            {creatives.map((c, i) => {
              const url = c.url || c;
              return (
                <div
                  key={i}
                  style={{
                    width: 140,
                    border: "1px solid #eee",
                    padding: 6,
                    textAlign: "center",
                  }}
                >
                  {/\.(jpg|jpeg|png|gif)$/i.test(url) ? (
                    <img
                      src={url}
                      alt=""
                      style={{ width: "100%", height: 100, objectFit: "cover" }}
                    />
                  ) : (
                    <video
                      src={url}
                      style={{ width: "100%", height: 100 }}
                      controls
                    />
                  )}
                  <div
                    style={{
                      marginTop: 6,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Button
                      size="small"
                      onClick={() => {
                        // remove creative (also remove from any selected assets referencing it)
                        setCreatives((prev) =>
                          prev.filter((p, i2) => i2 !== i)
                        );
                        setSelectedAssets((prev) =>
                          prev.map((a) =>
                            a.previewCreative === url
                              ? { ...a, previewCreative: null }
                              : a
                          )
                        );
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Actions */}
        <Space>
          <Button onClick={() => navigate("/campaigns")}>Cancel</Button>
          <Button onClick={() => onSubmit("Draft")} loading={loading}>
            Save as Draft
          </Button>
          <Button
            type="primary"
            onClick={() => onSubmit("Waiting_for_approval")}
            loading={loading}
          >
            Save
          </Button>
        </Space>
      </Form>
    </div>
  );
}
