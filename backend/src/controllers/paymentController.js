import { Order } from '../models/Order.js';
import {
  getRazorpayInstance,
  verifyRazorpaySignature,
  verifyWebhookSignature,
} from '../config/razorpay.js';

/**
 * @desc Get public payment configuration status (no secrets exposed)
 * @route GET /api/payment/config
 */
export const getPaymentConfig = (req, res) => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const isConfigured = Boolean(
    key_id &&
      process.env.RAZORPAY_KEY_SECRET &&
      !key_id.includes('placeholder') &&
      !process.env.RAZORPAY_KEY_SECRET.includes('placeholder')
  );

  res.status(200).json({
    success: true,
    isConfigured,
    mode: 'test',
    keyId: isConfigured ? key_id : null,
    currency: 'INR',
  });
};

/**
 * @desc Create a Razorpay payment order for an existing Urban Bites order
 * @route POST /api/payment/create-order
 */
export const createPaymentOrder = async (req, res, next) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required to create a payment session.',
      });
    }

    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: `Order #${orderId} was not found.`,
      });
    }

    // Idempotency / guard against double payment
    if (order.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'This order has already been paid for.',
        data: order,
      });
    }

    // Authoritative INR amount converted to paise (1 INR = 100 paise)
    const amountInPaise = Math.round(order.total * 100);

    if (amountInPaise <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order amount for payment creation.',
      });
    }

    const razorpay = getRazorpayInstance();

    // Check if test credentials are configured
    if (!razorpay) {
      return res.status(200).json({
        success: false,
        isConfigured: false,
        message:
          'Razorpay test credentials are not configured on the server. Please configure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend/.env to test live modal payments.',
        orderId: order.orderId,
        amount: amountInPaise,
        total: order.total,
        currency: 'INR',
      });
    }

    // Create order with official Razorpay SDK
    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: order.orderId,
      notes: {
        orderId: order.orderId,
        customerName: order.customerName,
        customerEmail: order.email,
        customerPhone: order.phone,
      },
    });

    // Save generated Razorpay order ID to order record
    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    res.status(200).json({
      success: true,
      isConfigured: true,
      orderId: order.orderId,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      customer: {
        name: order.customerName,
        email: order.email,
        phone: order.phone,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Verify Razorpay payment signature after successful checkout modal flow
 * @route POST /api/payment/verify
 */
export const verifyPayment = async (req, res, next) => {
  try {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({
        success: false,
        message:
          'Missing required payment verification fields (orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature).',
      });
    }

    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: `Order #${orderId} not found.`,
      });
    }

    // Idempotency: If order was already confirmed with this payment ID
    if (order.paymentStatus === 'paid' && order.razorpayPaymentId === razorpayPaymentId) {
      return res.status(200).json({
        success: true,
        message: 'Payment has already been verified and processed (idempotent call).',
        data: order,
      });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    const isValid = verifyRazorpaySignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      secret
    );

    if (!isValid) {
      // Record failure for audit
      order.paymentStatus = 'failed';
      order.paymentFailureReason = 'Cryptographic signature mismatch during verification';
      await order.save();

      return res.status(400).json({
        success: false,
        message:
          'Invalid payment signature. Verification failed or transaction data was tampered with.',
      });
    }

    // Verification succeeded: Transition order to paid and confirmed
    order.paymentStatus = 'paid';
    order.orderStatus = 'confirmed';
    order.razorpayOrderId = razorpayOrderId;
    order.razorpayPaymentId = razorpayPaymentId;
    order.razorpaySignature = razorpaySignature;
    order.paymentFailureReason = undefined;
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Payment verified and order confirmed successfully.',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Record a payment failure or cancellation from client checkout modal
 * @route POST /api/payment/failure
 */
export const handlePaymentFailure = async (req, res, next) => {
  try {
    const { orderId, reason, razorpayPaymentId, razorpayOrderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required to log payment failure.',
      });
    }

    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: `Order #${orderId} not found.`,
      });
    }

    // Only set to failed if not already successfully paid
    if (order.paymentStatus !== 'paid') {
      order.paymentStatus = 'failed';
      order.paymentFailureReason = reason || 'Payment cancelled or dismissed by customer';
      if (razorpayPaymentId) order.razorpayPaymentId = razorpayPaymentId;
      if (razorpayOrderId) order.razorpayOrderId = razorpayOrderId;
      await order.save();
    }

    res.status(200).json({
      success: true,
      message: 'Payment failure recorded.',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Handle asynchronous signed webhook events from Razorpay
 * @route POST /api/payment/webhook
 */
export const handleWebhook = async (req, res, next) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing x-razorpay-signature header.',
      });
    }

    if (!webhookSecret || webhookSecret.includes('placeholder')) {
      return res.status(400).json({
        success: false,
        message: 'Webhook secret is not configured on the server.',
      });
    }

    // Verify signature using the raw body buffer
    const rawBody = req.rawBody || JSON.stringify(req.body);
    const isValid = verifyWebhookSignature(rawBody, signature, webhookSecret);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Webhook signature verification failed.',
      });
    }

    const event = req.body.event;
    const payload = req.body.payload;

    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = payload?.payment?.entity || payload?.order?.entity;
      const orderId =
        paymentEntity?.notes?.orderId || paymentEntity?.receipt;
      const razorpayOrderId = paymentEntity?.order_id || paymentEntity?.id;
      const razorpayPaymentId = paymentEntity?.id;

      if (orderId) {
        const order = await Order.findOne({
          $or: [{ orderId }, { razorpayOrderId }],
        });

        if (order && order.paymentStatus !== 'paid') {
          order.paymentStatus = 'paid';
          order.orderStatus = 'confirmed';
          if (razorpayPaymentId) order.razorpayPaymentId = razorpayPaymentId;
          if (razorpayOrderId) order.razorpayOrderId = razorpayOrderId;
          order.paymentFailureReason = undefined;
          await order.save();
        }
      }
    } else if (event === 'payment.failed') {
      const paymentEntity = payload?.payment?.entity;
      const orderId = paymentEntity?.notes?.orderId || paymentEntity?.receipt;

      if (orderId) {
        const order = await Order.findOne({ orderId });
        if (order && order.paymentStatus !== 'paid') {
          order.paymentStatus = 'failed';
          order.paymentFailureReason =
            paymentEntity?.error_description || 'Payment failed event from Razorpay webhook';
          await order.save();
        }
      }
    }

    res.status(200).json({ status: 'ok', received: true });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Fallback to switch an unpaid order to Cash on Delivery
 * @route POST /api/payment/switch-to-cod
 */
export const switchToCod = async (req, res, next) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required to switch payment method.',
      });
    }

    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: `Order #${orderId} not found.`,
      });
    }

    if (order.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Order is already marked as paid and cannot be switched to COD.',
      });
    }

    order.paymentMethod = 'cod';
    order.paymentStatus = 'pending';
    order.orderStatus = 'confirmed';
    order.paymentFailureReason = undefined;
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order successfully switched to Cash on Delivery and confirmed.',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

