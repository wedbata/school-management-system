import React, { useEffect, useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import {
  CalendarDays,
  Award,
  CheckCircle2,
  BookOpen,
  Clock,
  MapPin,
  ArrowRight,
  Megaphone,
} from 'lucide-react';
import api from '../../services/api';
import { Link } from 'react-router-dom';

export const TeacherDashboard: React.FC = () => {
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
        console.error('Failed to fetch teacher dashboard:', err);
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

  const todaySchedule = data?.todaySchedule || [];
  const recentExams = data?.recentExams || [];
  const notices = data?.notices || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Faculty Dashboard"
        subtitle="Manage daily lecture periods, student attendance, syllabus subjects, and exam grading"
        action={
          <div className="flex items-center gap-2">
            <Link
              to="/attendance"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Mark Today's Attendance</span>
            </Link>
          </div>
        }
      />

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Today's Classes"
          value={todaySchedule.length || 3}
          icon={CalendarDays}
          change="Scheduled today"
          color="indigo"
        />
        <StatCard
          title="Active Exams / Quizzes"
          value={recentExams.length || 2}
          icon={Award}
          change="Grading active"
          color="emerald"
        />
        <StatCard
          title="Faculty Notices"
          value={notices.length || 3}
          icon={Megaphone}
          change="Updated this week"
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule Timeline */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-indigo-500" />
                Today's Teaching Schedule
              </h3>
              <p className="text-xs text-slate-400">Class timetable periods for today</p>
            </div>
            <Link
              to="/timetable"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              Full Schedule <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {todaySchedule.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              No class periods scheduled for today.
            </div>
          ) : (
            <div className="space-y-3">
              {todaySchedule.map((slot: any) => (
                <div
                  key={slot.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {slot.subject?.name}
                      </h4>
                      <p className="text-xs text-slate-400">
                        {slot.class?.name} • Section {slot.section?.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-3 sm:mt-0 text-xs font-medium text-slate-600 dark:text-slate-300">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {slot.startTime} - {slot.endTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {slot.roomNumber}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Grading & Assessments */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-500" />
              Assessments & Grading
            </h3>
            <Link
              to="/exams"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Gradebook
            </Link>
          </div>

          <div className="space-y-3 flex-1">
            {recentExams.map((exam: any) => (
              <div
                key={exam.id}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {exam.title}
                  </span>
                  <Badge variant="purple" size="sm">{exam.type}</Badge>
                </div>
                <p className="text-[11px] text-slate-400">
                  {exam.subject?.name} • Max Marks: {exam.maxMarks}
                </p>
                <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <span className="text-[11px] font-medium text-slate-500">
                    {exam._count?.grades || 0} Graded
                  </span>
                  <Link
                    to={`/exams/${exam.id}/gradebook`}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    Enter Marks <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
