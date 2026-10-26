import Razorpay from 'razorpay';
import crypto from 'node:crypto';

/**
 * Returns configured Razorpay SDK instance, or null if test credentials are not set
 */
export const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (
    !key_id ||
    !key_secret ||
    key_id.includes('placeholder') ||
    key_secret.includes('placeholder')
  ) {
    return null;
  }

  return new Razorpay({
    key_id,
    key_secret,
  });
};

/**
 * Verifies Razorpay payment signature using timing-safe comparison
 * @param {string} orderId - Razorpay Order ID (e.g. order_O8k...)
 * @param {string} paymentId - Razorpay Payment ID (e.g. pay_O8k...)
 * @param {string} signature - Razorpay Signature from Checkout callback
 * @param {string} secret - Razorpay Key Secret from environment
 * @returns {boolean}
 */
export const verifyRazorpaySignature = (orderId, paymentId, signature, secret) => {
  if (!orderId || !paymentId || !signature || !secret) {
    return false;
  }

  try {
    const text = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(text)
      .digest('hex');

    const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
    const receivedBuffer = Buffer.from(signature, 'utf8');

    if (expectedBuffer.length !== receivedBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
  } catch (err) {
    console.error('[Razorpay Signature Error]', err);
    return false;
  }
};

/**
 * Verifies Razorpay Webhook signature using raw request body
 * @param {string|Buffer} rawBody - Raw body buffer/string received from Razorpay
 * @param {string} signature - Value from 'x-razorpay-signature' header
 * @param {string} webhookSecret - Razorpay Webhook Secret from environment
 * @returns {boolean}
 */
export const verifyWebhookSignature = (rawBody, signature, webhookSecret) => {
  if (!rawBody || !signature || !webhookSecret) {
    return false;
  }

  try {
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
    const receivedBuffer = Buffer.from(signature, 'utf8');

    if (expectedBuffer.length !== receivedBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
  } catch (err) {
    console.error('[Razorpay Webhook Error]', err);
    return false;
  }
};
