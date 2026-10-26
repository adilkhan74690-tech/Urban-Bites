import express from 'express';
import {
  getPaymentConfig,
  createPaymentOrder,
  verifyPayment,
  handlePaymentFailure,
  handleWebhook,
  switchToCod,
} from '../controllers/paymentController.js';

const router = express.Router();

router.get('/config', getPaymentConfig);
router.post('/create-order', createPaymentOrder);
router.post('/verify', verifyPayment);
router.post('/failure', handlePaymentFailure);
router.post('/webhook', handleWebhook);
router.post('/switch-to-cod', switchToCod);

export default router;
