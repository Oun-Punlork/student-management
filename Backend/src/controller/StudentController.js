import { prisma } from '../../config/db.js';

const parseGender = (gender) => {
  if (!gender) return 'MALE';
  const g = String(gender).trim().toUpperCase();
  if (g === 'MALE' || g === 'ប្រុស' || g === 'M') return 'MALE';
  if (g === 'FEMALE' || g === 'ស្រី' || g === 'F') return 'FEMALE';
  return 'MALE';
};

const parseStatus = (status) => {
  if (!status) return 'ACTIVE';
  const s = String(status).trim().toUpperCase();
  return s === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE';
};

const parseDate = (d) => {
  if (!d) return null;
  const parsed = new Date(d);
  return isNaN(parsed.getTime()) ? null : parsed;
};

const withUserAvatar = (student) => {
  if (!student?.user) return student;

  const { profileImage, profileImageMimeType, ...user } = student.user;
  return {
    ...student,
    user: {
      ...user,
      avatarUrl: profileImage
        ? `data:${profileImageMimeType};base64,${Buffer.from(profileImage).toString('base64')}`
        : null,
    },
  };
};

// GET ALL STUDENTS
export const getAllStudents = async (req, res) => {
  try {
    const { search, status, gender } = req.query;

    const where = {};

    if (status) {
      where.status = parseStatus(status);
    }

    if (gender) {
      where.gender = parseGender(gender);
    }

    if (search) {
      where.OR = [
        { studentCode: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const students = await prisma.student.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            role: true,
            profileImage: true,
            profileImageMimeType: true,
          },
        },
      },
      orderBy: {
        id: 'desc',
      },
    });

    return res.status(200).json({
      status: 'success',
      total: students.length,
      data: students.map(withUserAvatar),
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve students',
      error: error.message,
    });
  }
};

// GET SINGLE STUDENT BY ID
export const getStudentById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid student ID' });
    }

    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            role: true,
            profileImage: true,
            profileImageMimeType: true,
          },
        },
        scores: {
          include: {
            subject: true,
          },
        },
        attendances: {
          include: {
            subject: true,
          },
        },
      },
    });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    return res.status(200).json({
      status: 'success',
      data: withUserAvatar(student),
    });
  } catch (error) {
    console.error('Error fetching student:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve student',
      error: error.message,
    });
  }
};

// CREATE NEW STUDENT
export const createStudent = async (req, res) => {
  try {
    const {
      studentCode,
      firstName,
      lastName,
      khmerName,
      gender,
      dateOfBirth,
      phone,
      address,
      status,
      userId,
    } = req.body;

    if (!firstName || !lastName) {
      return res.status(400).json({
        message: 'First Name and Last Name are required',
      });
    }

    // Auto-generate code if omitted
    const finalStudentCode = (studentCode && studentCode.trim()) 
      ? studentCode.trim() 
      : `STU-${Math.floor(1000 + Math.random() * 9000)}`;

    const formattedGender = parseGender(gender);
    const formattedStatus = parseStatus(status);

    // Check if studentCode already exists
    const existingCode = await prisma.student.findUnique({
      where: { studentCode: finalStudentCode },
    });

    if (existingCode) {
      return res.status(400).json({ message: `Student code ${finalStudentCode} is already in use` });
    }

    const newStudent = await prisma.student.create({
      data: {
        studentCode: finalStudentCode,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        khmerName: khmerName?.trim() || null,
        gender: formattedGender,
        dateOfBirth: parseDate(dateOfBirth),
        phone: phone ? phone.trim() : null,
        address: address ? address.trim() : null,
        status: formattedStatus,
        userId: userId ? parseInt(userId, 10) : null,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            profileImage: true,
            profileImageMimeType: true,
          },
        },
      },
    });

    return res.status(201).json({
      status: 'success',
      message: 'Student created successfully',
      data: withUserAvatar(newStudent),
    });
  } catch (error) {
    console.error('Error creating student:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to create student',
      error: error.message,
    });
  }
};

