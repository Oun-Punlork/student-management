import express from 'express';
import {
  createUser,
  deleteUser,
  getUsers,
  updateUserRole,
  updateUserStatus,
} from '../controller/UserController.js';
import { authmiddleware, requireRole } from '../middleware/AuthMiddleware.js';

const router = express.Router();

router.use('/users', authmiddleware, requireRole('ADMIN'));
router.get('/users', getUsers);
router.post('/users', createUser);
router.delete('/users/:id', deleteUser);
router.patch('/users/:id/role', updateUserRole);
router.patch('/users/:id/status', updateUserStatus);

export default router;
