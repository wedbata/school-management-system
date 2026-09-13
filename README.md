# 🎓 EduPulse — Full-Stack Enterprise School Management System

<div align="center">

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma_ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)

<p align="center">
  <strong>A production-ready, full-featured School Management System engineered with React, Node.js, Express, TypeScript, and PostgreSQL.</strong>
</p>

<p align="center">
  <a href="#-quick-demo--login-credentials">⚡ Instant Demo</a> •
  <a href="#-key-features--role-matrix">✨ Feature Matrix</a> •
  <a href="#-system-architecture">🏛️ Architecture</a> •
  <a href="#-database-schema">🗄️ Database Schema</a> •
  <a href="#-api-endpoints-reference">📡 REST API</a> •
  <a href="#-getting-started--local-setup">🚀 Getting Started</a> •
  <a href="#-docker-deployment">🐳 Docker Setup</a> •
  <a href="#-live-cloud-deployment">☁️ Deployment Guide</a>
</p>

</div>

---

## ⚡ Quick Demo & Login Credentials

EduPulse features **1-Click Demo Login** on the login page and a persistent **Role Switcher** bar at the top of the interface so recruiters and visitors can test any role instantly without typing credentials:

| Role | Demo Email | Password | Access Highlights |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@edupulse.com` | `admin123` | Full control: Analytics dashboard, Student/Teacher onboarding, Class/Subject creation, Timetable scheduling, Financial Invoicing, School Circulars |
| **Teacher** | `sarah.jenkins@edupulse.com` | `teacher123` | Teacher workspace: Class rosters, Interactive Batch Attendance marker with 1-click "Mark All Present", Live Gradebook spreadsheet with auto-calculated letter grades |
| **Student** | `alex.morgan@edupulse.com` | `student123` | Student portal: Timetable schedule, Attendance history log & punctuality stats, Official Printable Academic Transcript (PDF Report Card), Fee Invoices & Payment settlement |

---

## ✨ Key Features & Role Matrix

| Module | 👑 Administrator | 👨‍🏫 Teacher | 🎓 Student |
| :--- | :---: | :---: | :---: |
| **Analytics & KPIs** | School-wide enrollment, revenue, attendance & grade charts | Assigned classes, teaching hours, pending grading tasks | Attendance circular gauge, GPA breakdown, fee status alerts |
| **Student Directory** | Full CRUD, admission generation, class assignment, search & filter | Class rosters, student academic profiles | View personal academic profile |
| **Teacher Directory** | Full CRUD, department/qualification tags, subject assignment | Peer directory & personal profile | View assigned subject instructors |
| **Academic Structure** | Manage Grades, Classes, Sections, and Subjects | View assigned classes & curriculum subjects | View enrolled subjects & syllabus codes |
| **Timetable / Schedule** | Interactive weekly schedule scheduler (Mon–Sat) | Personal teaching timetable view | Class weekly schedule grid |
| **Daily Attendance** | School-wide daily attendance rate & historical records | Batch attendance marker with 1-click "Mark All Present" & status flags | Personal chronological attendance logs & punctuality metrics |
| **Exams & Assessments** | Create Midterm/Final/Quiz sessions across all classes | Manage assigned exam papers & grade weightage | View upcoming assessments schedule |
| **Gradebook & Grading** | Oversee academic performance & grade distribution | Interactive grade spreadsheet with live letter grade computation | — |
| **Academic Transcript** | Review student report cards | Generate class scorecards | **Official Printable Report Card** with signatures & remarks |
| **Fee Billing & Invoicing**| Issue tuition invoices, manage dues, record offline payments | — | View outstanding dues, settle invoices online with receipt generation |
| **School Noticeboard** | Broadcast school-wide or targeted circulars with priority flags | Post class announcements & homework notices | Real-time bulletin board feed |
| **Dark & Light Mode** | System / Manual toggle | System / Manual toggle | System / Manual toggle |

---

## 🏛️ System Architecture

EduPulse is engineered following modern full-stack best practices with clean separation of concerns, end-to-end TypeScript type safety, and stateless JWT authentication:

```
school-management-system/
├── client/                     # React 18 + Vite + TypeScript Frontend
│   ├── src/
│   │   ├── components/         # Reusable UI library (StatCards, Badges, Modals, Tables, Layout)
│   │   ├── context/            # AuthContext (JWT retention, RBAC), ThemeContext (Dark/Light)
│   │   ├── pages/              # Role-tailored dashboards and operational modules
│   │   │   ├── attendance/     # Batch Marker & Student History
│   │   │   ├── auth/           # Login with 1-Click Demo Buttons
│   │   │   ├── classes/        # Classes & Sections manager
│   │   │   ├── dashboard/      # Admin / Teacher / Student KPI Dashboards
│   │   │   ├── exams/          # Assessment Ledger, Gradebook Spreadsheet, Printable Transcript
│   │   │   ├── fees/           # Invoicing, dues tracker, payment settlement
│   │   │   ├── notices/        # Bulletin board & circulars
│   │   │   ├── students/       # Student directory & registration
│   │   │   ├── teachers/       # Faculty directory & onboarding
│   │   │   └── timetable/      # Weekly period scheduler
│   │   ├── services/           # Axios API client with automatic token interceptors
│   │   └── types/              # Unified TypeScript definitions & Enums
│   ├── Dockerfile
│   └── nginx.conf
│
├── server/                     # Node.js + Express + TypeScript Backend
│   ├── prisma/
│   │   ├── schema.prisma       # 13 PostgreSQL models, relations, cascading rules & enums
│   │   └── seed.ts             # Comprehensive realistic seeder (Users, Classes, Timetable, Exams, Fees)
│   ├── src/
│   │   ├── controllers/        # Business logic for Auth, Users, Attendance, Grades, Fees, etc.
│   │   ├── middleware/         # JWT Auth guard, Role-based RBAC, Zod validator, Global Error Handler
│   │   ├── routes/             # RESTful API route definitions
│   │   ├── schemas/            # Zod validation schemas
│   │   ├── utils/              # Password hashing, JWT signing, standard JSON response builder
│   │   └── server.ts           # Express application bootstrap
│   └── Dockerfile
│
├── .github/workflows/          # Continuous Integration (CI) build & type check workflow
├── docker-compose.yml          # Multi-container local orchestration (PostgreSQL + Backend + Client)
└── package.json                # Root orchestration workspace scripts
```

---

## 🗄️ Database Schema

The database is built on **PostgreSQL** using **Prisma ORM** with 13 relational models and strong relational integrity:

```mermaid
erDiagram
    User ||--o| AdminProfile : "has"
    User ||--o| TeacherProfile : "has"
    User ||--o| StudentProfile : "has"
    User ||--o{ Announcement : "publishes"

    Class ||--|{ Section : "contains"
    Class ||--|{ Subject : "teaches"
    Class ||--o{ StudentProfile : "enrolled"
    Section ||--o{ StudentProfile : "assigned"

    TeacherProfile ||--o{ Subject : "instructs"
    TeacherProfile ||--o{ Section : "class teacher"
    TeacherProfile ||--o{ TimetablePeriod : "teaches"

    Class ||--o{ TimetablePeriod : "schedules"
    Subject ||--o{ TimetablePeriod : "period subject"

    StudentProfile ||--o{ Attendance : "records"
    StudentProfile ||--o{ Grade : "receives"
    StudentProfile ||--o{ FeeInvoice : "billed"

    Exam ||--o{ Grade : "evaluates"
    Subject ||--o{ Exam : "assesses"
    Class ||--o{ Exam : "holds"
```

---

## 📡 API Endpoints Reference

### 🔐 Authentication (`/api/auth`)
- `POST /api/auth/login` — Login with email & password, returns JWT token & user profile
- `GET /api/auth/me` — Retrieve current authenticated user session
- `POST /api/auth/demo-login` — 1-Click instant login for `ADMIN`, `TEACHER`, or `STUDENT`

### 📊 Analytics & KPIs (`/api/dashboard`)
- `GET /api/dashboard/stats` — Role-specific KPIs (Students, revenue, class distribution, attendance rates)

### 👥 User Directories (`/api/students`, `/api/teachers`)
- `GET /api/students` — List students with search, class filter, and pagination
- `POST /api/students` — Register a new student with auto-generated admission number *(Admin only)*
- `DELETE /api/students/:id` — Remove student record *(Admin only)*
- `GET /api/teachers` — List all faculty members with qualifications & assigned subjects
- `POST /api/teachers` — Onboard a new teacher *(Admin only)*

### 🏫 Academic Structure (`/api/classes`, `/api/timetable`)
- `GET /api/classes/classes` — Get all classes with sections & subjects
- `POST /api/classes/classes` — Create a new class *(Admin only)*
- `POST /api/classes/sections` — Add a section to a class *(Admin only)*
- `POST /api/classes/subjects` — Assign a subject with code & teacher *(Admin only)*
- `GET /api/timetable` — Query weekly schedule by Class ID or Day of Week
- `POST /api/timetable` — Create/Update a timetable period *(Admin only)*

### 📅 Attendance (`/api/attendance`)
- `GET /api/attendance/class` — Get daily attendance sheet for a class & date
- `POST /api/attendance/batch` — Batch record attendance (`PRESENT`, `ABSENT`, `LATE`, `EXCUSED`) *(Teacher/Admin)*
- `GET /api/attendance/student` — Retrieve student attendance history, punctuality stats & rates

### 📝 Exams & Gradebook (`/api/exams`)
- `GET /api/exams` — List all assessments & exams
- `POST /api/exams` — Schedule an exam/quiz with max & passing marks *(Teacher/Admin)*
- `GET /api/exams/:id/gradebook` — Load gradebook spreadsheet roster for class
- `POST /api/exams/grades/batch` — Bulk save student scores with auto-calculated letter grades (`A+` to `F`) *(Teacher/Admin)*
- `GET /api/exams/report-card` — Generate official student transcript & GPA calculation *(Student)*

### 💳 Invoicing & Fees (`/api/fees`)
- `GET /api/fees` — List fee invoices with status filtering (`PAID`, `PENDING`, `OVERDUE`, `PARTIAL`)
- `POST /api/fees` — Issue a new student invoice *(Admin only)*
- `POST /api/fees/:id/pay` — Settle fees via Credit Card, Wire Transfer, or Cash with receipt record

### 📢 Noticeboard (`/api/notices`)
- `GET /api/notices` — Fetch active announcements filtered by target role and priority
- `POST /api/notices` — Post a school circular with priority tag (`HIGH`, `MEDIUM`, `LOW`) *(Teacher/Admin)*

---

## 🚀 Getting Started & Local Setup

### Prerequisites
- **Node.js**: v18.0 or higher (v20+ recommended)
- **PostgreSQL**: v14.0 or higher (or free cloud PostgreSQL like [Neon](https://neon.tech) / [Supabase](https://supabase.com))
- **npm** or **yarn** / **pnpm**

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/school-management-system.git
cd school-management-system
```

### 2. Configure Environment Variables

**Server (`/server/.env`):**
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/edupulse_db?schema=public"
JWT_SECRET="edupulse_super_secret_development_key_2026"
JWT_EXPIRES_IN="7d"
CLIENT_URL="http://localhost:5173"
```

**Client (`/client/.env`):**
```env
VITE_API_URL="http://localhost:5000/api"
```

### 3. Install Dependencies & Seed Database
```bash
# Install root, server, and client dependencies
npm run install:all

# Run database migration & populate with realistic test data
npm run db:migrate
npm run db:seed
```

### 4. Start the Application
```bash
# Starts both Backend (Port 5000) and Frontend (Port 5173) concurrently
npm run dev
```

Visit **`http://localhost:5173`** in your browser and use the **1-Click Demo Login** bar to explore!

---

## 🐳 Docker Setup

You can run the entire system (PostgreSQL + Express Server + Nginx React Frontend) in one command using Docker Compose:

```bash
# Build and start all containers
docker-compose up --build

# Once up, initialize database schema & seed inside the server container:
docker exec -it edupulse-server npx prisma migrate deploy
docker exec -it edupulse-server npm run db:seed
```

- **Frontend Client**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`
- **PostgreSQL Database**: `localhost:5432`

---

## ☁️ Live Cloud Deployment

### 1. Database (Neon / Supabase / Render)
1. Create a free PostgreSQL instance on [Neon](https://neon.tech) or [Supabase](https://supabase.com).
2. Copy the pooled connection string (`DATABASE_URL`).

### 2. Backend (Render / Railway)
1. Create a new **Web Service** pointing to `/server`.
2. Set Build Command: `npm install && npx prisma generate && npm run build`
3. Set Start Command: `npx prisma migrate deploy && npm run db:seed && node dist/server.js`
4. Add environment variables: `DATABASE_URL`, `JWT_SECRET`, `CLIENT_URL`.

### 3. Frontend (Vercel / Netlify)
1. Create a new project pointing to `/client`.
2. Framework Preset: **Vite**
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Add Environment Variable: `VITE_API_URL=https://your-backend-service.onrender.com/api`

---

## 🛡️ Security & Best Practices
- **Role-Based Access Control (RBAC)**: Enforced both on server endpoints and client-side route guards.
- **SQL Injection Prevention**: Parameterized queries handled automatically via Prisma ORM.
- **Payload Validation**: Strict Zod schemas validating all incoming request bodies.
- **Password Security**: Salting and hashing via `bcryptjs`.
- **Security Headers & CORS**: Configured with `helmet` and strict origin whitelisting.

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).

---

<div align="center">
  <sub>Built with ❤️ by iTech • Designed for scalable educational institutions.</sub>
</div>
