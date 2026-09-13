import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { sendError, sendSuccess } from '../utils/response';

export const getNotices = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const role = req.user?.role || 'STUDENT';
    const where: any = {};

    if (role === 'ADMIN') {
      // Admin sees everything
    } else if (role === 'TEACHER') {
      where.targetRole = { in: ['ALL', 'TEACHER'] };
    } else if (role === 'STUDENT') {
      where.targetRole = { in: ['ALL', 'STUDENT'] };
    }

    const notices = await prisma.announcement.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: { firstName: true, lastName: true, role: true, avatarUrl: true },
        },
      },
    });

    return sendSuccess(res, 'Announcements retrieved', notices);
  } catch (error: any) {
    return sendError(res, 'Failed to fetch announcements', 500, error.message);
  }
};

export const createNotice = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, content, targetRole, priority } = req.body;
    const authorId = req.user!.userId;

    const notice = await prisma.announcement.create({
      data: {
        title,
        content,
        targetRole: targetRole || 'ALL',
        priority: priority || 'MEDIUM',
        authorId,
      },
      include: {
        author: {
          select: { firstName: true, lastName: true, role: true },
        },
      },
    });

    return sendSuccess(res, 'Announcement created successfully', notice, 201);
  } catch (error: any) {
    return sendError(res, 'Failed to create announcement', 500, error.message);
  }
};

export const updateNotice = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const { title, content, targetRole, priority } = req.body;

    const notice = await prisma.announcement.update({
      where: { id },
      data: {
        title,
        content,
        targetRole,
        priority,
      },
      include: {
        author: {
          select: { firstName: true, lastName: true, role: true },
        },
      },
    });

    return sendSuccess(res, 'Announcement updated successfully', notice);
  } catch (error: any) {
    return sendError(res, 'Failed to update announcement', 500, error.message);
  }
};

export const deleteNotice = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = String(req.params.id);

    await prisma.announcement.delete({
      where: { id },
    });

    return sendSuccess(res, 'Announcement deleted successfully');
  } catch (error: any) {
    return sendError(res, 'Failed to delete announcement', 500, error.message);
  }
};
