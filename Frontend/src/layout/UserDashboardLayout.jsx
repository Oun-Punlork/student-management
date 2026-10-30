import { useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import UserNavbar from "../components/UserNavbar.jsx";
import UserSidebar from "../components/UserSidebar.jsx";
import { getCurrentUser } from "../service/authService.js";

export default function UserDashboardLayout() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const hasToken = Boolean(localStorage.getItem("token"));
  const {
    data: response,
    isPending,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["current-user"],
    queryFn: getCurrentUser,
    enabled: hasToken,
    retry: false,
  });

  if (!hasToken || (isError && (error.status === 401 || error.status === 403))) {
    return <Navigate to="/login" replace />;
  }

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm font-medium text-slate-500">
          Verifying your session...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md rounded-2xl border border-rose-200 bg-white p-6 text-center shadow-sm">
          <h1 className="font-semibold text-rose-700">
            Unable to verify your session.
          </h1>
          <p className="mt-2 text-sm text-slate-600">{error.message}</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const user = response?.data?.user;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <UserSidebar
        user={user}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <UserNavbar
          user={user}
          onToggleMobileSidebar={() => setIsMobileOpen((isOpen) => !isOpen)}
        />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
