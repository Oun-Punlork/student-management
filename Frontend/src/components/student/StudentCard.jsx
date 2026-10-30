export default function StudentCard({
  student,
  activeMenuId,
  setActiveMenuId,
  onEdit,
  onView,
  onDelete,
}) {
  const isActive = student.status === "ACTIVE";

  const fullName =
    `${student.firstName || ""} ${student.lastName || ""}`.trim() || "Student";
  const avatarUrl = student.user?.avatarUrl || student.avatar;
  const initials = fullName
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const formattedDate = student.createdAt
    ? new Date(student.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "N/A";

  return (
    <div className="bg-white/80 p-2 rounded-3xl ring-4 ring-white border border-slate-200/50 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <div className="bg-white border border-slate-100 rounded-[1.25rem] p-5 flex flex-col justify-between h-full">
        <div>
          {/* Top Row: Status Tag & Menu */}
          <div className="mb-4 flex items-center justify-between">
            {/* Status Badge */}
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                isActive
                  ? "border-emerald-200/80 bg-emerald-50 text-emerald-600"
                  : "border-slate-200 bg-slate-100 text-slate-500"
              }`}>
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isActive ? "bg-emerald-500" : "bg-slate-400"
                }`}
              />
              {student.status || "INACTIVE"}
            </span>

            {/* Dropdown Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setActiveMenuId(
                    activeMenuId === student.id ? null : student.id,
                  )
                }
                className={`rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 ${
                  activeMenuId === student.id
                    ? "bg-slate-100 text-slate-600"
                    : ""
                }`}>
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 24 24">
                  <path d="M12 8a2 2 0 100-4 2 2 0 000 4zm0 6a2 2 0 100-4 2 2 0 000 4zm0 6a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
              </button>

              {activeMenuId === student.id && (
                <>
                  {/* Click outside backdrop */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setActiveMenuId(null)}
                  />

                  {/* Dropdown Options */}
                  <div className="absolute right-0 top-8 z-20 w-36 overflow-hidden rounded-xl border border-slate-100 bg-white/95 p-1 shadow-xl shadow-slate-200/50 backdrop-blur-sm transition-all animate-in fade-in zoom-in-95 duration-100">
                    <button
                      type="button"
                      onClick={() => setActiveMenuId(null)}
                      className="group flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[11px] font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 active:scale-95">
                      <svg
                        className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveMenuId(null);
                        onDelete(student.id, fullName);
                      }}
                      className="group flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[11px] font-semibold text-rose-600 transition-colors hover:bg-rose-50 active:scale-95">
                      <svg
                        className="h-3.5 w-3.5 text-rose-500 group-hover:text-rose-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Student Profile Overview */}
          <div className="flex items-center gap-3 mb-4">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={`${fullName} profile`}
                className="h-12 w-12 shrink-0 rounded-full border border-slate-200 object-cover shadow-sm"
              />
            ) : (
              <span
                aria-label={`${fullName} profile`}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-indigo-50 text-sm font-bold text-indigo-700 shadow-sm"
              >
                {initials}
              </span>
            )}
            <div className="overflow-hidden">
              <h3 className="text-sm font-bold text-slate-900 truncate">
                {fullName}
              </h3>
              <p className="text-[11px] font-mono font-semibold text-emerald-600 mt-0.5">
                {student.studentCode || "N/A"}
              </p>
            </div>
          </div>

          {/* Key Meta Information */}
          <div className="bg-slate-50/80 rounded-xl p-3 mb-4 border border-slate-100 space-y-2">
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-400 font-medium">GENDER</span>
              <span className="text-slate-700 font-semibold uppercase">
                {student.gender || "N/A"}
              </span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-400 font-medium">JOINED</span>
              <span className="text-slate-700 font-semibold">
                {formattedDate}
              </span>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-1.5 mb-5 text-[11px] text-slate-500">

            <div className="flex items-center gap-2 truncate">
              <svg
                className="w-3.5 h-3.5 text-slate-400 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.828-1.41-5.187-3.769-6.598-6.598l1.293-.97c.362-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
                />
              </svg>
              <span>{student.phone || "N/A"}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={() => onEdit(student)}
            className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200/80 transition-colors">
            Edit
          </button>
          <button
            type="button"
            onClick={() => onView(student)}
            className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition-colors shadow-sm">
            View
          </button>
        </div>
      </div>
    </div>
  );
}
