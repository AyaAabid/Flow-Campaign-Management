// src/components/layouts/Sidebar.jsx
import { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { ChevronDown, LogOut } from "lucide-react";
import { userAuth } from "../../context/AuthContext";

// Pass your navItems in here, or import from a constants file
import {
  LayoutDashboard,
  ImageUp,
  Users,
  Tag,
  Building,
  Settings,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/editor/dashboard" },
  { label: "Campaigns", icon: ImageUp, path: "/campaigns" },
  {
    label: "Partners",
    icon: Users,
    children: [
      { label: "Brand", icon: Tag, path: "/brands" },
      { label: "Agency", icon: Building, path: "/agencies" },
    ],
  },
  { label: "Account Settings", icon: Settings, path: "/account" },
];

export default function Sidebar({
  isCollapsed = false,
  className = "",
  onNavigate,
}) {
  const { logout } = userAuth();
  const location = useLocation();

  // Figure out which group should be open based on current path
  const initiallyOpen = useMemo(() => {
    const open = {};
    navItems.forEach((item) => {
      if (item.children?.length) {
        open[item.label] = item.children.some((c) =>
          location.pathname.startsWith(c.path)
        );
      }
    });
    return open;
  }, [location.pathname]);

  const [openGroups, setOpenGroups] = useState(initiallyOpen);
  useEffect(() => setOpenGroups(initiallyOpen), [initiallyOpen]);

  const toggleGroup = (key) => setOpenGroups((s) => ({ ...s, [key]: !s[key] }));

  const ItemBase = ({ active, children }) => (
    <div
      className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors
      ${
        active
          ? "bg-indigo-50 text-indigo-700"
          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
      }`}
    >
      {children}
    </div>
  );

  const LinkItem = ({ to, icon: Icon, label }) => {
    const active =
      location.pathname === to || location.pathname.startsWith(to + "/");
    return (
      <NavLink to={to} onClick={onNavigate}>
        <ItemBase active={active}>
          <Icon className="h-5 w-5 shrink-0" />
          {!isCollapsed && <span className="truncate">{label}</span>}
        </ItemBase>
      </NavLink>
    );
  };

  const GroupItem = ({ item }) => {
    const hasActiveChild = item.children?.some((c) =>
      location.pathname.startsWith(c.path)
    );
    const isOpen = openGroups[item.label];

    // Collapsed: show a flyout on hover
    if (isCollapsed) {
      return (
        <div className="relative">
          <div className="cursor-default">
            <ItemBase active={hasActiveChild}>
              <item.icon className="h-5 w-5 shrink-0" />
              {/* label hidden in collapsed mode */}
            </ItemBase>
          </div>
          {/* flyout */}
          <div className="absolute left-full top-0 ml-2 hidden group-hover:flex">
            <div className="rounded-xl border border-slate-200 bg-white shadow-lg p-2 min-w-[12rem]">
              <div className="px-2 pb-1 text-xs font-semibold text-slate-400">
                {item.label}
              </div>
              {item.children.map((c) => (
                <NavLink key={c.path} to={c.path} onClick={onNavigate}>
                  <div
                    className={`flex items-center gap-2 rounded-md px-2 py-2 text-sm ${
                      location.pathname.startsWith(c.path)
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <c.icon className="h-4 w-4" />
                    <span className="truncate">{c.label}</span>
                  </div>
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // Expanded: classic toggle section
    return (
      <div>
        <button
          onClick={() => toggleGroup(item.label)}
          className={`w-full ${
            hasActiveChild ? "text-indigo-700" : "text-slate-700"
          } hover:text-slate-900`}
        >
          <div className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-slate-100">
            <div className="flex items-center gap-3">
              <item.icon className="h-5 w-5" />
              <span className="text-sm">{item.label}</span>
            </div>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </div>
        </button>

        <div
          className={`overflow-hidden transition-all ${
            isOpen ? "max-h-64" : "max-h-0"
          }`}
        >
          <div className="mt-1 space-y-1 pl-10 pr-2">
            {item.children?.map((c) => {
              const active = location.pathname.startsWith(c.path);
              return (
                <NavLink key={c.path} to={c.path} onClick={onNavigate}>
                  <div
                    className={`flex items-center gap-2 rounded-md px-2 py-2 text-sm ${
                      active
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    <c.icon className="h-4 w-4" />
                    <span className="truncate">{c.label}</span>
                  </div>
                </NavLink>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <aside
      className={`fixed top-14 left-0 h-[calc(100vh-56px)] bg-white/90 backdrop-blur border-r border-slate-200
      transition-[width] duration-300 overflow-x-hidden ${className}`}
      style={{ width: isCollapsed ? 80 : 256 }}
    >
      <div className="flex flex-col h-full px-3 py-4">
        <div className="text-[11px] font-semibold text-slate-400 px-2 mb-2">
          MAIN MENU
        </div>

        <nav className="space-y-1">
          {navItems.map((item) =>
            item.children ? (
              <GroupItem key={item.label} item={item} />
            ) : (
              <LinkItem
                key={item.path}
                to={item.path}
                icon={item.icon}
                label={item.label}
              />
            )
          )}
        </nav>

        <div className="flex-1" />

        <div className="text-[11px] font-semibold text-slate-400 px-2 mt-4 mb-2">
          ACCOUNT
        </div>
        <nav className="space-y-1">
          {/* Account Settings already in navItems; keep here only Logout */}
          <button
            onClick={() => {
              logout();
              window.location.href = "/login";
            }}
            className="w-full text-left"
          >
            <div className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-600 hover:bg-red-50">
              <LogOut className="h-5 w-5" />
              {!isCollapsed && <span className="truncate">Logout</span>}
            </div>
          </button>
        </nav>
      </div>
    </aside>
  );
}
