import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const NAV_ITEMS = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: "/dashboard",
    icon: "fa-chart-pie",
  },
  {
    id: "student",
    label: "Students",
    path: "/student",
    icon: "fa-user-graduate",
  },
  {
    id: "subject",
    label: "Subjects & Scores",
    path: "/subject",
    icon: "fa-book-bookmark",
    children: [
      {
        id: "results",
        label: "Results Preview",
        path: "/results",
        icon: "fa-file-lines",
      },
      {
        id: "information",
        label: "Information",
        path: "/information",
        icon: "fa-circle-info",
      },
    ],
  },
  {
    id: "attendance",
    label: "Attendance",
    path: "/attendance",
    icon: "fa-calendar-check",
    children: [
      {
        id: "attendance-weekly",
        label: "Weekly Review",
        path: "/attendance/weekly",
        icon: "fa-calendar-week",
      },
    ],
  },
  { id: "users", label: "Users & Roles", path: "/users", icon: "fa-users" },
];

export default function Sidebar({
  activePage,
  onNavigate,
  user,
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
  const matchedNavItem = NAV_ITEMS.find(
    (item) => matchesPath(item.path) || item.children?.some((child) => matchesPath(child.path)),
  );
  const activeChild = matchedNavItem?.children?.find((child) => matchesPath(child.path));
  const currentActive = activePage || activeChild?.id || matchedNavItem?.id || "dashboard";
  const portalTitle = user?.role ? `${user.role} Portal` : "Admin Portal";

  const sidebarContent = (
    <aside
      id="sidebar"
      className={`h-screen sticky top-0 bg-white text-slate-600 flex flex-col justify-between border-r border-slate-200/80 transition-all duration-300 ease-in-out select-none z-30 ${
        isCollapsed ? "w-20" : "w-64"
      }`}>
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
                <p className="text-[10px] font-semibold text-indigo-600/80 uppercase tracking-wider mt-1">
                  {portalTitle}
                </p>
              </div>
            )}
          </div>

          <button
            onClick={toggleSidebar}
            type="button"
            className="text-slate-400 hover:text-indigo-600 p-5 rounded-lg hover:bg-slate-50 transition-colors shrink-0 focus:outline-none"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}>
            <i
              className={`fa-solid ${isCollapsed ? "fa-indent" : "fa-outdent"} text-sm`}></i>
          </button>
        </div>

        {/* Menu Section Label */}
        {!isCollapsed && (
          <div className="px-5 pt-6 pb-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Navigation
            </p>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="p-3 space-y-1.5">
          {NAV_ITEMS.map((item) => {
            const isActive = currentActive === item.id;
            const isExpanded = isActive || item.children?.some((child) => child.id === currentActive);
            return (
              <div key={item.id}>
                <Link
                  to={item.path}
                  onClick={() => {
                    if (onNavigate) onNavigate(item.id);
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className={`group relative flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-indigo-50/80 text-indigo-600 font-semibold shadow-sm"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}>
                  {isActive && (
                    <span className="absolute left-0 top-2 bottom-2 w-1 bg-indigo-600 rounded-r-full" />
                  )}

                  <div className="flex items-center gap-3.5 truncate">
                    <i
                      className={`fa-solid ${item.icon} text-base w-5 text-center shrink-0 transition-colors ${
                        isActive
                          ? "text-indigo-600"
                          : "text-slate-400 group-hover:text-slate-600"
                      }`}></i>
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </div>

                  {!isCollapsed && item.badge && (
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full font-semibold transition-colors ${
                        isActive
                          ? "bg-indigo-100 text-indigo-700"
                          : "bg-slate-100 text-slate-500"
                      }`}>
                      {item.badge}
                    </span>
                  )}

                  {isCollapsed && (
                    <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                      {item.label}
                    </div>
                  )}
                </Link>

                {!isCollapsed && isExpanded && item.children?.length > 0 && (
                  <div className="ml-5 mt-1 space-y-1 border-l border-slate-200 pl-3">
                    {item.children.map((child) => {
                      const isChildActive = currentActive === child.id;
                      return (
                        <Link
                          key={child.id}
                          to={child.path}
                          onClick={() => {
                            if (onNavigate) onNavigate(child.id);
                            if (onCloseMobile) onCloseMobile();
                          }}
                          aria-current={isChildActive ? "page" : undefined}
                          className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors ${
                            isChildActive
                              ? "bg-indigo-50 text-indigo-700"
                              : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                          }`}>
                          <i className={`fa-solid ${child.icon} w-4 text-center`}></i>
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
      <div className="px-3 pt-3 pb-4 border-t border-slate-100">
        <a
          href="https://t.me/punlork_oun"
          onClick={onCloseMobile}
          title="Contact Admin"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Contact Admin on Telegram"
          className={`group relative flex items-center w-full rounded-xl bg-white border border-slate-200/80 shadow-sm transition-all duration-200 hover:border-sky-300 hover:bg-sky-50/50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 active:scale-[0.98] ${
            isCollapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5"
          }`}>
          {/* Telegram Icon Container with soft brand color accent */}
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-[#229ED9] group-hover:bg-[#229ED9] group-hover:text-white transition-colors duration-200">
            <i className="fa-brands fa-telegram text-xl"></i>
          </span>

          {/* Expanded Label */}
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

          {/* Collapsed Tooltip */}
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
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">{sidebarContent}</div>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}></div>
          <div className="relative z-10 flex">{sidebarContent}</div>
        </div>
      )}
    </>
  );
}
