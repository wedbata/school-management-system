import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/auth/LoginPage';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { DashboardRouter } from './pages/dashboard/DashboardRouter';
import { StudentsListPage } from './pages/students/StudentsListPage';
import { TeachersListPage } from './pages/teachers/TeachersListPage';
import { ClassesPage } from './pages/classes/ClassesPage';
import { TimetablePage } from './pages/timetable/TimetablePage';
import { AttendanceMarkerPage } from './pages/attendance/AttendanceMarkerPage';
import { StudentAttendanceHistoryPage } from './pages/attendance/StudentAttendanceHistoryPage';
import { ExamsListPage } from './pages/exams/ExamsListPage';
import { GradebookPage } from './pages/exams/GradebookPage';
import { ReportCardPage } from './pages/exams/ReportCardPage';
import { FeesManagementPage } from './pages/fees/FeesManagementPage';
import { NoticeboardPage } from './pages/notices/NoticeboardPage';

export const App: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Authenticated Routes */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardRouter />} />

        {/* User Management */}
        <Route
          path="/students"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'TEACHER']}>
              <StudentsListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teachers"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <TeachersListPage />
            </ProtectedRoute>
          }
        />

        {/* Academic Structure & Schedule */}
        <Route
          path="/classes"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'TEACHER']}>
              <ClassesPage />
            </ProtectedRoute>
          }
        />
        <Route path="/timetable" element={<TimetablePage />} />

        {/* Attendance */}
        <Route
          path="/attendance/mark"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'TEACHER']}>
              <AttendanceMarkerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance/history"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <StudentAttendanceHistoryPage />
            </ProtectedRoute>
          }
        />

        {/* Examinations & Grades */}
        <Route path="/exams" element={<ExamsListPage />} />
        <Route
          path="/exams/:id/gradebook"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'TEACHER']}>
              <GradebookPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/report-card"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <ReportCardPage />
            </ProtectedRoute>
          }
        />

        {/* Financials & Invoices */}
        <Route
          path="/fees"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'STUDENT']}>
              <FeesManagementPage />
            </ProtectedRoute>
          }
        />

        {/* Notices & Circulars */}
        <Route path="/notices" element={<NoticeboardPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
