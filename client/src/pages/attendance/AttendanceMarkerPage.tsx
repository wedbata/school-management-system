import React, { useEffect, useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { EmptyState } from '../../components/common/EmptyState';
import { Calendar, Users, Save, CheckCheck } from 'lucide-react';
import api from '../../services/api';
import confetti from 'canvas-confetti';

export const AttendanceMarkerPage: React.FC = () => {
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load initial classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await api.get('/classes/classes');
        if (res.data.success && res.data.data.length > 0) {
          setClasses(res.data.data);
          const firstCls = res.data.data[0];
          setSelectedClassId(firstCls.id);
          setSelectedSectionId(firstCls.sections?.[0]?.id || '');
        }
      } catch (err) {
        console.error('Failed to load classes for attendance:', err);
      }
    };
    fetchClasses();
  }, []);

  // Fetch student attendance list when class/section/date changes
  const fetchStudents = async () => {
    if (!selectedClassId || !selectedSectionId) return;
    try {
      setLoading(true);
      setSuccessMessage(null);
      const res = await api.get('/attendance/class', {
        params: {
          classId: selectedClassId,
          sectionId: selectedSectionId,
          date,
        },
      });
      if (res.data.success) {
        setStudents(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch attendance roster:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [selectedClassId, selectedSectionId, date]);

  const handleStatusChange = (studentId: string, status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED') => {
    setStudents((prev) =>
      prev.map((st) => (st.studentId === studentId ? { ...st, status } : st))
    );
  };

  const handleRemarksChange = (studentId: string, remarks: string) => {
    setStudents((prev) =>
      prev.map((st) => (st.studentId === studentId ? { ...st, remarks } : st))
    );
  };

  const handleMarkAll = (status: 'PRESENT' | 'ABSENT' | 'LATE') => {
    setStudents((prev) => prev.map((st) => ({ ...st, status })));
  };

  const handleSaveAttendance = async () => {
    setSaving(true);
    try {
      const records = students.map((st) => ({
        studentId: st.studentId,
        status: st.status,
        remarks: st.remarks,
      }));

      const res = await api.post('/attendance/batch', {
        date,
        classId: selectedClassId,
        sectionId: selectedSectionId,
        records,
      });

      if (res.data.success) {
        setSuccessMessage(`Attendance saved successfully for ${records.length} students on ${date}!`);
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.7 },
        });
        setTimeout(() => setSuccessMessage(null), 4000);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const activeClass = classes.find((c) => c.id === selectedClassId);

  const presentCount = students.filter((s) => s.status === 'PRESENT').length;
  const absentCount = students.filter((s) => s.status === 'ABSENT').length;
  const lateCount = students.filter((s) => s.status === 'LATE').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Class Attendance Registry"
        subtitle="Batch record student daily presence, late arrivals, and excused absences"
      />

      {/* Control Selector Bar */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">
              Select Class
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => {
                const targetCls = classes.find((c) => c.id === e.target.value);
                setSelectedClassId(e.target.value);
                setSelectedSectionId(targetCls?.sections?.[0]?.id || '');
              }}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            >
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">
              Select Section
            </label>
            <select
              value={selectedSectionId}
              onChange={(e) => setSelectedSectionId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            >
              {activeClass?.sections?.map((sec: any) => (
                <option key={sec.id} value={sec.id}>
                  Section {sec.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Attendance Date</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Quick Batch Tools & Counters */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 uppercase mr-1">
              Quick Actions:
            </span>
            <button
              onClick={() => handleMarkAll('PRESENT')}
              className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 text-xs font-semibold transition"
            >
              Mark All Present
            </button>
            <button
              onClick={() => handleMarkAll('ABSENT')}
              className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 text-xs font-semibold transition"
            >
              Mark All Absent
            </button>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold">
            <span className="text-emerald-600 dark:text-emerald-400">
              Present: {presentCount}
            </span>
            <span className="text-rose-600 dark:text-rose-400">
              Absent: {absentCount}
            </span>
            <span className="text-amber-600 dark:text-amber-400">
              Late: {lateCount}
            </span>
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCheck className="w-5 h-5" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Student Roster Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : students.length === 0 ? (
          <EmptyState
            title="No students in this section"
            description="No active students are currently assigned to this class and section."
            icon={Users}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3.5 px-6">Roll #</th>
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Status Selector</th>
                  <th className="py-3.5 px-6">Remarks / Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {students.map((st) => (
                  <tr
                    key={st.studentId}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="py-3.5 px-6 font-mono font-bold text-slate-900 dark:text-white">
                      #{st.rollNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={st.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${st.name}`}
                          alt={st.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div>
                          <span className="font-semibold text-slate-900 dark:text-white block">
                            {st.name}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">
                            {st.admissionNumber}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="inline-flex rounded-xl p-1 bg-slate-100 dark:bg-slate-800 gap-1">
                        <button
                          type="button"
                          onClick={() => handleStatusChange(st.studentId, 'PRESENT')}
                          className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                            st.status === 'PRESENT'
                              ? 'bg-emerald-500 text-white shadow-sm'
                              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          Present
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(st.studentId, 'LATE')}
                          className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                            st.status === 'LATE'
                              ? 'bg-amber-500 text-white shadow-sm'
                              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          Late
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(st.studentId, 'ABSENT')}
                          className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                            st.status === 'ABSENT'
                              ? 'bg-rose-500 text-white shadow-sm'
                              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          Absent
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(st.studentId, 'EXCUSED')}
                          className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                            st.status === 'EXCUSED'
                              ? 'bg-sky-500 text-white shadow-sm'
                              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          Excused
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5 px-6">
                      <input
                        type="text"
                        placeholder="e.g. Doctor appointment note"
                        value={st.remarks || ''}
                        onChange={(e) => handleRemarksChange(st.studentId, e.target.value)}
                        className="w-full max-w-xs px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Save Bar */}
        {students.length > 0 && (
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex justify-end">
            <button
              onClick={handleSaveAttendance}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving Records...' : 'Save Daily Attendance'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
