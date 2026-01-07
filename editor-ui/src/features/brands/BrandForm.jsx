// src/features/brands/BrandForm.jsx
import React, { useEffect, useState } from "react";
import { Button, Card, Form, Input, message, Select, Alert, Spin } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import {
  createBrand,
  fetchBrandById,
  updateBrand,
} from "../../services/brands";
import { getIndustries } from "../../services/lookups";

export default function BrandForm({ mode = "create" }) {
  const isEdit = mode === "edit";
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingIndustries, setLoadingIndustries] = useState(false);
  const [industries, setIndustries] = useState([]);
  const [lookupError, setLookupError] = useState("");
  const [form] = Form.useForm();

  useEffect(() => {
    // load industries
    (async () => {
      try {
        setLoadingIndustries(true);
        const list = await getIndustries();
        if (!Array.isArray(list) || list.length === 0) {
          setLookupError("No industries returned by /api/lookups/industries");
        }
        setIndustries(list);
      } catch (e) {
        console.error("Industries fetch failed:", e);
        setLookupError("Failed to load industries");
      } finally {
        setLoadingIndustries(false);
      }
    })();
  }, []);

  useEffect(() => {
    // edit mode: load brand
    const loadBrand = async () => {
      if (!isEdit || !id) return;
      try {
        setLoading(true);
        const b = await fetchBrandById(id);
        form.setFieldsValue({
          brandName: b.brandName,
          brandIndustry: b.brandIndustry || undefined,
        });
      } catch (e) {
        console.error(e);
        message.error("Failed to load brand");
      } finally {
        setLoading(false);
      }
    };
    loadBrand();
  }, [id]);

  const onSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      if (isEdit) {
        await updateBrand(id, values);
        message.success("Brand updated");
      } else {
        await createBrand(values);
        message.success("Brand created");
      }
      navigate("/brands");
    } catch (e) {
      if (e?.errorFields) return;
      console.error(e);
      message.error("Save failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-xl md:text-2xl font-semibold mb-4">
        {isEdit ? "Edit Brand" : "New Brand"}
      </h1>

      {lookupError ? (
        <Alert className="mb-4" type="warning" message={lookupError} showIcon />
      ) : null}

      <Form form={form} layout="vertical" disabled={loading}>
        <Card className="mb-4" title="Brand Details">
          <Form.Item
            label="Brand name"
            name="brandName"
            rules={[{ required: true, message: "Please enter a brand name" }]}
          >
            <Input placeholder="e.g., Hyper Cola" />
          </Form.Item>

          <Form.Item
            label="Industry"
            name="brandIndustry"
            rules={[{ required: true, message: "Please select an industry" }]}
          >
            <Select
              placeholder={
                loadingIndustries ? "Loading industries..." : "Select industry"
              }
              loading={loadingIndustries}
              options={industries.map((i) => ({ label: i, value: i }))}
              showSearch
              optionFilterProp="label"
              // do NOT set disabled when value is empty (prevents the AntD warning)
            />
          </Form.Item>
        </Card>

        <div className="flex items-center gap-3">
          <Button onClick={() => navigate("/brands")}>Cancel</Button>
          <Button type="primary" onClick={onSubmit}>
            Save
          </Button>
        </div>
      </Form>
    </div>
  );
}
