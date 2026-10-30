import { Users, UserCheck, Clock, UserX } from 'lucide-react';

const STAT_CONFIG = {
  total: {
    label: 'Total Students',
    subLabel: 'សិស្សសរុប',
    icon: Users,
    textColor: 'text-slate-900',
    badgeBg: 'bg-slate-100',
    iconColor: 'text-slate-600',
  },
  present: {
    label: 'Present',
    subLabel: 'មក',
    icon: UserCheck,
    textColor: 'text-emerald-700',
    badgeBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
  },
  late: {
    label: 'Late',
    subLabel: 'យឺត',
    icon: Clock,
    textColor: 'text-amber-700',
    badgeBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
  },
  absent: {
    label: 'Absent',
    subLabel: 'អវត្តមាន',
    icon: UserX,
    textColor: 'text-rose-700',
    badgeBg: 'bg-rose-50',
    iconColor: 'text-rose-600',
  },
};

export default function AttendanceStats({ stats = {} }) {
  const keys = ['total', 'present', 'late', 'absent'];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {keys.map((key) => {
        const config = STAT_CONFIG[key];
        const Icon = config.icon;
        const count = stats[key] ?? 0;

        return (
          <div
            key={key}
            className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between"
          >
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {config.label}
                </span>
                <span className="text-[11px] font-medium text-slate-400">
                  ({config.subLabel})
                </span>
              </div>
              <p className={`text-2xl font-extrabold mt-1.5 tracking-tight ${config.textColor}`}>
                {count}
              </p>
            </div>

            <div className={`p-3 rounded-xl ${config.badgeBg} ${config.iconColor}`}>
              <Icon className="w-5 h-5 stroke-[2.2]" />
            </div>
          </div>
        );
      })}
    </div>
  );
}