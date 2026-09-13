import { Router } from 'express';
import {
  createNotice,
  deleteNotice,
  getNotices,
} from '../controllers/notice.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { validate } from '../middleware/error.middleware';
import { announcementSchema } from '../schemas';

const router = Router();

router.use(authenticate);

router.get('/', getNotices);
router.post('/', requireRole(['ADMIN', 'TEACHER']), validate(announcementSchema), createNotice);
router.delete('/:id', requireRole(['ADMIN']), deleteNotice);

export default router;
