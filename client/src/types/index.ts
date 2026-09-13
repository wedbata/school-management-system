export type Role = 'ADMIN' | 'TEACHER' | 'STUDENT';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
export type ExamType = 'QUIZ' | 'ASSIGNMENT' | 'MIDTERM' | 'FINAL' | 'PROJECT';
export type FeeStatus = 'PAID' | 'PENDING' | 'OVERDUE' | 'PARTIAL';
export type NoticePriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type NoticeTarget = 'ALL' | 'TEACHER' | 'STUDENT';
export type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY';

export interface User {
  id: string;
  email: string;
  role: Role;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  profileId?: string;
  department?: string;
  employeeId?: string;
  qualification?: string;
  specialization?: string;
  admissionNumber?: string;
  rollNumber?: number;
  class?: Class;
  section?: Section;
  assignedSubjects?: Subject[];
}

export interface Class {
  id: string;
  name: string;
  numericGrade: number;
  description?: string;
  sections?: Section[];
  subjects?: Subject[];
  _count?: {
    students: number;
    subjects: number;
  };
}

export interface Section {
  id: string;
  name: string;
  classId: string;
  class?: Class;
  classTeacherId?: string;
  classTeacher?: Teacher;
  _count?: {
    students: number;
  };
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  classId: string;
  class?: Class;
  teacherId?: string;
  teacher?: Teacher;
  creditHours: number;
}

export interface Student {
  id: string;
  userId: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    avatarUrl?: string;
    isActive: boolean;
  };
  admissionNumber: string;
  rollNumber: number;
  dob: string;
  gender: Gender;
  bloodGroup?: string;
  address?: string;
  parentName: string;
  parentPhone: string;
  parentEmail?: string;
  emergencyPhone?: string;
  classId: string;
  class: Class;
  sectionId: string;
  section: Section;
  attendances?: AttendanceRecord[];
  grades?: GradeRecord[];
  feeInvoices?: FeeInvoice[];
}

export interface Teacher {
  id: string;
  userId: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    avatarUrl?: string;
    isActive: boolean;
  };
  employeeId: string;
  qualification: string;
  specialization: string;
  joiningDate: string;
  subjects?: Subject[];
  sections?: Section[];
}

export interface TimetablePeriod {
  id: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  roomNumber: string;
  classId: string;
  class?: Class;
  sectionId: string;
  section?: Section;
  subjectId: string;
  subject: Subject;
  teacherId: string;
  teacher?: Teacher;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  status: AttendanceStatus;
  remarks?: string;
}

export interface Exam {
  id: string;
  title: string;
  type: ExamType;
  term: string;
  maxMarks: number;
  passingMarks: number;
  examDate: string;
  subjectId: string;
  subject: Subject;
  classId: string;
  class: Class;
  _count?: {
    grades: number;
  };
}

export interface GradeRecord {
  id: string;
  marksObtained: number;
  gradeLetter: string;
  comments?: string;
  exam: Exam;
}

export interface FeeInvoice {
  id: string;
  invoiceNumber: string;
  title: string;
  amount: number;
  dueDate: string;
  status: FeeStatus;
  paidAmount: number;
  paidDate?: string;
  paymentMethod?: string;
  notes?: string;
  studentId: string;
  student?: Student;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  targetRole: NoticeTarget;
  priority: NoticePriority;
  author: {
    firstName: string;
    lastName: string;
    role: Role;
    avatarUrl?: string;
  };
  createdAt: string;
}