export const createStudentsBulk = async (req, res) => {
  try {
    if (!Array.isArray(req.body) || req.body.length === 0) {
      return res.status(400).json({ message: 'Request body must be a non-empty array of students' });
    }

    const invalidIndex = req.body.findIndex((student) =>
      !student ||
      typeof student.studentCode !== 'string' ||
      !student.studentCode.trim() ||
      typeof student.firstName !== 'string' ||
      !student.firstName.trim() ||
      typeof student.lastName !== 'string' ||
      !student.lastName.trim(),
    );

    if (invalidIndex !== -1) {
      return res.status(400).json({
        message: `Student at index ${invalidIndex} requires studentCode, firstName, and lastName`,
      });
    }

    const students = req.body.map((student) => ({
      studentCode: student.studentCode.trim(),
      firstName: student.firstName.trim(),
      lastName: student.lastName.trim(),
      khmerName: student.khmerName?.trim() || null,
      gender: parseGender(student.gender),
      dateOfBirth: parseDate(student.dateOfBirth),
      phone: student.phone?.trim() || null,
      address: student.address?.trim() || null,
      status: parseStatus(student.status),
      userId: student.userId ? parseInt(student.userId, 10) : null,
    }));

    const result = await prisma.student.createMany({
      data: students,
      skipDuplicates: true,
    });

    return res.status(201).json({
      status: 'success',
      requested: students.length,
      created: result.count,
      skipped: students.length - result.count,
    });
  } catch (error) {
    console.error('Error creating students in bulk:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to create students',
    });
  }
};

// UPDATE STUDENT
export const updateStudent = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid student ID' });
    }

    const {
      studentCode,
      firstName,
      lastName,
      khmerName,
      gender,
      dateOfBirth,
      phone,
      address,
      status,
      userId,
    } = req.body;

    // Check if student exists
    const existingStudent = await prisma.student.findUnique({
      where: { id },
    });

    if (!existingStudent) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check studentCode uniqueness if updated
    if (studentCode && studentCode.trim() !== existingStudent.studentCode) {
      const codeConflict = await prisma.student.findUnique({
        where: { studentCode: studentCode.trim() },
      });

      if (codeConflict) {
        return res.status(400).json({ message: 'Student code is already in use' });
      }
    }

    const updateData = {};

    if (studentCode !== undefined && studentCode.trim()) updateData.studentCode = studentCode.trim();
    if (firstName !== undefined && firstName.trim()) updateData.firstName = firstName.trim();
    if (lastName !== undefined && lastName.trim()) updateData.lastName = lastName.trim();
    if (khmerName !== undefined) updateData.khmerName = khmerName ? khmerName.trim() : null;
    if (gender !== undefined) updateData.gender = parseGender(gender);
    if (dateOfBirth !== undefined) updateData.dateOfBirth = parseDate(dateOfBirth);
    if (phone !== undefined) updateData.phone = phone ? phone.trim() : null;
    if (address !== undefined) updateData.address = address ? address.trim() : null;
    if (status !== undefined) updateData.status = parseStatus(status);
    if (userId !== undefined) updateData.userId = userId ? parseInt(userId, 10) : null;

    const updatedStudent = await prisma.student.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    return res.status(200).json({
      status: 'success',
      message: 'Student updated successfully',
      data: updatedStudent,
    });
  } catch (error) {
    console.error('Error updating student:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to update student',
      error: error.message,
    });
  }
};

// DELETE STUDENT
export const deleteStudent = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid student ID' });
    }

    const existingStudent = await prisma.student.findUnique({
      where: { id },
    });

    if (!existingStudent) {
      return res.status(404).json({ message: 'Student not found' });
    }

    await prisma.student.delete({
      where: { id },
    });

    return res.status(200).json({
      status: 'success',
      message: 'Student deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting student:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to delete student',
      error: error.message,
    });
  }
};

export default {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
};
