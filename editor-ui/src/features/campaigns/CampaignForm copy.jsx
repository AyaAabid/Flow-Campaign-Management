// frontend/editor-ui/src/features/campaigns/CampaignForm.jsx
import React, { useEffect, useState } from "react";
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
} from "antd";
import { InboxOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import {
  createCampaign,
  fetchCampaign,
  updateCampaign,
} from "../../services/campaigns";
import { fetchBrands } from "../../services/brands";
import { fetchAgencies } from "../../services/agencies";
import { updateCampaignStatus } from "../../services/campaigns";
import { CAMPAIGN_TYPES } from "../../constants/campaigns";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;
const { Dragger } = Upload;
const asString = (v) => (v == null ? undefined : String(v));

export default function CampaignForm({ mode = "create" }) {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(false);
  const [brands, setBrands] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [form] = Form.useForm();

  const isEdit = mode === "edit";

  useEffect(() => {
    if (isEdit && !id) {
      message.error("No campaign id provided for editing.");
      navigate("/campaigns", { replace: true });
    }
  }, [isEdit, id]);

  const load = async () => {
    try {
      setLoading(true);
      const [bRaw, aRaw] = await Promise.all([fetchBrands(), fetchAgencies()]);

      // 👇 map API -> Select options that show names and store _id
      const brandOptions = (Array.isArray(bRaw) ? bRaw : []).map((x) => ({
        label: x.brandName, // DISPLAY
        value: String(x._id), // STORED
      }));
      const agencyOptions = (Array.isArray(aRaw) ? aRaw : []).map((x) => ({
        label: x.agencyName, // DISPLAY
        value: String(x._id), // STORED
      }));

      setBrands(brandOptions);
      setAgencies(agencyOptions);

      if (isEdit && id) {
        const c = await fetchCampaign(id);
        form.setFieldsValue({
          campaign_name: c.campaign_name,
          campaign_type: c.campaign_type,
          // 👇 IMPORTANT: set initial ids as strings to match options.value
          brand: asString(c.brand?._id ?? c.brand),
          agency: asString(c.agency?._id ?? c.agency),
          dateRange:
            c.launchDate && c.endDate
              ? [dayjs(c.launchDate), dayjs(c.endDate)]
              : undefined,
          comment: c.comment,
        });
      }
    } catch (e) {
      console.error(e);
      message.error("Failed to load form data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);
  const onSubmit = async (targetStatus = "Waiting_for_approval") => {
    try {
      const values = await form.validateFields();
      const payload = {
        campaign_name: values.campaign_name,
        campaign_type: values.campaign_type,
        brand: values.brand,
        agency: values.agency,
        comment: values.comment || "",
        launchDate: values.dateRange?.[0]?.toDate() ?? null,
        endDate: values.dateRange?.[1]?.toDate() ?? null,
      };

      setLoading(true);

      if (isEdit) {
        // Update the campaign data first
        const saved = await updateCampaign(id, payload);
        // Then set the desired status
        await updateCampaignStatus(id, targetStatus);
        message.success(targetStatus === "Draft" ? "Saved as draft" : "Saved");
      } else {
        // Create with the desired status directly
        const created = await createCampaign({
          ...payload,
          status: targetStatus,
        });
        message.success(targetStatus === "Draft" ? "Saved as draft" : "Saved");
      }

      navigate("/campaigns");
    } catch (e) {
      console.error(e);
      message.error("Failed to save campaign");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">
          {isEdit ? "Edit Campaign" : "Create Campaign"}
        </h2>
        <p className="text-gray-500">
          {isEdit
            ? "Update your campaign settings."
            : "Set up your new campaign."}
        </p>
      </div>

      <Form form={form} layout="vertical" disabled={loading}>
        {/* Campaign Identification */}
        <Card className="mb-4" title="Campaign Identification">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Form.Item
              label="Campaign name"
              name="campaign_name"
              rules={[{ required: true, message: "Please enter a name" }]}
            >
              <Input placeholder="e.g., Summer Launch DOOH" />
            </Form.Item>

            {/* Channel removed; replaced by Submitted By on list view */}

            <Form.Item
              label="Type"
              name="campaign_type"
              rules={[{ required: true, message: "Please select a type" }]}
            >
              <Select options={CAMPAIGN_TYPES} placeholder="Select a type" />
            </Form.Item>

            {/* Brand with names */}
            <Form.Item label="Brand" name="brand" rules={[{ required: true }]}>
              <>
                <Select
                  showSearch
                  placeholder="Select a brand"
                  options={brands} // 👈 already {label, value}
                  optionLabelProp="label"
                  optionFilterProp="label"
                  filterOption={(input, option) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                />
                <div style={{ marginTop: 4 }}>
                  <small>
                    The brand is not among the list?{" "}
                    <a onClick={() => navigate("/brands/new")}>
                      Add it from here
                    </a>
                  </small>
                </div>
              </>
            </Form.Item>

            {/* Agency with names */}
            <Form.Item
              label="Agency"
              name="agency"
              rules={[{ required: true }]}
            >
              <>
                <Select
                  showSearch
                  placeholder="Select an agency"
                  options={agencies} // 👈 already {label, value}
                  optionLabelProp="label"
                  optionFilterProp="label"
                  filterOption={(input, option) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                />
                <div style={{ marginTop: 4 }}>
                  <small>
                    The agency is not among the list?{" "}
                    <a onClick={() => navigate("/agencies/new")}>
                      Add it from here
                    </a>
                  </small>
                </div>
              </>
            </Form.Item>

            <Form.Item
              label="Campaign dates"
              name="dateRange"
              rules={[{ required: true }]}
            >
              <RangePicker className="w-full" />
            </Form.Item>
          </div>
        </Card>

        {/* Comments separate from Assets */}
        <Card className="mb-4" title="Comments">
          <Form.Item label="Comment" name="comment">
            <Input.TextArea
              rows={4}
              placeholder="Optional notes for this campaign..."
            />
          </Form.Item>
        </Card>

        <Card className="mb-4" title="Assets">
          <Divider style={{ marginTop: 0 }} />
          <Dragger multiple disabled>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">Upload creatives (coming soon)</p>
            <p className="ant-upload-hint">Drag & drop files here</p>
          </Dragger>
        </Card>

        <Space>
          <Button onClick={() => navigate("/campaigns")}>Cancel</Button>
          <Button onClick={() => onSubmit("Draft")} loading={loading}>
            Save as draft
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
