import express from 'express';
import {
  createOrder,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
} from '../controllers/orderController.js';
import { validateOrderInput } from '../middleware/validate.js';

const router = express.Router();

router.post('/', validateOrderInput, createOrder);
router.get('/', getAllOrders);
router.get('/:orderId', getOrderById);
router.patch('/:orderId/status', updateOrderStatus);

export default router;
