const FILTER_TABS = [
  { value: 'ALL', label: 'All', stat: 'total' },
  { value: 'PRESENT', label: 'Present', stat: 'present' },
  { value: 'LATE', label: 'Late', stat: 'late' },
  { value: 'ABSENT', label: 'Absent', stat: 'absent' },
];

export default function AttendanceStatusTabs({ activeFilter, onFilterChange, stats }) {
  return (
    <div
      role="group"
      aria-label="Filter attendance by status"
      className="flex items-center gap-1 border-b border-slate-200"
    >
      {FILTER_TABS.map((tab) => {
        const isActive = activeFilter === tab.value;
        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onFilterChange(tab.value)}
            aria-pressed={isActive}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
              isActive
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800'
            }`}
          >
            {tab.label}
            <span className={`rounded-full px-2 py-0.5 text-xs ${
              isActive ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-500'
            }`}>
              {stats[tab.stat] ?? 0}
            </span>
          </button>
        );
      })}
    </div>
  );
}