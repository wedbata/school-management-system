import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { calculateGradeLetter } from '../utils/auth';
import { sendError, sendSuccess } from '../utils/response';

export const getExams = async (req: Request, res: Response) => {
  try {
    const { classId, subjectId } = req.query;
    const where: any = {};

    if (classId) where.classId = String(classId);
    if (subjectId) where.subjectId = String(subjectId);

    const exams = await prisma.exam.findMany({
      where,
      orderBy: { examDate: 'desc' },
      include: {
        subject: true,
        class: true,
        _count: { select: { grades: true } },
      },
    });

    return sendSuccess(res, 'Exams retrieved', exams);
  } catch (error: any) {
    return sendError(res, 'Failed to fetch exams', 500, error.message);
  }
};

export const createExam = async (req: Request, res: Response) => {
  try {
    const { title, type, term, maxMarks, passingMarks, examDate, subjectId, classId } = req.body;

    const exam = await prisma.exam.create({
      data: {
        title,
        type,
        term,
        maxMarks: parseFloat(maxMarks),
        passingMarks: parseFloat(passingMarks || 40),
        examDate: new Date(examDate),
        subjectId,
        classId,
      },
      include: {
        subject: true,
        class: true,
      },
    });

    return sendSuccess(res, 'Exam created successfully', exam, 201);
  } catch (error: any) {
    return sendError(res, 'Failed to create exam', 500, error.message);
  }
};

export const updateExam = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { title, type, term, maxMarks, passingMarks, examDate, subjectId, classId } = req.body;

    const exam = await prisma.exam.update({
      where: { id },
      data: {
        title,
        type,
        term,
        maxMarks: maxMarks ? parseFloat(maxMarks) : undefined,
        passingMarks: passingMarks !== undefined ? parseFloat(passingMarks) : undefined,
        examDate: examDate ? new Date(examDate) : undefined,
        subjectId,
        classId,
      },
      include: {
        subject: true,
        class: true,
      },
    });

    return sendSuccess(res, 'Exam updated successfully', exam);
  } catch (error: any) {
    return sendError(res, 'Failed to update exam', 500, error.message);
  }
};

export const deleteExam = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);

    await prisma.exam.delete({
      where: { id },
    });

    return sendSuccess(res, 'Exam deleted successfully');
  } catch (error: any) {
    return sendError(res, 'Failed to delete exam', 500, error.message);
  }
};

export const getExamGradebook = async (req: Request, res: Response) => {
  try {
    const examId = String(req.params.id);

    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        subject: true,
        class: {
          include: {
            students: {
              orderBy: { rollNumber: 'asc' },
              include: {
                user: { select: { firstName: true, lastName: true } },
                section: true,
              },
            },
          },
        },
        grades: true,
      },
    });

    if (!exam) return sendError(res, 'Exam not found', 404);

    const gradesMap = new Map((exam.grades as any[]).map((g) => [g.studentId, g]));

    const roster = (exam.class.students as any[]).map((st) => {
      const existingGrade = gradesMap.get(st.id);
      return {
        studentId: st.id,
        rollNumber: st.rollNumber,
        studentName: `${st.user.firstName} ${st.user.lastName}`,
        sectionName: st.section.name,
        marksObtained: existingGrade ? existingGrade.marksObtained : 0,
        gradeLetter: existingGrade ? existingGrade.gradeLetter : '-',
        comments: existingGrade?.comments || '',
      };
    });

    return sendSuccess(res, 'Gradebook sheet retrieved', {
      exam,
      roster,
    });
  } catch (error: any) {
    return sendError(res, 'Failed to fetch gradebook', 500, error.message);
  }
};

export const recordBatchGrades = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { examId, grades } = req.body;

    const exam = await prisma.exam.findUnique({
      where: { id: examId },
    });

    if (!exam) return sendError(res, 'Exam not found', 404);

    const updates = await prisma.$transaction(
      grades.map((g: { studentId: string; marksObtained: number; comments?: string }) => {
        const gradeLetter = calculateGradeLetter(g.marksObtained, exam.maxMarks);
        return prisma.grade.upsert({
          where: {
            examId_studentId: {
              examId,
              studentId: g.studentId,
            },
          },
          update: {
            marksObtained: g.marksObtained,
            gradeLetter,
            comments: g.comments,
          },
          create: {
            examId,
            studentId: g.studentId,
            marksObtained: g.marksObtained,
            gradeLetter,
            comments: g.comments,
          },
        });
      })
    );

    return sendSuccess(res, `Recorded ${updates.length} grades successfully`, updates);
  } catch (error: any) {
    return sendError(res, 'Failed to record grades', 500, error.message);
  }
};

export const getStudentReportCard = async (req: AuthenticatedRequest, res: Response) => {
  try {
    let studentId = (req.query.studentId as string) || (req.params.studentId as string);

    if (!studentId && req.user?.role === 'STUDENT') {
      studentId = req.user.profileId!;
    }

    if (!studentId) {
      // Default to first student if admin/teacher requests without studentId
      const firstStudent = await prisma.studentProfile.findFirst();
      if (firstStudent) studentId = firstStudent.id;
    }

    if (!studentId) return sendError(res, 'Student ID required', 400);

    const student = await prisma.studentProfile.findUnique({
      where: { id: String(studentId) },
      include: {
        user: true,
        class: true,
        section: true,
        grades: {
          include: {
            exam: {
              include: { subject: true },
            },
          },
        },
      },
    });

    if (!student) return sendError(res, 'Student not found', 404);

    let totalMarks = 0;
    let totalMaxMarks = 0;

    const subjectsSummary: any[] = (student.grades as any[]).map((g) => {
      totalMarks += g.marksObtained;
      totalMaxMarks += g.exam.maxMarks;

      return {
        subject: g.exam.subject.name,
        subjectCode: g.exam.subject.code,
        examTitle: g.exam.title,
        examType: g.exam.type,
        marksObtained: g.marksObtained,
        maxMarks: g.exam.maxMarks,
        gradeLetter: g.gradeLetter,
        comments: g.comments,
      };
    });

    const overallPercentage = totalMaxMarks > 0 ? ((totalMarks / totalMaxMarks) * 100).toFixed(1) : '0';
    const overallGrade = calculateGradeLetter(totalMarks, totalMaxMarks || 100);

    return sendSuccess(res, 'Student report card', {
      student: {
        id: student.id,
        name: `${student.user.firstName} ${student.user.lastName}`,
        admissionNumber: student.admissionNumber,
        rollNumber: student.rollNumber,
        class: `${student.class.name} - ${student.section.name}`,
      },
      overallPercentage: parseFloat(overallPercentage),
      overallGrade,
      totalMarks,
      totalMaxMarks,
      subjects: subjectsSummary,
    });
  } catch (error: any) {
    return sendError(res, 'Failed to fetch report card', 500, error.message);
  }
};
