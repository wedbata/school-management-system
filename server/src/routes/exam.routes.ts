import { Router } from 'express';
import {
  createExam,
  deleteExam,
  getExamGradebook,
  getExams,
  getStudentReportCard,
  recordBatchGrades,
  updateExam,
} from '../controllers/exam.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { validate } from '../middleware/error.middleware';
import { examCreateSchema } from '../schemas';

const router = Router();

router.use(authenticate);

router.get('/', getExams);
router.post('/', requireRole(['ADMIN', 'TEACHER']), validate(examCreateSchema), createExam);
router.put('/:id', requireRole(['ADMIN', 'TEACHER']), updateExam);
router.delete('/:id', requireRole(['ADMIN', 'TEACHER']), deleteExam);

router.get('/:id/gradebook', requireRole(['ADMIN', 'TEACHER']), getExamGradebook);
router.post('/grades/batch', requireRole(['ADMIN', 'TEACHER']), recordBatchGrades);

router.get('/report-card', getStudentReportCard);
router.get('/report-card/:studentId', getStudentReportCard);

export default router;
