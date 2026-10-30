import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  Mail,
  ShieldCheck,
  UserRound,
  KeyRound,
  ArrowLeft,
  Copy,
  Check,
  Clock,
  Fingerprint,
  Globe2,
  Activity,
} from "lucide-react";
import { getCurrentUser } from "../../service/authService";

function formatDate(value) {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function getRoleBadge(role) {
  const normalized = String(role || "").toUpperCase();
  if (normalized === "ADMIN" || normalized === "SUPER_ADMIN") {
    return "bg-indigo-50 text-indigo-700 ring-indigo-500/30";
  }
  if (normalized === "TEACHER" || normalized === "MODERATOR") {
    return "bg-emerald-50 text-emerald-700 ring-emerald-500/30";
  }
  return "bg-slate-100 text-slate-700 ring-slate-500/20";
}

export default function EnhancedProfile() {
  const [copiedField, setCopiedField] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  const {
    data: response,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["current-user"],
    queryFn: getCurrentUser,
  });

  const user = response?.data?.user;
  const initials = (user?.username || "?").slice(0, 2).toUpperCase();

  const handleCopy = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl animate-pulse space-y-6 py-6">
        <div className="h-8 w-36 rounded-lg bg-slate-200" />
        <div className="h-44 rounded-2xl border border-slate-200/80 bg-white" />
        <div className="h-72 rounded-2xl border border-slate-200/80 bg-white" />
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="mx-auto max-w-4xl rounded-2xl border border-rose-200 bg-rose-50/70 p-6 text-sm text-rose-800 shadow-xs" role="alert">
        <h2 className="font-bold text-base">Unable to load profile</h2>
        <p className="mt-1 text-rose-700">{error?.message || "Your account details could not be loaded."}</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-4 rounded-xl bg-rose-700 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-rose-800"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 py-4">
      {/* Top Header Navigation */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
            Account Preferences
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Personal Profile
          </h1>
        </div>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 self-start sm:self-auto rounded-xl border border-slate-200/80 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:bg-slate-50 hover:border-slate-300"
        >
          <ArrowLeft className="h-3.5 w-3.5 text-slate-400" />
          Dashboard
        </Link>
      </div>

      {/* Hero Overview Card */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
        <div className="bg-slate-50/60 p-6 border-b border-slate-100 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            
            {/* User Identity */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-lg font-bold text-white shadow-sm ring-4 ring-indigo-50">
                  {initials}
                </div>
                {/* Status Indicator Dot */}
                <span className="absolute -bottom-0.5 -right-0.5 block h-4 w-4 rounded-full bg-emerald-500 ring-2 ring-white" title="Account Active" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="truncate text-lg font-bold text-slate-900">{user.username}</h2>
                  <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${getRoleBadge(user.role)}`}>
                    {user.role || "Member"}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                  <span className="truncate">{user.email}</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(user.email, "email")}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                    title="Copy Email"
                  >
                    {copiedField === "email" ? (
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <Link
                to="/settings/security"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:bg-slate-50 hover:text-slate-900"
              >
                <KeyRound className="h-3.5 w-3.5 text-slate-400" />
                Change Password
              </Link>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-100 bg-white px-6">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`border-b-2 py-3 px-1 text-xs font-semibold transition-colors mr-6 ${
              activeTab === "overview"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Overview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("system")}
            className={`border-b-2 py-3 px-1 text-xs font-semibold transition-colors ${
              activeTab === "system"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            System & Metadata
          </button>
        </div>

        {/* Tab Content 1: Overview */}
        {activeTab === "overview" && (
          <div className="p-6 sm:p-8 space-y-8">
            <div>
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-4">
                Primary Account Details
              </h3>
              <dl className="grid gap-6 sm:grid-cols-2">
                <div className="flex items-start gap-3.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                    <UserRound className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <dt className="text-xs font-medium text-slate-500">Username</dt>
                    <dd className="mt-0.5 text-xs font-semibold text-slate-900">{user.username}</dd>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                    <Mail className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <dt className="text-xs font-medium text-slate-500">Email Address</dt>
                    <dd className="mt-0.5 text-xs font-semibold text-slate-900">{user.email}</dd>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                    <ShieldCheck className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <dt className="text-xs font-medium text-slate-500">Access Level</dt>
                    <dd className="mt-0.5 text-xs font-semibold text-slate-900 capitalize">
                      {user.role ? user.role.toLowerCase() : "Standard User"}
                    </dd>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                    <CalendarDays className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <dt className="text-xs font-medium text-slate-500">Member Since</dt>
                    <dd className="mt-0.5 text-xs font-semibold text-slate-900">
                      {formatDate(user.createdAt)}
                    </dd>
                  </div>
                </div>
              </dl>
            </div>
          </div>
        )}

        {/* Tab Content 2: System Metadata */}
        {activeTab === "system" && (
          <div className="p-6 sm:p-8 space-y-6">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-4">
              System References
            </h3>
            <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slate-500">
                  <Fingerprint className="h-4 w-4 text-slate-400" /> Account ID
                </span>
                <span className="font-mono font-semibold text-slate-800">{user.id || "N/A"}</span>
              </div>
              <div className="flex items-center justify-between text-xs border-t border-slate-100 pt-3">
                <span className="flex items-center gap-2 text-slate-500">
                  <Globe2 className="h-4 w-4 text-slate-400" /> Default Language
                </span>
                <span className="font-semibold text-slate-800">English (US) / Khmer</span>
              </div>
              <div className="flex items-center justify-between text-xs border-t border-slate-100 pt-3">
                <span className="flex items-center gap-2 text-slate-500">
                  <Activity className="h-4 w-4 text-slate-400" /> Account Status
                </span>
                <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Active
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}