import React, { useEffect, useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import { Layers, Plus, BookOpen, Users, GraduationCap } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const ClassesPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [classes, setClasses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [classForm, setClassForm] = useState({
    name: '',
    numericGrade: 10,
    description: '',
    sections: ['A', 'B'],
  });

  const [subjectForm, setSubjectForm] = useState({
    name: '',
    code: '',
    classId: '',
    teacherId: '',
    creditHours: 3,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [classRes, teacherRes] = await Promise.all([
        api.get('/classes/classes'),
        api.get('/teachers'),
      ]);

      if (classRes.data.success) {
        setClasses(classRes.data.data);
        if (classRes.data.data.length > 0 && !subjectForm.classId) {
          setSubjectForm((prev) => ({ ...prev, classId: classRes.data.data[0].id }));
        }
      }
      if (teacherRes.data.success) {
        setTeachers(teacherRes.data.data);
        if (teacherRes.data.data.length > 0 && !subjectForm.teacherId) {
          setSubjectForm((prev) => ({ ...prev, teacherId: teacherRes.data.data[0].id }));
        }
      }
    } catch (err) {
      console.error('Failed to load class & subject data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/classes/classes', classForm);
      if (res.data.success) {
        setIsClassModalOpen(false);
        fetchData();
        setClassForm({ name: '', numericGrade: 10, description: '', sections: ['A', 'B'] });
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create class');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/classes/subjects', subjectForm);
      if (res.data.success) {
        setIsSubjectModalOpen(false);
        fetchData();
        setSubjectForm((prev) => ({ ...prev, name: '', code: '', creditHours: 3 }));
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create subject');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Classes & Academic Subjects"
        subtitle="Manage grades, academic sections, course curriculum, and subject teachers"
        action={
          isAdmin && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSubjectModalOpen(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition"
              >
                <Plus className="w-4 h-4 text-indigo-500" />
                <span>Add Subject</span>
              </button>
              <button
                onClick={() => setIsClassModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition"
              >
                <Plus className="w-4 h-4" />
                <span>Create Class</span>
              </button>
            </div>
          )
        }
      />

      {loading ? (
        <div className="p-12 flex justify-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : classes.length === 0 ? (
        <EmptyState
          title="No classes available"
          description="Create your first class to start enrolling students."
          icon={Layers}
        />
      ) : (
        <div className="space-y-6">
          {classes.map((cls) => (
            <div
              key={cls.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
            >
              {/* Class Header */}
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-800/30">
                <div className="flex items-center gap-3.5">
                  <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    <Layers className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {cls.name}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {cls.description || 'General Secondary Curriculum'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-medium">
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                    <GraduationCap className="w-4 h-4 text-indigo-500" />
                    <span>{cls._count?.students || 0} Students</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                    <BookOpen className="w-4 h-4 text-emerald-500" />
                    <span>{cls.subjects?.length || 0} Subjects</span>
                  </div>
                </div>
              </div>

              {/* Sections & Subjects Area */}
              <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sections List */}
                <div className="lg:col-span-1 border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-800 pb-6 lg:pb-0 lg:pr-6">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                    <Users className="w-3.5 h-3.5" />
                    Class Sections
                  </h4>
                  <div className="space-y-2.5">
                    {cls.sections?.map((sec: any) => (
                      <div
                        key={sec.id}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 flex items-center justify-between"
                      >
                        <div>
                          <span className="text-sm font-bold text-slate-900 dark:text-white">
                            Section {sec.name}
                          </span>
                          <span className="block text-[11px] text-slate-400">
                            Class Teacher: {sec.classTeacher?.user ? `${sec.classTeacher.user.firstName} ${sec.classTeacher.user.lastName}` : 'Unassigned'}
                          </span>
                        </div>
                        <Badge variant="default" size="sm">
                          {sec._count?.students || 0} Students
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Subjects Roster */}
                <div className="lg:col-span-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5" />
                    Curriculum Subjects
                  </h4>

                  {cls.subjects?.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No subjects registered for this class yet.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {cls.subjects?.map((sub: any) => (
                        <div
                          key={sub.id}
                          className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                              {sub.name}
                            </h5>
                            <span className="font-mono text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                              {sub.code}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400">
                            Teacher: {sub.teacher?.user ? `${sub.teacher.user.firstName} ${sub.teacher.user.lastName}` : 'Pending'}
                          </p>
                          <div className="mt-2 text-[10px] text-slate-500 font-semibold uppercase">
                            {sub.creditHours} Credit Hours
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Class Modal */}
      <Modal
        isOpen={isClassModalOpen}
        onClose={() => setIsClassModalOpen(false)}
        title="Create New Academic Class"
      >
        <form onSubmit={handleCreateClass} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
              Class / Grade Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Grade 11"
              value={classForm.name}
              onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
              Numeric Level (Grade #) *
            </label>
            <input
              type="number"
              required
              value={classForm.numericGrade}
              onChange={(e) => setClassForm({ ...classForm, numericGrade: parseInt(e.target.value, 10) })}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
              Description
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Senior High School Preparation"
              value={classForm.description}
              onChange={(e) => setClassForm({ ...classForm, description: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsClassModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm"
            >
              {submitting ? 'Creating...' : 'Create Class'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Subject Modal */}
      <Modal
        isOpen={isSubjectModalOpen}
        onClose={() => setIsSubjectModalOpen(false)}
        title="Add Curriculum Subject"
      >
        <form onSubmit={handleCreateSubject} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
              Subject Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. World History & Civilization"
              value={subjectForm.name}
              onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Subject Code *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. HIS-101"
                value={subjectForm.code}
                onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Credit Hours
              </label>
              <input
                type="number"
                value={subjectForm.creditHours}
                onChange={(e) => setSubjectForm({ ...subjectForm, creditHours: parseInt(e.target.value, 10) })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
              Target Class *
            </label>
            <select
              required
              value={subjectForm.classId}
              onChange={(e) => setSubjectForm({ ...subjectForm, classId: e.target.value })}
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
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
              Assigned Teacher
            </label>
            <select
              value={subjectForm.teacherId}
              onChange={(e) => setSubjectForm({ ...subjectForm, teacherId: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            >
              <option value="">Unassigned</option>
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
              onClick={() => setIsSubjectModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm"
            >
              {submitting ? 'Saving...' : 'Add Subject'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
