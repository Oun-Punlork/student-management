import express from 'express';
import { getDashboardStats } from '../controller/DashboardController.js';
import { authmiddleware, requireRole } from '../middleware/AuthMiddleware.js';

const router = express.Router();

router.use('/dashboard', authmiddleware, requireRole('ADMIN'));

router.get('/dashboard/stats', getDashboardStats);

export default router;
