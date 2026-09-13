import React, { useEffect, useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { CheckCircle2, Calendar, Clock, AlertTriangle } from 'lucide-react';
import api from '../../services/api';

export const StudentAttendanceHistoryPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const res = await api.get('/attendance/student');
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load attendance history:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="p-12 flex justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const counts = data?.counts || { PRESENT: 0, ABSENT: 0, LATE: 0, EXCUSED: 0, TOTAL: 0 };
  const rate = data?.rate || 100;
  const records = data?.records || [];

  const statusVariants: any = {
    PRESENT: 'success',
    ABSENT: 'danger',
    LATE: 'warning',
    EXCUSED: 'info',
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Attendance Log"
        subtitle="Historical daily class attendance logs, punctuality metrics, and absence records"
      />

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Overall Attendance"
          value={`${rate}%`}
          icon={CheckCircle2}
          color="emerald"
          change="Good standing"
        />
        <StatCard
          title="Days Present"
          value={counts.PRESENT}
          icon={Calendar}
          color="indigo"
        />
        <StatCard
          title="Late Arrivals"
          value={counts.LATE}
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Days Absent"
          value={counts.ABSENT}
          icon={AlertTriangle}
          color="rose"
        />
      </div>

      {/* Attendance History Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Daily Attendance Records
          </h3>
          <p className="text-xs text-slate-400">Chronological attendance timestamps</p>
        </div>

        {records.length === 0 ? (
          <EmptyState
            title="No records found"
            description="No attendance logs have been recorded for your account yet."
            icon={Calendar}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3.5 px-6">Date</th>
                  <th className="py-3.5 px-4">Day</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-6">Notes / Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {records.map((r: any) => {
                  const recordDate = new Date(r.date);
                  return (
                    <tr
                      key={r.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="py-3.5 px-6 font-medium text-slate-900 dark:text-white">
                        {recordDate.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500">
                        {recordDate.toLocaleDateString('en-US', { weekday: 'long' })}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant={statusVariants[r.status] || 'default'}>
                          {r.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-6 text-xs text-slate-500 dark:text-slate-400">
                        {r.remarks || 'Regular class attendance'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
