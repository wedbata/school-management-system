import { Router } from 'express';
import {
  createStudent,
  deleteStudent,
  getStudentById,
  getStudents,
  updateStudent,
} from '../controllers/student.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { validate } from '../middleware/error.middleware';
import { studentCreateSchema } from '../schemas';

const router = Router();

router.use(authenticate);

router.get('/', getStudents);
router.get('/:id', getStudentById);
router.post('/', requireRole(['ADMIN']), validate(studentCreateSchema), createStudent);
router.put('/:id', requireRole(['ADMIN']), updateStudent);
router.delete('/:id', requireRole(['ADMIN']), deleteStudent);

export default router;
