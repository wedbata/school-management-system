import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/auth';
import { sendError } from '../utils/response';
import prisma from '../config/prisma';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload & {
    profileId?: string;
    firstName?: string;
    lastName?: string;
  };
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Authentication required. No token provided.', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        adminProfile: true,
        teacherProfile: true,
        studentProfile: true,
      },
    });

    if (!user || !user.isActive) {
      return sendError(res, 'User not found or account is deactivated.', 401);
    }

    let profileId: string | undefined;
    if (user.role === 'ADMIN') profileId = user.adminProfile?.id;
    if (user.role === 'TEACHER') profileId = user.teacherProfile?.id;
    if (user.role === 'STUDENT') profileId = user.studentProfile?.id;

    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role,
      profileId,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    next();
  } catch (error: any) {
    return sendError(res, 'Invalid or expired authentication token.', 401, error.message);
  }
};

export const requireRole = (allowedRoles: ('ADMIN' | 'TEACHER' | 'STUDENT')[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, 'Unauthorized access.', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(
        res,
        `Forbidden: Access restricted to [${allowedRoles.join(', ')}]. Your role is ${req.user.role}.`,
        403
      );
    }

    next();
  };
};
