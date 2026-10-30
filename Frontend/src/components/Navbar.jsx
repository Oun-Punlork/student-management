import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { logoutUser } from "../service/authService";

export default function Navbar({ user, onToggleMobileSidebar }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifyOpen, setIsNotifyOpen] = useState(false);
  const profileRef = useRef(null);
  const notifyRef = useRef(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const displayName = user?.username || "Administrator";
  const displayEmail = user?.email || "admin@sv30.edu";
  const userInitials = (user?.username || "AD").slice(0, 2).toUpperCase();

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (notifyRef.current && !notifyRef.current.contains(event.target)) {
        setIsNotifyOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    const revocationRequest = logoutUser();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    queryClient.clear();
    setIsProfileOpen(false);
    navigate("/login", { replace: true });

    revocationRequest.catch((error) => {
      console.error("Logout API error:", error);
    });
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-4 md:px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Left: Mobile Toggle & Search */}
      <div className="flex items-center gap-3 flex-1">
        <button
          onClick={onToggleMobileSidebar}
          type="button"
          className="md:hidden p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
          <i className="fa-solid fa-bars text-lg"></i>
        </button>

        {/* Global Search Bar */}
        <div className="relative w-full max-w-xs hidden sm:block">
          <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
          <input
            type="text"
            placeholder="Search students, classes..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 text-slate-700 placeholder-slate-400 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          />
        </div>
      </div>

      {/* Right Action Icons & Profile */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Notifications Dropdown */}
        <div className="relative" ref={notifyRef}>
          <button
            onClick={() => setIsNotifyOpen(!isNotifyOpen)}
            type="button"
            className="relative p-2.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-colors focus:outline-none"
            title="Notifications">
            <i className="fa-regular fa-bell text-base"></i>
            {/* Ping Indicator */}
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
          </button>

          {isNotifyOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Notifications
                </h3>
                <span className="text-[10px] font-semibold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">
                  3 New
                </span>
              </div>
              <div className="divide-y divide-slate-50 max-h-64 overflow-y-auto">
                <div className="px-4 py-3 hover:bg-slate-50/80 transition-colors cursor-pointer">
                  <p className="text-xs font-medium text-slate-800">
                    New student enrollment
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    2 minutes ago
                  </p>
                </div>
                <div className="px-4 py-3 hover:bg-slate-50/80 transition-colors cursor-pointer">
                  <p className="text-xs font-medium text-slate-800">
                    Attendance report generated
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    1 hour ago
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-slate-200 mx-1"></div>

        {/* Profile Menu Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            type="button"
            className="flex items-center gap-3 p-1 rounded-xl hover:bg-slate-50 transition-colors focus:outline-none">
            <div className="w-8 h-8 rounded-lg  from-indigo-600 to-violet-500 text-white flex items-center justify-center text-xs font-bold shadow-sm">
              {userInitials}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-slate-800 leading-tight">
                {displayName}
              </p>
              <p className="text-[10px] text-slate-400 leading-tight">
                {displayEmail}
              </p>
            </div>
            <i
              className={`fa-solid fa-chevron-down text-[10px] text-slate-400 transition-transform ${isProfileOpen ? "rotate-180" : ""}`}></i>
          </button>

          {/* User Menu Dropdown */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-50">
              <div className="px-4 py-2.5 border-b border-slate-100 sm:hidden">
                <p className="text-xs font-semibold text-slate-800">
                  {displayName}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {displayEmail}
                </p>
              </div>

              <div className="p-1">
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    navigate("/profile");
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/50 rounded-xl transition-colors">
                  <i className="fa-regular fa-user text-sm w-4 text-center"></i>
                  My Profile
                </button>

                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    navigate("/settings");
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/50 rounded-xl transition-colors">
                  <i className="fa-solid fa-gear text-sm w-4 text-center"></i>
                  Account Settings
                </button>
              </div>

              <div className="p-1 border-t border-slate-100">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-colors">
                  <i className="fa-solid fa-arrow-right-from-bracket text-sm w-4 text-center"></i>
                  Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
