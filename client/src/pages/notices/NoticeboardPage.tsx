import React, { useEffect, useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import { Bell, Plus, Pin, Calendar, User } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const NoticeboardPage: React.FC = () => {
  const { user } = useAuth();
  const canPost = user?.role === 'ADMIN' || user?.role === 'TEACHER';

  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPriority, setFilterPriority] = useState('');

  // Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [noticeForm, setNoticeForm] = useState({
    title: '',
    content: '',
    targetRole: 'ALL',
    priority: 'MEDIUM',
  });

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notices');
      if (res.data.success) {
        setNotices(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load notices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/notices', noticeForm);
      if (res.data.success) {
        setIsAddModalOpen(false);
        setNoticeForm({
          title: '',
          content: '',
          targetRole: 'ALL',
          priority: 'MEDIUM',
        });
        fetchNotices();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to publish announcement');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredNotices = filterPriority
    ? notices.filter((n) => n.priority === filterPriority)
    : notices;

  const priorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'danger';
      case 'MEDIUM':
        return 'warning';
      case 'LOW':
      default:
        return 'info';
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="School Noticeboard & Circulars"
        subtitle="Official school-wide communications, academic notices, event alerts, and guidelines"
        action={
          canPost && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Post Announcement</span>
            </button>
          )
        }
      />

      {/* Filter bar */}
      <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
            Official Bulletin Feed
          </span>
          <span className="text-xs text-slate-400">({filteredNotices.length} active circulars)</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Filter Priority:</span>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Priorities</option>
            <option value="HIGH">High / Urgent Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="LOW">Low / Information</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="p-12 flex justify-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredNotices.length === 0 ? (
        <EmptyState
          title="No notices found"
          description="There are currently no active circulars matching your filter."
          icon={Bell}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredNotices.map((notice) => (
            <div
              key={notice.id}
              className={`rounded-2xl border bg-white dark:bg-slate-900 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition ${
                notice.priority === 'HIGH'
                  ? 'border-rose-200 dark:border-rose-900/60'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <Badge variant={priorityBadgeVariant(notice.priority)} size="sm">
                      {notice.priority} PRIORITY
                    </Badge>
                    <Badge variant="default" size="sm">
                      Audience: {notice.targetRole}
                    </Badge>
                  </div>
                  <Pin className="w-4 h-4 text-slate-400 rotate-45" />
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 leading-snug">
                  {notice.title}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {notice.content}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-400">
                  <User className="w-3.5 h-3.5 text-indigo-500" />
                  {notice.author?.firstName} {notice.author?.lastName}
                </span>

                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(notice.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Post Notice Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Post School Announcement"
      >
        <form onSubmit={handleCreateNotice} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
              Title / Subject *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Science Fair 2026 Registration & Guidelines"
              value={noticeForm.title}
              onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Target Audience *
              </label>
              <select
                value={noticeForm.targetRole}
                onChange={(e) => setNoticeForm({ ...noticeForm, targetRole: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                <option value="ALL">All School (Everyone)</option>
                <option value="TEACHER">Faculty & Staff Only</option>
                <option value="STUDENT">Students & Parents Only</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Priority Level *
              </label>
              <select
                value={noticeForm.priority}
                onChange={(e) => setNoticeForm({ ...noticeForm, priority: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                <option value="LOW">Low (Informational)</option>
                <option value="MEDIUM">Medium (Standard)</option>
                <option value="HIGH">High (Urgent / Critical)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
              Announcement Body *
            </label>
            <textarea
              required
              rows={4}
              placeholder="Write the full circular announcement content here..."
              value={noticeForm.content}
              onChange={(e) => setNoticeForm({ ...noticeForm, content: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
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
              {submitting ? 'Publishing...' : 'Publish Announcement'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
