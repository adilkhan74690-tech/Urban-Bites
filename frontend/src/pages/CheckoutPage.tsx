import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Truck,
  Store,
  CreditCard,
  Banknote,
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { PaymentMethod, Order } from '../types';
import {
  createOrder,
  fetchPaymentConfig,
  createRazorpayPaymentOrder,
  verifyRazorpayPayment,
  recordPaymentFailureApi,
  PaymentConfigResponse,
} from '../services/api';
import { loadRazorpayScript } from '../utils/loadRazorpay';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart, subtotal, deliveryFee, tax, total, orderType, setOrderType, clearCart } = useCart();

  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    email: '',
    deliveryAddress: '',
    notes: localStorage.getItem('urban_bites_order_notes') || '',
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);

  // Payment configuration status
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfigResponse | null>(null);

  useEffect(() => {
    fetchPaymentConfig()
      .then((cfg) => {
        setPaymentConfig(cfg);
        if (cfg && !cfg.isConfigured && paymentMethod === 'razorpay') {
          setPaymentMethod('cod');
        }
      })
      .catch((err) => console.warn('Payment configuration check:', err));
  }, [paymentMethod]);

  if (cart.length === 0) {
    return (
      <div className="py-20 bg-cream-100 min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md px-4">
          <h2 className="font-serif text-2xl font-bold text-charcoal-900">Your Cart is Empty</h2>
          <p className="text-sm text-charcoal-800">
            Please add some food items to your cart before proceeding to checkout.
          </p>
          <Link
            to="/menu"
            className="inline-block px-6 py-3 rounded-full bg-brand-600 text-white font-bold text-sm shadow-md hover:bg-brand-700 transition-colors"
          >
            Explore Menu
          </Link>
        </div>
      </div>
    );
  }

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.customerName.trim()) {
      errs.customerName = 'Please enter your full name.';
    }
    if (!formData.phone.trim()) {
      errs.phone = 'Please enter your contact phone number.';
    } else if (!/^[6-9]\d{9}$/.test(formData.phone.replace(/[\s-]/g, ''))) {
      errs.phone = 'Please enter a valid 10-digit Indian phone number.';
    }

    if (!formData.email.trim()) {
      errs.email = 'Please enter your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = 'Please enter a valid email address.';
    }

    if (orderType === 'delivery' && !formData.deliveryAddress.trim()) {
      errs.deliveryAddress = 'Delivery address is required for doorstep orders.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setServerError(null);

    const orderPayload = {
      customerName: formData.customerName.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      orderType,
      deliveryAddress: orderType === 'delivery' ? formData.deliveryAddress.trim() : undefined,
      notes: formData.notes.trim() || undefined,
      items: cart.map((item) => ({
        menuItemId: item.menuItem.id,
        quantity: item.quantity,
        price: item.menuItem.price,
      })),
      paymentMethod,
    };

    try {
      // 1. Submit order to backend
      const createdOrder: Order = await createOrder(orderPayload);
      const generatedOrderId = createdOrder.orderId || createdOrder.id;

      // Cash on Delivery fulfillment
      if (paymentMethod === 'cod') {
        try {
          const existing = JSON.parse(localStorage.getItem('urban_bites_orders') || '[]');
          localStorage.setItem('urban_bites_orders', JSON.stringify([createdOrder, ...existing]));
          localStorage.setItem('urban_bites_last_order', JSON.stringify(createdOrder));
        } catch (e) {
          console.error(e);
        }

        clearCart();
        setIsSubmitting(false);
        navigate(`/order-confirmation?orderId=${generatedOrderId}`);
        return;
      }

      // Online payment via Razorpay
      if (paymentMethod === 'razorpay') {
        const paymentSession = await createRazorpayPaymentOrder(generatedOrderId);

        // If online payment is unavailable on server, gracefully switch to COD
        if (!paymentSession.isConfigured || !paymentSession.razorpayOrderId) {
          setIsSubmitting(false);
          setPaymentMethod('cod');
          setServerError(
            'Online payment is temporarily unavailable. We have selected Cash on Delivery for your order. Please click "Place Order" to confirm.'
          );
          return;
        }

        // Load Razorpay checkout script
        const isLoaded = await loadRazorpayScript();
        if (!isLoaded || !(window as any).Razorpay) {
          setIsSubmitting(false);
          setPaymentMethod('cod');
          setServerError(
            'Online payment could not be opened. Please use Cash on Delivery to complete your order.'
          );
          return;
        }

        // Configure checkout popup
        const options = {
          key: paymentSession.keyId,
          amount: paymentSession.amount,
          currency: paymentSession.currency || 'INR',
          name: 'Urban Bites',
          description: `Order #${generatedOrderId}`,
          image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=128&q=80',
          order_id: paymentSession.razorpayOrderId,
          prefill: {
            name: createdOrder.customerName,
            email: createdOrder.email,
            contact: createdOrder.phone,
          },
          theme: {
            color: '#E05822',
          },
          handler: async function (response: any) {
            try {
              setIsVerifyingPayment(true);
              const verifyRes = await verifyRazorpayPayment({
                orderId: generatedOrderId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });

              try {
                const existing = JSON.parse(localStorage.getItem('urban_bites_orders') || '[]');
                localStorage.setItem(
                  'urban_bites_orders',
                  JSON.stringify([verifyRes.data, ...existing])
                );
                localStorage.setItem('urban_bites_last_order', JSON.stringify(verifyRes.data));
              } catch (e) {
                console.error(e);
              }

              clearCart();
              setIsVerifyingPayment(false);
              setIsSubmitting(false);
              navigate(`/order-confirmation?orderId=${generatedOrderId}`);
            } catch (err: any) {
              console.error('Payment verification failed:', err);
              setIsVerifyingPayment(false);
              setIsSubmitting(false);
              setServerError('Payment verification could not be confirmed. Please contact our support.');
            }
          },
          modal: {
            ondismiss: async function () {
              setIsSubmitting(false);
              await recordPaymentFailureApi({
                orderId: generatedOrderId,
                reason: 'Checkout window closed before payment',
                razorpayOrderId: paymentSession.razorpayOrderId,
              });
              setServerError(
                'Payment was not completed. You may retry payment or select Cash on Delivery.'
              );
            },
          },
        };

        const razorpayInstance = new (window as any).Razorpay(options);

        razorpayInstance.on('payment.failed', async function (response: any) {
          setIsSubmitting(false);
          const failDesc = response.error?.description || 'Payment was declined';
          await recordPaymentFailureApi({
            orderId: generatedOrderId,
            reason: failDesc,
            razorpayPaymentId: response.error?.metadata?.payment_id,
            razorpayOrderId: response.error?.metadata?.order_id,
          });
          setServerError(`Payment was not completed (${failDesc}). You can retry or choose Cash on Delivery.`);
        });

        razorpayInstance.open();
      }
    } catch (err: any) {
      console.error('Order creation failed:', err);
      setIsSubmitting(false);
      setServerError(err.message || 'Failed to place order. Please review your details and try again.');
    }
  };

  return (
    <div className="py-12 bg-cream-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-warmgray-400">
          <Link to="/cart" className="hover:text-charcoal-900 flex items-center gap-1 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Cart</span>
          </Link>
          <span>/</span>
          <span className="text-charcoal-900">Checkout</span>
        </div>

        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-900">
            Checkout
          </h1>
          <p className="text-sm text-charcoal-800 mt-1">
            Provide your dining details and preferred payment method.
          </p>
        </div>

        {/* User Alert */}
        {serverError && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3 text-sm animate-fadeIn">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">Notice</p>
              <p className="text-xs text-amber-800 leading-relaxed">{serverError}</p>
            </div>
          </div>
        )}

        {/* Verification Loader Modal */}
        {isVerifyingPayment && (
          <div className="fixed inset-0 z-50 bg-charcoal-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center space-y-4 shadow-2xl">
              <div className="w-14 h-14 rounded-full bg-brand-50 text-brand-600 mx-auto flex items-center justify-center">
                <Loader2 className="w-7 h-7 animate-spin" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-lg font-bold text-charcoal-900">
                  Verifying Payment
                </h3>
                <p className="text-xs text-charcoal-800 leading-relaxed">
                  Confirming your transaction details. Please do not refresh.
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Form: Customer Details & Fulfillment */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Fulfillment Type */}
            <div className="bg-white rounded-3xl p-6 border border-warmgray-200 shadow-sm space-y-4">
              <h2 className="font-bold text-base text-charcoal-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-brand-600 text-white text-xs flex items-center justify-center font-bold">1</span>
                <span>Select Order Type</span>
              </h2>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setOrderType('delivery')}
                  className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                    orderType === 'delivery'
                      ? 'border-brand-600 bg-brand-50/60 ring-2 ring-brand-500/20'
                      : 'border-warmgray-200 bg-white hover:bg-cream-50'
                  }`}
                >
                  <Truck className={`w-5 h-5 mb-2 ${orderType === 'delivery' ? 'text-brand-600' : 'text-warmgray-400'}`} />
                  <div>
                    <p className="font-bold text-sm text-charcoal-900">Doorstep Delivery</p>
                    <p className="text-xs text-warmgray-400 mt-0.5">Delivered fresh and hot to your location</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setOrderType('pickup')}
                  className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                    orderType === 'pickup'
                      ? 'border-brand-600 bg-brand-50/60 ring-2 ring-brand-500/20'
                      : 'border-warmgray-200 bg-white hover:bg-cream-50'
                  }`}
                >
                  <Store className={`w-5 h-5 mb-2 ${orderType === 'pickup' ? 'text-brand-600' : 'text-warmgray-400'}`} />
                  <div>
                    <p className="font-bold text-sm text-charcoal-900">Dine-in / Takeaway</p>
                    <p className="text-xs text-warmgray-400 mt-0.5">Pick up at our Indiranagar counter</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Step 2: Contact Information */}
            <div className="bg-white rounded-3xl p-6 border border-warmgray-200 shadow-sm space-y-4">
              <h2 className="font-bold text-base text-charcoal-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-brand-600 text-white text-xs flex items-center justify-center font-bold">2</span>
                <span>Contact Details</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-charcoal-900 uppercase tracking-wider">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    placeholder="e.g. Rahul Sharma"
                    className={`w-full p-3 rounded-xl bg-cream-50 border text-sm text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                      errors.customerName ? 'border-rose-500 bg-rose-50/30' : 'border-warmgray-200'
                    }`}
                  />
                  {errors.customerName && (
                    <p className="text-xs text-rose-500">{errors.customerName}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-charcoal-900 uppercase tracking-wider">
                    Phone Number (10 digits) *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="9876543210"
                    className={`w-full p-3 rounded-xl bg-cream-50 border text-sm text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                      errors.phone ? 'border-rose-500 bg-rose-50/30' : 'border-warmgray-200'
                    }`}
                  />
                  {errors.phone && (
                    <p className="text-xs text-rose-500">{errors.phone}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-charcoal-900 uppercase tracking-wider">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="rahul@example.com"
                    className={`w-full p-3 rounded-xl bg-cream-50 border text-sm text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                      errors.email ? 'border-rose-500 bg-rose-50/30' : 'border-warmgray-200'
                    }`}
                  />
                  {errors.email && (
                    <p className="text-xs text-rose-500">{errors.email}</p>
                  )}
                </div>

                {orderType === 'delivery' && (
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs font-bold text-charcoal-900 uppercase tracking-wider">
                      Complete Delivery Address *
                    </label>
                    <textarea
                      rows={2}
                      value={formData.deliveryAddress}
                      onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                      placeholder="Flat/House number, Apartment/Building, Street, Indiranagar, Bengaluru..."
                      className={`w-full p-3 rounded-xl bg-cream-50 border text-sm text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                        errors.deliveryAddress ? 'border-rose-500 bg-rose-50/30' : 'border-warmgray-200'
                      }`}
                    />
                    {errors.deliveryAddress && (
                      <p className="text-xs text-rose-500">{errors.deliveryAddress}</p>
                    )}
                  </div>
                )}

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-charcoal-900 uppercase tracking-wider">
                    Order / Cooking Notes (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="e.g. Extra napkins, less spicy, leave at door..."
                    className="w-full p-3 rounded-xl bg-cream-50 border border-warmgray-200 text-sm text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Payment Method Selection */}
            <div className="bg-white rounded-3xl p-6 border border-warmgray-200 shadow-sm space-y-4">
              <h2 className="font-bold text-base text-charcoal-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-brand-600 text-white text-xs flex items-center justify-center font-bold">3</span>
                <span>Payment Method</span>
              </h2>

              <div className="space-y-3">
                {/* Cash on Delivery / Counter */}
                <label
                  className={`flex items-start gap-3.5 p-4 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === 'cod'
                      ? 'border-brand-600 bg-brand-50/60 ring-2 ring-brand-500/20'
                      : 'border-warmgray-200 bg-white hover:bg-cream-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="mt-1 text-brand-600 focus:ring-brand-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Banknote className="w-5 h-5 text-emerald-600" />
                        <span className="font-bold text-sm text-charcoal-900">
                          {orderType === 'delivery' ? 'Cash on Delivery (COD)' : 'Pay at Restaurant Counter'}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Available
                      </span>
                    </div>
                    <p className="text-xs text-charcoal-800 mt-1">
                      Pay in cash or card when your order arrives or upon counter pickup.
                    </p>
                  </div>
                </label>

                {/* Online Payment */}
                <label
                  className={`flex items-start gap-3.5 p-4 rounded-2xl border transition-all ${
                    paymentConfig && !paymentConfig.isConfigured
                      ? 'border-warmgray-200 bg-warmgray-100/50 opacity-70 cursor-not-allowed'
                      : paymentMethod === 'razorpay'
                      ? 'border-brand-600 bg-brand-50/60 ring-2 ring-brand-500/20 cursor-pointer'
                      : 'border-warmgray-200 bg-white hover:bg-cream-50 cursor-pointer'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="razorpay"
                    disabled={Boolean(paymentConfig && !paymentConfig.isConfigured)}
                    checked={paymentMethod === 'razorpay'}
                    onChange={() => {
                      if (!paymentConfig || paymentConfig.isConfigured) {
                        setPaymentMethod('razorpay');
                      }
                    }}
                    className="mt-1 text-brand-600 focus:ring-brand-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-brand-600" />
                        <span className="font-bold text-sm text-charcoal-900">
                          Online Payment (UPI, Cards, NetBanking)
                        </span>
                      </div>
                      {paymentConfig && !paymentConfig.isConfigured ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-warmgray-200 text-charcoal-700">
                          Unavailable
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-100 text-brand-800">
                          Instant &amp; Secure
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-charcoal-800 mt-1">
                      {paymentConfig && !paymentConfig.isConfigured
                        ? 'Online payment is currently unavailable. Please select Cash on Delivery.'
                        : 'Pay securely via UPI (Google Pay, PhonePe, Paytm), Credit/Debit Card, or NetBanking.'}
                    </p>
                  </div>
                </label>
              </div>

              {/* Security info */}
              <div className="pt-2 flex items-center gap-2 text-xs text-warmgray-400">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Secure 256-bit encrypted checkout. Prices verified upon order placement.</span>
              </div>
            </div>
          </div>

          {/* Right Summary Sidebar */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-warmgray-200 shadow-sm space-y-6 sticky top-28">
            <h2 className="font-serif text-xl font-bold text-charcoal-900 border-b border-warmgray-100 pb-4">
              Order Summary ({cart.reduce((s, i) => s + i.quantity, 0)} items)
            </h2>

            {/* Quick Item List */}
            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
              {cart.map(({ menuItem, quantity }) => (
                <div key={menuItem.id} className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <span className="w-5 h-5 rounded-md bg-cream-200 flex items-center justify-center font-bold text-charcoal-900 shrink-0">
                      {quantity}×
                    </span>
                    <span className="font-medium text-charcoal-900 truncate">
                      {menuItem.name}
                    </span>
                  </div>
                  <span className="font-bold text-charcoal-900 shrink-0">
                    ₹{menuItem.price * quantity}
                  </span>
                </div>
              ))}
            </div>

            {/* Bill Breakdown */}
            <div className="border-t border-warmgray-100 pt-4 space-y-2 text-xs">
              <div className="flex justify-between text-charcoal-800">
                <span>Items Subtotal</span>
                <span className="font-semibold text-charcoal-900">₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-charcoal-800">
                <span>Delivery Charge</span>
                <span className="font-semibold">
                  {deliveryFee === 0 ? <span className="text-emerald-700 font-bold">FREE</span> : `₹${deliveryFee}`}
                </span>
              </div>
              <div className="flex justify-between text-charcoal-800">
                <span>GST (5%)</span>
                <span className="font-semibold text-charcoal-900">₹{tax}</span>
              </div>
              <div className="pt-3 border-t border-warmgray-200 flex justify-between items-baseline">
                <span className="text-sm font-bold text-charcoal-900">Total Payable</span>
                <span className="text-2xl font-extrabold text-brand-600">₹{total}</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-brand-600 hover:bg-brand-700 disabled:bg-warmgray-300 text-white font-bold text-sm shadow-md hover:shadow-warm transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Order...</span>
                </>
              ) : paymentMethod === 'razorpay' ? (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>Pay Online • ₹{total}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Place Order • ₹{total}</span>
                </>
              )}
            </button>

            {/* Reassurance notice */}
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-900 flex items-start gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Fresh Preparation:</strong> All orders are prepared fresh to order. Real-time kitchen tracking is available once confirmed.
              </span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
