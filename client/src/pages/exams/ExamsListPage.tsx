import React, { useEffect, useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Award,
  Plus,
  Calendar,
  BookOpen,
  ArrowRight,
  Edit2,
  Trash2,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

export const ExamsListPage: React.FC = () => {
  const { user } = useAuth();
  const canManage = user?.role === 'ADMIN' || user?.role === 'TEACHER';

  const [exams, setExams] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  const [examForm, setExamForm] = useState({
    title: '',
    type: 'MIDTERM',
    term: 'Spring 2026',
    maxMarks: 100,
    passingMarks: 40,
    examDate: new Date().toISOString().split('T')[0],
    classId: '',
    subjectId: '',
  });

  const [editExamForm, setEditExamForm] = useState({
    title: '',
    type: 'MIDTERM',
    term: 'Spring 2026',
    maxMarks: 100,
    passingMarks: 40,
    examDate: new Date().toISOString().split('T')[0],
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [examsRes, classesRes] = await Promise.all([
        api.get('/exams'),
        api.get('/classes/classes'),
      ]);

      if (examsRes.data.success) setExams(examsRes.data.data);
      if (classesRes.data.success) {
        setClasses(classesRes.data.data);
        if (classesRes.data.data.length > 0 && !examForm.classId) {
          const firstCls = classesRes.data.data[0];
          setExamForm((prev) => ({
            ...prev,
            classId: firstCls.id,
            subjectId: firstCls.subjects?.[0]?.id || '',
          }));
        }
      }
    } catch (err) {
      console.error('Failed to load exams:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const activeClassObj = classes.find((c) => c.id === examForm.classId);

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/exams', examForm);
      if (res.data.success) {
        setIsAddModalOpen(false);
        fetchData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create exam');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEditModal = (exam: any) => {
    setSelectedExam(exam);
    setEditExamForm({
      title: exam.title,
      type: exam.type,
      term: exam.term,
      maxMarks: exam.maxMarks,
      passingMarks: exam.passingMarks || 40,
      examDate: new Date(exam.examDate).toISOString().split('T')[0],
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExam) return;
    setSubmitting(true);
    try {
      const res = await api.put(`/exams/${selectedExam.id}`, editExamForm);
      if (res.data.success) {
        setIsEditModalOpen(false);
        fetchData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update exam');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteExam = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete assessment "${title}"?`)) return;
    try {
      await api.delete(`/exams/${id}`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete exam');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Examinations & Assessments"
        subtitle="Manage academic tests, quizzes, mid-terms, and official gradebook entries"
        action={
          canManage && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Assessment</span>
            </button>
          )
        }
      />

      {loading ? (
        <div className="p-12 flex justify-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : exams.length === 0 ? (
        <EmptyState
          title="No assessments found"
          description="Create your first exam or quiz to start recording student grades."
          icon={Award}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam) => (
            <div
              key={exam.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <Badge variant="purple">{exam.type}</Badge>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-medium text-slate-400 mr-1">
                      {exam.term}
                    </span>
                    {canManage && (
                      <>
                        <button
                          onClick={() => handleOpenEditModal(exam)}
                          className="p-1 rounded text-slate-400 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                          title="Edit Assessment"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteExam(exam.id, exam.title)}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                          title="Delete Assessment"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  {exam.title}
                </h4>

                <div className="mt-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                  <p className="flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                    <span>
                      {exam.subject?.name} ({exam.class?.name})
                    </span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {new Date(exam.examDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Max Marks</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {exam.maxMarks} pts
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Submissions</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {exam._count?.grades || 0} Graded
                    </span>
                  </div>
                </div>
              </div>

              {canManage && (
                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <Link
                    to={`/exams/${exam.id}/gradebook`}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 text-xs font-semibold transition"
                  >
                    <span>Open Gradebook Sheet</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Edit Exam Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Assessment"
      >
        <form onSubmit={handleUpdateExam} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
              Assessment Title *
            </label>
            <input
              type="text"
              required
              value={editExamForm.title}
              onChange={(e) => setEditExamForm({ ...editExamForm, title: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Assessment Type *
              </label>
              <select
                value={editExamForm.type}
                onChange={(e) => setEditExamForm({ ...editExamForm, type: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                <option value="MIDTERM">Mid-Term Exam</option>
                <option value="FINAL">Final Exam</option>
                <option value="QUIZ">Quiz</option>
                <option value="ASSIGNMENT">Assignment</option>
                <option value="PROJECT">Project</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Academic Term *
              </label>
              <input
                type="text"
                required
                value={editExamForm.term}
                onChange={(e) => setEditExamForm({ ...editExamForm, term: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Max Marks *
              </label>
              <input
                type="number"
                required
                value={editExamForm.maxMarks}
                onChange={(e) =>
                  setEditExamForm({ ...editExamForm, maxMarks: parseFloat(e.target.value) })
                }
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Passing Marks
              </label>
              <input
                type="number"
                value={editExamForm.passingMarks}
                onChange={(e) =>
                  setEditExamForm({ ...editExamForm, passingMarks: parseFloat(e.target.value) })
                }
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Exam Date *
              </label>
              <input
                type="date"
                required
                value={editExamForm.examDate}
                onChange={(e) => setEditExamForm({ ...editExamForm, examDate: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm"
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Exam Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create Examination / Assessment"
      >
        <form onSubmit={handleCreateExam} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
              Assessment Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Mid-Term Examination 2026"
              value={examForm.title}
              onChange={(e) => setExamForm({ ...examForm, title: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Assessment Type *
              </label>
              <select
                value={examForm.type}
                onChange={(e) => setExamForm({ ...examForm, type: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                <option value="MIDTERM">Mid-Term Exam</option>
                <option value="FINAL">Final Exam</option>
                <option value="QUIZ">Quiz</option>
                <option value="ASSIGNMENT">Assignment</option>
                <option value="PROJECT">Project</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Academic Term *
              </label>
              <input
                type="text"
                required
                placeholder="Spring 2026"
                value={examForm.term}
                onChange={(e) => setExamForm({ ...examForm, term: e.target.value })}
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
                value={examForm.classId}
                onChange={(e) => {
                  const targetCls = classes.find((c) => c.id === e.target.value);
                  setExamForm({
                    ...examForm,
                    classId: e.target.value,
                    subjectId: targetCls?.subjects?.[0]?.id || '',
                  });
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
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Subject *
              </label>
              <select
                required
                value={examForm.subjectId}
                onChange={(e) => setExamForm({ ...examForm, subjectId: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                {activeClassObj?.subjects?.map((sub: any) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name} ({sub.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Max Marks *
              </label>
              <input
                type="number"
                required
                value={examForm.maxMarks}
                onChange={(e) =>
                  setExamForm({ ...examForm, maxMarks: parseFloat(e.target.value) })
                }
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Passing Marks
              </label>
              <input
                type="number"
                value={examForm.passingMarks}
                onChange={(e) =>
                  setExamForm({ ...examForm, passingMarks: parseFloat(e.target.value) })
                }
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Exam Date *
              </label>
              <input
                type="date"
                required
                value={examForm.examDate}
                onChange={(e) => setExamForm({ ...examForm, examDate: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
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
              {submitting ? 'Creating...' : 'Create Assessment'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
