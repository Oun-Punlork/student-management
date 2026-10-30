import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const NAV_ITEMS = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: "/userdashboard",
    icon: "fa-chart-pie",
  },
  {
    id: "profile",
    label: "Profile",
    path: "/userprofile",
    icon: "fa-user",
  },
  {
    id: "information",
    label: "Information",
    path: "/userinformation",
    icon: "fa-info-circle",
  },
  {
    id: "attendance",
    label: "Attendance",
    path: "/userattendance",
    icon: "fa-calendar-check",
  }
  
];

export default function UserSidebar({
  activePage,
  onNavigate,
  user = { role: "student" },
  isMobileOpen = false,
  onCloseMobile,
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  const matchesPath = (path) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  const filteredNavItems = NAV_ITEMS;

  // Detect active route matching current path
  const matchedNavItem = filteredNavItems.find(
    (item) =>
      matchesPath(item.path) ||
      item.children?.some((child) => matchesPath(child.path))
  );

  const activeChild = matchedNavItem?.children?.find((child) =>
    matchesPath(child.path)
  );

  // Default to activePage prop, matched route, OR fallback to "dashboard" first
  const currentActive =
    activePage || activeChild?.id || matchedNavItem?.id || "dashboard";

  // Accordion state - defaults open for the active parent/child item
  const [expandedSubmenus, setExpandedSubmenus] = useState({});

  const toggleSubmenu = (itemId) => {
    setExpandedSubmenus((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const portalTitle = user?.role ? `${user.role} Portal` : "Student Portal";

  const sidebarContent = (
    <aside
      id="sidebar"
      className={`h-screen sticky top-0 bg-white text-slate-600 flex flex-col justify-between border-r border-slate-200/80 transition-all duration-300 ease-in-out select-none z-30 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      <div>
        {/* Header / Brand Logo */}
        <div className="h-16 px-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl text-lg font-bold flex items-center justify-center border border-indigo-100 shadow-sm shrink-0">
              <i className="fa-solid fa-graduation-cap"></i>
            </div>
            {!isCollapsed && (
              <div className="transition-opacity duration-200 truncate">
                <h1 className="text-base font-bold tracking-tight text-slate-900 leading-none">
                  SV30
                </h1>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-1">
                  {portalTitle}
                </p>
              </div>
            )}
          </div>

          <button
            onClick={toggleSidebar}
            type="button"
            className="text-slate-800 hover:text-indigo-600 p-5 rounded-lg hover:bg-slate-50 transition-colors shrink-0 focus:outline-none"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            <i
              className={`fa-solid ${
                isCollapsed ? "fa-indent" : "fa-outdent"
              } text-sm`}
            ></i>
          </button>
        </div>

        {/* Section Header */}
        {!isCollapsed && (
          <div className="px-5 pt-5 pb-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-900">
              Navigation
            </p>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="p-3 space-y-1.5 overflow-y-auto max-h-[calc(100vh-160px)] [&::-webkit-scrollbar]:hidden">
          {filteredNavItems.map((item) => {
            const isActive = currentActive === item.id;
            const hasChildren = item.children && item.children.length > 0;
            const isChildActive = item.children?.some(
              (child) => child.id === currentActive
            );
            const isMenuOpen =
              expandedSubmenus[item.id] ?? (isActive || isChildActive);

            return (
              <div key={item.id}>
                <div className="relative group">
                  <Link
                    to={item.path}
                    onClick={() => {
                      if (hasChildren && !isCollapsed) {
                        toggleSubmenu(item.id);
                      }
                      if (onNavigate) onNavigate(item.id);
                      if (onCloseMobile) onCloseMobile();
                    }}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive || isChildActive
                        ? "bg-indigo-50/80 text-indigo-600 font-semibold shadow-xs"
                        : "text-slate-900 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    {(isActive || isChildActive) && (
                      <span className="absolute left-0 top-2 bottom-2 w-1 bg-indigo-600 rounded-r-full" />
                    )}

                    <div className="flex items-center gap-3.5 truncate">
                      <i
                        className={`fa-solid ${item.icon} text-base w-5 text-center shrink-0 transition-colors ${
                          isActive || isChildActive
                            ? "text-indigo-600"
                            : "text-slate-900 group-hover:text-slate-600"
                        }`}
                      ></i>
                      {!isCollapsed && (
                        <span className="truncate">{item.label}</span>
                      )}
                    </div>

                    {!isCollapsed && hasChildren && (
                      <i
                        className={`fa-solid fa-chevron-down text-[10px] text-slate-400 transition-transform duration-200 ${
                          isMenuOpen ? "rotate-180 text-indigo-600" : ""
                        }`}
                      ></i>
                    )}

                  </Link>
                </div>

                {/* Submenu Dropdown */}
                {!isCollapsed && hasChildren && isMenuOpen && (
                  <div className="ml-5 mt-1 space-y-1 border-l border-slate-200 pl-3">
                    {item.children.map((child) => {
                      const isSubActive = currentActive === child.id;
                      return (
                        <Link
                          key={child.id}
                          to={child.path}
                          onClick={() => {
                            if (onNavigate) onNavigate(child.id);
                            if (onCloseMobile) onCloseMobile();
                          }}
                          className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors ${
                            isSubActive
                              ? "bg-indigo-50 text-indigo-700 font-semibold"
                              : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                          }`}
                        >
                          <i
                            className={`fa-solid ${child.icon} w-4 text-center text-[11px] ${
                              isSubActive
                                ? "text-indigo-600"
                                : "text-slate-400"
                            }`}
                          ></i>
                          <span>{child.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="px-3 pt-3 pb-4 border-t border-slate-100">
        <a
          href="https://t.me/punlork_oun"
          onClick={onCloseMobile}
          title="Contact Admin"
          target="_blank"
          rel="noopener noreferrer"
          className={`group relative flex items-center w-full rounded-xl bg-white border border-slate-200/80 shadow-xs transition-all duration-200 hover:border-sky-300 hover:bg-sky-50/50 hover:shadow-sm active:scale-[0.98] ${
            isCollapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5"
          }`}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-[#229ED9] group-hover:bg-[#229ED9] group-hover:text-white transition-colors duration-200">
            <i className="fa-brands fa-telegram text-xl"></i>
          </span>

          {!isCollapsed && (
            <span className="min-w-0 flex-1 text-left">
              <span className="block text-xs font-bold text-slate-800 group-hover:text-sky-600 transition-colors">
                Contact Admin
              </span>
              <span className="mt-0.5 block text-[11px] font-medium text-slate-400">
                Message us on Telegram
              </span>
            </span>
          )}

          {isCollapsed && (
            <span className="absolute left-full ml-3 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white opacity-0 shadow-xl transition-opacity group-hover:opacity-100 pointer-events-none z-50 whitespace-nowrap">
              Contact Admin
            </span>
          )}
        </a>
      </div>
    </aside>
  );

  return (
    <>
      <div className="hidden md:flex">{sidebarContent}</div>
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 flex">{sidebarContent}</div>
        </div>
      )}
    </>
  );
}