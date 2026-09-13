import { Router } from 'express';
import {
  createClass,
  createSubject,
  getClasses,
  getSubjects,
} from '../controllers/class.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/classes', getClasses);
router.post('/classes', requireRole(['ADMIN']), createClass);

router.get('/subjects', getSubjects);
router.post('/subjects', requireRole(['ADMIN']), createSubject);

export default router;
