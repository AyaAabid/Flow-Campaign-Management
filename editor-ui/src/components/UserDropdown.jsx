import { ChevronDown, LogOut, Settings } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { userAuth } from "../context/AuthContext";
import { Avatar } from "antd";
import { useNavigate } from "react-router-dom";

const menuItems = [
  {
    key: "settings",
    label: "Account Settings",
    icon: <Settings className="w-4 h-4" />,
    to: "/account",
  },
  {
    key: "logout",
    label: "Logout",
    icon: <LogOut className="w-4 h-4" />,
    danger: true,
  },
];

const MENU_WIDTH = 224; // w-56

const UserDropdown = () => {
  const { user, logout } = userAuth();
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(() => {
    const stored = localStorage.getItem("pos-user");
    return user ?? (stored ? JSON.parse(stored) : null);
  });
  const [menuOpen, setMenuOpen] = useState(false);

  // sync with context & user:updated events
  useEffect(() => {
    if (user) setCurrentUser(user);
  }, [user]);
  useEffect(() => {
    const handler = (e) =>
      setCurrentUser((p) => ({ ...(p || {}), ...e.detail }));
    window.addEventListener("user:updated", handler);
    return () => window.removeEventListener("user:updated", handler);
  }, []);

  // avatar/fullname
  const apiBase = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
  const staticBase = apiBase.replace(/\/api\/?$/, "");
  const avatarSrc = currentUser?.profilePicture
    ? currentUser.profilePicture.startsWith("http")
      ? currentUser.profilePicture
      : `${staticBase}${currentUser.profilePicture}`
    : undefined;

  const fullName =
    [currentUser?.firstName, currentUser?.lastName].filter(Boolean).join(" ") ||
    currentUser?.username ||
    "Unknown";

  // trigger ref + computed position for portal menu
  const triggerRef = useRef(null);
  const menuRef = useRef(null); // <-- ref for the portal menu
  const [pos, setPos] = useState({ top: 0, left: 0 });

  const computePos = () => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const top = r.bottom + 8; // below, 8px gap (mt-2)
    const left = Math.max(8, r.right - MENU_WIDTH);
    setPos({ top, left });
  };

  useLayoutEffect(() => {
    if (!menuOpen) return;
    computePos();
    const onScroll = () => computePos();
    const onResize = () => computePos();
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
  }, [menuOpen]);

  // close on outside click (but NOT when clicking inside the portal menu)
  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e) => {
      const trigger = triggerRef.current;
      const menu = menuRef.current;
      if (trigger && (trigger === e.target || trigger.contains(e.target)))
        return; // click on trigger
      if (menu && (menu === e.target || menu.contains(e.target))) return; // click inside menu -> keep open until item handles it
      setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [menuOpen]);

  const handleLogout = () => {
    logout();
    // If you use a router-based guard, navigate is fine:
    // navigate("/login");
    // Hard redirect also OK:
    window.location.href = "/login";
  };

  const handleAction = (item) => {
    if (item.key === "logout") {
      handleLogout();
    } else if (item.to) {
      navigate(item.to);
    }
    setMenuOpen(false);
  };

  return (
    <div className="relative">
      {/* Trigger (use ref for positioning) */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setMenuOpen((o) => !o)}
        className="group flex items-center gap-3 pl-3 border-l border-slate-200 focus:outline-none"
      >
        <Avatar size="large" src={avatarSrc}>
          {currentUser?.firstName?.[0] || currentUser?.username?.[0] || "U"}
        </Avatar>

        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-slate-700">{fullName}</p>
          <p className="text-xs text-slate-500">
            {currentUser?.role || "User"}
          </p>
        </div>

        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform ${
            menuOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* PORTAL MENU — on top, but clicks inside no longer close it prematurely */}
      {menuOpen &&
        createPortal(
          <div
            ref={menuRef}
            className="fixed z-[10000]"
            style={{ top: pos.top, left: pos.left, width: MENU_WIDTH }}
          >
            <div
              className="rounded-md bg-white border border-slate-200 shadow-lg"
              role="menu"
            >
              <div className="px-4 pt-3 pb-2 border-b border-slate-100">
                <p className="text-sm font-semibold text-slate-800 truncate">
                  {fullName}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {currentUser?.username}
                </p>
              </div>

              <div className="py-1">
                {menuItems.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => handleAction(item)}
                    className={`w-full flex items-center gap-2 px-4 py-2 text-sm text-left ${
                      item.danger
                        ? "text-red-600 hover:bg-red-50"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                    role="menuitem"
                  >
                    {item.icon}
                    <span className="truncate">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default UserDropdown;
