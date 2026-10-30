import express from 'express';
import {
  getAttendance,
  saveAttendance,
  saveBatchAttendance,
} from '../controller/AttendanceController.js';
import { authmiddleware, requireRole } from '../middleware/AuthMiddleware.js';

const router = express.Router();

router.use('/attendance', authmiddleware, requireRole('ADMIN'));

router.get('/attendance', getAttendance);
router.post('/attendance', saveAttendance);
router.post('/attendance/batch', saveBatchAttendance);

export default router;
