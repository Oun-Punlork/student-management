import { Users, CheckCircle2, XCircle, TrendingUp } from 'lucide-react';

export default function StatsSummary({ stats = {} }) {
  const {
    totalStudents = 0,
    gradedStudents = 0,
    ungradedStudents = totalStudents,
    passCount = 0,
    failCount = 0,
    passRate = '0.0',
    failRate = '0.0',
  } = stats;

  const cardData = [
    {
      title: 'Total Students',
      count: totalStudents,
      unit: 'students',
      subtext: `${gradedStudents ?? 0} graded · ${ungradedStudents ?? totalStudents ?? 0} not graded`,
      subtextColor: 'text-slate-500',
      icon: Users,
      color: 'text-slate-700',
      bg: 'bg-slate-100',
    },
    {
      title: 'Passed',
      count: passCount,
      unit: 'passed',
      icon: CheckCircle2,
      color: 'text-emerald-700',
      bg: 'bg-emerald-50',
    },
    {
      title: 'Failed',
      count: failCount,
      unit: 'failed',
      icon: XCircle,
      color: 'text-rose-700',
      bg: 'bg-rose-50',
    },
    {
      title: 'Pass Rate',
      value: passRate === null ? '—' : `${passRate}%`,
      subtext: passRate === null ? 'No scores recorded yet' : `Fail: ${failRate}%`,
      subtextColor: passRate === null ? 'text-slate-500' : 'text-rose-500',
      icon: TrendingUp,
      color: 'text-indigo-700',
      bg: 'bg-indigo-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cardData.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between"
          >
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                {card.title}
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  {card.count !== undefined ? card.count : card.value}
                </span>
                {card.unit && (
                  <span className="text-xs font-semibold text-slate-500">
                    {card.unit}
                  </span>
                )}
              </div>
              {card.subtext && (
                <p className={`text-xs font-medium pt-0.5 ${card.subtextColor || 'text-rose-500'}`}>
                  {card.subtext}
                </p>
              )}
            </div>

            <div className={`p-3.5 rounded-xl ${card.bg} ${card.color}`}>
              <Icon className="w-5 h-5 stroke-[2.5]" />
            </div>
          </div>
        );
      })}
    </div>
  );
}