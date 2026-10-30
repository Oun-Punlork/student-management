import bcrypt from 'bcrypt';
import { prisma } from '../../config/db.js';

const VALID_ROLES = ['ADMIN', 'TEACHER', 'STUDENT'];
const USER_FIELDS = {
  id: true,
  username: true,
  email: true,
  role: true,
  status: true,
  createdAt: true,
};

export const getUsers = async (_req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: USER_FIELDS,
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({ status: 'success', data: users });
  } catch (error) {
    console.error('Error retrieving users:', error);
    return res.status(500).json({ message: 'Failed to retrieve users' });
  }
};

export const createUser = async (req, res) => {
  try {
    const username = req.body.username?.trim();
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password;
    const role = req.body.role;

    if (!username || !email || !password || !role) {
      return res.status(400).json({ message: 'Username, email, password, and role are required.' });
    }
    if (username.length < 2 || username.length > 100) {
      return res.status(400).json({ message: 'Username must contain 2 to 100 characters.' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Enter a valid email address.' });
    }
    if (typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ message: 'Password must contain at least 8 characters.' });
    }
    if (!VALID_ROLES.includes(role)) {
      return res.status(400).json({ message: 'Select a valid user role.' });
    }

    const hash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { username, email, password: hash, role },
      select: USER_FIELDS,
    });

    return res.status(201).json({ status: 'success', data: user });
  } catch (error) {
    if (error.code === 'P2002') {
      const target = error.meta?.target;
      const field = Array.isArray(target) && target.includes('username') ? 'Username' : 'Email';
      return res.status(409).json({ message: `${field} is already in use.` });
    }
    console.error('Error creating user:', error);
    return res.status(500).json({ message: 'Failed to create user' });
  }
};

export const deleteUser = async (req, res) => {
  const userId = Number.parseInt(req.params.id, 10);

  if (!Number.isInteger(userId) || userId < 1) {
    return res.status(400).json({ message: 'A valid user ID is required.' });
  }
  if (userId === req.user.id) {
    return res.status(400).json({ message: 'You cannot delete your own account.' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.role === 'ADMIN') {
      const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
      if (adminCount <= 1) {
        return res.status(409).json({ message: 'The last administrator cannot be deleted.' });
      }
    }

    await prisma.user.delete({ where: { id: userId } });

    return res.status(200).json({
      status: 'success',
      message: 'User and linked student profile deleted successfully.',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({ message: 'Failed to delete user.' });
  }
};

export const updateUserRole = async (req, res) => {
  const userId = Number.parseInt(req.params.id, 10);
  const { role } = req.body;

  if (!Number.isInteger(userId) || userId < 1) {
    return res.status(400).json({ message: 'A valid user ID is required.' });
  }
  if (!VALID_ROLES.includes(role)) {
    return res.status(400).json({ message: 'Select a valid user role.' });
  }
  if (userId === req.user.id) {
    return res.status(400).json({ message: 'You cannot change your own role.' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.role === 'ADMIN' && role !== 'ADMIN') {
      const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
      if (adminCount <= 1) {
        return res.status(409).json({ message: 'The last administrator cannot be demoted.' });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: USER_FIELDS,
    });

    return res.status(200).json({ status: 'success', data: updatedUser });
  } catch (error) {
    console.error('Error updating user role:', error);
    return res.status(500).json({ message: 'Failed to update user role' });
  }
};

export const updateUserStatus = async (req, res) => {
  const userId = Number.parseInt(req.params.id, 10);
  const { status } = req.body;

  if (!Number.isInteger(userId) || userId < 1) {
    return res.status(400).json({ message: 'A valid user ID is required.' });
  }
  if (!['ACTIVE', 'INACTIVE'].includes(status)) {
    return res.status(400).json({ message: 'Select a valid user status.' });
  }
  if (userId === req.user.id && status === 'INACTIVE') {
    return res.status(400).json({ message: 'You cannot deactivate your own account.' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, status: true },
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.role === 'ADMIN' && user.status === 'ACTIVE' && status === 'INACTIVE') {
      const activeAdminCount = await prisma.user.count({
        where: { role: 'ADMIN', status: 'ACTIVE' },
      });
      if (activeAdminCount <= 1) {
        return res.status(409).json({ message: 'The last active administrator cannot be deactivated.' });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { status },
      select: USER_FIELDS,
    });

    return res.status(200).json({ status: 'success', data: updatedUser });
  } catch (error) {
    console.error('Error updating user status:', error);
    return res.status(500).json({ message: 'Failed to update user status' });
  }
};

export default { getUsers, createUser, deleteUser, updateUserRole, updateUserStatus };
