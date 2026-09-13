import { Router } from 'express';
import {
  createFeeInvoice,
  getFeeInvoices,
  recordFeePayment,
} from '../controllers/fee.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { validate } from '../middleware/error.middleware';
import { feeInvoiceCreateSchema, feePaymentSchema } from '../schemas';

const router = Router();

router.use(authenticate);

router.get('/', getFeeInvoices);
router.post('/', requireRole(['ADMIN']), validate(feeInvoiceCreateSchema), createFeeInvoice);
router.post('/:id/pay', requireRole(['ADMIN', 'STUDENT']), validate(feePaymentSchema), recordFeePayment);

export default router;
