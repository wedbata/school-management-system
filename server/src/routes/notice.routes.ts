import { Router } from 'express';
import {
  createNotice,
  deleteNotice,
  getNotices,
  updateNotice,
} from '../controllers/notice.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { validate } from '../middleware/error.middleware';
import { noticeCreateSchema } from '../schemas';

const router = Router();

router.use(authenticate);

router.get('/', getNotices);
router.post('/', requireRole(['ADMIN', 'TEACHER']), validate(noticeCreateSchema), createNotice);
router.put('/:id', requireRole(['ADMIN', 'TEACHER']), updateNotice);
router.delete('/:id', requireRole(['ADMIN', 'TEACHER']), deleteNotice);

export default router;
