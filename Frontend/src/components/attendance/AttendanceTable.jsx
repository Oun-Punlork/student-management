const STATUSES = ['PRESENT', 'LATE', 'ABSENT'];

function getStatusClass(status, isSelected) {
  if (!isSelected) return 'text-slate-600 hover:text-slate-900';
  if (status === 'PRESENT') return 'bg-emerald-600 text-white shadow-xs';
  if (status === 'LATE') return 'bg-amber-500 text-white shadow-xs';
  return 'bg-rose-600 text-white shadow-xs';
}

export default function AttendanceTable({ students, isLoading, onStatusChange }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-4 text-center w-16">#</th>
              <th className="py-3.5 px-4">Code</th>
              <th className="py-3.5 px-4">Student Name</th>
              <th className="py-3.5 px-4 text-center">Gender</th>
              <th className="py-3.5 px-4 text-center">Attendance Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400 text-xs font-medium">
                  Loading attendance...
                </td>
              </tr>
            ) : students.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400 text-xs font-medium">
                  No active students found.
                </td>
              </tr>
            ) : students.map((student, index) => {
              const isFemale = String(student?.gender || '').toUpperCase() === 'FEMALE' || student?.gender === 'ស្រី';
              return (
                <tr key={student.id || index} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 text-center text-slate-400 text-xs font-medium">{index + 1}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-indigo-600 text-xs">{student.studentCode}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800 text-xs">{student.name}</td>
                  <td className="py-3.5 px-4 text-center text-xs">
                    {isFemale
                      ? <span className="text-rose-500 font-semibold px-2 py-0.5 bg-rose-50 rounded-md">ស្រី</span>
                      : <span className="text-indigo-600 font-semibold px-2 py-0.5 bg-indigo-50 rounded-md">ប្រុស</span>}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="inline-flex items-center justify-center p-1 bg-slate-100 rounded-xl gap-1">
                      {STATUSES.map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => onStatusChange(student.id, status)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${getStatusClass(status, student.status === status)}`}
                        >
                          {status.charAt(0) + status.slice(1).toLowerCase()}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}