import { prisma } from '../../config/db.js';

const getUtcDayStart = (date) =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

const getDateKey = (date) => date.toISOString().slice(0, 10);

export const getDashboardStats = async (_req, res) => {
  try {
    const today = getUtcDayStart(new Date());
    const tomorrow = new Date(today);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

    const weekStart = new Date(today);
    const daysSinceMonday = (today.getUTCDay() + 6) % 7;
    weekStart.setUTCDate(weekStart.getUTCDate() - daysSinceMonday);

    const weekdaysEnd = new Date(weekStart);
    weekdaysEnd.setUTCDate(weekdaysEnd.getUTCDate() + 5);

    const [
      totalStudents,
      activeStudents,
      totalSubjects,
      attendanceByStatus,
      todayAttendanceByStatus,
      weekdayAttendance,
    ] = await Promise.all([
      prisma.student.count(),
      prisma.student.count({ where: { status: 'ACTIVE' } }),
      prisma.subject.count(),
      prisma.attendance.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),
      prisma.attendance.groupBy({
        by: ['status'],
        where: { attendanceDate: { gte: today, lt: tomorrow } },
        _count: { _all: true },
      }),
      prisma.attendance.findMany({
        where: { attendanceDate: { gte: weekStart, lt: weekdaysEnd } },
        select: { attendanceDate: true, status: true },
      }),
    ]);

    const countByStatus = (records) => {
      const counts = { PRESENT: 0, LATE: 0, ABSENT: 0 };
      for (const record of records) {
        counts[record.status] = record._count._all;
      }
      return counts;
    };

    const allAttendanceCounts = countByStatus(attendanceByStatus);
    const attendanceSummary = countByStatus(todayAttendanceByStatus);
    const totalAttendanceRecords = Object.values(allAttendanceCounts).reduce(
      (total, count) => total + count,
      0,
    );

    const weekly = {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      present: [0, 0, 0, 0, 0],
      absent: [0, 0, 0, 0, 0],
      late: [0, 0, 0, 0, 0],
    };
    const weekdayIndexes = new Map();
    for (let index = 0; index < 5; index += 1) {
      const date = new Date(weekStart);
      date.setUTCDate(date.getUTCDate() + index);
      weekdayIndexes.set(getDateKey(date), index);
    }

    for (const attendance of weekdayAttendance) {
      const index = weekdayIndexes.get(getDateKey(attendance.attendanceDate));
      if (index === undefined) continue;

      const series = attendance.status.toLowerCase();
      weekly[series][index] += 1;
    }

    return res.status(200).json({
      status: 'success',
      data: {
        stats: {
          totalStudents,
          activeStudents,
          totalSubjects,
          presentRate: totalAttendanceRecords
            ? Number(((allAttendanceCounts.PRESENT / totalAttendanceRecords) * 100).toFixed(1))
            : 0,
          absencesToday: attendanceSummary.ABSENT,
        },
        attendanceSummary,
        weekly,
      },
    });
  } catch (error) {
    console.error('Error loading dashboard stats:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve dashboard statistics',
    });
  }
};

export default { getDashboardStats };
