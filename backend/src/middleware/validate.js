import { TIME_SLOTS } from '../models/Reservation.js';

export const validateOrderInput = (req, res, next) => {
  const { customerName, phone, email, orderType, deliveryAddress, items, paymentMethod } = req.body;
  const errors = [];

  // Customer Name
  if (!customerName || typeof customerName !== 'string' || !customerName.trim()) {
    errors.push({ field: 'customerName', message: 'Customer full name is required' });
  }

  // Phone
  const cleanedPhone = (phone || '').replace(/[\s-]/g, '');
  if (!cleanedPhone) {
    errors.push({ field: 'phone', message: 'Phone number is required' });
  } else if (!/^[6-9]\d{9}$/.test(cleanedPhone)) {
    errors.push({ field: 'phone', message: 'Please provide a valid 10-digit Indian phone number' });
  }

  // Email
  if (!email || typeof email !== 'string' || !email.trim()) {
    errors.push({ field: 'email', message: 'Email address is required' });
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push({ field: 'email', message: 'Please provide a valid email address' });
  }

  // Order Type
  if (!orderType || !['delivery', 'pickup'].includes(orderType)) {
    errors.push({ field: 'orderType', message: "Order type must be either 'delivery' or 'pickup'" });
  }

  // Delivery Address
  if (orderType === 'delivery' && (!deliveryAddress || typeof deliveryAddress !== 'string' || !deliveryAddress.trim())) {
    errors.push({ field: 'deliveryAddress', message: 'Delivery address is required for doorstep orders' });
  }

  // Items
  if (!Array.isArray(items) || items.length === 0) {
    errors.push({ field: 'items', message: 'Cart must contain at least one menu item' });
  } else {
    items.forEach((item, index) => {
      if (!item.menuItemId) {
        errors.push({ field: `items[${index}].menuItemId`, message: 'Menu item ID is required' });
      }
      const qty = Number(item.quantity);
      if (!Number.isInteger(qty) || qty < 1 || qty > 50) {
        errors.push({ field: `items[${index}].quantity`, message: 'Quantity must be an integer between 1 and 50' });
      }
    });
  }

  // Payment Method
  if (!paymentMethod || !['razorpay', 'cod'].includes(paymentMethod)) {
    errors.push({ field: 'paymentMethod', message: "Payment method must be 'razorpay' or 'cod'" });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  next();
};

export const validateReservationInput = (req, res, next) => {
  const { customerName, phone, email, reservationDate, timeSlot, guests } = req.body;
  const errors = [];

  // Customer Name
  if (!customerName || typeof customerName !== 'string' || !customerName.trim()) {
    errors.push({ field: 'customerName', message: 'Customer name is required' });
  }

  // Phone
  const cleanedPhone = (phone || '').replace(/[\s-]/g, '');
  if (!cleanedPhone) {
    errors.push({ field: 'phone', message: 'Phone number is required' });
  } else if (!/^[6-9]\d{9}$/.test(cleanedPhone)) {
    errors.push({ field: 'phone', message: 'Please provide a valid 10-digit Indian phone number' });
  }

  // Email
  if (!email || typeof email !== 'string' || !email.trim()) {
    errors.push({ field: 'email', message: 'Email address is required' });
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push({ field: 'email', message: 'Please provide a valid email address' });
  }

  // Reservation Date
  const todayStr = new Date().toISOString().split('T')[0];
  if (!reservationDate || typeof reservationDate !== 'string') {
    errors.push({ field: 'reservationDate', message: 'Reservation date is required (YYYY-MM-DD)' });
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(reservationDate)) {
    errors.push({ field: 'reservationDate', message: 'Invalid date format. Expected YYYY-MM-DD' });
  } else if (reservationDate < todayStr) {
    errors.push({ field: 'reservationDate', message: 'Reservation date cannot be in the past' });
  }

  // Time Slot
  if (!timeSlot || !TIME_SLOTS.includes(timeSlot)) {
    errors.push({
      field: 'timeSlot',
      message: `Invalid time slot. Allowed values: ${TIME_SLOTS.join(', ')}`,
    });
  }

  // Guests
  const guestCount = Number(guests);
  if (!Number.isInteger(guestCount) || guestCount < 1 || guestCount > 20) {
    errors.push({ field: 'guests', message: 'Party size must be between 1 and 20 guests' });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  next();
};
