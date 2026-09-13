import React, { useEffect, useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import {
  Award,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  BookOpen,
  ArrowRight,
  Megaphone,
} from 'lucide-react';
import api from '../../services/api';
import { Link } from 'react-router-dom';

export const StudentDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard/stats');
        if (response.data.success) {
          setData(response.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch student dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const student = data?.student || {};
  const attendanceRate = data?.attendanceRate || 95;
  const recentGrades = data?.recentGrades || [];
  const pendingInvoices = data?.pendingInvoices || [];
  const notices = data?.notices || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Academic Portal"
        subtitle={`Enrolled in ${student.class?.name || 'Grade 10'} • Section ${student.section?.name || 'A'} • Roll #${student.rollNumber || 1}`}
        action={
          <div className="flex items-center gap-2">
            <Link
              to="/exams/my-report"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition"
            >
              <Award className="w-4 h-4" />
              <span>View Report Card</span>
            </Link>
          </div>
        }
      />

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Attendance Rate"
          value={`${attendanceRate}%`}
          icon={CheckCircle2}
          change="Eligible for exams"
          color="emerald"
        />
        <StatCard
          title="Academic Standing"
          value="3.85 GPA"
          icon={Award}
          change="Grade: A+"
          color="indigo"
        />
        <StatCard
          title="Class Schedule"
          value="5 Periods"
          icon={CalendarDays}
          change="Mon - Fri"
          color="purple"
        />
        <StatCard
          title="Tuition Dues"
          value={pendingInvoices.length > 0 ? `$${pendingInvoices[0].amount - pendingInvoices[0].paidAmount}` : '$0.00'}
          icon={CreditCard}
          change={pendingInvoices.length > 0 ? 'Pending Dues' : 'Fully Settled'}
          color={pendingInvoices.length > 0 ? 'rose' : 'emerald'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Assessment Scores */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-indigo-500" />
                Recent Academic Grades
              </h3>
              <p className="text-xs text-slate-400">Scores published by your course teachers</p>
            </div>
            <Link
              to="/exams/my-report"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              Transcript <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentGrades.map((grade: any) => (
              <div key={grade.id} className="py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {grade.exam?.subject?.name}
                    </h4>
                    <p className="text-xs text-slate-400">
                      {grade.exam?.title} ({grade.exam?.type})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {grade.marksObtained} / {grade.exam?.maxMarks}
                    </span>
                    <p className="text-[10px] text-slate-400">Marks</p>
                  </div>
                  <Badge variant="success" size="md">
                    {grade.gradeLetter}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notices & Alerts */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-indigo-500" />
              School Notices
            </h3>
            <Link
              to="/notices"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              All Notices
            </Link>
          </div>

          <div className="space-y-3 flex-1">
            {notices.map((notice: any) => (
              <div
                key={notice.id}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {notice.title}
                  </span>
                  <Badge
                    variant={notice.priority === 'HIGH' ? 'danger' : 'info'}
                    size="sm"
                  >
                    {notice.priority}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                  {notice.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
