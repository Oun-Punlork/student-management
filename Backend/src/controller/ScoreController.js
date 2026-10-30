import { prisma } from '../../config/db.js';

export const DEFAULT_SUBJECTS = [
  { code: 'MA', name: 'Mathematics' },
  { code: 'CA', name: 'Computer Architecture' },
  { code: 'SA', name: 'System Analysis' },
  { code: 'WBD', name: 'Web Development' },
  { code: 'PYTHON', name: 'Python Programming' },
  { code: 'JAVA', name: 'Java Programming' },
  { code: 'ORACLE', name: 'Oracle Database' },
  { code: 'LINUX', name: 'Linux System' },
  { code: 'CND', name: 'Computer Networking & Data' },
];

export const ensureDefaultSubjects = async () => {
  try {
    const existing = await prisma.subject.findMany({
      select: { code: true },
    });
    const existingCodes = new Set(existing.map((s) => s.code));

    const missing = DEFAULT_SUBJECTS.filter((s) => !existingCodes.has(s.code));
    if (missing.length > 0) {
      for (const sub of missing) {
        try {
          await prisma.subject.create({
            data: { code: sub.code, name: sub.name },
          });
        } catch (_) {}
      }
    }
  } catch (err) {
    console.warn('Warning: Could not sync default subjects:', err.message);
  }
};

export const getAllScores = async (req, res) => {
  try {
    await ensureDefaultSubjects();

    const [subjects, students] = await Promise.all([
      prisma.subject.findMany({
        orderBy: { id: 'asc' },
      }),
      prisma.student.findMany({
        include: {
          scores: {
            include: {
              subject: true,
            },
          },
        },
        orderBy: { id: 'asc' },
      }),
    ]);

    const formattedData = students.map((student) => {
      const scoresMap = {};

      student.scores.forEach((sc) => {
        if (sc.subject?.code) {
          scoresMap[sc.subject.code] = {
            id: sc.id,
            score: sc.score,
            midtermScore: sc.midtermScore,
            finalScore: sc.finalScoreEntered ? sc.finalScore : null,
            finalScoreEntered: sc.finalScoreEntered,
            remarks: sc.remarks,
          };
        }
      });

      return {
        id: student.id,
        code: student.studentCode,
        khmerName: student.khmerName,
        name: `${student.firstName} ${student.lastName}`.trim(),
        gender: student.gender,
        dateOfBirth: student.dateOfBirth,
        status: student.status,
        scores: scoresMap,
      };
    });

    return res.status(200).json({
      status: 'success',
      total: formattedData.length,
      subjects,
      data: formattedData,
    });
  } catch (error) {
    console.error('Error loading scores:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve scores',
      error: error.message,
    });
  }
};

export const getMyScores = async (req, res) => {
  try {
    const [student, information, subjects] = await Promise.all([
      prisma.student.findUnique({
        where: { userId: req.user.id },
        select: {
          studentCode: true,
          firstName: true,
          lastName: true,
          khmerName: true,
          scores: {
            select: {
              midtermScore: true,
              finalScore: true,
              finalScoreEntered: true,
              subjectId: true,
            },
          },
        },
      }),
      prisma.informationPage.findUnique({
        where: { id: 1 },
        select: { finalResultsPublishedAt: true },
      }),
      prisma.subject.findMany({
        select: { id: true, code: true, name: true },
        orderBy: { id: 'asc' },
      }),
    ]);

    if (!student) {
      return res.status(404).json({ message: 'No student profile is linked to your account.' });
    }

    const finalResultsPublishedAt = information?.finalResultsPublishedAt || null;
    const isFinalResultsPublished = Boolean(finalResultsPublishedAt);
    const scoresBySubjectId = new Map(
      student.scores.map((score) => [score.subjectId, score]),
    );

    const scores = subjects.map((subject) => {
      const score = scoresBySubjectId.get(subject.id);
      const finalScore = isFinalResultsPublished && score?.finalScoreEntered
        ? score.finalScore
        : null;

      return {
        code: subject.code,
        name: subject.name,
        midtermScore: score?.midtermScore ?? null,
        finalScore,
        totalScore: finalScore === null
          ? null
          : (score?.midtermScore ?? 0) + finalScore,
      };
    });

    return res.status(200).json({
      status: 'success',
      data: {
        student: {
          studentCode: student.studentCode,
          name: `${student.firstName} ${student.lastName}`.trim(),
          khmerName: student.khmerName,
        },
        finalResultsPublishedAt,
        scores,
      },
    });
  } catch (error) {
    console.error('Error loading current student scores:', error);
    return res.status(500).json({ message: 'Failed to retrieve your scores.' });
  }
};

export const saveScore = async (req, res) => {
  try {
    const { studentId, subjectId, subjectCode, score, examType, remarks } = req.body;

    const sId = parseInt(studentId, 10);
    if (isNaN(sId)) {
      return res.status(400).json({ message: 'Valid student ID is required' });
    }

    let subId = subjectId ? parseInt(subjectId, 10) : null;

    if (!subId && subjectCode) {
      const subject = await prisma.subject.findUnique({
        where: { code: subjectCode.trim() },
      });
      if (subject) {
        subId = subject.id;
      }
    }

    if (!subId) {
      return res.status(400).json({ message: 'Valid subject is required' });
    }

    const numericScore = parseFloat(score || 0);
    const type = (examType || 'ALL').toUpperCase();

    const existingScore = await prisma.score.findUnique({
      where: {
        studentId_subjectId: {
          studentId: sId,
          subjectId: subId,
        },
      },
    });

    let updatePayload = { remarks: remarks || null };
    let createPayload = {
      studentId: sId,
      subjectId: subId,
      remarks: remarks || null,
    };

    if (type === 'MIDTERM') {
      const currentFinal = existingScore ? existingScore.finalScore : 0;
      updatePayload.midtermScore = numericScore;
      updatePayload.score = numericScore + currentFinal;

      createPayload.midtermScore = numericScore;
      createPayload.finalScore = 0;
      createPayload.score = numericScore;
    } else if (type === 'FINAL') {
      const currentMidterm = existingScore ? existingScore.midtermScore : 0;
      updatePayload.finalScore = numericScore;
      updatePayload.finalScoreEntered = true;
      updatePayload.score = currentMidterm + numericScore;

      createPayload.midtermScore = 0;
      createPayload.finalScore = numericScore;
      createPayload.finalScoreEntered = true;
      createPayload.score = numericScore;
    } else {
      updatePayload.score = numericScore;
      createPayload.score = numericScore;
    }

    const savedRecord = await prisma.score.upsert({
      where: {
        studentId_subjectId: {
          studentId: sId,
          subjectId: subId,
        },
      },
      update: updatePayload,
      create: createPayload,
      include: {
        subject: true,
      },
    });

    return res.status(200).json({
      status: 'success',
      message: 'Score saved successfully',
      data: savedRecord,
    });
  } catch (error) {
    console.error('Error saving score:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to save score',
      error: error.message,
    });
  }
};

export default {
  getAllScores,
  saveScore,
};
