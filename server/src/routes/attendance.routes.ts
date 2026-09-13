import { Router } from 'express';
import {
  getClassAttendance,
  getStudentAttendanceHistory,
  recordBatchAttendance,
} from '../controllers/attendance.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { validate } from '../middleware/error.middleware';
import { attendanceBatchSchema } from '../schemas';

const router = Router();

router.use(authenticate);

router.post(
  '/batch',
  requireRole(['ADMIN', 'TEACHER']),
  validate(attendanceBatchSchema),
  recordBatchAttendance
);
router.get('/class', requireRole(['ADMIN', 'TEACHER']), getClassAttendance);
router.get('/student/:studentId?', getStudentAttendanceHistory);

export default router;
