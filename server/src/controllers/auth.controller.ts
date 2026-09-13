import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { comparePassword, generateToken, hashPassword } from '../utils/auth';
import { sendError, sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        adminProfile: true,
        teacherProfile: {
          include: {
            subjects: true,
            sections: { include: { class: true } },
          },
        },
        studentProfile: {
          include: {
            class: true,
            section: true,
          },
        },
      },
    });

    if (!user) {
      return sendError(res, 'Invalid credentials. User not found.', 401);
    }

    if (!user.isActive) {
      return sendError(res, 'Account is inactive. Contact the administrator.', 403);
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return sendError(res, 'Invalid credentials. Incorrect password.', 401);
    }

    let profileId: string | undefined;
    let extraData: any = {};

    if (user.role === 'ADMIN') {
      profileId = user.adminProfile?.id;
      extraData = { department: user.adminProfile?.department };
    } else if (user.role === 'TEACHER') {
      profileId = user.teacherProfile?.id;
      extraData = {
        employeeId: user.teacherProfile?.employeeId,
        qualification: user.teacherProfile?.qualification,
        specialization: user.teacherProfile?.specialization,
        assignedSubjects: user.teacherProfile?.subjects,
      };
    } else if (user.role === 'STUDENT') {
      profileId = user.studentProfile?.id;
      extraData = {
        admissionNumber: user.studentProfile?.admissionNumber,
        rollNumber: user.studentProfile?.rollNumber,
        class: user.studentProfile?.class,
        section: user.studentProfile?.section,
      };
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return sendSuccess(res, 'Login successful', {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        profileId,
        ...extraData,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return sendError(res, 'An error occurred while logging in', 500, error.message);
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 'Not authenticated', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: {
        adminProfile: true,
        teacherProfile: {
          include: {
            subjects: true,
            sections: { include: { class: true } },
          },
        },
        studentProfile: {
          include: {
            class: true,
            section: true,
          },
        },
      },
    });

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    let profileId: string | undefined;
    let extraData: any = {};

    if (user.role === 'ADMIN') {
      profileId = user.adminProfile?.id;
      extraData = { department: user.adminProfile?.department };
    } else if (user.role === 'TEACHER') {
      profileId = user.teacherProfile?.id;
      extraData = {
        employeeId: user.teacherProfile?.employeeId,
        qualification: user.teacherProfile?.qualification,
        specialization: user.teacherProfile?.specialization,
        assignedSubjects: user.teacherProfile?.subjects,
      };
    } else if (user.role === 'STUDENT') {
      profileId = user.studentProfile?.id;
      extraData = {
        admissionNumber: user.studentProfile?.admissionNumber,
        rollNumber: user.studentProfile?.rollNumber,
        class: user.studentProfile?.class,
        section: user.studentProfile?.section,
      };
    }

    return sendSuccess(res, 'User profile retrieved', {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      profileId,
      ...extraData,
    });
  } catch (error: any) {
    return sendError(res, 'Failed to fetch profile', 500, error.message);
  }
};

export const demoLogin = async (req: Request, res: Response) => {
  try {
    const { role } = req.body;
    let targetEmail = 'admin@edupulse.com';

    if (role === 'TEACHER') {
      targetEmail = 'sarah.jenkins@edupulse.com';
    } else if (role === 'STUDENT') {
      targetEmail = 'alex.morgan@edupulse.com';
    }

    const user = await prisma.user.findUnique({
      where: { email: targetEmail },
      include: {
        adminProfile: true,
        teacherProfile: {
          include: {
            subjects: true,
            sections: { include: { class: true } },
          },
        },
        studentProfile: {
          include: {
            class: true,
            section: true,
          },
        },
      },
    });

    if (!user) {
      return sendError(res, `Demo account for role ${role} not found. Please run database seed.`, 404);
    }

    let profileId: string | undefined;
    let extraData: any = {};

    if (user.role === 'ADMIN') {
      profileId = user.adminProfile?.id;
      extraData = { department: user.adminProfile?.department };
    } else if (user.role === 'TEACHER') {
      profileId = user.teacherProfile?.id;
      extraData = {
        employeeId: user.teacherProfile?.employeeId,
        qualification: user.teacherProfile?.qualification,
        specialization: user.teacherProfile?.specialization,
      };
    } else if (user.role === 'STUDENT') {
      profileId = user.studentProfile?.id;
      extraData = {
        admissionNumber: user.studentProfile?.admissionNumber,
        rollNumber: user.studentProfile?.rollNumber,
        class: user.studentProfile?.class,
        section: user.studentProfile?.section,
      };
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return sendSuccess(res, `Demo login as ${user.role} successful`, {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        profileId,
        ...extraData,
      },
    });
  } catch (error: any) {
    return sendError(res, 'Demo login failed', 500, error.message);
  }
};
