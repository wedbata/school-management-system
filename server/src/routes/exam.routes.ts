import { Router } from 'express';
import {
  createExam,
  getExamGradebook,
  getExams,
  getStudentReportCard,
  recordBatchGrades,
} from '../controllers/exam.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { validate } from '../middleware/error.middleware';
import { examCreateSchema, gradeBatchSchema } from '../schemas';

const router = Router();

router.use(authenticate);

router.get('/', getExams);
router.post('/', requireRole(['ADMIN', 'TEACHER']), validate(examCreateSchema), createExam);

router.get('/:id/gradebook', requireRole(['ADMIN', 'TEACHER']), getExamGradebook);
router.post('/grades/batch', requireRole(['ADMIN', 'TEACHER']), validate(gradeBatchSchema), recordBatchGrades);

router.get('/report-card/:studentId?', getStudentReportCard);

export default router;
