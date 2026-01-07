import { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";

export default function DashboardLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleCollapse = () => setIsCollapsed((s) => !s);
  const toggleMobile = () => setMobileOpen((s) => !s);
  const closeMobile = () => setMobileOpen(false);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Header */}
      <Header
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleCollapse}
        onToggleMobile={toggleMobile}
      />

      <div className="relative">
        {/* Sidebar (desktop) */}
        <Sidebar
          isCollapsed={isCollapsed}
          className="hidden md:block"
          onNavigate={closeMobile}
        />

        {/* Sidebar (mobile drawer) */}
        <div
          className={`fixed inset-0 z-40 md:hidden ${
            mobileOpen ? "pointer-events-auto" : "pointer-events-none"
          }`}
        >
          {/* overlay */}
          <div
            className={`absolute inset-0 bg-slate-900/40 transition-opacity ${
              mobileOpen ? "opacity-100" : "opacity-0"
            }`}
            onClick={closeMobile}
          />
          {/* drawer */}
          <div
            className={`absolute top-0 left-0 h-full w-[18rem] bg-white shadow-xl transition-transform duration-300 ${
              mobileOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <Sidebar isCollapsed={false} onNavigate={closeMobile} />
          </div>
        </div>

        {/* Main content */}
        <main
          className={`transition-[margin] duration-300 md:ml-${
            isCollapsed ? "[5rem]" : "[16rem]"
          } px-4 md:px-8 pb-8`}
          style={{
            marginLeft: isCollapsed ? /* 80 */ "80px" : /* 256 */ "256px",
          }}
        >
          <div className="mt-6 grid gap-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
