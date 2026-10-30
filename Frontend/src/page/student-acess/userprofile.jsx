import { useState, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  CalendarDays,
  Camera,
  CheckCircle2,
  Copy,
  Edit3,
  Fingerprint,
  GraduationCap,
  Mail,
  ShieldCheck,
  UserRound,
  Sparkles,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  getCurrentUser,
  uploadProfileImage,
} from "../../service/authService.js";

function formatDate(value) {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function ProfileDetailItem({
  label,
  value,
  icon: Icon,
  isTag = false,
  tags = [],
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs  ">
      <div className="flex items-center gap-2 mb-1.5">
        {Icon && <Icon className="h-4 w-4 text-slate-500 " />}
        <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500 ">
          {label}
        </dt>
      </div>

      {isTag ? (
        <dd className="flex flex-wrap gap-1.5 pt-0.5">
          {tags.map((tag, idx) => (
            <span
              key={idx}
              className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-semibold text-slate-700   ">
              {tag}
            </span>
          ))}
        </dd>
      ) : (
        <dd className="text-sm font-bold text-slate-900  break-words">
          {value || "Not available"}
        </dd>
      )}
    </div>
  );
}

export default function UserProfile() {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [uploadError, setUploadError] = useState(false);
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();

  const {
    data: response,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["current-user"],
    queryFn: getCurrentUser,
    retry: false,
  });

  const user = response?.data?.user || response?.user || {};
  const displayName = user?.username || "Student";
  const initials = displayName.trim().slice(0, 2).toUpperCase() || "ST";

  const profileImageMutation = useMutation({
    mutationFn: uploadProfileImage,
    onSuccess: async () => {
      setUploadError(false);
      setUploadMessage("Profile photo updated.");
      await queryClient.invalidateQueries({ queryKey: ["current-user"] });
    },
    onError: (error) => {
      setUploadError(true);
      setUploadMessage(error.message);
    },
  });

  const [editForm, setEditForm] = useState({
    username: displayName,
  });

  const handleCopyId = (id) => {
    if (!id) return;
    navigator.clipboard.writeText(String(id));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setUploadError(true);
      setUploadMessage("Choose a JPEG, PNG, or WebP image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError(true);
      setUploadMessage("Profile images must be 5 MB or smaller.");
      return;
    }

    setUploadError(false);
    setUploadMessage("Uploading profile photo...");
    profileImageMutation.mutate(file);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white p-6 text-black">
        <div className="mx-auto max-w-5xl animate-pulse space-y-6 py-4">
          <div className="h-8 w-40 rounded-xl bg-slate-200 " />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="h-[420px] rounded-3xl bg-slate-200 " />
            <div className="h-[420px] rounded-3xl bg-slate-200  lg:col-span-2" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-6 text-black">
        <div
          className="mx-auto max-w-md w-full rounded-3xl border border-rose-200  bg-rose-50  p-8 text-center shadow-xl"
          role="alert">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600  ">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="text-lg font-bold text-rose-900 ">
            Unable to load profile
          </h1>
          <p className="mt-2 text-xs leading-relaxed text-rose-700 ">
            {error?.message ||
              "Your account details could not be loaded at this time."}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-6 rounded-xl bg-rose-600 px-6 py-2.5 text-xs font-semibold text-white shadow-lg cursor-pointer">
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4 text-black font-sans sm:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Top Navigation Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200  pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-emerald-600 " />
              <h1 className="text-2xl font-black tracking-tight text-slate-900  sm:text-3xl">
                Profile
              </h1>
            </div>
            <p className="text-xs font-medium text-slate-600 ">
              View and manage your student profile information
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setEditForm({
                  username: displayName,
                });
                setIsEditing(true);
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white   px-4 py-2.5 text-xs font-bold text-slate-800  shadow-2xs cursor-pointer">
              <Edit3 className="h-4 w-4 text-emerald-600 " />
              Edit Profile
            </button>

            <Link
              to="/userdashboard"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white   px-4 py-2.5 text-xs font-bold text-slate-700  shadow-2xs">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to dashboard
            </Link>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Avatar Card */}
          <div className="relative flex flex-col items-center justify-between overflow-hidden rounded-3xl border border-slate-200 bg-white   p-8 text-center shadow-lg">
            <div className="relative z-10 flex flex-col items-center w-full">
              {/* Perfectly Circular Avatar Section */}
              <div className="relative mb-6 flex items-center justify-center">
                {/* Circle Avatar Container */}
                <div className="relative flex h-36 w-36 shrink-0 items-center justify-center rounded-full border-4 border-slate-200  bg-slate-100  shadow-xl overflow-hidden aspect-square">
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={displayName}
                      className="h-full w-full rounded-full object-cover aspect-square"
                    />
                  ) : (
                    <span className="text-4xl font-black text-slate-800  tracking-tight">
                      {initials}
                    </span>
                  )}
                </div>

                {/* Camera Upload Icon Badge */}
                <button
                  type="button"
                  disabled={profileImageMutation.isPending}
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-1 right-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-white bg-emerald-600 text-white shadow-lg enabled:cursor-pointer disabled:cursor-wait disabled:opacity-70 "
                  title="Upload profile photo">
                  <Camera className="h-4 w-4" aria-hidden="true" />
                </button>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  aria-label="Upload profile photo"
                />
              </div>
              {uploadMessage && (
                <p
                  className={`mb-4 text-xs ${
                    uploadError
                      ? "text-rose-600 "
                      : "text-emerald-700 "
                  }`}
                  role={uploadError ? "alert" : "status"}
                >
                  {uploadMessage}
                </p>
              )}

              <h2 className="text-xl font-black text-slate-900  tracking-tight">
                {displayName}
              </h2>
              <p className="mt-1 text-xs font-bold uppercase tracking-wider text-emerald-600 ">
                {user.role || "Student"}
              </p>

              <div className="mt-6 w-full pt-4 border-t border-slate-200  flex justify-center">
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-50  px-3.5 py-1.5 text-xs font-bold text-emerald-700 ">
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                  Active Account
                </span>
              </div>
            </div>

            <div className="mt-8 text-xs font-semibold text-slate-500  w-full pt-4 border-t border-slate-200  flex items-center justify-center gap-1.5">
              <GraduationCap className="h-4 w-4 text-slate-600 " />
              <span>Verified Student Record</span>
            </div>
          </div>

          {/* Right Details Grid Card */}
          <div className="relative rounded-3xl border border-slate-200 bg-white   p-6 sm:p-8 shadow-lg lg:col-span-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6 border-b border-slate-200  pb-4">
                <h2 className="text-base font-extrabold text-slate-900 ">
                  Bio & Account Details
                </h2>
                <span className="text-xs font-medium text-slate-500 ">
                  Updated automatically
                </span>
              </div>

              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ProfileDetailItem
                  icon={UserRound}
                  label="Username"
                  value={user.username}
                />
                <ProfileDetailItem
                  icon={Mail}
                  label="Email Address"
                  value={user.email}
                />
                <ProfileDetailItem
                  icon={ShieldCheck}
                  label="Account Role"
                  value={user.role || "Student"}
                />
                <ProfileDetailItem
                  icon={CalendarDays}
                  label="Member Since"
                  value={formatDate(user.createdAt)}
                />
                <ProfileDetailItem
                  icon={Sparkles}
                  label="Availability Status"
                  value="Available for Learning"
                />
                <ProfileDetailItem
                  label="Tags"
                  isTag={true}
                  tags={["#Student", "#Active", "#Learner"]}
                />
              </dl>
            </div>

            {/* Account ID Footer Box */}
            <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-200  bg-slate-50  p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white  text-slate-700  shadow-2xs">
                  <Fingerprint className="h-5 w-5 text-emerald-600 " />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 ">
                    Account ID
                  </p>
                  <p className="font-mono text-xs font-bold text-slate-900  truncate">
                    {user.id ?? "Not available"}
                  </p>
                </div>
              </div>

              {user?.id && (
                <button
                  type="button"
                  onClick={() => handleCopyId(user.id)}
                  className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-xl border border-slate-300 bg-white   px-3.5 py-2 text-xs font-bold text-slate-800  cursor-pointer shadow-2xs">
                  {copied ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 " />
                      <span className="text-emerald-600 ">
                        Copied
                      </span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy ID</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Edit Modal Overlay */}
        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-2xs p-4">
            <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white   p-6 shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 ">
                <h3 className="text-lg font-bold text-slate-900 ">
                  Edit Profile Details
                </h3>
                <button
                  onClick={() => setIsEditing(false)}
                  className="rounded-lg p-1 text-slate-400 hover:text-slate-600  cursor-pointer">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700  uppercase mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={editForm.username}
                    onChange={(e) =>
                      setEditForm({ ...editForm, username: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-300  bg-white  px-3.5 py-2.5 text-sm text-slate-900  focus:outline-none"
                    required
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 ">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600  cursor-pointer">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-slate-900  px-5 py-2 text-xs font-bold text-white shadow-md cursor-pointer">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
