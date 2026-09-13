import React, { useEffect, useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import { CreditCard, Plus, CheckCircle, Clock, Receipt } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import confetti from 'canvas-confetti';

export const FeesManagementPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [invoices, setInvoices] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');

  // Modals
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  const [invoiceForm, setInvoiceForm] = useState({
    studentId: '',
    title: 'Term Tuition & Facility Fee',
    amount: 850.0,
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: 'Includes lab consumables, library, and extracurricular access.',
  });

  const [payForm, setPayForm] = useState({
    paidAmount: 0,
    paymentMethod: 'Credit Card',
    notes: 'Settled via online student portal',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filterStatus) params.status = filterStatus;

      const [invRes, stdRes] = await Promise.all([
        api.get('/fees', { params }),
        isAdmin ? api.get('/students') : Promise.resolve({ data: { success: true, data: [] } }),
      ]);

      if (invRes.data.success) setInvoices(invRes.data.data);
      if (stdRes.data.success && stdRes.data.data.length > 0) {
        setStudents(stdRes.data.data);
        if (!invoiceForm.studentId) {
          setInvoiceForm((prev) => ({ ...prev, studentId: stdRes.data.data[0].id }));
        }
      }
    } catch (err) {
      console.error('Failed to load fee invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterStatus]);

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/fees', invoiceForm);
      if (res.data.success) {
        setIsInvoiceModalOpen(false);
        fetchData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create invoice');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenPayModal = (inv: any) => {
    setSelectedInvoice(inv);
    setPayForm({
      paidAmount: inv.amount - inv.paidAmount,
      paymentMethod: 'Credit Card',
      notes: 'Online student fee settlement',
    });
    setIsPayModalOpen(true);
  };

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/fees/${selectedInvoice.id}/pay`, payForm);
      if (res.data.success) {
        setIsPayModalOpen(false);
        fetchData();
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to process payment');
    } finally {
      setSubmitting(false);
    }
  };

  const totalBilled = invoices.reduce((acc, curr) => acc + curr.amount, 0);
  const totalPaid = invoices.reduce((acc, curr) => acc + curr.paidAmount, 0);
  const totalPending = totalBilled - totalPaid;

  const statusVariants: any = {
    PAID: 'success',
    PENDING: 'warning',
    OVERDUE: 'danger',
    PARTIAL: 'info',
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fee Billing & Financial Invoices"
        subtitle="Manage student tuition fees, invoice generation, online payments, and receipts"
        action={
          isAdmin && (
            <button
              onClick={() => setIsInvoiceModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>Create Invoice</span>
            </button>
          )
        }
      />

      {/* Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Billed Invoices"
          value={`$${totalBilled.toLocaleString()}`}
          icon={Receipt}
          color="indigo"
        />
        <StatCard
          title="Collected Revenue"
          value={`$${totalPaid.toLocaleString()}`}
          icon={CheckCircle}
          color="emerald"
        />
        <StatCard
          title="Pending Dues"
          value={`$${totalPending.toLocaleString()}`}
          icon={Clock}
          color={totalPending > 0 ? 'rose' : 'emerald'}
        />
      </div>

      {/* Invoices List Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-800/30">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Invoices & Receipts Ledger
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="PAID">Paid</option>
              <option value="OVERDUE">Overdue</option>
              <option value="PARTIAL">Partial</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : invoices.length === 0 ? (
          <EmptyState
            title="No invoices found"
            description="There are currently no fee invoices matching your criteria."
            icon={CreditCard}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3.5 px-6">Invoice #</th>
                  <th className="py-3.5 px-4">Title / Description</th>
                  {isAdmin && <th className="py-3.5 px-4">Student</th>}
                  <th className="py-3.5 px-4">Total Amount</th>
                  <th className="py-3.5 px-4">Paid Amount</th>
                  <th className="py-3.5 px-4">Due Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {invoices.map((inv) => (
                  <tr
                    key={inv.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="py-3.5 px-6 font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                      {inv.title}
                    </td>
                    {isAdmin && (
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-slate-900 dark:text-white block">
                          {inv.student?.user?.firstName} {inv.student?.user?.lastName}
                        </span>
                        <span className="text-xs text-slate-400">
                          {inv.student?.class?.name} ({inv.student?.section?.name})
                        </span>
                      </td>
                    )}
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      ${inv.amount.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                      ${inv.paidAmount.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500">
                      {new Date(inv.dueDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={statusVariants[inv.status]}>{inv.status}</Badge>
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      {inv.status !== 'PAID' ? (
                        <button
                          onClick={() => handleOpenPayModal(inv)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
                        >
                          Pay Dues
                        </button>
                      ) : (
                        <span className="text-xs font-semibold text-emerald-600 flex items-center justify-end gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> Paid
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Invoice Modal */}
      <Modal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        title="Create Fee Invoice"
      >
        <form onSubmit={handleCreateInvoice} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
              Select Student *
            </label>
            <select
              required
              value={invoiceForm.studentId}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, studentId: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            >
              {students.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.user.firstName} {st.user.lastName} ({st.admissionNumber} - {st.class?.name})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
              Invoice Title *
            </label>
            <input
              type="text"
              required
              value={invoiceForm.title}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, title: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Amount ($ USD) *
              </label>
              <input
                type="number"
                required
                min={1}
                value={invoiceForm.amount}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, amount: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Due Date *
              </label>
              <input
                type="date"
                required
                value={invoiceForm.dueDate}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
              Notes
            </label>
            <textarea
              rows={2}
              value={invoiceForm.notes}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, notes: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsInvoiceModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm"
            >
              {submitting ? 'Generating...' : 'Issue Invoice'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Record Payment Modal */}
      <Modal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        title={`Process Payment: ${selectedInvoice?.invoiceNumber}`}
      >
        <form onSubmit={handleProcessPayment} className="space-y-4">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
            <div className="flex justify-between mb-1">
              <span className="text-slate-500">Invoice:</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {selectedInvoice?.title}
              </span>
            </div>
            <div className="flex justify-between mb-1">
              <span className="text-slate-500">Remaining Due:</span>
              <span className="font-bold text-rose-600 dark:text-rose-400">
                ${(selectedInvoice ? selectedInvoice.amount - selectedInvoice.paidAmount : 0).toFixed(2)}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
              Payment Amount ($) *
            </label>
            <input
              type="number"
              required
              min={1}
              max={selectedInvoice ? selectedInvoice.amount - selectedInvoice.paidAmount : undefined}
              value={payForm.paidAmount}
              onChange={(e) => setPayForm({ ...payForm, paidAmount: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
              Payment Method *
            </label>
            <select
              value={payForm.paymentMethod}
              onChange={(e) => setPayForm({ ...payForm, paymentMethod: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            >
              <option value="Credit Card">Credit Card (Online Portal)</option>
              <option value="Bank Transfer">Bank Wire Transfer</option>
              <option value="Cash">Cash at Bursar Office</option>
              <option value="Check">Official Bank Check</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsPayModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm"
            >
              {submitting ? 'Processing...' : 'Confirm Payment'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
