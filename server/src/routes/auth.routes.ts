import { Router } from 'express';
import { demoLogin, getMe, login } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/error.middleware';
import { loginSchema } from '../schemas';

const router = Router();

router.post('/login', validate(loginSchema), login);
router.post('/demo-login', demoLogin);
router.get('/me', authenticate, getMe);

export default router;
