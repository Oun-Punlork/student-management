export default function StudentHeader({
  searchQuery,
  setSearchQuery,
  nameRangeFilter,
  setNameRangeFilter,
  statusFilter,
  setStatusFilter,
  totalCount,
  onOpenAddModal
}) {
  const nameRanges = ['ALL', 'A-E', 'F-K', 'L-P', 'Q-U', 'V-Z'];
  const statuses = ['ALL', 'ACTIVE', 'INACTIVE'];

  return (
    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Student Directory</h2>
            <span className="text-xs font-semibold bg-white text-slate-700 px-2.5 py-0.5 rounded-lg border border-slate-200 shadow-sm">
              {totalCount || 0} Total
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Manage student profiles, accounts, and contact details</p>
        </div>

        {/* Search Bar & Alphabet Filter Row */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <svg 
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search student by name, code..."
              className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400 outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold p-0.5 rounded-full hover:bg-slate-100"
              >
                ✕
              </button>
            )}
          </div>

          {/* Alphabet Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80 text-xs font-medium overflow-x-auto">
            {nameRanges.map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => setNameRangeFilter(range)}
                className={`px-3 py-1.5 rounded-lg transition-all shrink-0 ${
                  nameRangeFilter === range 
                    ? 'bg-white text-slate-900 shadow-sm font-semibold' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {range === 'ALL' ? 'All' : range}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Status Filter & Add Button */}
      <div className="flex items-center justify-between sm:justify-start gap-2.5 pt-2 lg:pt-0">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80 text-xs font-medium">
          {statuses.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === status 
                  ? 'bg-white text-slate-900 shadow-sm font-semibold' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {status.charAt(0) + status.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onOpenAddModal}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs px-4 py-2.5 rounded-xl shadow-sm transition-all flex items-center gap-2 shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          <span>Add Student</span>
        </button>
      </div>
    </div>
  );
}