import React, { useEffect, useMemo, useState } from "react";
import { Button, Dropdown, Input, Table, Tag, message, Card } from "antd";
import { PlusOutlined, MoreOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { fetchAgencies, deleteAgency } from "../../services/agencies";

export default function AgencyList() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      const list = await fetchAgencies();
      const normalized = list.map((a, idx) => ({
        key: a._id || idx,
        id: a._id,
        agencyName: a.agencyName,
        agencyEmail: a.agencyEmail || "—",
        agencyPhone: a.agencyPhone || "—",
        commission: typeof a.commission === "number" ? `${a.commission}%` : "—",
        campaignCount: a.campaignCount || 0,
        status: a.status || (a.campaignCount > 0 ? "Active" : "Inactive"),
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
      }));
      setRows(normalized);
    } catch (e) {
      console.error(e);
      message.error("Failed to load agencies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    let data = rows;
    const q = search.trim().toLowerCase();
    if (q) {
      data = data.filter(
        (r) =>
          r.agencyName?.toLowerCase().includes(q) ||
          r.agencyEmail?.toLowerCase().includes(q) ||
          r.agencyPhone?.toLowerCase().includes(q) ||
          `${r.id}`.toLowerCase().includes(q)
      );
    }
    return data;
  }, [rows, search]);

  const onDelete = async (record) => {
    try {
      await deleteAgency(record.id);
      message.success("Agency deleted");
      load();
    } catch (e) {
      console.error(e);
      message.error("Delete failed");
    }
  };

  const columns = [
    { title: "ID", dataIndex: "id", width: 260, ellipsis: true },
    {
      title: "Agency",
      dataIndex: "agencyName",
      render: (text, record) => (
        <Button
          type="link"
          onClick={() => navigate(`/agencies/${record.id}`)}
          className="p-0 h-auto font-medium"
        >
          {text}
        </Button>
      ),
    },
    { title: "Email", dataIndex: "agencyEmail" },
    { title: "Phone", dataIndex: "agencyPhone" },
    {
      title: "Commission",
      dataIndex: "commission",
      render: (v) => (v === "—" ? "—" : <Tag>{v}</Tag>),
    },
    {
      title: "Campaigns",
      dataIndex: "campaignCount",
      width: 100,
      align: "center",
      render: (count) => (
        <Tag color={count > 0 ? "blue" : "default"}>{count}</Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      width: 100,
      align: "center",
      render: (status) => (
        <Tag color={status === "Active" ? "green" : "red"}>{status}</Tag>
      ),
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      render: (d) => (d ? new Date(d).toLocaleString() : "—"),
    },
    {
      title: "Updated",
      dataIndex: "updatedAt",
      render: (d) => (d ? new Date(d).toLocaleString() : "—"),
    },
    {
      title: "Action",
      key: "action",
      width: 110,
      render: (_, record) => {
        const items = [
          {
            key: "edit",
            label: "Edit",
            onClick: () => navigate(`/agencies/${record.id}/edit`),
          },
          { type: "divider" },
          {
            key: "delete",
            label: <span className="text-red-600">Delete</span>,
            onClick: () => onDelete(record),
          },
        ];
        return (
          <Dropdown
            menu={{
              items: items.map(({ onClick, ...r }) => ({ ...r, onClick })),
            }}
            trigger={["click"]}
          >
            <Button icon={<MoreOutlined />} />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl md:text-2xl font-semibold">Agency Management</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate("/agencies/new")}
        >
          New Agency
        </Button>
      </div>

      <Card className="mb-4">
        <Input.Search
          placeholder="Search agencies…"
          allowClear
          onSearch={setSearch}
          onChange={(e) => setSearch(e.target.value)}
          className="md:w-80"
        />
      </Card>

      <Table
        loading={loading}
        columns={columns}
        dataSource={filtered}
        pagination={{ pageSize: 10, showSizeChanger: true }}
        bordered
        size="middle"
      />
    </div>
  );
}
