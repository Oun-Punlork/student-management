import { prisma } from '../../config/db.js';
import { Prisma } from '@prisma/client';
import { ensureDefaultSubjects } from './ScoreController.js';

const normalizeDate = (dateStr) => {
  if (!dateStr) {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    return new Date(`${yyyy}-${mm}-${dd}T00:00:00.000Z`);
  }
  const clean = String(dateStr).slice(0, 10);
  return new Date(`${clean}T00:00:00.000Z`);
};

export const getAttendance = async (req, res) => {
  try {
    await ensureDefaultSubjects();

    const subjects = await prisma.subject.findMany({
      orderBy: { id: 'asc' },
    });

    const dateStr = req.query.date || new Date().toISOString().slice(0, 10);
    const targetDate = normalizeDate(dateStr);

    let subjectId = parseInt(req.query.subjectId, 10);
    if (isNaN(subjectId) && subjects.length > 0) {
      subjectId = subjects[0].id;
    }

    const students = await prisma.student.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { id: 'asc' },
    });

    const attendances = subjectId
      ? await prisma.attendance.findMany({
          where: {
            subjectId,
            attendanceDate: targetDate,
          },
        })
      : [];

    const attendanceMap = new Map();
    attendances.forEach((att) => {
      attendanceMap.set(att.studentId, att.status);
    });

    const studentList = students.map((s) => ({
      id: s.id,
      studentCode: s.studentCode,
      firstName: s.firstName,
      lastName: s.lastName,
      name: `${s.firstName} ${s.lastName}`.trim(),
      gender: s.gender,
      status: attendanceMap.get(s.id) || 'PRESENT',
      isRecorded: attendanceMap.has(s.id),
    }));

    return res.status(200).json({
      status: 'success',
      date: dateStr.slice(0, 10),
      selectedSubjectId: subjectId,
      subjects,
      data: studentList,
    });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve attendance records',
      error: error.message,
    });
  }
};

export const saveAttendance = async (req, res) => {
  try {
    const { studentId, subjectId, date, status } = req.body;
    if (!studentId || !subjectId) {
      return res.status(400).json({ message: 'studentId and subjectId are required' });
    }

    const targetDate = normalizeDate(date);
    const validStatus = ['PRESENT', 'ABSENT', 'LATE'].includes(status) ? status : 'PRESENT';

    const saved = await prisma.attendance.upsert({
      where: {
        studentId_subjectId_attendanceDate: {
          studentId: parseInt(studentId, 10),
          subjectId: parseInt(subjectId, 10),
          attendanceDate: targetDate,
        },
      },
      update: {
        status: validStatus,
      },
      create: {
        studentId: parseInt(studentId, 10),
        subjectId: parseInt(subjectId, 10),
        attendanceDate: targetDate,
        status: validStatus,
      },
    });

    return res.status(200).json({
      status: 'success',
      message: 'Attendance saved successfully',
      data: saved,
    });
  } catch (error) {
    console.error('Error saving single attendance:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to save attendance',
      error: error.message,
    });
  }
};

export const saveBatchAttendance = async (req, res) => {
  try {
    const { subjectId, date, records } = req.body;
    if (!subjectId || !Array.isArray(records)) {
      return res.status(400).json({ message: 'subjectId and records array are required' });
    }

    const targetDate = normalizeDate(date);
    const subId = parseInt(subjectId, 10);

    if (records.length > 0) {
      const attendanceValues = records.map((rec) => {
        const studentId = parseInt(rec.studentId, 10);
        const validStatus = ['PRESENT', 'ABSENT', 'LATE'].includes(rec.status)
          ? rec.status
          : 'PRESENT';

        return Prisma.sql`(${studentId}, ${subId}, ${targetDate}, ${validStatus}::"AttendanceStatus")`;
      });

      await prisma.$executeRaw(Prisma.sql`
        INSERT INTO "Attendance" ("studentId", "subjectId", "attendanceDate", "status")
        VALUES ${Prisma.join(attendanceValues)}
        ON CONFLICT ("studentId", "subjectId", "attendanceDate")
        DO UPDATE SET "status" = EXCLUDED."status"
      `);
    }

    return res.status(200).json({
      status: 'success',
      message: 'Batch attendance saved successfully',
      count: records.length,
    });
  } catch (error) {
    console.error('Error saving batch attendance:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to save batch attendance',
      error: error.message,
    });
  }
};

export default {
  getAttendance,
  saveAttendance,
  saveBatchAttendance,
};
