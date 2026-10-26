import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, Clock, MapPin, Phone, ArrowRight, Printer, Sparkles, UtensilsCrossed, Loader2 } from 'lucide-react';
import { Order } from '../types';
import { fetchOrderById } from '../services/api';

export const OrderConfirmationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadOrder = async () => {
      if (!orderId) {
        // Fallback to local storage if no ID passed
        const lastOrderStr = localStorage.getItem('urban_bites_last_order');
        if (lastOrderStr && isMounted) {
          setOrder(JSON.parse(lastOrderStr));
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);
      try {
        const liveOrder = await fetchOrderById(orderId);
        if (isMounted) {
          setOrder(liveOrder);
        }
      } catch (err) {
        console.warn('Could not fetch live order from API, checking local storage:', err);
        // Fallback to local storage
        const lastOrderStr = localStorage.getItem('urban_bites_last_order');
        if (lastOrderStr && isMounted) {
          const parsed = JSON.parse(lastOrderStr);
          if (parsed.orderId === orderId || parsed.id === orderId) {
            setOrder(parsed);
          }
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadOrder();

    return () => {
      isMounted = false;
    };
  }, [orderId]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="py-24 bg-cream-100 min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-brand-600 animate-spin" />
        <p className="text-sm font-semibold text-charcoal-800">
          Loading your order details...
        </p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-24 bg-cream-100 min-h-[60vh] text-center space-y-4 max-w-md mx-auto px-4">
        <h2 className="font-serif text-2xl font-bold text-charcoal-900">Order Not Found</h2>
        <p className="text-sm text-charcoal-800">
          We could not find the order reference specified ({orderId || 'none'}).
        </p>
        <Link
          to="/menu"
          className="inline-block px-6 py-3 rounded-full bg-brand-600 text-white font-bold text-xs shadow-md"
        >
          Explore Menu
        </Link>
      </div>
    );
  }

  const steps = [
    { title: 'Order Placed', status: 'completed' },
    { title: 'Confirmed by Kitchen', status: 'completed' },
    {
      title: 'Preparing Food',
      status: ['preparing', 'ready', 'out_for_delivery', 'delivered'].includes(order.orderStatus)
        ? 'completed'
        : 'current',
    },
    {
      title: order.orderType === 'delivery' ? 'Out for Delivery' : 'Ready for Pickup',
      status: ['ready', 'out_for_delivery', 'delivered'].includes(order.orderStatus)
        ? 'completed'
        : 'upcoming',
    },
    { title: 'Delivered', status: order.orderStatus === 'delivered' ? 'completed' : 'upcoming' },
  ];

  return (
    <div className="py-12 bg-cream-100 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Success Banner */}
        <div className="bg-white rounded-3xl p-8 border border-warmgray-200 shadow-warm text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-700">
              Order Confirmed
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-900">
              Thank You for Dining With Us!
            </h1>
            <p className="text-sm text-charcoal-800">
              Order reference:{' '}
              <strong className="font-mono text-brand-600">{order.orderId || order.id}</strong>
            </p>
          </div>

          {/* Live Tracker Steps */}
          <div className="pt-6 border-t border-warmgray-100">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-left sm:text-center">
              {steps.map((step, idx) => (
                <div key={idx} className="flex flex-col items-start sm:items-center p-2 rounded-xl">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-1.5 ${
                      step.status === 'completed'
                        ? 'bg-emerald-600 text-white'
                        : step.status === 'current'
                        ? 'bg-brand-600 text-white animate-pulse'
                        : 'bg-warmgray-200 text-warmgray-400'
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <span
                    className={`text-xs font-semibold ${
                      step.status === 'completed'
                        ? 'text-emerald-700'
                        : step.status === 'current'
                        ? 'text-brand-600 font-bold'
                        : 'text-warmgray-400'
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Details & Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Estimated Time Card */}
          <div className="bg-white rounded-2xl p-5 border border-warmgray-200 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-warmgray-400 font-medium">Estimated Arrival</p>
              <p className="font-bold text-base text-charcoal-900">30 – 40 Minutes</p>
            </div>
          </div>

          {/* Delivery or Pickup Address */}
          <div className="bg-white rounded-2xl p-5 border border-warmgray-200 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 shrink-0">
              <MapPin className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-warmgray-400 font-medium">
                {order.orderType === 'delivery' ? 'Deliver to' : 'Pickup at'}
              </p>
              <p className="font-bold text-xs text-charcoal-900 truncate">
                {order.deliveryAddress || 'Urban Bites Indiranagar Counter'}
              </p>
            </div>
          </div>

          {/* Contact Details */}
          <div className="bg-white rounded-2xl p-5 border border-warmgray-200 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 shrink-0">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-warmgray-400 font-medium">Customer Contact</p>
              <p className="font-bold text-xs text-charcoal-900">{order.customerName}</p>
              <p className="text-[11px] text-warmgray-400">{order.phone}</p>
            </div>
          </div>
        </div>

        {/* Detailed Itemized Receipt */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-warmgray-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-warmgray-100 pb-4">
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="w-5 h-5 text-brand-600" />
              <h2 className="font-bold text-lg text-charcoal-900">Ordered Delicacies</h2>
            </div>
            <button
              onClick={handlePrint}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-warmgray-300 text-xs font-semibold text-charcoal-800 hover:bg-cream-100 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Receipt</span>
            </button>
          </div>

          {/* Items */}
          <div className="divide-y divide-warmgray-100">
            {order.items.map((item, idx) => (
              <div key={idx} className="py-3 flex justify-between items-center text-sm">
                <div>
                  <p className="font-bold text-charcoal-900">
                    {item.name || item.menuItem?.name}{' '}
                    <span className="text-xs font-medium text-warmgray-400 ml-1">
                      × {item.quantity}
                    </span>
                  </p>
                  <p className="text-xs text-warmgray-400">
                    ₹{item.price} each
                  </p>
                </div>
                <span className="font-bold text-charcoal-900">
                  ₹{item.itemTotal || (item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          {/* Financial Breakdown */}
          <div className="pt-4 border-t border-warmgray-200 space-y-2 text-xs">
            <div className="flex justify-between text-charcoal-800">
              <span>Subtotal</span>
              <span className="font-semibold text-charcoal-900">₹{order.subtotal}</span>
            </div>
            <div className="flex justify-between text-charcoal-800">
              <span>Delivery Fee</span>
              <span className="font-semibold">
                {order.deliveryFee === 0 ? <span className="text-emerald-700 font-bold">FREE</span> : `₹${order.deliveryFee}`}
              </span>
            </div>
            <div className="flex justify-between text-charcoal-800">
              <span>GST Taxes (5%)</span>
              <span className="font-semibold text-charcoal-900">₹{order.tax}</span>
            </div>
            <div className="pt-3 border-t border-warmgray-200 flex justify-between items-baseline text-sm">
              <span className="font-bold text-charcoal-900">Total Payable</span>
              <span className="text-2xl font-extrabold text-brand-600">₹{order.total}</span>
            </div>
          </div>

          {/* Payment Status Pill */}
          <div className="p-4 rounded-2xl bg-cream-50 border border-warmgray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-600" />
                <span>
                  Payment Method:{' '}
                  <strong className="text-charcoal-900">
                    {order.paymentMethod === 'razorpay'
                      ? 'Online Payment'
                      : 'Cash on Delivery (COD)'}
                  </strong>
                </span>
              </div>
              {order.razorpayPaymentId && (
                <p className="text-[11px] font-mono text-warmgray-400">
                  Transaction ID: <span className="text-charcoal-900 font-bold">{order.razorpayPaymentId}</span>
                </p>
              )}
              {order.paymentFailureReason && (
                <p className="text-[11px] text-rose-600">
                  Note: {order.paymentFailureReason}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider self-start sm:self-auto ${
                  order.paymentStatus === 'paid'
                    ? 'bg-emerald-100 text-emerald-800'
                    : order.paymentStatus === 'failed'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                Payment: {order.paymentStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/menu"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-md hover:shadow-warm transition-all"
          >
            <span>Order More Food</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/reservations"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-sm font-bold text-charcoal-900 bg-white hover:bg-cream-200 border border-warmgray-300 shadow-xs transition-all"
          >
            <span>Book a Dine-In Table</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
