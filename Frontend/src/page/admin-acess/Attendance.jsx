import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Eye } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AttendanceToolbar from "../../components/attendance/AttendanceToolbar";
import AttendanceStats from "../../components/attendance/AttendanceStats";
import AttendanceStatusTabs from "../../components/attendance/AttendanceStatusTabs";
import AttendanceTable from "../../components/attendance/AttendanceTable";
import { apiUrl, getAuthorizationHeaders } from "../../service/authService";

export default function Attendance() {
  const queryClient = useQueryClient();
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedDate, setSelectedDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [localStatuses, setLocalStatuses] = useState({});
  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState("");

  const {
    data: attendanceData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["attendance", selectedDate, selectedSubjectId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedDate) params.append("date", selectedDate);
      if (selectedSubjectId) params.append("subjectId", selectedSubjectId);
      const res = await fetch(apiUrl(`/api/attendance?${params.toString()}`), {
        headers: getAuthorizationHeaders(),
      });
      const contentType = res.headers.get("content-type") || "";
      const result = contentType.includes("application/json")
        ? await res.json()
        : {};
      if (!res.ok) {
        throw new Error(result.message || "Unable to load attendance.");
      }
      return result;
    },
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const subjects = useMemo(
    () =>
      Array.isArray(attendanceData?.subjects) ? attendanceData.subjects : [],
    [attendanceData],
  );

  const currentSubjectId =
    selectedSubjectId || String(attendanceData?.selectedSubjectId ?? "");

  const rawStudents = useMemo(
    () => (Array.isArray(attendanceData?.data) ? attendanceData.data : []),
    [attendanceData],
  );

  const students = useMemo(
    () =>
      rawStudents.map((s) => ({
        ...s,
        status: localStatuses[s.id] ?? s.status ?? "PRESENT",
      })),
    [rawStudents, localStatuses],
  );

  const handleStatusChange = (id, status) =>
    setLocalStatuses((prev) => ({ ...prev, [id]: status }));

  const handleMarkAllPresent = () => {
    const next = {};
    rawStudents.forEach((s) => {
      next[s.id] = "PRESENT";
    });
    setLocalStatuses(next);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!currentSubjectId) {
        throw new Error("Choose a subject before saving attendance.");
      }
      const res = await fetch(apiUrl("/api/attendance/batch"), {
        method: "POST",
        headers: {
          ...getAuthorizationHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subjectId: currentSubjectId,
          date: selectedDate,
          records: students.map((s) => ({ studentId: s.id, status: s.status })),
        }),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        const message = e.message || "Unable to save attendance.";
        const detail = e.error && e.error !== message ? `: ${e.error}` : "";
        throw new Error(`${message}${detail}`);
      }
      return res.json();
    },
    onMutate: () => {
      setSaveError("");
      setSaveMessage("");
    },
    onSuccess: () => {
      setLocalStatuses({});
      setSaveMessage("វត្តមានត្រូវបានរក្សាទុកដោយជោគជ័យ! (Attendance saved)");
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      setTimeout(() => setSaveMessage(""), 3000);
    },
    onError: (err) => setSaveError(err.message || "Error saving attendance."),
  });

  const { matchingStudents, stats } = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const list = students.filter(
      (s) =>
        !q ||
        (s.name || "").toLowerCase().includes(q) ||
        (s.studentCode || "").toLowerCase().includes(q),
    );
    let present = 0,
      late = 0,
      absent = 0;
    students.forEach((s) => {
      if (s.status === "PRESENT") present++;
      else if (s.status === "LATE") late++;
      else if (s.status === "ABSENT") absent++;
    });
    const total = students.length;
    const rate = total > 0 ? ((present / total) * 100).toFixed(1) : "0.0";
    return {
      matchingStudents: list,
      stats: { total, present, late, absent, rate },
    };
  }, [students, searchQuery]);

  const filteredStudents = useMemo(
    () =>
      statusFilter === "ALL"
        ? matchingStudents
        : matchingStudents.filter((student) => student.status === statusFilter),
    [matchingStudents, statusFilter],
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
          <i className="fa-solid fa-calendar-check text-lg"></i>
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
            Daily Register
          </p>
          <h2 className="mt-0.5 text-xl font-bold tracking-tight text-slate-900">
            Attendance Overview
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Track daily student presence, tardiness, and absences
          </p>
        </div>
      </div>
      <AttendanceToolbar
        selectedDate={selectedDate}
        onDateChange={(date) => {
          setSelectedDate(date);
          setLocalStatuses({});
        }}
        subjects={subjects}
        selectedSubjectId={currentSubjectId}
        onSubjectChange={(subjectId) => {
          setSelectedSubjectId(subjectId);
          setLocalStatuses({});
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onMarkAllPresent={handleMarkAllPresent}
        onSave={() => saveMutation.mutate()}
        isSaving={saveMutation.isPending}
        isSaveDisabled={!currentSubjectId || students.length === 0 || isLoading}
      />

      {isError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700" role="alert">
          <p className="font-semibold">Unable to load attendance.</p>
          <p className="mt-1 text-xs">{error.message}</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-3 rounded-lg bg-rose-700 px-3 py-2 text-xs font-semibold text-white hover:bg-rose-800"
          >
            Try again
          </button>
        </div>
      ) : null}

      {saveMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-xl text-center">
          {saveMessage}
        </div>
      )}
      {saveError && (
        <div
          className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl text-center"
          role="alert"
        >
          {saveError}
        </div>
      )}

      {!isError && <AttendanceStats stats={stats} />}
      {!isError && <div className="flex items-end justify-between gap-3">
        <AttendanceStatusTabs
          activeFilter={statusFilter}
          onFilterChange={setStatusFilter}
          stats={stats}
        />
        <Link
          to="/attendance/weekly"
          className="mb-1 inline-flex shrink-0 items-center gap-2 rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm font-semibold text-indigo-700 transition-colors hover:bg-indigo-50"
        >
          <Eye size={16} aria-hidden="true" />
          Preview
        </Link>
      </div>}
      {!isError && <AttendanceTable
        students={filteredStudents}
        isLoading={isLoading}
        onStatusChange={handleStatusChange}
      />}
    </div>
  );
}
