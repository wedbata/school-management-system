import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { sendError, sendSuccess } from '../utils/response';

export const getClasses = async (req: Request, res: Response) => {
  try {
    const classes = await prisma.class.findMany({
      orderBy: { numericGrade: 'asc' },
      include: {
        sections: {
          include: {
            classTeacher: {
              include: { user: { select: { firstName: true, lastName: true } } },
            },
            _count: { select: { students: true } },
          },
        },
        subjects: {
          include: {
            teacher: {
              include: { user: { select: { firstName: true, lastName: true } } },
            },
          },
        },
        _count: {
          select: { students: true, subjects: true },
        },
      },
    });

    return sendSuccess(res, 'Classes retrieved', classes);
  } catch (error: any) {
    return sendError(res, 'Failed to fetch classes', 500, error.message);
  }
};

export const createClass = async (req: Request, res: Response) => {
  try {
    const { name, numericGrade, description, sections } = req.body;

    const newClass = await prisma.class.create({
      data: {
        name,
        numericGrade: parseInt(numericGrade, 10),
        description,
        sections: {
          create: (sections && sections.length > 0 ? sections : ['A']).map((secName: string) => ({
            name: secName,
          })),
        },
      },
      include: {
        sections: true,
      },
    });

    return sendSuccess(res, 'Class created successfully', newClass, 201);
  } catch (error: any) {
    return sendError(res, 'Failed to create class', 500, error.message);
  }
};

export const getSubjects = async (req: Request, res: Response) => {
  try {
    const { classId } = req.query;
    const where: any = {};
    if (classId) where.classId = String(classId);

    const subjects = await prisma.subject.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        class: true,
        teacher: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true } },
          },
        },
      },
    });

    return sendSuccess(res, 'Subjects retrieved', subjects);
  } catch (error: any) {
    return sendError(res, 'Failed to fetch subjects', 500, error.message);
  }
};

export const createSubject = async (req: Request, res: Response) => {
  try {
    const { name, code, classId, teacherId, creditHours } = req.body;

    const subject = await prisma.subject.create({
      data: {
        name,
        code,
        classId,
        teacherId: teacherId || null,
        creditHours: creditHours ? parseInt(creditHours, 10) : 3,
      },
      include: {
        class: true,
        teacher: {
          include: { user: { select: { firstName: true, lastName: true } } },
        },
      },
    });

    return sendSuccess(res, 'Subject created successfully', subject, 201);
  } catch (error: any) {
    return sendError(res, 'Failed to create subject', 500, error.message);
  }
};
