import { Response } from 'express';
import prisma from '../config/prisma';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { sendError, sendSuccess } from '../utils/response';

export const recordBatchAttendance = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { date, classId, sectionId, records } = req.body;
    const targetDate = new Date(new Date(date).setHours(0, 0, 0, 0));
    const recordedById = req.user?.profileId;

    const results = await prisma.$transaction(
      records.map((r: { studentId: string; status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'; remarks?: string }) =>
        prisma.attendance.upsert({
          where: {
            studentId_date: {
              studentId: r.studentId,
              date: targetDate,
            },
          },
          update: {
            status: r.status,
            remarks: r.remarks,
            recordedById,
          },
          create: {
            studentId: r.studentId,
            date: targetDate,
            status: r.status,
            remarks: r.remarks,
            recordedById,
          },
        })
      )
    );

    return sendSuccess(res, `Attendance recorded for ${results.length} students on ${date}`, results);
  } catch (error: any) {
    console.error('Batch attendance error:', error);
    return sendError(res, 'Failed to record attendance', 500, error.message);
  }
};

export const getClassAttendance = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { classId, sectionId, date } = req.query;

    if (!classId || !sectionId) {
      return sendError(res, 'classId and sectionId are required', 400);
    }

    const targetDate = date ? new Date(new Date(String(date)).setHours(0, 0, 0, 0)) : new Date(new Date().setHours(0, 0, 0, 0));

    // Get all students in this class/section
    const students = await prisma.studentProfile.findMany({
      where: { classId: String(classId), sectionId: String(sectionId) },
      orderBy: { rollNumber: 'asc' },
      include: {
        user: { select: { firstName: true, lastName: true, avatarUrl: true } },
        attendances: {
          where: { date: targetDate },
        },
      },
    });

    const formatted = students.map((s) => ({
      studentId: s.id,
      rollNumber: s.rollNumber,
      admissionNumber: s.admissionNumber,
      name: `${s.user.firstName} ${s.user.lastName}`,
      avatarUrl: s.user.avatarUrl,
      status: s.attendances[0]?.status || 'PRESENT',
      remarks: s.attendances[0]?.remarks || '',
    }));

    return sendSuccess(res, 'Class attendance list retrieved', formatted);
  } catch (error: any) {
    return sendError(res, 'Failed to fetch class attendance', 500, error.message);
  }
};

export const getStudentAttendanceHistory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    let studentId = req.params.studentId as string;

    if (req.user?.role === 'STUDENT') {
      studentId = req.user.profileId!;
    }

    if (!studentId) {
      return sendError(res, 'Student ID required', 400);
    }

    const records = await prisma.attendance.findMany({
      where: { studentId: String(studentId) },
      orderBy: { date: 'desc' },
      take: 60,
    });

    const counts = {
      PRESENT: records.filter((r) => r.status === 'PRESENT').length,
      ABSENT: records.filter((r) => r.status === 'ABSENT').length,
      LATE: records.filter((r) => r.status === 'LATE').length,
      EXCUSED: records.filter((r) => r.status === 'EXCUSED').length,
      TOTAL: records.length,
    };

    const rate = counts.TOTAL > 0 ? Math.round((counts.PRESENT / counts.TOTAL) * 100) : 100;

    return sendSuccess(res, 'Student attendance history', {
      rate,
      counts,
      records,
    });
  } catch (error: any) {
    return sendError(res, 'Failed to fetch student attendance history', 500, error.message);
  }
};
