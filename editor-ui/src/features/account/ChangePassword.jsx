import React from "react";
import { Button, Card, Form, Input, message } from "antd";
import { changePassword } from "../../services/users";
import { useNavigate } from "react-router-dom";

export default function ChangePassword() {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const onSubmit = async () => {
    try {
      const { currentPassword, newPassword, confirmPassword } =
        await form.validateFields();

      if (newPassword === currentPassword) {
        return message.error(
          "New password must be different from current password"
        );
      }
      await changePassword({ currentPassword, newPassword, confirmPassword });
      message.success("Password updated");
      form.resetFields();
      navigate("/account");
    } catch (e) {
      if (e?.errorFields) return;
      message.error(e?.response?.data?.message || "Password update failed");
    }
  };

  return (
    <div className="p-4 md:p-6">
      <Card
        title={<span className="text-lg font-semibold">Change Password</span>}
        className="max-w-xl"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Current password"
            name="currentPassword"
            rules={[{ required: true, message: "Required" }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            label="New password"
            name="newPassword"
            rules={[
              { required: true, message: "Required" },
              { min: 8, message: "At least 8 characters" },
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            label="Confirm new password"
            name="confirmPassword"
            dependencies={["newPassword"]}
            rules={[
              { required: true, message: "Required" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value)
                    return Promise.resolve();
                  return Promise.reject(new Error("Passwords do not match"));
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>

          <div className="flex gap-2">
            <Button onClick={() => navigate("/account")}>Cancel</Button>
            <Button type="primary" onClick={onSubmit}>
              Update Password
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}
