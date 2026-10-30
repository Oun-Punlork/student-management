import { prisma } from '../../config/db.js';

const MAX_SCHEDULE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

const ensureInformationPage = () =>
  prisma.informationPage.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });

export const getInformation = async (_req, res) => {
  try {
    const information = await ensureInformationPage();
    return res.status(200).json({
      status: 'success',
      data: {
        scheduleImage: information.scheduleImage
          ? `data:${information.scheduleImageMimeType};base64,${Buffer.from(information.scheduleImage).toString('base64')}`
          : null,
        scheduleImageName: information.scheduleImageName,
        additionalScheduleImage: information.additionalScheduleImage
          ? `data:${information.additionalScheduleImageMimeType};base64,${Buffer.from(information.additionalScheduleImage).toString('base64')}`
          : null,
        additionalScheduleImageName: information.additionalScheduleImageName,
        finalResultsPublishedAt: information.finalResultsPublishedAt,
        reexamStudents: information.publishedReexamStudents || [],
      },
    });
  } catch (error) {
    console.error('Error loading information page:', error);
    return res.status(500).json({ message: 'Failed to load information page.' });
  }
};

const saveScheduleImage = async (req, res, fields) => {
  try {
    const mimeType = req.get('content-type');
    if (!ALLOWED_IMAGE_TYPES.has(mimeType)) {
      return res.status(415).json({ message: 'Upload a JPEG, PNG, or WebP schedule image.' });
    }

    if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
      return res.status(400).json({ message: 'Choose a schedule image to upload.' });
    }
    if (req.body.length > MAX_SCHEDULE_BYTES) {
      return res.status(413).json({ message: 'Schedule images must be 5 MB or smaller.' });
    }

    let imageName = 'schedule';
    try {
      imageName = decodeURIComponent(req.get('x-file-name') || imageName);
    } catch {
      return res.status(400).json({ message: 'The uploaded file name is invalid.' });
    }
    imageName = imageName.replace(/[\\/]/g, '').slice(0, 255) || 'schedule';

    const imageData = {
      [fields.image]: req.body,
      [fields.name]: imageName,
      [fields.mimeType]: mimeType,
    };
    await prisma.informationPage.upsert({
      where: { id: 1 },
      update: imageData,
      create: {
        id: 1,
        ...imageData,
      },
    });

    return res.status(200).json({ status: 'success', message: 'Schedule image uploaded.' });
  } catch (error) {
    console.error('Error uploading schedule image:', error);
    return res.status(500).json({ message: 'Failed to save the schedule image.' });
  }
};

export const uploadScheduleImage = (req, res) =>
  saveScheduleImage(req, res, {
    image: 'scheduleImage',
    name: 'scheduleImageName',
    mimeType: 'scheduleImageMimeType',
  });

export const uploadAdditionalScheduleImage = (req, res) =>
  saveScheduleImage(req, res, {
    image: 'additionalScheduleImage',
    name: 'additionalScheduleImageName',
    mimeType: 'additionalScheduleImageMimeType',
  });

export const publishFinalResults = async (_req, res) => {
  try {
    const [subjects, students] = await Promise.all([
      prisma.subject.findMany({ orderBy: { id: 'asc' } }),
      prisma.student.findMany({
        where: { status: 'ACTIVE' },
        include: {
          scores: {
            include: { subject: true },
          },
        },
        orderBy: { id: 'asc' },
      }),
    ]);

    if (subjects.length === 0 || students.length === 0) {
      return res.status(400).json({ message: 'Students and subjects are required before publishing final results.' });
    }

    const incompleteStudents = [];
    const reexamStudents = [];

    students.forEach((student) => {
      const scoresBySubjectId = new Map(student.scores.map((score) => [score.subjectId, score]));
      const missingSubjects = subjects.filter((subject) => {
        const score = scoresBySubjectId.get(subject.id);
        return !score || !score.finalScoreEntered;
      });

      if (missingSubjects.length > 0) {
        incompleteStudents.push({
          studentCode: student.studentCode,
          name: `${student.firstName} ${student.lastName}`.trim(),
          missingSubjects: missingSubjects.map((subject) => subject.code),
        });
        return;
      }

      const finalScores = subjects.map((subject) => ({
        code: subject.code,
        name: subject.name,
        score: scoresBySubjectId.get(subject.id).finalScore,
      }));

      if (finalScores.every(({ score }) => score < 50)) {
        reexamStudents.push({
          id: student.id,
          studentCode: student.studentCode,
          name: `${student.firstName} ${student.lastName}`.trim(),
          finalScores,
        });
      }
    });

    if (incompleteStudents.length > 0) {
      return res.status(409).json({
        message: 'Cannot publish yet: enter a final-exam score for every subject and active student.',
        incompleteStudents,
      });
    }

    const publishedAt = new Date();
    await prisma.informationPage.upsert({
      where: { id: 1 },
      update: {
        finalResultsPublishedAt: publishedAt,
        publishedReexamStudents: reexamStudents,
      },
      create: {
        id: 1,
        finalResultsPublishedAt: publishedAt,
        publishedReexamStudents: reexamStudents,
      },
    });

    return res.status(200).json({
      status: 'success',
      message: 'Final results published.',
      publishedAt,
      reexamStudentCount: reexamStudents.length,
    });
  } catch (error) {
    console.error('Error publishing final results:', error);
    return res.status(500).json({ message: 'Failed to publish final results.' });
  }
};
