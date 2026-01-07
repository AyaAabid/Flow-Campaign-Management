import React, { useEffect, useState } from "react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Form,
  Input,
  Upload,
  message,
} from "antd";
import {
  SaveOutlined,
  UndoOutlined,
  KeyOutlined,
  UserOutlined,
  MailOutlined,
  IdcardOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { getMe, updateMe, uploadAvatar } from "../../services/users";
import { useNavigate } from "react-router-dom";

export default function AccountSettings() {
  const [loading, setLoading] = useState(false);
  const [me, setMe] = useState(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const apiBase = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
  const staticBase = apiBase.replace(/\/api\/?$/, "");

  const load = async () => {
    try {
      setLoading(true);
      const u = await getMe();
      setMe(u);
      form.setFieldsValue({
        username: u.username,
        fullName: [u.firstName, u.lastName].filter(Boolean).join(" "),
        email: u.email,
        position: u.position,
      });
    } catch (e) {
      console.error(e);
      message.error("Failed to load account");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSave = async () => {
    try {
      const values = await form.validateFields();

      // Split fullName into first & last for backend
      const parts = (values.fullName || "").trim().split(/\s+/);
      const firstName = parts.shift() || "";
      const lastName = parts.join(" ") || "";

      const u = await updateMe({
        firstName,
        lastName,
        email: values.email,
      });

      // local state + storage
      setMe(u);
      const stored = localStorage.getItem("pos-user");
      if (stored) {
        localStorage.setItem(
          "pos-user",
          JSON.stringify({ ...JSON.parse(stored), ...u })
        );
      }

      message.success("Your profile was updated successfully.");
      // notify the entire app (e.g., topbar avatar/name)
      window.dispatchEvent(new CustomEvent("user:updated", { detail: u }));
    } catch (e) {
      if (e?.errorFields) return; // antd already shows field errors
      message.error(e?.response?.data?.message || "Save failed");
    }
  };

  const onReset = () => {
    if (!me) return;
    form.setFieldsValue({
      username: me.username,
      fullName: [me.firstName, me.lastName].filter(Boolean).join(" "),
      email: me.email,
      position: me.position,
    });
  };

  const beforeUpload = (file) => {
    const ok = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
      "image/gif",
    ].includes(file.type);
    if (!ok) message.error("Only JPG, PNG, WEBP, GIF allowed");
    const sizeOk = file.size / 1024 / 1024 < 5;
    if (!sizeOk) message.error("Max size 5MB");
    return ok && sizeOk;
  };

  const customUpload = async ({ file, onSuccess, onError }) => {
    try {
      const user = await uploadAvatar(file);

      // update state + storage
      setMe(user);
      const stored = localStorage.getItem("pos-user");
      if (stored) {
        localStorage.setItem(
          "pos-user",
          JSON.stringify({
            ...JSON.parse(stored),
            profilePicture: user.profilePicture,
          })
        );
      }

      message.success("Profile picture updated.");
      // broadcast update for instant UI refresh elsewhere
      window.dispatchEvent(new CustomEvent("user:updated", { detail: user }));

      onSuccess?.("ok");
    } catch (e) {
      console.error(e);
      message.error("Upload failed");
      onError?.(e);
    }
  };

  const avatarSrc = me?.profilePicture
    ? me.profilePicture.startsWith("http")
      ? me.profilePicture
      : `${staticBase}${me.profilePicture}`
    : undefined;

  return (
    <div className="p-4 md:p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: Profile Information */}
        <div className="lg:col-span-2">
          <Card>
            <div className="mt-2 border-t pt-4">
              <h2 className="text-base font-semibold mb-4">
                Profile Information
              </h2>

              <Form form={form} layout="vertical" disabled={loading}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Form.Item label="Username" name="username">
                    <Input prefix={<UserOutlined />} disabled />
                  </Form.Item>

                  <Form.Item
                    label="Full Name"
                    name="fullName"
                    rules={[
                      {
                        required: true,
                        message: "Please enter your full name",
                      },
                    ]}
                  >
                    <Input prefix={<IdcardOutlined />} placeholder="John Doe" />
                  </Form.Item>

                  <Form.Item
                    label="Email"
                    name="email"
                    rules={[
                      { required: true, message: "Email is required" },
                      { type: "email", message: "Invalid email" },
                    ]}
                  >
                    <Input
                      prefix={<MailOutlined />}
                      placeholder="you@example.com"
                    />
                  </Form.Item>

                  <Form.Item label="Position" name="position">
                    <Input disabled />
                  </Form.Item>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    onClick={onSave}
                  >
                    Save Changes
                  </Button>
                  <Button
                    icon={<KeyOutlined />}
                    onClick={() => navigate("/account/password")}
                  >
                    Change Password
                  </Button>
                  <Button icon={<UndoOutlined />} onClick={onReset}>
                    Reset Changes
                  </Button>
                </div>
              </Form>
            </div>
          </Card>
        </div>

        {/* RIGHT: Profile Picture + Account Status */}
        <div className="space-y-6">
          <Card
            title={
              <span className="text-base font-semibold">Profile Picture</span>
            }
          >
            <div className="flex flex-col items-center gap-4">
              <Avatar
                size={128}
                src={avatarSrc}
                style={{ borderRadius: "50%" }}
              >
                {me ? me.firstName?.[0] || me.username?.[0] : "U"}
              </Avatar>

              <Upload
                accept="image/*"
                showUploadList={false}
                beforeUpload={beforeUpload}
                customRequest={customUpload}
              >
                <Button icon={<UploadOutlined />}>Browse</Button>
              </Upload>

              <div className="text-xs text-gray-500 text-center">
                Supported formats: JPG, PNG, WEBP, GIF • Max size: 5MB
              </div>
            </div>
          </Card>

          <Card
            title={
              <span className="text-base font-semibold">Account Status</span>
            }
          >
            <div className="space-y-2">
              <div>
                <span className="text-gray-600 mr-2">Account Type:</span>
                <Badge color="blue" text={me?.role || "—"} />
              </div>
              <div>
                <span className="text-gray-600 mr-2">Last Updated:</span>
                <span>
                  {me?.updatedAt
                    ? new Date(me.updatedAt).toLocaleDateString()
                    : "—"}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
