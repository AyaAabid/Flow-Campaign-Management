import { Menu, Bell, Search } from "lucide-react";
import UserDropdown from "../../components/UserDropdown";

function FlowLogo() {
  return (
    <div className="flex items-center gap-2">
      <div className="h-7 w-7 rounded-lg bg-indigo-600 text-white font-bold grid place-items-center">
        F
      </div>
      <span className="text-lg font-semibold tracking-tight text-slate-900">
        Flow
      </span>
    </div>
  );
}

export default function Header({
  isCollapsed,
  onToggleCollapse,
  onToggleMobile,
}) {
  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-slate-200">
      <div className="h-14 flex items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          {/* mobile open */}
          <button
            onClick={onToggleMobile}
            className="md:hidden p-2 rounded-md hover:bg-slate-100"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5 text-slate-700" />
          </button>

          {/* desktop collapse */}
          <button
            onClick={onToggleCollapse}
            className="hidden md:inline-flex p-2 rounded-md hover:bg-slate-100"
            aria-label="Toggle sidebar"
            title={isCollapsed ? "Expand menu" : "Collapse menu"}
          >
            <Menu className="h-5 w-5 text-slate-700" />
          </button>

          <FlowLogo />
        </div>

        <div className="flex items-center gap-2">
          <UserDropdown />
        </div>
      </div>
    </header>
  );
}
