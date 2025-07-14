import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const paymentController = new PaymentController();

// All payment routes require authentication
router.use(authMiddleware);

// POST /api/payment/create - create a payment invoice
router.post('/create', paymentController.createPayment);

// GET /api/payment/status/:invoiceId - check payment status
router.get('/status/:invoiceId', paymentController.checkPaymentStatus);

// POST /api/payment/process - process successful payment
router.post('/process', paymentController.processPayment);

export default router; 