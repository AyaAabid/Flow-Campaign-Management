// src/features/agencies/AgencyForm.jsx
import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  message,
  Select,
  Alert,
} from "antd";
import { useNavigate, useParams } from "react-router-dom";
import {
  createAgency,
  fetchAgencyById,
  updateAgency,
} from "../../services/agencies";
import { getCountryCodes } from "../../services/lookups";

export default function AgencyForm({ mode = "create" }) {
  const isEdit = mode === "edit";
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [loadingCodes, setLoadingCodes] = useState(false);
  const [codes, setCodes] = useState([]);
  const [lookupError, setLookupError] = useState("");
  const [form] = Form.useForm();

  // Load country codes
  useEffect(() => {
    (async () => {
      try {
        setLoadingCodes(true);
        const list = await getCountryCodes();
        if (!Array.isArray(list) || list.length === 0) {
          setLookupError(
            "No country codes returned by /api/lookups/country-codes"
          );
        }
        setCodes(list);
      } catch (e) {
        console.error("Country codes fetch failed:", e);
        setLookupError("Failed to load country codes");
      } finally {
        setLoadingCodes(false);
      }
    })();
  }, []);

  // Load agency for edit
  useEffect(() => {
    if (!isEdit || !id) return;
    (async () => {
      try {
        setLoading(true);
        const a = await fetchAgencyById(id);

        // split stored phone to dial + number if possible
        let dial, number;
        if (a.agencyPhone) {
          const parts = a.agencyPhone.trim().split(/\s+/);
          dial = parts.shift();
          number = parts.join(" ");
        }

        form.setFieldsValue({
          agencyName: a.agencyName,
          agencyEmail: a.agencyEmail,
          phone: { dial, number },
          // if undefined/null, default to 0.01
          commission:
            typeof a.commission === "number" && !Number.isNaN(a.commission)
              ? a.commission
              : 0.01,
        });
      } catch (e) {
        console.error(e);
        message.error("Failed to load agency");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEdit, form]);

  const onSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        agencyName: values.agencyName,
        agencyEmail: values.agencyEmail,
        agencyPhone: values.phone
          ? `${values.phone.dial ?? ""} ${values.phone.number ?? ""}`.trim()
          : undefined,
        commission: values.commission, // number; backend also enforces ≥ 0.01
      };

      setLoading(true);
      if (isEdit) {
        await updateAgency(id, payload);
        message.success("Agency updated");
      } else {
        await createAgency(payload);
        message.success("Agency created");
      }
      navigate("/agencies");
    } catch (e) {
      if (e?.errorFields) return; // antd validation errors already shown
      console.error(e);
      message.error(e?.response?.data?.message || "Save failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-xl md:text-2xl font-semibold mb-4">
        {isEdit ? "Edit Agency" : "New Agency"}
      </h1>

      {lookupError ? (
        <Alert className="mb-4" type="warning" message={lookupError} showIcon />
      ) : null}

      <Form
        form={form}
        layout="vertical"
        disabled={loading}
        initialValues={{
          // ✅ default when creating
          commission: 0.01,
        }}
      >
        <Card className="mb-4" title="Agency Details">
          <Form.Item
            label="Agency name"
            name="agencyName"
            rules={[{ required: true, message: "Please enter an agency name" }]}
          >
            <Input placeholder="e.g., ACME Media" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="agencyEmail"
            rules={[{ type: "email", message: "Invalid email" }]}
          >
            <Input placeholder="e.g., contact@acme.com" />
          </Form.Item>

          <Form.Item label="Phone" required>
            <Input.Group compact>
              <Form.Item
                name={["phone", "dial"]}
                noStyle
                rules={[{ required: true, message: "Code" }]}
              >
                <Select
                  style={{ width: 140 }}
                  placeholder={loadingCodes ? "Loading…" : "+33"}
                  loading={loadingCodes}
                  showSearch
                  optionFilterProp="label"
                  options={codes.map((c) => ({
                    label: `${c.code} ${c.dial}`,
                    value: c.dial,
                  }))}
                />
              </Form.Item>
              <Form.Item
                name={["phone", "number"]}
                noStyle
                rules={[{ required: true, message: "Phone number" }]}
              >
                <Input
                  style={{ width: "calc(100% - 140px)" }}
                  placeholder="1 23 45 67 89"
                />
              </Form.Item>
            </Input.Group>
          </Form.Item>

          <Form.Item
            label="Commission (%)"
            name="commission"
            rules={[
              { required: true, message: "Commission is required" },
              {
                validator: (_, v) =>
                  v == null || Number(v) >= 0.01
                    ? Promise.resolve()
                    : Promise.reject(new Error("Commission must be ≥ 0.01")),
              },
            ]}
            tooltip="Minimum 0.01"
          >
            <InputNumber
              className="w-full"
              min={0.01}
              step={0.01}
              stringMode
              placeholder="e.g., 10.50"
            />
          </Form.Item>
        </Card>

        <div className="flex items-center gap-3">
          <Button onClick={() => navigate("/agencies")}>Cancel</Button>
          <Button type="primary" onClick={onSubmit} loading={loading}>
            Save
          </Button>
        </div>
      </Form>
    </div>
  );
}
