// frontend/editor-ui/src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Route groups
import campaignsRoutes from "./routes/campaigns.routes";
import brandsRoutes from "./routes/brands.routes";
import agenciesRoutes from "./routes/agencies.routes";
import accountRoutes from "./routes/account.routes";

import DashboardLayout from "./components/layouts/DashboardLayout";
import Dashboard from "./features/dashboard/Dashboard";
import Login from "./features/auth/Login";

// Simple guard (token check). If you prefer context-based guarding, swap to ProtectedRoute.
function Protected({ children }) {
  const token = localStorage.getItem("pos-token");
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const appRoutes = [
    ...campaignsRoutes,
    ...brandsRoutes,
    ...agenciesRoutes,
    ...accountRoutes,
  ];

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />

        {/* Protected layout — IMPORTANT: children go INSIDE this Route (no self-close) */}
        <Route
          element={
            <Protected>
              <DashboardLayout />
            </Protected>
          }
        >
          <Route index element={<Navigate to="/editor/dashboard" replace />} />
          {/* Default landing after login */}
          <Route path="/editor/dashboard" element={<Dashboard />} />

          {/* App pages */}
          {appRoutes.map((r, i) => (
            <Route key={i} path={r.path} element={r.element} />
          ))}
        </Route>

        {/* 404 fallback */}
        <Route path="*" element={<div className="p-6">Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
}
