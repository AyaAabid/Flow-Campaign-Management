// src/features/auth/Login.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { userAuth } from "../../context/AuthContext";
import { Button, Card, Form, Input, message } from "antd";

function FlowLogo() {
  return (
    <div className="flex items-center gap-2">
      <div className="h-6 w-6 rounded-md bg-indigo-600 flex items-center justify-center text-white font-bold">
        F
      </div>
      <span className="text-slate-900 font-semibold tracking-tight">Flow</span>
    </div>
  );
}

export default function Login() {
  const { login } = userAuth();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const onFinish = async ({ username, password }) => {
    try {
      setLoading(true);
      await login(username, password);
      message.success("Welcome back!");
      navigate("/", { replace: true });
    } catch (e) {
      if (e?.errorFields) return;
      message.error(e?.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[rgb(237,233,254,0.45)] flex flex-col">
      {/* Top bar */}
      <header className="h-16 w-full bg-white/80 backdrop-blur border-b border-slate-200 flex items-center">
        <div className="max-w-6xl mx-auto w-full px-6">
          <FlowLogo />
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-6xl w-full px-6">
          <div className="grid">
            <div className="mx-auto w-full max-w-md">
              {/* Title area */}
              <div className="mb-6">
                <h1 className="text-3xl font-semibold text-slate-900">Login</h1>
                <p className="text-sm text-slate-500 mt-1">
                  Hi, Welcome back 👋
                </p>
              </div>

              {/* Card */}
              <Card
                className="shadow-sm border border-slate-200/70"
                bodyStyle={{ padding: 24 }}
              >
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={onFinish}
                  autoComplete="off"
                >
                  <Form.Item
                    label={<span className="text-slate-700">Username</span>}
                    name="username"
                    rules={[
                      { required: true, message: "Please enter your username" },
                    ]}
                  >
                    <Input
                      autoComplete="username"
                      size="large"
                      className="rounded-md"
                      placeholder="Enter your username"
                    />
                  </Form.Item>

                  <Form.Item
                    label={<span className="text-slate-700">Password</span>}
                    name="password"
                    rules={[
                      { required: true, message: "Please enter your password" },
                    ]}
                  >
                    <Input.Password
                      autoComplete="current-password"
                      size="large"
                      className="rounded-md"
                      placeholder="Enter your password"
                    />
                  </Form.Item>

                  <div className="flex items-center justify-between mb-4">
                    <div />
                    {/* Optional forgot link target if you add it later */}
                    {/* <Link to="/forgot" className="text-sm text-indigo-600 hover:underline">Forgot Password?</Link> */}
                  </div>

                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    loading={loading}
                    className="!h-11 !rounded-md !bg-indigo-600 hover:!bg-indigo-700 w-full"
                  >
                    Login
                  </Button>
                </Form>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Page padding to echo the screenshot spacing */}
      <div className="h-8" />
    </div>
  );
}
