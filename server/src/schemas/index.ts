import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address format'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export const studentCreateSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).optional(),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  phone: z.string().optional(),
  dob: z.string().or(z.date()),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  bloodGroup: z.string().optional(),
  address: z.string().optional(),
  parentName: z.string().min(2),
  parentPhone: z.string().min(5),
  parentEmail: z.string().email().optional().or(z.literal('')),
  emergencyPhone: z.string().optional(),
  classId: z.string().uuid(),
  sectionId: z.string().uuid(),
  rollNumber: z.number().int().positive().optional(),
});

export const teacherCreateSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).optional(),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  phone: z.string().optional(),
  qualification: z.string().min(2),
  specialization: z.string().min(2),
  employeeId: z.string().optional(),
});

export const attendanceBatchSchema = z.object({
  date: z.string().or(z.date()),
  classId: z.string().uuid(),
  sectionId: z.string().uuid(),
  records: z.array(
    z.object({
      studentId: z.string().uuid(),
      status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED']),
      remarks: z.string().optional(),
    })
  ),
});

export const examCreateSchema = z.object({
  title: z.string().min(3),
  type: z.enum(['QUIZ', 'ASSIGNMENT', 'MIDTERM', 'FINAL', 'PROJECT']),
  term: z.string().min(2),
  maxMarks: z.number().positive(),
  passingMarks: z.number().positive(),
  examDate: z.string().or(z.date()),
  subjectId: z.string().uuid(),
  classId: z.string().uuid(),
});

export const gradeBatchSchema = z.object({
  examId: z.string().uuid(),
  grades: z.array(
    z.object({
      studentId: z.string().uuid(),
      marksObtained: z.number().min(0),
      comments: z.string().optional(),
    })
  ),
});

export const feeInvoiceCreateSchema = z.object({
  studentId: z.string().uuid(),
  title: z.string().min(3),
  amount: z.number().positive(),
  dueDate: z.string().or(z.date()),
  notes: z.string().optional(),
});

export const feePaymentSchema = z.object({
  paidAmount: z.number().positive(),
  paymentMethod: z.string().min(2),
  notes: z.string().optional(),
});

export const announcementSchema = z.object({
  title: z.string().min(3),
  content: z.string().min(5),
  targetRole: z.enum(['ALL', 'TEACHER', 'STUDENT']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
});

export const noticeCreateSchema = announcementSchema;
