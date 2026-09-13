import React, { useEffect, useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import { CalendarDays, Clock, Plus, BookOpen, User, Trash2 } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { DayOfWeek } from '../../types';

export const TimetablePage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const days: DayOfWeek[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('MONDAY');
  const [periods, setPeriods] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter
  const [selectedClass, setSelectedClass] = useState('');

  // Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [periodForm, setPeriodForm] = useState({
    dayOfWeek: 'MONDAY' as DayOfWeek,
    startTime: '08:30',
    endTime: '09:30',
    roomNumber: 'Room 101',
    classId: '',
    sectionId: '',
    subjectId: '',
    teacherId: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (selectedClass) params.classId = selectedClass;

      const [timetableRes, classesRes, teachersRes] = await Promise.all([
        api.get('/timetable', { params }),
        api.get('/classes/classes'),
        api.get('/teachers'),
      ]);

      if (timetableRes.data.success) setPeriods(timetableRes.data.data);
      if (classesRes.data.success) {
        setClasses(classesRes.data.data);
        if (classesRes.data.data.length > 0 && !periodForm.classId) {
          const firstCls = classesRes.data.data[0];
          setPeriodForm((prev) => ({
            ...prev,
            classId: firstCls.id,
            sectionId: firstCls.sections?.[0]?.id || '',
            subjectId: firstCls.subjects?.[0]?.id || '',
          }));
        }
      }
      if (teachersRes.data.success) {
        setTeachers(teachersRes.data.data);
        if (teachersRes.data.data.length > 0 && !periodForm.teacherId) {
          setPeriodForm((prev) => ({ ...prev, teacherId: teachersRes.data.data[0].id }));
        }
      }
    } catch (err) {
      console.error('Failed to load timetable:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedClass]);

  const activeClassObj = classes.find((c) => c.id === periodForm.classId);

  const handleCreatePeriod = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/timetable', periodForm);
      if (res.data.success) {
        setIsAddModalOpen(false);
        fetchData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add timetable period');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePeriod = async (id: string) => {
    if (!window.confirm('Delete this schedule slot?')) return;
    try {
      await api.delete(`/timetable/${id}`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete period');
    }
  };

  const filteredPeriods = periods.filter((p) => p.dayOfWeek === selectedDay);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Timetable & Class Schedules"
        subtitle="Weekly period schedules, assigned classroom venues, and instructor sessions"
        action={
          isAdmin && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Schedule Slot</span>
            </button>
          )
        }
      />

      {/* Class Selector Filter */}
      {isAdmin && (
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-500">Filter By Class:</span>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Classes</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Day of Week Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {days.map((day) => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              selectedDay === day
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Timetable Period Cards */}
      {loading ? (
        <div className="p-12 flex justify-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredPeriods.length === 0 ? (
        <EmptyState
          title={`No classes scheduled for ${selectedDay}`}
          description="There are no active periods assigned to this day of the week."
          icon={CalendarDays}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPeriods.map((period) => (
            <div
              key={period.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-lg">
                    <Clock className="w-3.5 h-3.5" />
                    {period.startTime} - {period.endTime}
                  </span>
                  <Badge variant="default">{period.roomNumber}</Badge>
                </div>

                <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-500" />
                  {period.subject?.name}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  {period.class?.name} • Section {period.section?.name}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 font-medium">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    Faculty: {period.teacher?.user?.firstName} {period.teacher?.user?.lastName}
                  </span>
                </div>
              </div>

              {isAdmin && (
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                  <button
                    onClick={() => handleDeletePeriod(period.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition"
                    title="Delete period"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Period Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Schedule Class Period"
      >
        <form onSubmit={handleCreatePeriod} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Day of Week *
              </label>
              <select
                value={periodForm.dayOfWeek}
                onChange={(e) => setPeriodForm({ ...periodForm, dayOfWeek: e.target.value as DayOfWeek })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                {days.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Room / Venue *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Room 204 or Lab 1"
                value={periodForm.roomNumber}
                onChange={(e) => setPeriodForm({ ...periodForm, roomNumber: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Start Time *
              </label>
              <input
                type="text"
                required
                placeholder="08:30"
                value={periodForm.startTime}
                onChange={(e) => setPeriodForm({ ...periodForm, startTime: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                End Time *
              </label>
              <input
                type="text"
                required
                placeholder="09:30"
                value={periodForm.endTime}
                onChange={(e) => setPeriodForm({ ...periodForm, endTime: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Class *
              </label>
              <select
                required
                value={periodForm.classId}
                onChange={(e) => {
                  const targetCls = classes.find((c) => c.id === e.target.value);
                  setPeriodForm({
                    ...periodForm,
                    classId: e.target.value,
                    sectionId: targetCls?.sections?.[0]?.id || '',
                    subjectId: targetCls?.subjects?.[0]?.id || '',
                  });
                }}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Section *
              </label>
              <select
                required
                value={periodForm.sectionId}
                onChange={(e) => setPeriodForm({ ...periodForm, sectionId: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                {activeClassObj?.sections?.map((sec: any) => (
                  <option key={sec.id} value={sec.id}>
                    Section {sec.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
              Subject *
            </label>
            <select
              required
              value={periodForm.subjectId}
              onChange={(e) => setPeriodForm({ ...periodForm, subjectId: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            >
              {activeClassObj?.subjects?.map((sub: any) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name} ({sub.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
              Assigned Instructor *
            </label>
            <select
              required
              value={periodForm.teacherId}
              onChange={(e) => setPeriodForm({ ...periodForm, teacherId: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            >
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.user.firstName} {t.user.lastName} ({t.specialization})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm"
            >
              {submitting ? 'Saving...' : 'Confirm Period'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
