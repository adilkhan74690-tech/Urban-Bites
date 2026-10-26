import express from 'express';
import {
  adminLogin,
  getAdminProfile,
  getDashboardStats,
  createMenuItem,
  updateMenuItem,
  updateDishAvailability,
  deleteMenuItem,
  updateReservationStatus,
} from '../controllers/adminController.js';
import { getAllOrders, updateOrderStatus } from '../controllers/orderController.js';
import { getAllReservations } from '../controllers/reservationController.js';
import { protectAdmin } from '../middleware/auth.js';
import { loginRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Public Admin Route (Rate Limited)
router.post('/login', loginRateLimiter, adminLogin);

// Protected Admin Routes (Require Valid JWT Bearer Token)
router.use(protectAdmin);

// Profile & Dashboard Overview Stats
router.get('/profile', getAdminProfile);
router.get('/stats', getDashboardStats);

// Menu CRUD Management
router.post('/menu', createMenuItem);
router.put('/menu/:id', updateMenuItem);
router.patch('/menu/:id/availability', updateDishAvailability);
router.delete('/menu/:id', deleteMenuItem);

// Orders Management
router.get('/orders', getAllOrders);
router.patch('/orders/:orderId/status', updateOrderStatus);

// Reservations Management
router.get('/reservations', getAllReservations);
router.patch('/reservations/:id/status', updateReservationStatus);

export default router;
