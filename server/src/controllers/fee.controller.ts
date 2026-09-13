import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { sendError, sendSuccess } from '../utils/response';

export const getFeeInvoices = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, studentId, classId } = req.query;
    const where: any = {};

    if (status) where.status = String(status);
    if (studentId) where.studentId = String(studentId);
    if (classId) where.student = { classId: String(classId) };

    // If logged in as student, restrict to own fees
    if (req.user?.role === 'STUDENT' && req.user.profileId) {
      where.studentId = req.user.profileId;
    }

    const invoices = await prisma.feeInvoice.findMany({
      where,
      orderBy: { dueDate: 'desc' },
      include: {
        student: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true } },
            class: true,
            section: true,
          },
        },
      },
    });

    return sendSuccess(res, 'Fee invoices retrieved', invoices);
  } catch (error: any) {
    return sendError(res, 'Failed to fetch fee invoices', 500, error.message);
  }
};

export const createFeeInvoice = async (req: Request, res: Response) => {
  try {
    const { studentId, title, amount, dueDate, notes } = req.body;
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;

    const invoice = await prisma.feeInvoice.create({
      data: {
        invoiceNumber,
        studentId,
        title,
        amount: parseFloat(amount),
        dueDate: new Date(dueDate),
        notes,
        status: 'PENDING',
      },
      include: {
        student: {
          include: {
            user: true,
            class: true,
          },
        },
      },
    });

    return sendSuccess(res, 'Fee invoice created', invoice, 201);
  } catch (error: any) {
    return sendError(res, 'Failed to create fee invoice', 500, error.message);
  }
};

export const recordFeePayment = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { paidAmount, paymentMethod, notes } = req.body;

    const invoice = await prisma.feeInvoice.findUnique({
      where: { id },
    });

    if (!invoice) return sendError(res, 'Invoice not found', 404);

    const paymentVal = parseFloat(paidAmount);
    const newPaidAmount = invoice.paidAmount + paymentVal;
    let newStatus: 'PAID' | 'PARTIAL' | 'PENDING' | 'OVERDUE' = 'PARTIAL';

    if (newPaidAmount >= invoice.amount) {
      newStatus = 'PAID';
    }

    const updated = await prisma.feeInvoice.update({
      where: { id },
      data: {
        paidAmount: newPaidAmount,
        status: newStatus,
        paymentMethod,
        paidDate: new Date(),
        notes: notes || invoice.notes,
      },
    });

    return sendSuccess(res, 'Payment recorded successfully', updated);
  } catch (error: any) {
    return sendError(res, 'Failed to record fee payment', 500, error.message);
  }
};
