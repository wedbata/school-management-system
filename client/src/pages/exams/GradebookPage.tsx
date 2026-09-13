import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { Award, ArrowLeft, Save, CheckCheck, Calculator } from 'lucide-react';
import api from '../../services/api';
import confetti from 'canvas-confetti';

export const GradebookPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [exam, setExam] = useState<any>(null);
  const [roster, setRoster] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const calculateGrade = (marks: number, maxMarks: number) => {
    const pct = (marks / maxMarks) * 100;
    if (pct >= 90) return 'A+';
    if (pct >= 80) return 'A';
    if (pct >= 70) return 'B';
    if (pct >= 60) return 'C';
    if (pct >= 50) return 'D';
    return 'F';
  };

  const fetchGradebook = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/exams/${id}/gradebook`);
      if (res.data.success) {
        setExam(res.data.data.exam);
        setRoster(res.data.data.roster);
      }
    } catch (err) {
      console.error('Failed to load gradebook:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGradebook();
  }, [id]);

  const handleScoreChange = (studentId: string, val: string) => {
    const numericVal = Math.min(exam?.maxMarks || 100, Math.max(0, parseFloat(val) || 0));
    setRoster((prev) =>
      prev.map((item) =>
        item.studentId === studentId
          ? {
              ...item,
              marksObtained: numericVal,
              gradeLetter: calculateGrade(numericVal, exam?.maxMarks || 100),
            }
          : item
      )
    );
  };

  const handleCommentsChange = (studentId: string, comments: string) => {
    setRoster((prev) =>
      prev.map((item) => (item.studentId === studentId ? { ...item, comments } : item))
    );
  };

  const handleSaveGrades = async () => {
    setSaving(true);
    try {
      const grades = roster.map((r) => ({
        studentId: r.studentId,
        marksObtained: r.marksObtained,
        comments: r.comments,
      }));

      const res = await api.post('/exams/grades/batch', {
        examId: id,
        grades,
      });

      if (res.data.success) {
        setSuccessMsg(`Marks successfully saved and published for ${grades.length} students!`);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
        setTimeout(() => setSuccessMsg(null), 4000);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save grades');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 flex justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!exam) {
    return (
      <EmptyState
        title="Assessment not found"
        description="The requested assessment could not be located."
        icon={Award}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to="/exams"
          className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Gradebook: {exam.title}
          </h1>
          <p className="text-xs text-slate-400">
            {exam.subject?.name} • {exam.class?.name} • Max Marks: {exam.maxMarks} • Term: {exam.term}
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCheck className="w-5 h-5" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Gradebook Spreadsheet Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <Calculator className="w-4 h-4 text-indigo-500" />
            <span>Class Student Assessment Scores</span>
          </div>
          <span className="text-xs text-slate-400">
            {roster.length} Enrolled Candidates
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-6">Roll #</th>
                <th className="py-3.5 px-4">Student Candidate</th>
                <th className="py-3.5 px-4">Section</th>
                <th className="py-3.5 px-4">Score (Out of {exam.maxMarks})</th>
                <th className="py-3.5 px-4">Grade</th>
                <th className="py-3.5 px-6">Evaluator Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {roster.map((item) => (
                <tr
                  key={item.studentId}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="py-3.5 px-6 font-mono font-bold text-slate-900 dark:text-white">
                    #{item.rollNumber}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                    {item.studentName}
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge variant="default" size="sm">
                      Sec {item.sectionName}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        max={exam.maxMarks}
                        value={item.marksObtained}
                        onChange={(e) => handleScoreChange(item.studentId, e.target.value)}
                        className="w-24 px-3 py-1.5 text-sm font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-right"
                      />
                      <span className="text-xs text-slate-400">/ {exam.maxMarks}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge
                      variant={
                        item.gradeLetter === 'A+' || item.gradeLetter === 'A'
                          ? 'success'
                          : item.gradeLetter === 'F'
                          ? 'danger'
                          : 'warning'
                      }
                      size="md"
                    >
                      {item.gradeLetter}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-6">
                    <input
                      type="text"
                      placeholder="e.g. Excellent conceptual understanding"
                      value={item.comments || ''}
                      onChange={(e) => handleCommentsChange(item.studentId, e.target.value)}
                      className="w-full max-w-sm px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={handleSaveGrades}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save & Publish Marks'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
