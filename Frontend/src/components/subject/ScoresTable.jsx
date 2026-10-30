export default function ScoresTable({
  students,
  activeSubjectTab,
  setActiveSubjectTab,
  subjects,
  examConfig,
  onOpenEditor,
}) {
  const visibleSubjects = subjects;
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-x-auto max-h-[75vh] overflow-y-auto custom-scrollbar">
      <table className="w-full min-w-full text-left border-collapse">
        <thead className="sticky top-0 z-10 bg-slate-100 shadow-sm">
          <tr className="border-b border-slate-200  text-xs text-slate-700  tracking-wider">
            <th className="py-4 px-2 text-center min-w-12">#</th>
            <th className="py-4 px-2 min-w-22">CODE</th>
            <th className="py-4 px-3 min-w-42 whitespace-nowrap">NAME</th>
            <th className="py-4 px-2 text-center min-w-18">GENDER</th>
            {visibleSubjects.map(({ code, name }) => (
              <th
                key={code}
                title={name}
                className={`py-4 px-2 text-center cursor-pointer transition-colors ${
                  activeSubjectTab === code ? 'bg-indigo-100 text-indigo-800' : ''
                }`}
                onClick={() => setActiveSubjectTab(code)}
              >
                {code}
              </th>
            ))}
            <th className="py-4 px-2 text-center text-rose-600 min-w-16">ធ្លាក់</th>
            <th className="py-4 px-2 text-center text-emerald-600 min-w-16">ជាប់</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm">
          {students.length === 0 ? (
            <tr>
              <td colSpan={visibleSubjects.length + 6} className="py-8 text-center text-slate-400 font-medium">
                មិនមានទិន្នន័យសិស្សឡើយ
              </td>
            </tr>
          ) : (
            students.map((student, index) => (
              <tr key={student.id || index} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3 px-2 text-center text-slate-400 font-medium">
                  {index + 1}
                </td>
                <td className="py-3 px-2 font-mono font-bold text-indigo-600 whitespace-nowrap">
                  {student.code}
                </td>
                <td className="py-3 px-3 font-bold text-slate-800 whitespace-nowrap min-w-42">
                  {student.name}
                </td>
                <td className="py-3 px-2 text-center">
                  {String(student.gender || '').toUpperCase() === 'FEMALE' || student.gender === 'ស្រី' ? (
                    <span className="text-rose-500 font-semibold px-2 py-0.5 bg-rose-50 rounded-md text-xs whitespace-nowrap">ស្រី</span>
                  ) : (
                    <span className="text-indigo-600 font-semibold px-2 py-0.5 bg-indigo-50 rounded-md text-xs whitespace-nowrap">ប្រុស</span>
                  )}
                </td>
                {visibleSubjects.map(({ code }) => {
                  const score = student.normalizedScores?.[code]?.[examConfig.scoreKey] ?? null;
                  return (
                    <td
                      key={code}
                      className={`py-3 px-1 text-center ${
                        activeSubjectTab === code ? 'bg-indigo-50/60 font-bold' : ''
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => onOpenEditor(student, code, score ?? '')}
                        aria-label={`${score === null ? 'Enter' : 'Edit'} ${code} score for ${student.name}`}
                        className="w-16 rounded-lg border border-slate-200 bg-white px-1 py-1 text-center hover:border-indigo-400 hover:bg-indigo-50 transition-all font-semibold"
                      >
                        {score === null ? '—' : score}
                      </button>
                    </td>
                  );
                })}
                <td className="py-3 px-2 text-center font-bold text-rose-600">
                  {student.failedSubjectsCount}
                </td>
                <td className="py-3 px-2 text-center font-bold text-emerald-600">
                  {student.passedSubjectsCount}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}