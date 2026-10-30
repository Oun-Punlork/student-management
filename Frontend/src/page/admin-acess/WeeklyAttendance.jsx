import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Printer } from "lucide-react";
import { useStudentContext } from "../../context/studentContext";
import { apiUrl, getAuthorizationHeaders } from "../../service/authService";

const WEEKDAYS = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
];

const SLOT_COUNT = 3;
const STATUS_STYLES = {
  PRESENT: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  ABSENT: "bg-rose-100 text-rose-800 ring-rose-200",
  LATE: "bg-amber-100 text-amber-800 ring-amber-200",
  UNMARKED: "bg-slate-100 text-slate-500 ring-slate-200",
};

function toLocalDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function mondayOf(date) {
  const monday = new Date(date);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  return monday;
}

function dateFromInput(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDay(date) {
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
  }).format(date);
}

function formatDateOfBirth(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

async function readAttendance(date, subjectId) {
  const params = new URLSearchParams({ date, subjectId: String(subjectId) });
  const response = await fetch(apiUrl(`/api/attendance?${params.toString()}`), {
    headers: getAuthorizationHeaders(),
  });
  if (!response.ok) throw new Error("Unable to load weekly attendance.");
  return response.json();
}

function AttendanceBadge({ status }) {
  if (status === "UNMARKED") {
    return <span className="text-xs text-slate-400" aria-label="Not marked">—</span>;
  }

  const label = status === "LATE" ? "Late" : status.charAt(0) + status.slice(1).toLowerCase();
  return (
    <span
      className={`inline-flex min-w-8 justify-center rounded px-1.5 py-1 text-[10px] font-bold ring-1 ${STATUS_STYLES[status] || STATUS_STYLES.UNMARKED}`}
      title={label}
      aria-label={label}
    >
      {status === "PRESENT" ? "P" : status === "ABSENT" ? "A" : "L"}
    </span>
  );
}

export default function WeeklyAttendance() {
  const { students, isLoading: isLoadingStudents } = useStudentContext();
  const [weekStart, setWeekStart] = useState(() => toLocalDateString(mondayOf(new Date())));

  const weekDays = useMemo(() => {
    const monday = dateFromInput(weekStart);
    return WEEKDAYS.map((weekday, index) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);
      return { ...weekday, date: toLocalDateString(date), dateLabel: formatDay(date) };
    });
  }, [weekStart]);

  const attendanceQuery = useQuery({
    queryKey: ["weekly-attendance", weekStart],
    queryFn: async () => {
      const firstDay = await fetch(apiUrl(`/api/attendance?date=${weekStart}`), {
        headers: getAuthorizationHeaders(),
      });
      if (!firstDay.ok) throw new Error("Unable to load weekly attendance.");
      const firstDayPayload = await firstDay.json();
      const subjects = Array.isArray(firstDayPayload.subjects) ? firstDayPayload.subjects : [];
      const slots = Array.from({ length: SLOT_COUNT }, (_, index) => {
        const subject = subjects[index];
        return subject
          ? { id: subject.id, code: subject.code, name: subject.name }
          : { id: null, code: `SLOT ${index + 1}`, name: `Slot ${index + 1}` };
      });

      const recordsByDay = {};
      await Promise.all(weekDays.map(async (day, dayIndex) => {
        recordsByDay[day.date] = await Promise.all(slots.map(async (slot, slotIndex) => {
          if (!slot.id) return {};
          const payload = dayIndex === 0 && slotIndex === 0
            ? firstDayPayload
            : await readAttendance(day.date, slot.id);
          return Object.fromEntries((payload.data || []).map((record) => [
            String(record.id),
            {
              status: record.isRecorded ? record.status : "UNMARKED",
            },
          ]));
        }));
      }));

      return { slots, recordsByDay };
    },
  });

  const activeStudents = useMemo(
    () => students
      .filter((student) => student.status !== "INACTIVE")
      .slice()
      .sort((first, second) => String(first.studentCode || "").localeCompare(String(second.studentCode || ""))),
    [students],
  );

  const slots = attendanceQuery.data?.slots || [];
  const firstDayLabel = weekDays[0]?.dateLabel;
  const lastDayLabel = weekDays[weekDays.length - 1]?.dateLabel;

  return (
    <main className="mx-auto max-w-[1600px] space-y-5 text-sm tracking-normal">
      <section className="no-print flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase text-emerald-700">Attendance / Weekly review</p>
          <h1 className="mt-1 text-2xl font-bold leading-tight text-slate-900">Weekly Attendance</h1>
          <p className="mt-1 text-sm text-slate-500">Review attendance by student, weekday, and subject.</p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <label className="grid gap-1 text-xs font-semibold text-slate-600">
            Week starting Monday
            <input
              type="date"
              value={weekStart}
              onChange={(event) => {
                if (event.target.value) {
                  setWeekStart(toLocalDateString(mondayOf(dateFromInput(event.target.value))));
                }
              }}
              className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-800"
            />
          </label>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex h-10 items-center gap-2 rounded-md bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-700"
          >
            <Printer size={16} aria-hidden="true" />
            Print A4
          </button>
        </div>
      </section>

      <section id="attendance-sheet" className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <header className="border-b-2 border-slate-800 pb-4 text-center">
          <p className="text-xs font-bold uppercase text-slate-600">SV30 Academic System</p>
          <h2 className="mt-1 text-xl font-bold text-slate-950">Weekly Student Attendance Register</h2>
          <p className="mt-2 text-sm font-medium text-slate-600">School week: {firstDayLabel} – {lastDayLabel}, {weekStart.slice(0, 4)}</p>
        </header>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 sm:text-sm">
          <p>Active students: <strong className="text-slate-900">{activeStudents.length}</strong></p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1" aria-label="Attendance legend">
            <span className="flex items-center gap-1.5"><AttendanceBadge status="PRESENT" /> Present</span>
            <span className="flex items-center gap-1.5"><AttendanceBadge status="ABSENT" /> Absent</span>
            <span className="flex items-center gap-1.5"><AttendanceBadge status="LATE" /> Late</span>
            <span className="flex items-center gap-1.5"><AttendanceBadge status="UNMARKED" /> Not marked</span>
          </div>
        </div>

        {attendanceQuery.isError ? (
          <div className="mt-5 rounded-md border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800" role="alert">
            {attendanceQuery.error.message}
          </div>
        ) : (
          <div className="attendance-scroll mt-4 overflow-x-auto">
            <table className="attendance-week-table w-full min-w-280 border-collapse text-left text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-800">
                  <th rowSpan={2} className="border border-slate-400 px-2 py-2 text-center">No.</th>
                  <th rowSpan={2} className="min-w-40 border border-slate-400 px-2 py-2">Student name</th>
                  <th rowSpan={2} className="border border-slate-400 px-2 py-2 text-center">Sex</th>
                  <th rowSpan={2} className="min-w-24 border border-slate-400 px-2 py-2 text-center">Date of birth</th>
                  {weekDays.map((day) => (
                    <th key={day.key} colSpan={SLOT_COUNT} className="border border-slate-400 px-2 py-2 text-center">
                      <span className="block font-semibold">{day.label}</span>
                      <span className="mt-0.5 block text-[11px] font-normal text-slate-600">{day.dateLabel}</span>
                    </th>
                  ))}
                </tr>
                <tr className="bg-slate-50 text-slate-600">
                  {weekDays.flatMap((day) => slots.map((slot, slotIndex) => (
                    <th key={`${day.key}-${slotIndex}`} className="min-w-12 border border-slate-400 px-1 py-2 text-center" title={slot.name}>
                      {slot.code}
                    </th>
                  )))}
                </tr>
              </thead>
              <tbody>
                {attendanceQuery.isPending || isLoadingStudents ? (
                  <tr><td colSpan={4 + WEEKDAYS.length * SLOT_COUNT} className="border border-slate-400 px-3 py-8 text-center text-slate-500">Loading weekly attendance…</td></tr>
                ) : activeStudents.length === 0 ? (
                  <tr><td colSpan={4 + WEEKDAYS.length * SLOT_COUNT} className="border border-slate-400 px-3 py-8 text-center text-slate-500">No active students found.</td></tr>
                ) : activeStudents.map((student, index) => (
                  <tr key={student.id} className="odd:bg-white even:bg-slate-50/70">
                    <td className="border border-slate-300 px-2 py-2 text-center tabular-nums">{index + 1}</td>
                    <td className="border border-slate-300 px-2 py-2">
                      <span className="block font-semibold text-slate-900">{`${student.firstName || ""} ${student.lastName || ""}`.trim() || " "}</span>
                    </td>
                    <td className="border border-slate-300 px-2 py-2 text-center">{student.gender === "FEMALE" ? "F" : student.gender === "MALE" ? "M" : "—"}</td>
                    <td className="border border-slate-300 px-2 py-2 text-center tabular-nums">{formatDateOfBirth(student.dateOfBirth)}</td>
                    {weekDays.flatMap((day) => slots.map((slot, slotIndex) => {
                      const status = slot.id
                        ? attendanceQuery.data?.recordsByDay?.[day.date]?.[slotIndex]?.[String(student.id)]?.status || "UNMARKED"
                        : "UNMARKED";
                      return (
                        <td key={`${day.date}-${slotIndex}`} className="border border-slate-300 px-1 py-1.5 text-center">
                          <AttendanceBadge status={status} />
                        </td>
                      );
                    }))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-8 grid grid-cols-2 gap-10 text-center text-xs text-slate-700">
          <p className="border-t border-slate-400 pt-2">Teacher signature</p>
          <p className="border-t border-slate-400 pt-2">School administrator</p>
        </div>
      </section>
    </main>
  );
}