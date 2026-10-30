import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getCurrentUser } from "../../service/authService.js";
import { fetchInformation } from "../../service/informationApi.js";

const shortcuts = [
  {
    title: "My attendance",
    description: "Review your attendance information.",
    path: "/userattendance",
    icon: "fa-calendar-check",
    color: "bg-emerald-50 text-emerald-700",
  },
  {
    title: "Student information",
    description: "View important student announcements.",
    path: "/userinformation",
    icon: "fa-circle-info",
    color: "bg-blue-50 text-blue-700",
  },
  {
    title: "My profile",
    description: "Manage your account and profile photo.",
    path: "/userprofile",
    icon: "fa-user",
    color: "bg-violet-50 text-violet-700",
  },
];

function ScheduleCard({ title, image, imageName }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4">
        <h3 className="font-semibold text-slate-900">{title}</h3>
        {imageName && <p className="mt-1 truncate text-sm text-slate-500">{imageName}</p>}
      </div>
      {image ? (
        <a href={image} target="_blank" rel="noreferrer" className="block bg-slate-50 p-3">
          <img
            src={image}
            alt={title}
            className="max-h-80 w-full rounded-lg object-contain"
          />
        </a>
      ) : (
        <p className="px-5 py-8 text-sm text-slate-500">No schedule has been posted yet.</p>
      )}
    </article>
  );
}

export default function UserDashboard() {
  const {
    data: userResponse,
    isError: userError,
    error: userErrorDetails,
    refetch: refetchUser,
  } = useQuery({
    queryKey: ["current-user"],
    queryFn: getCurrentUser,
    retry: false,
  });
  const {
    data: information,
    isLoading: isInformationLoading,
    isError: informationError,
    error: informationErrorDetails,
    refetch: refetchInformation,
  } = useQuery({
    queryKey: ["information"],
    queryFn: fetchInformation,
    retry: false,
  });

  const user = userResponse?.data?.user;

  if (userError) {
    return (
      <div className="mx-auto max-w-5xl rounded-2xl border border-rose-200 bg-white p-6" role="alert">
        <h1 className="font-semibold text-rose-700">Unable to load your dashboard.</h1>
        <p className="mt-1 text-sm text-slate-600">{userErrorDetails.message}</p>
        <button
          type="button"
          onClick={() => refetchUser()}
          className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-600 p-6 text-white shadow-sm md:p-9">
        <p className="text-sm font-semibold text-indigo-100">STUDENT PORTAL</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
          Welcome{user?.username ? `, ${user.username}` : " back"}!
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-indigo-100 md:text-base">
          Your student dashboard is the place to find your attendance, school information, and account details.
        </p>
        <p className="mt-5 text-sm font-medium text-white/90">
          {new Intl.DateTimeFormat(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          }).format(new Date())}
        </p>
      </section>

      <section aria-labelledby="student-shortcuts-heading">
        <div className="mb-4">
          <h2 id="student-shortcuts-heading" className="text-lg font-bold text-slate-900">
            Quick access
          </h2>
          <p className="mt-1 text-sm text-slate-500">Go directly to the student services you need.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {shortcuts.map((shortcut) => (
            <Link
              key={shortcut.path}
              to={shortcut.path}
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
            >
              <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${shortcut.color}`}>
                <i className={`fa-solid ${shortcut.icon}`} aria-hidden="true"></i>
              </span>
              <h3 className="mt-4 font-semibold text-slate-900">{shortcut.title}</h3>
              <p className="mt-1 text-sm leading-5 text-slate-500">{shortcut.description}</p>
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-indigo-700">
                Open <i className="fa-solid fa-arrow-right text-xs transition-transform group-hover:translate-x-1" aria-hidden="true"></i>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="schedule-heading">
        <div className="mb-4">
          <h2 id="schedule-heading" className="text-lg font-bold text-slate-900">
            Class schedules
          </h2>
          <p className="mt-1 text-sm text-slate-500">Schedules shared by your school.</p>
        </div>
        {isInformationLoading ? (
          <p className="text-sm text-slate-500" role="status">Loading schedules...</p>
        ) : informationError ? (
          <div className="rounded-2xl border border-rose-200 bg-white p-5" role="alert">
            <p className="text-sm text-rose-700">Unable to load schedules: {informationErrorDetails.message}</p>
            <button
              type="button"
              onClick={() => refetchInformation()}
              className="mt-3 text-sm font-semibold text-indigo-700 hover:text-indigo-900"
            >
              Try again
            </button>
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            <ScheduleCard
              title="Weekly schedule"
              image={information?.scheduleImage}
            />
            <ScheduleCard
              title="Exam Schedule"
              image={information?.additionalScheduleImage}
              
            />
          </div>
        )}
      </section>
    </div>
  );
}
