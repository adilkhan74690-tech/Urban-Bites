import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Truck, Store, AlertCircle, Sparkles, ChefHat } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { RESTAURANT_INFO } from '../data/menuData';
import { FoodImage } from '../components/common/FoodImage';
import { VegBadge } from '../components/common/VegBadge';

export const CartPage: React.FC = () => {
  const {
    cart,
    updateQuantity,
    removeItem,
    clearCart,
    subtotal,
    deliveryFee,
    tax,
    total,
    orderType,
    setOrderType,
  } = useCart();

  const navigate = useNavigate();
  const [cookingNote, setCookingNote] = useState(() => {
    return localStorage.getItem('urban_bites_order_notes') || '';
  });

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setCookingNote(val);
    localStorage.setItem('urban_bites_order_notes', val);
  };

  const amountToFreeDelivery = Math.max(0, RESTAURANT_INFO.freeDeliveryThreshold - subtotal);
  const freeDeliveryProgress = Math.min(100, (subtotal / RESTAURANT_INFO.freeDeliveryThreshold) * 100);

  if (cart.length === 0) {
    return (
      <div className="py-20 bg-cream-100 min-h-[70vh] flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 text-center space-y-6">
          <div className="w-24 h-24 rounded-3xl bg-white border border-warmgray-200 shadow-warm mx-auto flex items-center justify-center text-brand-600">
            <ShoppingBag className="w-12 h-12 stroke-[1.5]" />
          </div>
          <div className="space-y-2">
            <h2 className="font-serif text-3xl font-bold text-charcoal-900">
              Your Cart is Empty
            </h2>
            <p className="text-sm text-charcoal-800 leading-relaxed">
              Looks like you haven't added any of our delicious creations yet. Discover our artisanal burgers, sourdough pizzas, and slow-cooked curries!
            </p>
          </div>
          <Link
            to="/menu"
            className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-md hover:shadow-warm transition-all"
          >
            <span>Explore Menu</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-cream-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-warmgray-200 pb-6">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-900">
              Your Dining Cart
            </h1>
            <p className="text-sm text-charcoal-800 mt-1">
              Review your items before proceeding to secure checkout.
            </p>
          </div>
          <button
            onClick={clearCart}
            type="button"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-2 rounded-xl border border-rose-200 transition-colors self-start sm:self-auto"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear Entire Cart</span>
          </button>
        </div>

        {/* Free delivery tier progress bar */}
        {orderType === 'delivery' && (
          <div className="bg-white rounded-2xl p-4 border border-warmgray-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="flex items-center gap-1.5 text-charcoal-900">
                <Truck className="w-4 h-4 text-brand-600" />
                {amountToFreeDelivery === 0 ? (
                  <span className="text-emerald-700 font-extrabold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    Congratulations! You unlocked FREE Delivery!
                  </span>
                ) : (
                  <span>
                    Add <strong className="text-brand-600">₹{amountToFreeDelivery}</strong> more for FREE delivery
                  </span>
                )}
              </span>
              <span className="text-warmgray-400">Min. ₹{RESTAURANT_INFO.freeDeliveryThreshold}</span>
            </div>
            <div className="w-full h-2 rounded-full bg-cream-200 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  amountToFreeDelivery === 0 ? 'bg-emerald-500' : 'bg-brand-500'
                }`}
                style={{ width: `${freeDeliveryProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Main Grid: Cart Items vs Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Cart Items List */}
          <div className="lg:col-span-7 space-y-4">
            {/* Delivery / Pickup selector */}
            <div className="bg-white rounded-2xl p-4 border border-warmgray-200 shadow-xs flex items-center justify-between gap-4">
              <span className="text-xs font-bold uppercase tracking-wider text-charcoal-900">
                Fulfillment Type:
              </span>
              <div className="flex rounded-xl bg-cream-100 p-1 border border-warmgray-200">
                <button
                  type="button"
                  onClick={() => setOrderType('delivery')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    orderType === 'delivery'
                      ? 'bg-white text-brand-600 shadow-sm'
                      : 'text-charcoal-800 hover:text-charcoal-900'
                  }`}
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Doorstep Delivery</span>
                </button>
                <button
                  type="button"
                  onClick={() => setOrderType('pickup')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    orderType === 'pickup'
                      ? 'bg-white text-brand-600 shadow-sm'
                      : 'text-charcoal-800 hover:text-charcoal-900'
                  }`}
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>Dine-In / Takeaway</span>
                </button>
              </div>
            </div>

            {/* Item Rows */}
            <div className="bg-white rounded-3xl border border-warmgray-200 shadow-sm divide-y divide-warmgray-100 overflow-hidden">
              {cart.map(({ menuItem, quantity }) => (
                <div key={menuItem.id} className="p-4 sm:p-5 flex items-center gap-4 hover:bg-cream-50/50 transition-colors">
                  {/* Food Image */}
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-warmgray-200 shrink-0">
                    <FoodImage
                      src={menuItem.image}
                      alt={menuItem.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <VegBadge isVegetarian={menuItem.isVegetarian} />
                      <span className="text-[11px] font-semibold text-warmgray-400 uppercase tracking-wider">
                        {menuItem.category}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm sm:text-base text-charcoal-900 truncate">
                      {menuItem.name}
                    </h3>
                    <p className="text-xs text-warmgray-400 mt-0.5">
                      ₹{menuItem.price} each
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center bg-cream-100 border border-warmgray-200 rounded-xl p-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => updateQuantity(menuItem.id, quantity - 1)}
                      aria-label="Decrease quantity"
                      className="w-7 h-7 rounded-lg bg-white text-charcoal-800 hover:bg-rose-50 hover:text-rose-600 transition-colors flex items-center justify-center shadow-xs"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-7 text-center text-xs font-bold text-charcoal-900">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(menuItem.id, quantity + 1)}
                      aria-label="Increase quantity"
                      className="w-7 h-7 rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition-colors flex items-center justify-center shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Line Total & Remove */}
                  <div className="text-right shrink-0 min-w-[70px]">
                    <p className="text-base font-extrabold text-charcoal-900">
                      ₹{menuItem.price * quantity}
                    </p>
                    <button
                      type="button"
                      onClick={() => removeItem(menuItem.id)}
                      className="text-xs text-warmgray-400 hover:text-rose-600 transition-colors mt-1 inline-flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Special Instructions Note Input */}
            <div className="bg-white rounded-2xl p-5 border border-warmgray-200 shadow-xs space-y-2">
              <label htmlFor="cooking-notes" className="flex items-center gap-2 text-xs font-bold text-charcoal-900 uppercase tracking-wider">
                <ChefHat className="w-4 h-4 text-brand-600" />
                <span>Special Cooking / Delivery Instructions (Optional)</span>
              </label>
              <textarea
                id="cooking-notes"
                rows={2}
                value={cookingNote}
                onChange={handleNoteChange}
                placeholder="e.g. Less spicy, dressing on the side, ring door bell twice..."
                className="w-full p-3 rounded-xl bg-cream-50 border border-warmgray-200 text-xs text-charcoal-900 placeholder:text-warmgray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Right Column: Order Bill Summary */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-warmgray-200 shadow-sm space-y-6 sticky top-28">
            <h2 className="font-serif text-xl font-bold text-charcoal-900 border-b border-warmgray-100 pb-4">
              Bill Summary
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-charcoal-800">
                <span>Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span className="font-semibold text-charcoal-900">₹{subtotal}</span>
              </div>

              <div className="flex justify-between text-charcoal-800">
                <span className="flex items-center gap-1">
                  <span>Delivery Fee</span>
                  {orderType === 'pickup' && (
                    <span className="text-[10px] text-warmgray-400">(Pickup Selected)</span>
                  )}
                </span>
                <span className="font-semibold">
                  {deliveryFee === 0 ? (
                    <span className="text-emerald-700 font-bold uppercase text-xs">FREE</span>
                  ) : (
                    `₹${deliveryFee}`
                  )}
                </span>
              </div>

              <div className="flex justify-between text-charcoal-800">
                <span className="flex items-center gap-1">
                  <span>GST Taxes (5%)</span>
                  <span className="text-[10px] text-warmgray-400" title="Standard restaurant tax">
                    (?)
                  </span>
                </span>
                <span className="font-semibold text-charcoal-900">₹{tax}</span>
              </div>

              <div className="pt-3 border-t border-warmgray-200 flex justify-between items-baseline">
                <div>
                  <span className="text-base font-bold text-charcoal-900">To Pay</span>
                  <span className="block text-[11px] text-warmgray-400">Inclusive of all taxes</span>
                </div>
                <span className="text-2xl font-extrabold text-brand-600">
                  ₹{total}
                </span>
              </div>
            </div>

            {/* Revalidation & Security Guarantee Notice */}
            <div className="p-3.5 rounded-xl bg-cream-50 border border-warmgray-200 flex items-start gap-2.5 text-xs text-charcoal-800">
              <AlertCircle className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Item prices and real-time kitchen availability will be re-validated by the server upon checkout.
              </p>
            </div>

            {/* Checkout Action Button */}
            <button
              onClick={() => navigate('/checkout')}
              type="button"
              className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md hover:shadow-warm transition-all"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center">
              <Link
                to="/menu"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 hover:underline"
              >
                + Add more delicious items from menu
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
