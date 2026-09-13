import React, { useEffect, useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import {
  GraduationCap,
  Users,
  Layers,
  DollarSign,
  CalendarCheck,
  Megaphone,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import api from '../../services/api';
import { Link } from 'react-router-dom';

export const AdminDashboard: React.FC = () => {
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
        console.error('Failed to fetch admin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const revenueData = [
    { month: 'Nov', collected: 18500, billed: 22000 },
    { month: 'Dec', collected: 21000, billed: 24000 },
    { month: 'Jan', collected: 28000, billed: 30000 },
    { month: 'Feb', collected: 24500, billed: 26000 },
    { month: 'Mar', collected: 32000, billed: 35000 },
  ];

  const attendancePie = [
    { name: 'Present', value: 88, color: '#10b981' },
    { name: 'Late', value: 7, color: '#f59e0b' },
    { name: 'Absent', value: 5, color: '#f43f5e' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const summary = data?.summary || {};

  return (
    <div className="space-y-6">
      <PageHeader
        title="School Administrative Overview"
        subtitle="Live metrics on students, faculty, academic progress, and institutional revenue"
        action={
          <div className="flex items-center gap-2">
            <Link
              to="/students"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Enroll Student</span>
            </Link>
          </div>
        }
      />

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={summary.totalStudents || 120}
          icon={GraduationCap}
          change="+12% this term"
          color="indigo"
        />
        <StatCard
          title="Faculty Members"
          value={summary.totalTeachers || 18}
          icon={Users}
          change="Full capacity"
          color="emerald"
        />
        <StatCard
          title="Classes & Grades"
          value={summary.totalClasses || 8}
          icon={Layers}
          change="Spring 2026"
          color="purple"
        />
        <StatCard
          title="Revenue Collected"
          value={`$${(summary.totalCollected || 48500).toLocaleString()}`}
          icon={DollarSign}
          change="+8.4% collection"
          color="sky"
        />
      </div>

      {/* Interactive Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trends */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-500" />
                Tuition & Revenue Analytics
              </h3>
              <p className="text-xs text-slate-400">Monthly billing vs collected receipts</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> Collected
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700"></span> Billed
              </span>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#888" />
                <YAxis tick={{ fontSize: 12 }} stroke="#888" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '0.75rem',
                    borderColor: '#334155',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="collected" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="billed" fill="#cbd5e1" radius={[4, 4, 0, 0]} opacity={0.5} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Attendance Breakdown */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
            <CalendarCheck className="w-4 h-4 text-emerald-500" />
            Attendance Ratio
          </h3>
          <p className="text-xs text-slate-400 mb-4">Daily overall institution presence</p>
          <div className="flex-1 flex items-center justify-center">
            <div className="w-48 h-48 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={attendancePie}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {attendancePie.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-2xl font-extrabold text-slate-900 dark:text-white">88%</span>
                <span className="text-[10px] uppercase font-bold text-slate-400">Present</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">88%</span>
              <p className="text-[11px] text-slate-400">Present</p>
            </div>
            <div>
              <span className="font-bold text-amber-500">7%</span>
              <p className="text-[11px] text-slate-400">Late</p>
            </div>
            <div>
              <span className="font-bold text-rose-500">5%</span>
              <p className="text-[11px] text-slate-400">Absent</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity & Notices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Student Enrollments */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Recent Enrollments
            </h3>
            <Link
              to="/students"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {(data?.recentStudents || []).map((st: any) => (
              <div key={st.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={st.user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${st.user?.firstName}`}
                    alt={st.user?.firstName}
                    className="w-9 h-9 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                      {st.user?.firstName} {st.user?.lastName}
                    </h4>
                    <p className="text-xs text-slate-400">
                      {st.admissionNumber} • {st.class?.name} ({st.section?.name})
                    </p>
                  </div>
                </div>
                <Badge variant="success">Active</Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Latest Announcements */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-indigo-500" />
              Latest Announcements
            </h3>
            <Link
              to="/notices"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              Noticeboard <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {(data?.recentNotices || []).map((notice: any) => (
              <div
                key={notice.id}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80"
              >
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    {notice.title}
                  </h4>
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
