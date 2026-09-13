import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { hashPassword } from '../utils/auth';
import { sendError, sendSuccess } from '../utils/response';

export const getTeachers = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    const where: any = {};

    if (search) {
      where.OR = [
        { employeeId: { contains: String(search), mode: 'insensitive' } },
        { specialization: { contains: String(search), mode: 'insensitive' } },
        { user: { firstName: { contains: String(search), mode: 'insensitive' } } },
        { user: { lastName: { contains: String(search), mode: 'insensitive' } } },
        { user: { email: { contains: String(search), mode: 'insensitive' } } },
      ];
    }

    const teachers = await prisma.teacherProfile.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            avatarUrl: true,
            isActive: true,
          },
        },
        subjects: {
          include: { class: true },
        },
        sections: {
          include: { class: true },
        },
      },
    });

    return sendSuccess(res, 'Teachers retrieved successfully', teachers);
  } catch (error: any) {
    return sendError(res, 'Failed to fetch teachers', 500, error.message);
  }
};

export const getTeacherById = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);

    const teacher = await prisma.teacherProfile.findUnique({
      where: { id },
      include: {
        user: true,
        subjects: { include: { class: true } },
        sections: { include: { class: true } },
        timetableSlots: {
          include: { subject: true, class: true, section: true },
          orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
        },
      },
    });

    if (!teacher) {
      return sendError(res, 'Teacher not found', 404);
    }

    return sendSuccess(res, 'Teacher details retrieved', teacher);
  } catch (error: any) {
    return sendError(res, 'Failed to fetch teacher details', 500, error.message);
  }
};

export const createTeacher = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const defaultPassword = data.password || 'Teacher@123';
    const passwordHash = await hashPassword(defaultPassword);

    const count = await prisma.teacherProfile.count();
    const employeeId = data.employeeId || `TCH-${String(count + 1).padStart(3, '0')}`;

    const teacher = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email.toLowerCase().trim(),
          passwordHash,
          role: 'TEACHER',
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.firstName}_${data.lastName}`,
        },
      });

      return tx.teacherProfile.create({
        data: {
          userId: user.id,
          employeeId,
          qualification: data.qualification,
          specialization: data.specialization,
          joiningDate: data.joiningDate ? new Date(data.joiningDate) : new Date(),
        },
        include: {
          user: true,
          subjects: true,
        },
      });
    });

    return sendSuccess(res, 'Teacher created successfully', teacher, 201);
  } catch (error: any) {
    return sendError(res, 'Failed to create teacher', 500, error.message);
  }
};

export const updateTeacher = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const data = req.body;

    const existing = await prisma.teacherProfile.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!existing) {
      return sendError(res, 'Teacher not found', 404);
    }

    const updated = await prisma.$transaction(async (tx) => {
      if (data.firstName || data.lastName || data.phone || data.email) {
        await tx.user.update({
          where: { id: existing.userId },
          data: {
            firstName: data.firstName || existing.user.firstName,
            lastName: data.lastName || existing.user.lastName,
            phone: data.phone !== undefined ? data.phone : existing.user.phone,
            email: data.email ? data.email.toLowerCase().trim() : existing.user.email,
          },
        });
      }

      return tx.teacherProfile.update({
        where: { id },
        data: {
          qualification: data.qualification || existing.qualification,
          specialization: data.specialization || existing.specialization,
        },
        include: {
          user: true,
          subjects: true,
        },
      });
    });

    return sendSuccess(res, 'Teacher updated successfully', updated);
  } catch (error: any) {
    return sendError(res, 'Failed to update teacher', 500, error.message);
  }
};

export const deleteTeacher = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);

    const teacher = await prisma.teacherProfile.findUnique({
      where: { id },
    });

    if (!teacher) {
      return sendError(res, 'Teacher not found', 404);
    }

    await prisma.user.delete({
      where: { id: teacher.userId },
    });

    return sendSuccess(res, 'Teacher deleted successfully');
  } catch (error: any) {
    return sendError(res, 'Failed to delete teacher', 500, error.message);
  }
};
