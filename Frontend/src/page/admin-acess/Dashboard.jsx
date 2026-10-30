import { useQuery } from '@tanstack/react-query';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { fetchDashboardStatsApi } from '../../service/dashboardApi';

// Register Chart.js modules
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function Dashboard() {
  const {
    data: dashboardData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStatsApi,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  if (isLoading) {
    return (
      <div className="p-4 md:p-8 max-w-7xl mx-auto" role="status">
        <p className="text-sm text-slate-500">Loading dashboard data…</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 md:p-8 max-w-7xl mx-auto" role="alert">
        <p className="text-sm font-semibold text-rose-700">Unable to load dashboard data.</p>
        <p className="mt-1 text-sm text-slate-600">{error.message}</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
        >
          Try again
        </button>
      </div>
    );
  }

  const { stats: dataStats, attendanceSummary: dataSummary, weekly: dataWeekly } = dashboardData;

  // Doughnut Chart Setup
  const doughnutData = {
    labels: ['Present', 'Late', 'Absent'],
    datasets: [
      {
        data: [dataSummary.PRESENT, dataSummary.LATE, dataSummary.ABSENT],
        backgroundColor: ['#10b981', '#f59e0b', '#f43f5e'],
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    cutout: '75%',
  };

  // Bar Chart Setup
  const barData = {
    labels: dataWeekly.labels,
    datasets: [
      {
        label: 'Present',
        data: dataWeekly.present,
        backgroundColor: '#0a0a0a',
        borderRadius: 6,
      },
      {
        label: 'Absent',
        data: dataWeekly.absent,
        backgroundColor: '#e5e5e5',
        borderRadius: 6,
      },
      {
        label: 'Late',
        data: dataWeekly.late,
        backgroundColor: '#f59e0b',
        borderRadius: 6,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { boxWidth: 12, font: { size: 11 } },
      },
    },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: '#f5f5f5' }, beginAtZero: true },
    },
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">System Dashboard</h2>
          <p className="text-xs text-slate-500 mt-0.5">Real-time stats and overview</p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> System Live
        </span>
      </div>
      {/* KPI Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Students */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Students</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{dataStats.totalStudents}</h3>
            <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
              <i className="fa-solid fa-user-check text-[10px]"></i> {dataStats.activeStudents} Active students
            </p>
          </div>
          <div className="w-11 h-11 bg-slate-50 text-slate-800 rounded-xl flex items-center justify-center text-lg border border-slate-100">
            <i className="fa-solid fa-user-graduate"></i>
          </div>
        </div>

        {/* Active Subjects */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Subjects</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{dataStats.totalSubjects}</h3>
            <p className="text-[11px] text-slate-400 font-medium mt-1">Subjects in database</p>
          </div>
          <div className="w-11 h-11 bg-slate-50 text-slate-800 rounded-xl flex items-center justify-center text-lg border border-slate-100">
            <i className="fa-solid fa-book-open"></i>
          </div>
        </div>

        {/* Overall Present Rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Present Rate</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{dataStats.presentRate}%</h3>
            <p className="text-[11px] text-slate-400 font-medium mt-1">From all attendance records</p>
          </div>
          <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center text-lg border border-emerald-100">
            <i className="fa-solid fa-calendar-check"></i>
          </div>
        </div>

        {/* Absences Today */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Absences Today</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{dataStats.absencesToday}</h3>
            <p className="text-[11px] text-rose-600 font-medium mt-1">Absent today</p>
          </div>
          <div className="w-11 h-11 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center text-lg border border-rose-100">
            <i className="fa-solid fa-circle-exclamation"></i>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Breakdown Pie Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs lg:col-span-1 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Attendance Distribution</h3>
            <p className="text-xs text-slate-500 mt-0.5">Based on latest records</p>
          </div>
          <div className="relative my-4 flex items-center justify-center h-52">
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
          <div className="grid grid-cols-3 text-center border-t border-slate-100 pt-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Present</span>
              <p className="text-xs font-bold text-emerald-600">{dataSummary.PRESENT}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Late</span>
              <p className="text-xs font-bold text-amber-600">{dataSummary.LATE}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Absent</span>
              <p className="text-xs font-bold text-rose-600">{dataSummary.ABSENT}</p>
            </div>
          </div>
        </div>

        {/* Weekly Attendance Logs Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs lg:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Weekly Attendance Logs</h3>
              <p className="text-xs text-slate-500 mt-0.5">Tracked across all active subjects</p>
            </div>
            <span className="text-xs text-slate-400 font-medium bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">This Week</span>
          </div>
          <div className="relative my-2 h-56">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}