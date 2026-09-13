import { Router } from 'express';
import authRoutes from './auth.routes';
import dashboardRoutes from './dashboard.routes';
import studentRoutes from './student.routes';
import teacherRoutes from './teacher.routes';
import classRoutes from './class.routes';
import timetableRoutes from './timetable.routes';
import attendanceRoutes from './attendance.routes';
import examRoutes from './exam.routes';
import feeRoutes from './fee.routes';
import noticeRoutes from './notice.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/students', studentRoutes);
router.use('/teachers', teacherRoutes);
router.use('/classes', classRoutes);
router.use('/timetable', timetableRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/exams', examRoutes);
router.use('/fees', feeRoutes);
router.use('/notices', noticeRoutes);

export default router;
