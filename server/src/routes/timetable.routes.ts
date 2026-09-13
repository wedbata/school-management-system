import { Router } from 'express';
import {
  createTimetablePeriod,
  deleteTimetablePeriod,
  getTimetable,
} from '../controllers/timetable.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getTimetable);
router.post('/', requireRole(['ADMIN']), createTimetablePeriod);
router.delete('/:id', requireRole(['ADMIN']), deleteTimetablePeriod);

export default router;
