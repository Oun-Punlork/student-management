import express from 'express';
import {
  getInformation,
  publishFinalResults,
  uploadAdditionalScheduleImage,
  uploadScheduleImage,
} from '../controller/InformationController.js';
import { authmiddleware, requireRole } from '../middleware/AuthMiddleware.js';

const router = express.Router();
const scheduleImageBody = express.raw({
  type: ['image/jpeg', 'image/png', 'image/webp'],
  limit: '5mb',
});

router.use('/information', authmiddleware);
router.get('/information', getInformation);
router.put('/information/schedule/additional', requireRole('ADMIN'), scheduleImageBody, uploadAdditionalScheduleImage);
router.put('/information/schedule', requireRole('ADMIN'), scheduleImageBody, uploadScheduleImage);
router.post('/information/publish-final-results', requireRole('ADMIN'), publishFinalResults);

export default router;
