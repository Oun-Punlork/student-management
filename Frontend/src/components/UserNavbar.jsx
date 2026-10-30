import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { logoutUser } from "../service/authService.js";

export default function UserNavbar({ user, onToggleMobileSidebar }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [failedAvatarUrl, setFailedAvatarUrl] = useState(null);
  const profileRef = useRef(null);
  const notificationsRef = useRef(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const displayName = user?.username || "Student";
  const userInitial = displayName.trim().charAt(0).toUpperCase() || "S";
  const avatarUrl = user?.avatarUrl;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!profileRef.current?.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (!notificationsRef.current?.contains(event.target)) {
        setIsNotificationsOpen(false);
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
    navigate("/login", { replace: true });

    revocationRequest.catch((error) => {
      console.error("Logout API error:", error);
    });
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white px-4 md:px-6">
      <button
        onClick={onToggleMobileSidebar}
        type="button"
        aria-label="Open navigation menu"
        className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 md:hidden"
      >
        <i className="fa-solid fa-bars text-lg" aria-hidden="true"></i>
      </button>

      <div className="ml-auto flex items-center gap-2 md:gap-3">
        <div className="relative" ref={notificationsRef}>
          <button
            type="button"
            onClick={() => {
              setIsNotificationsOpen((isOpen) => !isOpen);
              setIsProfileOpen(false);
            }}
            aria-label="Notifications"
            aria-expanded={isNotificationsOpen}
            className="rounded-lg p-2.5 text-slate-600 transition-colors hover:bg-slate-50 hover:text-indigo-600"
          >
            <i className="fa-solid fa-bell text-lg" aria-hidden="true"></i>
          </button>
          {isNotificationsOpen && (
            <div className="absolute right-0 z-50 mt-2 w-64 rounded-2xl border border-slate-100 bg-white p-4 shadow-xl">
              <p className="text-sm font-semibold text-slate-800">Notifications</p>
              <p className="mt-2 text-sm text-slate-500">No notifications yet.</p>
            </div>
          )}
        </div>

        <a
          href="https://t.me/punlork_oun"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Message the admin on Telegram"
          title="Message the admin"
          className="rounded-lg p-2.5 text-slate-600 transition-colors hover:bg-slate-50 hover:text-indigo-600"
        >
          <i className="fa-solid fa-message text-lg" aria-hidden="true"></i>
        </a>

        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => {
              setIsProfileOpen((isOpen) => !isOpen);
              setIsNotificationsOpen(false);
            }}
            aria-label="Open profile menu"
            aria-expanded={isProfileOpen}
            className="flex items-center gap-2 rounded-full border border-slate-200 px-2.5 py-1.5 transition-colors hover:bg-slate-50 sm:gap-3 sm:px-3"
          >
            <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full  border-2 bg-pink-600 text-base font-bold text-white shadow-sm">
              {avatarUrl && failedAvatarUrl !== avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={`${displayName}'s profile`}
                  className="h-full w-full object-cover"
                  onError={() => setFailedAvatarUrl(avatarUrl)}
                />
              ) : (
                userInitial
              )}
            </span>
            <span className="hidden max-w-40 truncate text-sm font-semibold text-slate-800 sm:inline">
              {displayName}
            </span>
            <i
              className={`fa-solid fa-chevron-down text-[10px] text-slate-500 transition-transform ${
                isProfileOpen ? "rotate-180" : ""
              }`}
              aria-hidden="true"
            ></i>
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-slate-100 bg-white py-1 shadow-xl">
              <button
                type="button"
                onClick={() => {
                  setIsProfileOpen(false);
                  navigate("/userprofile");
                }}
                className="w-full border-b border-slate-100 px-4 py-3 text-left text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50"
              >
                My Profile
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full px-4 py-3 text-left text-sm font-semibold text-red-600 transition-colors hover:bg-rose-50"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}