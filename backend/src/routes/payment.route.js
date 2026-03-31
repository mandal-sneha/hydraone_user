import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { createPayment, confirmPayment, getPaymentHistory } from '../controllers/payment.controller.js';

const router = Router();

router.post('/create-payment-intent', protect, createPayment);
router.post('/confirm-payment', protect, confirmPayment);
router.get('/:waterId/history', protect, getPaymentHistory);

export default router;