import React, { useEffect, useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import {
  GraduationCap,
  Search,
  Plus,
  Filter,
  Phone,
  Mail,
  Trash2,
  Eye,
  Edit2,
  Printer,
  FileText,
  School,
  IdCard,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const StudentsListPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const navigate = useNavigate();

  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: 'MALE',
    dob: '2010-05-15',
    bloodGroup: 'O+',
    address: '124 Maple Avenue, Springfield',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    classId: '',
    sectionId: '',
    rollNumber: 1,
  });

  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: 'MALE',
    bloodGroup: 'O+',
    address: '',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    classId: '',
    sectionId: '',
    rollNumber: 1,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (search) params.search = search;
      if (selectedClass) params.classId = selectedClass;

      const [studentsRes, classesRes] = await Promise.all([
        api.get('/students', { params }),
        api.get('/classes/classes'),
      ]);

      if (studentsRes.data.success) {
        setStudents(studentsRes.data.data);
      }
      if (classesRes.data.success) {
        setClasses(classesRes.data.data);
        if (classesRes.data.data.length > 0 && !formData.classId) {
          const firstCls = classesRes.data.data[0];
          setFormData((prev) => ({
            ...prev,
            classId: firstCls.id,
            sectionId: firstCls.sections?.[0]?.id || '',
          }));
        }
      }
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, selectedClass]);

  const activeClassObj = classes.find((c) => c.id === formData.classId);
  const editActiveClassObj = classes.find((c) => c.id === editFormData.classId);

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/students', formData);
      if (res.data.success) {
        setIsAddModalOpen(false);
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          gender: 'MALE',
          dob: '2010-05-15',
          bloodGroup: 'O+',
          address: '124 Maple Avenue, Springfield',
          parentName: '',
          parentPhone: '',
          parentEmail: '',
          classId: classes[0]?.id || '',
          sectionId: classes[0]?.sections?.[0]?.id || '',
          rollNumber: 1,
        });
        fetchData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create student');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenViewModal = (student: any) => {
    setSelectedStudent(student);
    setIsViewModalOpen(true);
  };

  const handleOpenEditModal = (student: any) => {
    setSelectedStudent(student);
    setEditFormData({
      firstName: student.user.firstName,
      lastName: student.user.lastName,
      email: student.user.email,
      phone: student.user.phone || '',
      gender: student.gender || 'MALE',
      bloodGroup: student.bloodGroup || 'O+',
      address: student.address || '',
      parentName: student.parentName || '',
      parentPhone: student.parentPhone || '',
      parentEmail: student.parentEmail || '',
      classId: student.classId,
      sectionId: student.sectionId,
      rollNumber: student.rollNumber || 1,
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    setSubmitting(true);
    try {
      const res = await api.put(`/students/${selectedStudent.id}`, editFormData);
      if (res.data.success) {
        setIsEditModalOpen(false);
        fetchData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update student');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove student "${name}"?`)) return;
    try {
      await api.delete(`/students/${id}`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete student');
    }
  };

  const handlePrintIDCard = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Directory"
        subtitle="Manage enrolled student records, personal profiles, academic status, and official credentials"
        action={
          isAdmin && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Enroll Student</span>
            </button>
          )
        }
      />

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, or admission ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          >
            <option value="">All Academic Grades</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Students Data Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : students.length === 0 ? (
          <EmptyState
            title="No students found"
            description="Try adjusting your search criteria or enroll a new student."
            icon={GraduationCap}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3.5 px-6">Student Profile</th>
                  <th className="py-3.5 px-4">Admission #</th>
                  <th className="py-3.5 px-4">Class & Section</th>
                  <th className="py-3.5 px-4">Parent Details</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions & Views</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {students.map((student) => (
                  <tr
                    key={student.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={student.user.avatarUrl}
                          alt={student.user.firstName}
                          className="w-9 h-9 rounded-full object-cover bg-slate-100 dark:bg-slate-800 ring-2 ring-indigo-500/20"
                        />
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {student.user.firstName} {student.user.lastName}
                          </p>
                          <p className="text-slate-400 text-[11px] flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {student.user.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-medium text-indigo-600 dark:text-indigo-400">
                      {student.admissionNumber}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-medium text-slate-900 dark:text-white block">
                        {student.class.name}
                      </span>
                      <span className="text-slate-400 text-[11px]">
                        Section {student.section.name} • Roll #{student.rollNumber}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-medium text-slate-900 dark:text-white">
                        {student.parentName}
                      </p>
                      <p className="text-slate-400 text-[11px] flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {student.parentPhone}
                      </p>
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge variant="success" size="sm">
                        Active
                      </Badge>
                    </td>

                    <td className="py-3.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View Profile & ID Card */}
                        <button
                          onClick={() => handleOpenViewModal(student)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition cursor-pointer"
                          title="View Profile & ID Badge"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* View Official Academic Report Card */}
                        <button
                          onClick={() => navigate(`/report-card?studentId=${student.id}`)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition cursor-pointer"
                          title="View Academic Transcript"
                        >
                          <FileText className="w-4 h-4" />
                        </button>

                        {/* Edit Student */}
                        {isAdmin && (
                          <button
                            onClick={() => handleOpenEditModal(student)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/50 transition cursor-pointer"
                            title="Edit Student Info"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}

                        {/* Delete Student */}
                        {isAdmin && (
                          <button
                            onClick={() =>
                              handleDelete(
                                student.id,
                                `${student.user.firstName} ${student.user.lastName}`
                              )
                            }
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
                            title="Delete Student"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Student Profile & ID Badge Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Student Identity & Academic Record"
      >
        {selectedStudent && (
          <div className="space-y-6">
            {/* Student ID Badge Card (Printable) */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-900 to-slate-900 text-white shadow-xl relative overflow-hidden border border-indigo-500/30">
              <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl"></div>

              <div className="flex items-center justify-between border-b border-indigo-500/30 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-md">
                    <School className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold tracking-tight">
                      EduPulse International Academy
                    </h4>
                    <p className="text-[10px] text-indigo-300">Official Student ID Card</p>
                  </div>
                </div>
                <IdCard className="w-6 h-6 text-indigo-400 opacity-60" />
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6">
                <img
                  src={selectedStudent.user.avatarUrl}
                  alt={selectedStudent.user.firstName}
                  className="w-20 h-20 rounded-2xl object-cover bg-white/10 ring-4 ring-indigo-400/40 shadow-md"
                />

                <div className="space-y-1 text-center sm:text-left flex-1">
                  <h3 className="text-lg font-black tracking-tight">
                    {selectedStudent.user.firstName} {selectedStudent.user.lastName}
                  </h3>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs">
                    <span className="bg-indigo-950/80 px-2.5 py-0.5 rounded-full border border-indigo-500/30 font-mono font-bold text-indigo-300">
                      {selectedStudent.admissionNumber}
                    </span>
                    <span className="text-indigo-200">
                      {selectedStudent.class.name} • Sec {selectedStudent.section.name}
                    </span>
                    <span className="text-indigo-200 font-semibold">
                      Roll #{selectedStudent.rollNumber}
                    </span>
                  </div>
                  <p className="text-[11px] text-indigo-300/80">{selectedStudent.user.email}</p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-indigo-500/20 grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <span className="text-[10px] uppercase text-indigo-300 block">Gender</span>
                  <span className="font-bold">{selectedStudent.gender || 'MALE'}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-indigo-300 block">Blood Group</span>
                  <span className="font-bold text-rose-400">
                    {selectedStudent.bloodGroup || 'O+'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-indigo-300 block">Emergency</span>
                  <span className="font-bold">{selectedStudent.parentPhone}</span>
                </div>
              </div>
            </div>

            {/* Detailed Bio & Parent Contact */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block text-[11px] uppercase font-semibold">
                  Guardian / Parent
                </span>
                <p className="font-bold text-slate-900 dark:text-white mt-1">
                  {selectedStudent.parentName}
                </p>
                <p className="text-slate-500">{selectedStudent.parentPhone}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block text-[11px] uppercase font-semibold">
                  Residential Address
                </span>
                <p className="font-medium text-slate-900 dark:text-white mt-1">
                  {selectedStudent.address || 'Standard Campus Residence'}
                </p>
              </div>
            </div>

            {/* Quick Action Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => navigate(`/report-card?studentId=${selectedStudent.id}`)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition"
              >
                <FileText className="w-4 h-4" />
                <span>Open Official Transcript</span>
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handlePrintIDCard}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-white hover:bg-slate-700 transition cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print ID Badge</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsViewModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Student Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Student: ${selectedStudent?.user?.firstName} ${selectedStudent?.user?.lastName}`}
      >
        <form onSubmit={handleUpdateStudent} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                First Name *
              </label>
              <input
                type="text"
                required
                value={editFormData.firstName}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, firstName: e.target.value })
                }
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                required
                value={editFormData.lastName}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, lastName: e.target.value })
                }
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
                value={editFormData.classId}
                onChange={(e) => {
                  const targetCls = classes.find((c) => c.id === e.target.value);
                  setEditFormData({
                    ...editFormData,
                    classId: e.target.value,
                    sectionId: targetCls?.sections?.[0]?.id || '',
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
                Section *
              </label>
              <select
                required
                value={editFormData.sectionId}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, sectionId: e.target.value })
                }
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                {editActiveClassObj?.sections?.map((sec: any) => (
                  <option key={sec.id} value={sec.id}>
                    Section {sec.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Roll Number *
              </label>
              <input
                type="number"
                required
                min={1}
                value={editFormData.rollNumber}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    rollNumber: parseInt(e.target.value, 10),
                  })
                }
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Blood Group
              </label>
              <input
                type="text"
                value={editFormData.bloodGroup}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, bloodGroup: e.target.value })
                }
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Parent Name *
              </label>
              <input
                type="text"
                required
                value={editFormData.parentName}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, parentName: e.target.value })
                }
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Parent Phone *
              </label>
              <input
                type="text"
                required
                value={editFormData.parentPhone}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, parentPhone: e.target.value })
                }
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
              Residential Address
            </label>
            <input
              type="text"
              value={editFormData.address}
              onChange={(e) =>
                setEditFormData({ ...editFormData, address: e.target.value })
              }
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
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
              {submitting ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Enroll Student Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Enroll New Student"
      >
        <form onSubmit={handleCreateStudent} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                First Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. John"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Doe"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                placeholder="john.doe@edupulse.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Contact Phone
              </label>
              <input
                type="tel"
                placeholder="+1 555-0199"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
                value={formData.classId}
                onChange={(e) => {
                  const targetCls = classes.find((c) => c.id === e.target.value);
                  setFormData({
                    ...formData,
                    classId: e.target.value,
                    sectionId: targetCls?.sections?.[0]?.id || '',
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
                Section *
              </label>
              <select
                required
                value={formData.sectionId}
                onChange={(e) => setFormData({ ...formData, sectionId: e.target.value })}
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Parent / Guardian Name *
              </label>
              <input
                type="text"
                required
                placeholder="Parent Name"
                value={formData.parentName}
                onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Parent Phone *
              </label>
              <input
                type="tel"
                required
                placeholder="+1 555-0100"
                value={formData.parentPhone}
                onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
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
              {submitting ? 'Enrolling...' : 'Enroll Student'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
