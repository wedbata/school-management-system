import { Response } from 'express';
import prisma from '../config/prisma';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { sendError, sendSuccess } from '../utils/response';

export const getDashboardStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { role, userId, profileId } = req.user!;

    if (role === 'ADMIN') {
      const [
        totalStudents,
        totalTeachers,
        totalClasses,
        totalSubjects,
        recentStudents,
        recentNotices,
        feeStats,
        attendanceToday,
      ] = await Promise.all([
        prisma.studentProfile.count(),
        prisma.teacherProfile.count(),
        prisma.class.count(),
        prisma.subject.count(),
        prisma.studentProfile.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { firstName: true, lastName: true, email: true, avatarUrl: true } },
            class: true,
            section: true,
          },
        }),
        prisma.announcement.findMany({
          take: 4,
          orderBy: { createdAt: 'desc' },
          include: { author: { select: { firstName: true, lastName: true, role: true } } },
        }),
        prisma.feeInvoice.aggregate({
          _sum: { amount: true, paidAmount: true },
        }),
        prisma.attendance.groupBy({
          by: ['status'],
          where: {
            date: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
              lte: new Date(new Date().setHours(23, 59, 59, 999)),
            },
          },
          _count: { status: true },
        }),
      ]);

      const totalBilled = feeStats._sum.amount || 0;
      const totalCollected = feeStats._sum.paidAmount || 0;
      const pendingFees = totalBilled - totalCollected;

      return sendSuccess(res, 'Admin dashboard stats retrieved', {
        summary: {
          totalStudents,
          totalTeachers,
          totalClasses,
          totalSubjects,
          totalCollected,
          pendingFees,
        },
        recentStudents,
        recentNotices,
        attendanceToday,
      });
    }

    if (role === 'TEACHER') {
      const teacher = await prisma.teacherProfile.findUnique({
        where: { id: profileId },
        include: {
          subjects: { include: { class: true } },
          sections: { include: { class: true } },
        },
      });

      if (!teacher) return sendError(res, 'Teacher profile not found', 404);

      // Today's schedule
      const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'] as const;
      const todayDay = days[new Date().getDay()];

      const [todaySchedule, recentExams, notices] = await Promise.all([
        prisma.timetablePeriod.findMany({
          where: {
            teacherId: teacher.id,
            dayOfWeek: (todayDay === 'SUNDAY' ? 'MONDAY' : todayDay) as any,
          },
          include: {
            subject: true,
            class: true,
            section: true,
          },
          orderBy: { startTime: 'asc' },
        }),
        prisma.exam.findMany({
          where: {
            subject: { teacherId: teacher.id },
          },
          take: 5,
          orderBy: { examDate: 'desc' },
          include: {
            subject: true,
            class: true,
            _count: { select: { grades: true } },
          },
        }),
        prisma.announcement.findMany({
          where: { targetRole: { in: ['ALL', 'TEACHER'] } },
          take: 4,
          orderBy: { createdAt: 'desc' },
          include: { author: { select: { firstName: true, lastName: true, role: true } } },
        }),
      ]);

      return sendSuccess(res, 'Teacher dashboard stats retrieved', {
        teacher,
        todaySchedule,
        recentExams,
        notices,
      });
    }

    if (role === 'STUDENT') {
      const student = await prisma.studentProfile.findUnique({
        where: { id: profileId },
        include: {
          class: true,
          section: true,
        },
      });

      if (!student) return sendError(res, 'Student profile not found', 404);

      const [attendanceRecords, recentGrades, pendingInvoices, notices] = await Promise.all([
        prisma.attendance.findMany({
          where: { studentId: student.id },
          take: 30,
          orderBy: { date: 'desc' },
        }),
        prisma.grade.findMany({
          where: { studentId: student.id },
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            exam: { include: { subject: true } },
          },
        }),
        prisma.feeInvoice.findMany({
          where: { studentId: student.id, status: { in: ['PENDING', 'OVERDUE', 'PARTIAL'] } },
        }),
        prisma.announcement.findMany({
          where: { targetRole: { in: ['ALL', 'STUDENT'] } },
          take: 4,
          orderBy: { createdAt: 'desc' },
          include: { author: { select: { firstName: true, lastName: true, role: true } } },
        }),
      ]);

      const totalPresent = attendanceRecords.filter((a) => a.status === 'PRESENT').length;
      const attendanceRate = attendanceRecords.length > 0
        ? Math.round((totalPresent / attendanceRecords.length) * 100)
        : 100;

      return sendSuccess(res, 'Student dashboard stats retrieved', {
        student,
        attendanceRate,
        attendanceRecords: attendanceRecords.slice(0, 7),
        recentGrades,
        pendingInvoices,
        notices,
      });
    }

    return sendError(res, 'Invalid role', 400);
  } catch (error: any) {
    return sendError(res, 'Failed to fetch dashboard metrics', 500, error.message);
  }
};
