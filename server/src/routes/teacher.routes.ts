import { Router } from 'express';
import {
  createTeacher,
  deleteTeacher,
  getTeacherById,
  getTeachers,
  updateTeacher,
} from '../controllers/teacher.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { validate } from '../middleware/error.middleware';
import { teacherCreateSchema } from '../schemas';

const router = Router();

router.use(authenticate);

router.get('/', getTeachers);
router.get('/:id', getTeacherById);
router.post('/', requireRole(['ADMIN']), validate(teacherCreateSchema), createTeacher);
router.put('/:id', requireRole(['ADMIN']), updateTeacher);
router.delete('/:id', requireRole(['ADMIN']), deleteTeacher);

export default router;
