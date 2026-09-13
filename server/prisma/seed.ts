import { PrismaClient, Role, Gender, AttendanceStatus, ExamType, FeeStatus, NoticePriority, NoticeTarget, DayOfWeek } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting EduPulse Database Seeding...');

  // 1. Clean existing records in correct order
  await prisma.grade.deleteMany();
  await prisma.exam.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.feeInvoice.deleteMany();
  await prisma.timetablePeriod.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.section.deleteMany();
  await prisma.class.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.teacherProfile.deleteMany();
  await prisma.adminProfile.deleteMany();
  await prisma.user.deleteMany();

  const defaultPasswordHash = await bcrypt.hash('Password@123', 10);
  const adminPasswordHash = await bcrypt.hash('Admin@123', 10);
  const teacherPasswordHash = await bcrypt.hash('Teacher@123', 10);
  const studentPasswordHash = await bcrypt.hash('Student@123', 10);

  // 2. Create Admin User
  console.log('Creating Admin account...');
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@edupulse.com',
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      firstName: 'Dr. Arthur',
      lastName: 'Pendelton',
      phone: '+1 (555) 019-2834',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      adminProfile: {
        create: {
          department: 'Principal Office & Administration',
        },
      },
    },
  });

  // 3. Create Classes
  console.log('Creating Classes & Sections...');
  const grade9 = await prisma.class.create({
    data: {
      name: 'Grade 9',
      numericGrade: 9,
      description: 'Freshman Year Secondary Curriculum',
      sections: {
        create: [{ name: 'A' }, { name: 'B' }],
      },
    },
    include: { sections: true },
  });

  const grade10 = await prisma.class.create({
    data: {
      name: 'Grade 10',
      numericGrade: 10,
      description: 'Sophomore Year Secondary Curriculum',
      sections: {
        create: [{ name: 'A' }, { name: 'B' }],
      },
    },
    include: { sections: true },
  });

  const grade11 = await prisma.class.create({
    data: {
      name: 'Grade 11',
      numericGrade: 11,
      description: 'Junior High Academic Preparation',
      sections: {
        create: [{ name: 'A' }],
      },
    },
    include: { sections: true },
  });

  // 4. Create Teachers
  console.log('Creating Teachers...');
  const teacher1User = await prisma.user.create({
    data: {
      email: 'sarah.jenkins@edupulse.com',
      passwordHash: teacherPasswordHash,
      role: Role.TEACHER,
      firstName: 'Sarah',
      lastName: 'Jenkins',
      phone: '+1 (555) 234-5678',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      teacherProfile: {
        create: {
          employeeId: 'TCH-001',
          qualification: 'M.Sc. Pure Mathematics, MIT',
          specialization: 'Advanced Calculus & Algebra',
        },
      },
    },
    include: { teacherProfile: true },
  });

  const teacher2User = await prisma.user.create({
    data: {
      email: 'michael.chang@edupulse.com',
      passwordHash: teacherPasswordHash,
      role: Role.TEACHER,
      firstName: 'Michael',
      lastName: 'Chang',
      phone: '+1 (555) 345-6789',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      teacherProfile: {
        create: {
          employeeId: 'TCH-002',
          qualification: 'Ph.D. Physics, Stanford University',
          specialization: 'Theoretical & Applied Physics',
        },
      },
    },
    include: { teacherProfile: true },
  });

  const teacher3User = await prisma.user.create({
    data: {
      email: 'emily.watson@edupulse.com',
      passwordHash: teacherPasswordHash,
      role: Role.TEACHER,
      firstName: 'Emily',
      lastName: 'Watson',
      phone: '+1 (555) 456-7890',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      teacherProfile: {
        create: {
          employeeId: 'TCH-003',
          qualification: 'M.A. English Literature, Oxford',
          specialization: 'Modern Literature & Composition',
        },
      },
    },
    include: { teacherProfile: true },
  });

  // Assign class teacher
  await prisma.section.update({
    where: { id: grade10.sections[0].id },
    data: { classTeacherId: teacher1User.teacherProfile!.id },
  });

  // 5. Create Subjects
  console.log('Creating Subjects...');
  const math10 = await prisma.subject.create({
    data: {
      name: 'Advanced Mathematics',
      code: 'MTH-101',
      classId: grade10.id,
      teacherId: teacher1User.teacherProfile!.id,
      creditHours: 4,
    },
  });

  const physics10 = await prisma.subject.create({
    data: {
      name: 'General Physics & Lab',
      code: 'PHY-101',
      classId: grade10.id,
      teacherId: teacher2User.teacherProfile!.id,
      creditHours: 4,
    },
  });

  const english10 = await prisma.subject.create({
    data: {
      name: 'World Literature & Writing',
      code: 'ENG-101',
      classId: grade10.id,
      teacherId: teacher3User.teacherProfile!.id,
      creditHours: 3,
    },
  });

  const cs10 = await prisma.subject.create({
    data: {
      name: 'Computer Science & AI Basics',
      code: 'CSC-101',
      classId: grade10.id,
      teacherId: teacher2User.teacherProfile!.id,
      creditHours: 3,
    },
  });

  // 6. Create Students
  console.log('Creating Students...');
  const studentData = [
    {
      firstName: 'Alex',
      lastName: 'Morgan',
      email: 'alex.morgan@edupulse.com',
      gender: Gender.MALE,
      roll: 1,
      parent: 'David Morgan',
      phone: '+1 (555) 601-1101',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    },
    {
      firstName: 'Sophia',
      lastName: 'Martinez',
      email: 'sophia.martinez@edupulse.com',
      gender: Gender.FEMALE,
      roll: 2,
      parent: 'Elena Martinez',
      phone: '+1 (555) 601-1102',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    },
    {
      firstName: 'Liam',
      lastName: 'Johnson',
      email: 'liam.johnson@edupulse.com',
      gender: Gender.MALE,
      roll: 3,
      parent: 'Robert Johnson',
      phone: '+1 (555) 601-1103',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
    {
      firstName: 'Olivia',
      lastName: 'Davis',
      email: 'olivia.davis@edupulse.com',
      gender: Gender.FEMALE,
      roll: 4,
      parent: 'Claire Davis',
      phone: '+1 (555) 601-1104',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    },
    {
      firstName: 'Ethan',
      lastName: 'Brown',
      email: 'ethan.brown@edupulse.com',
      gender: Gender.MALE,
      roll: 5,
      parent: 'James Brown',
      phone: '+1 (555) 601-1105',
      avatar: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&auto=format&fit=crop&q=80',
    },
  ];

  const createdStudents = [];
  for (let i = 0; i < studentData.length; i++) {
    const s = studentData[i];
    const user = await prisma.user.create({
      data: {
        email: s.email,
        passwordHash: studentPasswordHash,
        role: Role.STUDENT,
        firstName: s.firstName,
        lastName: s.lastName,
        phone: s.phone,
        avatarUrl: s.avatar,
        studentProfile: {
          create: {
            admissionNumber: `ADM-2026-${String(i + 1).padStart(4, '0')}`,
            rollNumber: s.roll,
            dob: new Date('2009-04-15'),
            gender: s.gender,
            bloodGroup: 'O+',
            address: `${100 + i} Highland Ave, Springfield`,
            parentName: s.parent,
            parentPhone: s.phone,
            parentEmail: `parent.${s.lastName.toLowerCase()}@example.com`,
            classId: grade10.id,
            sectionId: grade10.sections[0].id,
          },
        },
      },
      include: { studentProfile: true },
    });
    createdStudents.push(user.studentProfile!);
  }

  // 7. Create Timetable for Grade 10-A
  console.log('Creating Timetable periods...');
  const scheduleSlots = [
    { day: DayOfWeek.MONDAY, start: '08:30', end: '09:30', room: 'Room 101', subjectId: math10.id, teacherId: teacher1User.teacherProfile!.id },
    { day: DayOfWeek.MONDAY, start: '09:45', end: '10:45', room: 'Lab 2', subjectId: physics10.id, teacherId: teacher2User.teacherProfile!.id },
    { day: DayOfWeek.MONDAY, start: '11:00', end: '12:00', room: 'Room 101', subjectId: english10.id, teacherId: teacher3User.teacherProfile!.id },
    { day: DayOfWeek.TUESDAY, start: '08:30', end: '09:30', room: 'Room 101', subjectId: cs10.id, teacherId: teacher2User.teacherProfile!.id },
    { day: DayOfWeek.TUESDAY, start: '09:45', end: '10:45', room: 'Room 101', subjectId: math10.id, teacherId: teacher1User.teacherProfile!.id },
    { day: DayOfWeek.WEDNESDAY, start: '08:30', end: '09:30', room: 'Lab 2', subjectId: physics10.id, teacherId: teacher2User.teacherProfile!.id },
    { day: DayOfWeek.WEDNESDAY, start: '10:00', end: '11:00', room: 'Room 101', subjectId: english10.id, teacherId: teacher3User.teacherProfile!.id },
    { day: DayOfWeek.THURSDAY, start: '08:30', end: '09:30', room: 'Room 101', subjectId: math10.id, teacherId: teacher1User.teacherProfile!.id },
    { day: DayOfWeek.THURSDAY, start: '10:00', end: '11:00', room: 'Computer Lab 1', subjectId: cs10.id, teacherId: teacher2User.teacherProfile!.id },
    { day: DayOfWeek.FRIDAY, start: '09:00', end: '10:00', room: 'Room 101', subjectId: english10.id, teacherId: teacher3User.teacherProfile!.id },
  ];

  for (const slot of scheduleSlots) {
    await prisma.timetablePeriod.create({
      data: {
        dayOfWeek: slot.day,
        startTime: slot.start,
        endTime: slot.end,
        roomNumber: slot.room,
        classId: grade10.id,
        sectionId: grade10.sections[0].id,
        subjectId: slot.subjectId,
        teacherId: slot.teacherId,
      },
    });
  }

  // 8. Create Attendance Records for the past 7 days
  console.log('Generating Attendance records...');
  const today = new Date();
  for (let d = 0; d < 7; d++) {
    const recordDate = new Date(today);
    recordDate.setDate(today.getDate() - d);
    recordDate.setHours(0, 0, 0, 0);

    for (const student of createdStudents) {
      const isAbsent = Math.random() < 0.1;
      const isLate = !isAbsent && Math.random() < 0.15;
      const status = isAbsent ? AttendanceStatus.ABSENT : isLate ? AttendanceStatus.LATE : AttendanceStatus.PRESENT;

      await prisma.attendance.create({
        data: {
          date: recordDate,
          status,
          studentId: student.id,
          recordedById: teacher1User.teacherProfile!.id,
          remarks: isAbsent ? 'Medical leave requested' : isLate ? 'Bus delay' : 'On time',
        },
      });
    }
  }

  // 9. Create Exams & Grades
  console.log('Creating Exams and Grades...');
  const examMath = await prisma.exam.create({
    data: {
      title: 'Mid-Term Exam 2026: Calculus & Algebra',
      type: ExamType.MIDTERM,
      term: 'Spring 2026',
      maxMarks: 100,
      passingMarks: 40,
      examDate: new Date('2026-03-10'),
      subjectId: math10.id,
      classId: grade10.id,
    },
  });

  const examPhysics = await prisma.exam.create({
    data: {
      title: 'Mid-Term Exam 2026: Mechanics & Waves',
      type: ExamType.MIDTERM,
      term: 'Spring 2026',
      maxMarks: 100,
      passingMarks: 40,
      examDate: new Date('2026-03-12'),
      subjectId: physics10.id,
      classId: grade10.id,
    },
  });

  const examEnglish = await prisma.exam.create({
    data: {
      title: 'Essay Assessment: Literary Analysis',
      type: ExamType.ASSIGNMENT,
      term: 'Spring 2026',
      maxMarks: 50,
      passingMarks: 20,
      examDate: new Date('2026-03-05'),
      subjectId: english10.id,
      classId: grade10.id,
    },
  });

  // Assign realistic grades
  const sampleScores = [92, 88, 76, 95, 68];
  for (let i = 0; i < createdStudents.length; i++) {
    const student = createdStudents[i];
    const scoreMath = sampleScores[i];
    const scorePhys = Math.max(45, scoreMath - Math.floor(Math.random() * 10));
    const scoreEng = Math.floor(sampleScores[i] / 2);

    await prisma.grade.create({
      data: {
        examId: examMath.id,
        studentId: student.id,
        marksObtained: scoreMath,
        gradeLetter: scoreMath >= 90 ? 'A+' : scoreMath >= 80 ? 'A' : scoreMath >= 70 ? 'B' : 'C',
        comments: 'Excellent grasp of algebraic proofs and derivation.',
      },
    });

    await prisma.grade.create({
      data: {
        examId: examPhysics.id,
        studentId: student.id,
        marksObtained: scorePhys,
        gradeLetter: scorePhys >= 90 ? 'A+' : scorePhys >= 80 ? 'A' : scorePhys >= 70 ? 'B' : 'C',
        comments: 'Solid laboratory work and theoretical problem solving.',
      },
    });

    await prisma.grade.create({
      data: {
        examId: examEnglish.id,
        studentId: student.id,
        marksObtained: scoreEng,
        gradeLetter: scoreEng >= 45 ? 'A+' : scoreEng >= 40 ? 'A' : 'B',
        comments: 'Thoughtful critique of theme and character arcs.',
      },
    });
  }

  // 10. Create Fee Invoices
  console.log('Generating Fee Invoices...');
  for (let i = 0; i < createdStudents.length; i++) {
    const student = createdStudents[i];

    // Term 1 tuition - Paid
    await prisma.feeInvoice.create({
      data: {
        invoiceNumber: `INV-2026-${String(i * 2 + 1).padStart(4, '0')}`,
        title: 'Spring 2026 Academic Tuition Fee',
        amount: 1250.0,
        paidAmount: 1250.0,
        dueDate: new Date('2026-02-01'),
        status: FeeStatus.PAID,
        paidDate: new Date('2026-01-25'),
        paymentMethod: 'Credit Card (Online Portal)',
        notes: 'Full tuition settled with early enrollment rebate.',
        studentId: student.id,
      },
    });

    // Lab & Tech Fee - Pending/Overdue
    const isPending = i % 2 === 0;
    await prisma.feeInvoice.create({
      data: {
        invoiceNumber: `INV-2026-${String(i * 2 + 2).padStart(4, '0')}`,
        title: 'Science Lab & Digital Library Access Fee',
        amount: 350.0,
        paidAmount: isPending ? 0 : 350.0,
        dueDate: new Date('2026-04-15'),
        status: isPending ? FeeStatus.PENDING : FeeStatus.PAID,
        paidDate: isPending ? null : new Date(),
        paymentMethod: isPending ? null : 'Bank Transfer',
        notes: 'Annual laboratory consumables and cloud software licensing.',
        studentId: student.id,
      },
    });
  }

  // 11. Create Announcements
  console.log('Publishing Announcements...');
  await prisma.announcement.create({
    data: {
      title: 'Spring Semester Mid-Term Examination Schedule Released',
      content:
        'The comprehensive schedule for Spring 2026 Mid-Term Examinations is now officially published. Please review your personalized timetable and study materials under the Exams module.',
      targetRole: NoticeTarget.ALL,
      priority: NoticePriority.HIGH,
      authorId: adminUser.id,
    },
  });

  await prisma.announcement.create({
    data: {
      title: 'Annual Science Fair & Innovation Expo 2026',
      content:
        'Submissions for project abstracts are open until April 10th. Students interested in robotics, environmental science, or AI projects should register with Dr. Chang.',
      targetRole: NoticeTarget.ALL,
      priority: NoticePriority.MEDIUM,
      authorId: teacher2User.id,
    },
  });

  await prisma.announcement.create({
    data: {
      title: 'Staff Development Workshop - AI Tools in Curriculum',
      content:
        'Mandatory faculty training on Friday at 3:30 PM in the Conference Hall. We will explore new digital grading tools and collaborative syllabus planning.',
      targetRole: NoticeTarget.TEACHER,
      priority: NoticePriority.HIGH,
      authorId: adminUser.id,
    },
  });

  console.log('✅ EduPulse Seed Completed Successfully!');
  console.log('--------------------------------------------------');
  console.log('Demo Login Credentials:');
  console.log('👑 Admin:   admin@edupulse.com         / Admin@123');
  console.log('👩‍🏫 Teacher: sarah.jenkins@edupulse.com  / Teacher@123');
  console.log('🎓 Student: alex.morgan@edupulse.com    / Student@123');
  console.log('--------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
