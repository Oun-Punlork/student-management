import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Printer, FileText } from "lucide-react";
import { fetchScores, publishFinalResults } from "../../service/scoreApi";
import "../../css/results.css";

const EXAM_OPTIONS = [
  { value: "MIDTERM", label: "Midterm", maximum: 40 },
  { value: "FINAL", label: "Final", maximum: 60 },
];

function formatDate(value) {
  return value ? String(value).slice(0, 10) : "-";
}

export default function Results() {
  const queryClient = useQueryClient();
  const canPublishFinalResults =
    queryClient.getQueryData(["current-user"])?.data?.user?.role === "ADMIN";
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedExam = searchParams.get("exam")?.toUpperCase();
  const activeExam = EXAM_OPTIONS.some((exam) => exam.value === requestedExam)
    ? requestedExam
    : "MIDTERM";
  const exam = EXAM_OPTIONS.find((option) => option.value === activeExam);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["scores"],
    queryFn: fetchScores,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
  const publishMutation = useMutation({
    mutationFn: publishFinalResults,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["information"] });
    },
  });

  const subjects = useMemo(
    () => (Array.isArray(data?.subjects) ? data.subjects : []),
    [data],
  );

  const students = useMemo(
    () => (Array.isArray(data?.data) ? data.data : []),
    [data],
  );

  const resultRows = useMemo(
    () =>
      students.map((student) => {
        const subjectScores = subjects.map((subject) => {
          const record = student.scores?.[subject.code];
          const value =
            activeExam === "MIDTERM"
              ? record?.midtermScore
              : record?.finalScore;
          return value === null || value === undefined ? null : Number(value);
        });
        return { ...student, subjectScores };
      }),
    [students, subjects, activeExam],
  );

  return (
    <div className="results-page mx-auto max-w-7xl space-y-5">
      <div className="result-no-print flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
            SV30 Academic Records
          </p>
          <h1 className="mt-1 flex items-center gap-2 text-xl font-bold text-slate-900">
            <FileText className="h-5 w-5 text-indigo-600" />
            Results Preview
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Review an exam result sheet before printing.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center rounded-xl border border-slate-200 bg-slate-100 p-1 text-xs font-semibold">
            {EXAM_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setSearchParams({ exam: option.value })}
                aria-pressed={activeExam === option.value}
                className={`rounded-lg px-3.5 py-2 transition-colors ${
                  activeExam === option.value
                    ? "bg-white text-indigo-700 shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}>
                {option.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => window.print()}
            disabled={isLoading || isError}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50">
            <Printer className="h-4 w-4" />
            Print A4
          </button>
          {activeExam === "FINAL" && canPublishFinalResults && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm("Publish final results and show the re-examination list on the Information page?")) {
                  publishMutation.mutate();
                }
              }}
              disabled={isLoading || isError || publishMutation.isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {publishMutation.isPending ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              Publish final results
            </button>
          )}
        </div>
      </div>

      {publishMutation.isSuccess && (
        <div className="result-no-print rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800" role="status">
          Final results published. {publishMutation.data.reexamStudentCount} student(s) will appear on the Information page.
        </div>
      )}
      {publishMutation.isError && (
        <div className="result-no-print rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800" role="alert">
          <p className="font-semibold">{publishMutation.error.message}</p>
          {publishMutation.error.incompleteStudents?.length > 0 && (
            <ul className="mt-2 max-h-36 list-inside list-disc overflow-y-auto text-xs">
              {publishMutation.error.incompleteStudents.slice(0, 10).map((student) => (
                <li key={student.studentCode}>
                  {student.studentCode} — {student.name}: missing {student.missingSubjects.join(", ")}
                </li>
              ))}
              {publishMutation.error.incompleteStudents.length > 10 && (
                <li>And {publishMutation.error.incompleteStudents.length - 10} more students.</li>
              )}
            </ul>
          )}
        </div>
      )}

      <div
        id="result-sheet"
        className="result-sheet rounded-xl border border-slate-200 bg-white p-6 shadow-sm max-w-225 mx-auto font-sans">
        {/* Official Ministry Header */}
        <div>
<div className="flex">
  <div className="ml-auto text-right text-xs font-bold leading-relaxed text-slate-800">
    <p>ព្រះរាជាណាចក្រកម្ពុជា</p>
    <p className="text-sm font-extrabold">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
  </div>
</div>
          <div className="text-xs font-bold text-slate-800 leading-relaxed">
            <p>ក្រសួងអប់រំ យុវជន និងកីឡា</p>
            <p className="text-sm font-extrabold">វិទ្យាស្ថាន{"\u200B"}សុីតិច</p>
          </div>
        </div>
        <p className="text-[11px] font-normal text-slate-600 flex justify-center text-center">
          តារាងលទ្ធផលប្រឡងត្រីមាស ឆមាសប្រព័ន្ធគ្រប់គ្រងទិន្នន័យវិទ្យា
        </p>

        {isLoading ? (
          <div className="py-16 text-center text-sm font-medium text-slate-400">
            Loading results...
          </div>
        ) : isError ? (
          <div className="py-16 text-center text-sm font-medium text-rose-600" role="alert">
            <p>Unable to load results. {error.message}</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-3 rounded-lg bg-rose-700 px-3 py-2 text-xs font-semibold text-white hover:bg-rose-800"
            >
              Try again
            </button>
          </div>
        ) : (
          <div className="result-table-wrap mt-4 overflow-x-auto bg-white p-2 rounded-xl">
            <table className="result-table w-full border-collapse text-left text-xs">
              <thead>
                <tr className="bg-slate-100 text-[10px] font-bold uppercase text-slate-700">
                  <th className="w-8 border border-slate-300 px-1.5 py-2.5 text-center">
                    No
                  </th>
                  <th className="result-khmer-name border border-slate-300 px-2 py-2.5">
                    គោត្តនាម-នាម
                  </th>
                  <th className="result-latin-name border border-slate-300 px-2 py-2.5">
                    Name in English
                  </th>
                  <th className="w-8 border border-slate-300 px-1 py-2.5 text-center">
                    Sex
                  </th>
                  <th className="w-20 border border-slate-300 px-1.5 py-2.5 text-center">
                    Birth date
                  </th>
                  {subjects.map((subject) => (
                    <th
                      key={subject.code}
                      title={subject.name}
                      className="w-9 border border-slate-300 px-1 py-2.5 text-center font-bold text-slate-800">
                      {subject.code}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {resultRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={subjects.length + 5}
                      className="border border-slate-300 px-3 py-10 text-center text-slate-400">
                      No student results found.
                    </td>
                  </tr>
                ) : (
                  resultRows.map((student, index) => (
                    <tr
                      key={student.id ?? student.code}
                      className="result-row text-slate-800 hover:bg-slate-50/50">
                      {/* Number */}
                      <td className="border border-slate-300 px-1.5 py-1.5 text-center text-slate-500 font-medium">
                        {index + 1}
                      </td>

                      {/* Distinct Khmer and English name columns */}
                      <td className="result-khmer-name border border-slate-300 px-2 py-1.5 font-bold text-slate-900">
                        {student.khmerName || "-"}
                      </td>
                      <td className="result-latin-name border border-slate-300 px-2 py-1.5 font-medium text-slate-800">
                        {student.name || "-"}
                      </td>

                      {/* Sex */}
                      <td className="border border-slate-300 px-1 py-1.5 text-center font-medium">
                        {student.gender === "FEMALE" ||
                        student.gender === "ស្រី"
                          ? "F"
                          : "M"}
                      </td>

                      {/* Birth date */}
                      <td className="border border-slate-300 px-1.5 py-1.5 text-center font-mono text-[11px] text-slate-600">
                        {formatDate(student.dateOfBirth)}
                      </td>

                      {/* Subject Scores */}
                      {student.subjectScores.map((score, scoreIndex) => {
                        const isFailed =
                          score !== null && score < exam.maximum / 2;
                        return (
                          <td
                            key={subjects[scoreIndex].code}
                            className={`border border-slate-300 px-1 py-1.5 text-center font-semibold ${
                              isFailed
                                ? "text-rose-600 bg-rose-50/30"
                                : "text-slate-700"
                            }`}>
                            {score === null ? "-" : score}
                          </td>
                        );
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="result-sheet-footer mt-6 flex justify-between gap-8 text-xs text-slate-700">
          <div className="min-w-40 border-t border-slate-400 pt-2 text-center">
            Teacher&apos;s signature
          </div>
          <div className="min-w-40 border-t border-slate-400 pt-2 text-center">
            Director&apos;s signature
          </div>
        </div>
      </div>

      <div className="result-no-print">
        <Link
          to="/subject"
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
          <i className="fa-solid fa-arrow-left mr-1.5"></i>
          Back to Subjects &amp; Scores
        </Link>
      </div>
    </div>
  );
}
