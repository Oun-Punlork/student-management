export default function AttendanceToolbar({
  selectedDate,
  onDateChange,
  subjects,
  selectedSubjectId,
  onSubjectChange,
  searchQuery,
  onSearchChange,
  onMarkAllPresent,
  onSave,
  isSaving,
  isSaveDisabled,
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
          <i className="fa-regular fa-calendar text-slate-400 text-xs"></i>
          <input
            type="date"
            value={selectedDate}
            onChange={(event) => onDateChange(event.target.value)}
            className="bg-transparent text-xs font-semibold text-slate-700 outline-none cursor-pointer"
          />
        </div>
        {subjects.length > 0 && (
          <select
            value={selectedSubjectId}
            onChange={(event) => onSubjectChange(event.target.value)}
            className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 outline-none cursor-pointer"
          >
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.code} - {subject.name}
              </option>
            ))}
          </select>
        )}
        <div className="relative">
          <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
          <input
            type="text"
            placeholder="ស្វែងរកសិស្ស..."
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:bg-white focus:outline-none"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onMarkAllPresent}
          className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-600 transition-colors cursor-pointer"
        >
          <i className="fa-solid fa-check-double mr-1.5 text-emerald-600"></i>
          Mark All Present
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving || isSaveDisabled}
          className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
        >
          <i className="fa-solid fa-floppy-disk"></i>
          {isSaving ? 'Saving...' : 'Save Attendance'}
        </button>
      </div>
    </div>
  );
}