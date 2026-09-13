import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { hashPassword } from '../utils/auth';
import { sendError, sendSuccess } from '../utils/response';

export const getStudents = async (req: Request, res: Response) => {
  try {
    const { classId, sectionId, search, page = '1', limit = '100' } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (classId) where.classId = String(classId);
    if (sectionId) where.sectionId = String(sectionId);
    if (search) {
      where.OR = [
        { admissionNumber: { contains: String(search), mode: 'insensitive' } },
        { user: { firstName: { contains: String(search), mode: 'insensitive' } } },
        { user: { lastName: { contains: String(search), mode: 'insensitive' } } },
        { user: { email: { contains: String(search), mode: 'insensitive' } } },
      ];
    }

    const [total, students] = await Promise.all([
      prisma.studentProfile.count({ where }),
      prisma.studentProfile.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: [{ class: { numericGrade: 'asc' } }, { rollNumber: 'asc' }],
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
          class: true,
          section: true,
        },
      }),
    ]);

    return sendSuccess(
      res,
      'Students list retrieved',
      students,
      200,
      {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      }
    );
  } catch (error: any) {
    return sendError(res, 'Failed to fetch students', 500, error.message);
  }
};

export const getStudentById = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);

    const student = await prisma.studentProfile.findUnique({
      where: { id },
      include: {
        user: true,
        class: { include: { subjects: true } },
        section: true,
        attendances: {
          take: 30,
          orderBy: { date: 'desc' },
        },
        grades: {
          include: {
            exam: { include: { subject: true } },
          },
        },
        feeInvoices: {
          orderBy: { dueDate: 'desc' },
        },
      },
    });

    if (!student) {
      return sendError(res, 'Student not found', 404);
    }

    return sendSuccess(res, 'Student details retrieved', student);
  } catch (error: any) {
    return sendError(res, 'Failed to fetch student details', 500, error.message);
  }
};

export const createStudent = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const defaultPassword = data.password || 'Student@123';
    const passwordHash = await hashPassword(defaultPassword);

    // Auto-generate admission number if not provided
    const count = await prisma.studentProfile.count();
    const admissionNumber = `ADM-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    // Compute roll number if not provided
    let rollNumber = data.rollNumber;
    if (!rollNumber) {
      const highestRoll = await prisma.studentProfile.findFirst({
        where: { classId: data.classId, sectionId: data.sectionId },
        orderBy: { rollNumber: 'desc' },
      });
      rollNumber = (highestRoll?.rollNumber || 0) + 1;
    }

    const student = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email.toLowerCase().trim(),
          passwordHash,
          role: 'STUDENT',
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.firstName}_${data.lastName}`,
        },
      });

      const profile = await tx.studentProfile.create({
        data: {
          userId: user.id,
          admissionNumber,
          rollNumber,
          dob: new Date(data.dob),
          gender: data.gender,
          bloodGroup: data.bloodGroup,
          address: data.address,
          parentName: data.parentName,
          parentPhone: data.parentPhone,
          parentEmail: data.parentEmail || null,
          emergencyPhone: data.emergencyPhone || null,
          classId: data.classId,
          sectionId: data.sectionId,
        },
        include: {
          user: true,
          class: true,
          section: true,
        },
      });

      // Automatically create a default tuition fee invoice
      await tx.feeInvoice.create({
        data: {
          invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
          title: 'Term 1 Enrollment & Tuition Fee',
          amount: 850.0,
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          status: 'PENDING',
          studentId: profile.id,
        },
      });

      return profile;
    });

    return sendSuccess(res, 'Student created successfully', student, 201);
  } catch (error: any) {
    console.error('Create student error:', error);
    return sendError(res, 'Failed to create student', 500, error.message);
  }
};

export const updateStudent = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const data = req.body;

    const existing = await prisma.studentProfile.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!existing) {
      return sendError(res, 'Student not found', 404);
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

      return tx.studentProfile.update({
        where: { id },
        data: {
          classId: data.classId || existing.classId,
          sectionId: data.sectionId || existing.sectionId,
          rollNumber: data.rollNumber !== undefined ? data.rollNumber : existing.rollNumber,
          gender: data.gender || existing.gender,
          bloodGroup: data.bloodGroup || existing.bloodGroup,
          address: data.address || existing.address,
          parentName: data.parentName || existing.parentName,
          parentPhone: data.parentPhone || existing.parentPhone,
          parentEmail: data.parentEmail !== undefined ? data.parentEmail : existing.parentEmail,
        },
        include: {
          user: true,
          class: true,
          section: true,
        },
      });
    });

    return sendSuccess(res, 'Student updated successfully', updated);
  } catch (error: any) {
    return sendError(res, 'Failed to update student', 500, error.message);
  }
};

export const deleteStudent = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);

    const student = await prisma.studentProfile.findUnique({
      where: { id },
    });

    if (!student) {
      return sendError(res, 'Student not found', 404);
    }

    await prisma.user.delete({
      where: { id: student.userId },
    });

    return sendSuccess(res, 'Student deleted successfully');
  } catch (error: any) {
    return sendError(res, 'Failed to delete student', 500, error.message);
  }
};
