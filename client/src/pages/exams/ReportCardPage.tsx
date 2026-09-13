import React, { useEffect, useState } from 'react';
import { EmptyState } from '../../components/common/EmptyState';
import { Award, Printer, School, CheckCircle, UserCheck } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSearchParams } from 'react-router-dom';

export const ReportCardPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const canSelectStudent = user?.role === 'ADMIN' || user?.role === 'TEACHER';

  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    searchParams.get('studentId') || ''
  );
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch student roster for Admin/Teacher selector
  useEffect(() => {
    if (canSelectStudent) {
      api.get('/students').then((res) => {
        if (res.data.success && res.data.data.length > 0) {
          setStudents(res.data.data);
          if (!selectedStudentId) {
            setSelectedStudentId(res.data.data[0].id);
          }
        }
      });
    }
  }, [canSelectStudent]);

  // Fetch Report Card data
  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const params: any = {};
        if (canSelectStudent && selectedStudentId) {
          params.studentId = selectedStudentId;
        }
        const res = await api.get('/exams/report-card', { params });
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load report card:', err);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [selectedStudentId, canSelectStudent]);

  const handlePrint = () => {
    window.print();
  };

  const handleStudentChange = (stId: string) => {
    setSelectedStudentId(stId);
    setSearchParams({ studentId: stId });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header & Selector Toolbar (Hidden during Print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm print:hidden">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Official Academic Transcript
          </h2>
          <p className="text-xs text-slate-500">
            Spring 2026 Semester Grade Report & Performance Record
          </p>
        </div>

        <div className="flex items-center gap-3">
          {canSelectStudent && students.length > 0 && (
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <select
                value={selectedStudentId}
                onChange={(e) => handleStudentChange(e.target.value)}
                className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {students.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.user.firstName} {st.user.lastName} ({st.class?.name})
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Official Transcript</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 flex justify-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : !data ? (
        <EmptyState
          title="Report card not available"
          description="Grades have not yet been published for this student."
          icon={Award}
        />
      ) : (
        /* Printable Report Card Sheet */
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-8 sm:p-12 text-slate-800 dark:text-slate-100 print:shadow-none print:border-0 print:p-0 print:m-0">
          {/* School Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-8 border-b-2 border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-4">
              <div className="p-3.5 rounded-2xl bg-indigo-600 text-white shadow-lg">
                <School className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  EduPulse International Academy
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Department of Academic Affairs & Examinations • Spring 2026
                </p>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 rounded-full">
                OFFICIAL TRANSCRIPT
              </span>
              <p className="text-[11px] text-slate-400 mt-1">
                Date:{' '}
                {new Date().toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>

          {/* Student Profile Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px] uppercase font-semibold">
                Student Name
              </span>
              <span className="font-bold text-slate-900 dark:text-white text-sm">
                {data.student.name}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px] uppercase font-semibold">
                Admission Number
              </span>
              <span className="font-bold text-slate-900 dark:text-white font-mono">
                {data.student.admissionNumber}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px] uppercase font-semibold">
                Class & Section
              </span>
              <span className="font-bold text-slate-900 dark:text-white">
                {data.student.class}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px] uppercase font-semibold">
                Roll Number
              </span>
              <span className="font-bold text-slate-900 dark:text-white">
                #{data.student.rollNumber}
              </span>
            </div>
          </div>

          {/* Subject Scores Table */}
          <div className="overflow-x-auto my-6">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Exam Type</th>
                  <th className="py-3 px-4 text-right">Max Marks</th>
                  <th className="py-3 px-4 text-right">Marks Scored</th>
                  <th className="py-3 px-4 text-center">Grade</th>
                  <th className="py-3 px-4">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {data.subjects.map((sub: any, i: number) => (
                  <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {sub.subject}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">
                      {sub.subjectCode}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{sub.examType}</td>
                    <td className="py-3.5 px-4 text-right text-slate-500">
                      {sub.maxMarks}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900 dark:text-white">
                      {sub.marksObtained}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-indigo-600 dark:text-indigo-400">
                      {sub.gradeLetter}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 italic max-w-xs truncate">
                      {sub.comments || 'Satisfactory academic performance'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Aggregate Summary Box */}
          <div className="my-8 p-6 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <span className="text-xs uppercase font-bold text-indigo-600 dark:text-indigo-400 block mb-1">
                Overall Academic Standing
              </span>
              <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {data.overallPercentage}%
              </h3>
              <p className="text-xs text-slate-500">
                Total Score: {data.totalMarks} out of {data.totalMaxMarks} points
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-center p-3 rounded-xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900 shadow-sm min-w-[90px]">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Final Grade
                </span>
                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                  {data.overallGrade}
                </span>
              </div>

              <div className="text-center p-3 rounded-xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900 shadow-sm min-w-[90px]">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Status
                </span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1 mt-1">
                  <CheckCircle className="w-4 h-4" /> Passed
                </span>
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-12 pt-12 mt-12 border-t border-slate-200 dark:border-slate-800 text-xs text-center text-slate-500">
            <div>
              <div className="w-48 border-b border-slate-300 dark:border-slate-700 mx-auto mb-2"></div>
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                Class Teacher Signature
              </p>
              <p className="text-[10px] text-slate-400">Faculty Advisor</p>
            </div>

            <div>
              <div className="w-48 border-b border-slate-300 dark:border-slate-700 mx-auto mb-2"></div>
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                Dr. Arthur Pendelton
              </p>
              <p className="text-[10px] text-slate-400">Principal & Dean of Studies</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
