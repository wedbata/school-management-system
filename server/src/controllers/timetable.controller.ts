import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { sendError, sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export const getTimetable = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { classId, sectionId, teacherId } = req.query;
    const where: any = {};

    if (classId) where.classId = String(classId);
    if (sectionId) where.sectionId = String(sectionId);
    if (teacherId) where.teacherId = String(teacherId);

    // If student is logged in, default to their class and section
    if (req.user?.role === 'STUDENT' && req.user.profileId) {
      const student = await prisma.studentProfile.findUnique({
        where: { id: req.user.profileId },
      });
      if (student) {
        where.classId = student.classId;
        where.sectionId = student.sectionId;
      }
    }

    // If teacher is logged in and no filter is passed, show teacher's schedule
    if (req.user?.role === 'TEACHER' && !classId && req.user.profileId) {
      where.teacherId = req.user.profileId;
    }

    const periods = await prisma.timetablePeriod.findMany({
      where,
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
      include: {
        subject: true,
        class: true,
        section: true,
        teacher: {
          include: {
            user: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });

    return sendSuccess(res, 'Timetable schedule retrieved', periods);
  } catch (error: any) {
    return sendError(res, 'Failed to fetch timetable', 500, error.message);
  }
};

export const createTimetablePeriod = async (req: Request, res: Response) => {
  try {
    const { dayOfWeek, startTime, endTime, roomNumber, classId, sectionId, subjectId, teacherId } = req.body;

    const period = await prisma.timetablePeriod.create({
      data: {
        dayOfWeek,
        startTime,
        endTime,
        roomNumber,
        classId,
        sectionId,
        subjectId,
        teacherId,
      },
      include: {
        subject: true,
        class: true,
        section: true,
        teacher: {
          include: { user: { select: { firstName: true, lastName: true } } },
        },
      },
    });

    return sendSuccess(res, 'Timetable period created', period, 201);
  } catch (error: any) {
    return sendError(res, 'Failed to create timetable period', 500, error.message);
  }
};

export const deleteTimetablePeriod = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    await prisma.timetablePeriod.delete({ where: { id } });
    return sendSuccess(res, 'Timetable period removed');
  } catch (error: any) {
    return sendError(res, 'Failed to delete period', 500, error.message);
  }
};
