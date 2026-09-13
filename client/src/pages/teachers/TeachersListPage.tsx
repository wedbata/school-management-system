import React, { useEffect, useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Users,
  Search,
  Plus,
  Mail,
  Phone,
  BookOpen,
  Trash2,
  Eye,
  Edit2,
  Award,
  Briefcase,
  School,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const TeachersListPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form data for creating
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    qualification: '',
    specialization: '',
  });

  // Form data for editing
  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    qualification: '',
    specialization: '',
  });

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (search) params.search = search;
      const response = await api.get('/teachers', { params });
      if (response.data.success) {
        setTeachers(response.data.data);
      }
    } catch (err) {
      console.error('Failed to load teachers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTeachers();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await api.post('/teachers', formData);
      if (response.data.success) {
        setIsAddModalOpen(false);
        fetchTeachers();
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          qualification: '',
          specialization: '',
        });
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add teacher');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenViewModal = (t: any) => {
    setSelectedTeacher(t);
    setIsViewModalOpen(true);
  };

  const handleOpenEditModal = (t: any) => {
    setSelectedTeacher(t);
    setEditFormData({
      firstName: t.user.firstName,
      lastName: t.user.lastName,
      email: t.user.email,
      phone: t.user.phone || '',
      qualification: t.qualification || '',
      specialization: t.specialization || '',
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacher) return;
    setIsSubmitting(true);
    try {
      const response = await api.put(`/teachers/${selectedTeacher.id}`, editFormData);
      if (response.data.success) {
        setIsEditModalOpen(false);
        fetchTeachers();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update teacher');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove faculty member "${name}"?`)) return;
    try {
      await api.delete(`/teachers/${id}`);
      fetchTeachers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete teacher');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Faculty & Teachers"
        subtitle="Manage academic staff, department qualifications, and teaching assignments"
        action={
          isAdmin && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Faculty Member</span>
            </button>
          )
        }
      />

      {/* Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search faculty by name, specialization, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white transition"
          />
        </div>
      </div>

      {/* Teachers Grid Cards */}
      {loading ? (
        <div className="p-12 flex justify-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : teachers.length === 0 ? (
        <EmptyState
          title="No faculty members found"
          description="There are currently no teachers matching your criteria."
          icon={Users}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teachers.map((t) => (
            <div
              key={t.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition group"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={
                        t.user.avatarUrl ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${t.user.firstName}`
                      }
                      alt={t.user.firstName}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-500/30"
                    />
                    <div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white">
                        {t.user.firstName} {t.user.lastName}
                      </h4>
                      <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
                        {t.employeeId}
                      </span>
                    </div>
                  </div>
                  <Badge variant="success">Active</Badge>
                </div>

                <div className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-400">
                  <p className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {t.user.email}
                  </p>
                  {t.user.phone && (
                    <p className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {t.user.phone}
                    </p>
                  )}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <p className="font-semibold text-slate-700 dark:text-slate-300">
                      {t.specialization}
                    </p>
                    <p className="text-[11px] text-slate-400">{t.qualification}</p>
                  </div>
                </div>

                {/* Assigned Subjects Pills */}
                {t.subjects && t.subjects.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5 flex items-center gap-1">
                      <BookOpen className="w-3 h-3 text-indigo-500" />
                      Assigned Subjects
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {t.subjects.map((sub: any) => (
                        <span
                          key={sub.id}
                          className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-medium text-slate-700 dark:text-slate-300"
                        >
                          {sub.name} {sub.class?.name ? `(${sub.class.name})` : ''}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons Toolbar */}
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Joined {new Date(t.joiningDate || t.createdAt).getFullYear()}
                </span>

                <div className="flex items-center gap-1">
                  {/* View Details */}
                  <button
                    onClick={() => handleOpenViewModal(t)}
                    className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg transition cursor-pointer"
                    title="View Faculty Profile"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  {/* Edit Faculty (Admin only) */}
                  {isAdmin && (
                    <button
                      onClick={() => handleOpenEditModal(t)}
                      className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/50 rounded-lg transition cursor-pointer"
                      title="Edit Faculty Details"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}

                  {/* Delete Faculty (Admin only) */}
                  {isAdmin && (
                    <button
                      onClick={() =>
                        handleDelete(t.id, `${t.user.firstName} ${t.user.lastName}`)
                      }
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition cursor-pointer"
                      title="Delete Teacher"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Teacher Details Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Faculty Member Profile"
      >
        {selectedTeacher && (
          <div className="space-y-6">
            {/* Header Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white shadow-xl relative overflow-hidden border border-indigo-500/20">
              <div className="flex items-center gap-4">
                <img
                  src={
                    selectedTeacher.user.avatarUrl ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedTeacher.user.firstName}`
                  }
                  alt={selectedTeacher.user.firstName}
                  className="w-16 h-16 rounded-2xl object-cover bg-white/10 ring-4 ring-indigo-400/30 shadow-md"
                />
                <div>
                  <h3 className="text-lg font-bold">
                    {selectedTeacher.user.firstName} {selectedTeacher.user.lastName}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/30 text-indigo-300 border border-indigo-400/20">
                      {selectedTeacher.employeeId}
                    </span>
                    <Badge variant="success" size="sm">
                      Faculty
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Qualifications & Specialization */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 flex items-center gap-1 text-[11px] uppercase font-semibold">
                  <Award className="w-3.5 h-3.5 text-indigo-500" />
                  Qualification
                </span>
                <p className="font-bold text-slate-900 dark:text-white mt-1 text-sm">
                  {selectedTeacher.qualification}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 flex items-center gap-1 text-[11px] uppercase font-semibold">
                  <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
                  Specialization
                </span>
                <p className="font-bold text-slate-900 dark:text-white mt-1 text-sm">
                  {selectedTeacher.specialization}
                </p>
              </div>
            </div>

            {/* Contact & Meta */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Mail className="w-4 h-4 text-indigo-500" />
                <span>{selectedTeacher.user.email}</span>
              </div>
              {selectedTeacher.user.phone && (
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <Phone className="w-4 h-4 text-indigo-500" />
                  <span>{selectedTeacher.user.phone}</span>
                </div>
              )}
            </div>

            {/* Assigned Courses / Subjects */}
            {selectedTeacher.subjects && selectedTeacher.subjects.length > 0 && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <School className="w-3.5 h-3.5 text-indigo-500" />
                  Teaching Assignments ({selectedTeacher.subjects.length})
                </h5>
                <div className="grid grid-cols-2 gap-2">
                  {selectedTeacher.subjects.map((sub: any) => (
                    <div
                      key={sub.id}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60"
                    >
                      <p className="font-semibold text-xs text-slate-900 dark:text-white">
                        {sub.name}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {sub.class?.name || 'All Classes'} • Code: {sub.code}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              >
                Close Profile
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Teacher Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Faculty: ${selectedTeacher?.user?.firstName} ${selectedTeacher?.user?.lastName}`}
        maxWidth="lg"
      >
        <form onSubmit={handleUpdateTeacher} className="space-y-4">
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

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={editFormData.email}
              onChange={(e) =>
                setEditFormData({ ...editFormData, email: e.target.value })
              }
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
              Contact Phone
            </label>
            <input
              type="text"
              value={editFormData.phone}
              onChange={(e) =>
                setEditFormData({ ...editFormData, phone: e.target.value })
              }
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Specialization *
              </label>
              <input
                type="text"
                required
                value={editFormData.specialization}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, specialization: e.target.value })
                }
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Qualification *
              </label>
              <input
                type="text"
                required
                value={editFormData.qualification}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, qualification: e.target.value })
                }
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
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm"
            >
              {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Teacher Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Faculty Member"
        maxWidth="lg"
      >
        <form onSubmit={handleAddTeacher} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                First Name *
              </label>
              <input
                type="text"
                required
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
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              required
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
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Specialization *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Pure Mathematics"
                value={formData.specialization}
                onChange={(e) =>
                  setFormData({ ...formData, specialization: e.target.value })
                }
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Qualification *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. M.Sc., Ph.D."
                value={formData.qualification}
                onChange={(e) =>
                  setFormData({ ...formData, qualification: e.target.value })
                }
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
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm"
            >
              {isSubmitting ? 'Adding...' : 'Add Faculty'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
