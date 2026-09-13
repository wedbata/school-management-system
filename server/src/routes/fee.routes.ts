import { Router } from 'express';
import {
  createFeeInvoice,
  deleteFeeInvoice,
  getFeeInvoices,
  recordFeePayment,
  updateFeeInvoice,
} from '../controllers/fee.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { validate } from '../middleware/error.middleware';
import { feeInvoiceCreateSchema } from '../schemas';

const router = Router();

router.use(authenticate);

router.get('/', getFeeInvoices);
router.post('/', requireRole(['ADMIN']), validate(feeInvoiceCreateSchema), createFeeInvoice);
router.put('/:id', requireRole(['ADMIN']), updateFeeInvoice);
router.delete('/:id', requireRole(['ADMIN']), deleteFeeInvoice);
router.post('/:id/pay', recordFeePayment);

export default router;
