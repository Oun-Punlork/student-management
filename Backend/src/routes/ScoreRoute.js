import express from 'express';
import { getAllScores, saveScore } from '../controller/ScoreController.js';
import { authmiddleware, requireRole } from '../middleware/AuthMiddleware.js';

const router = express.Router();

router.use('/scores', authmiddleware, requireRole('ADMIN'));

router.get('/scores', getAllScores);
router.post('/scores', saveScore);

export default router;
