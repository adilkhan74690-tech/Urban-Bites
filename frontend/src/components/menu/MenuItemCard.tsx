import React from 'react';
import { Plus, Minus, Star, Clock } from 'lucide-react';
import { MenuItem } from '../../types';
import { useCart } from '../../context/CartContext';
import { FoodImage } from '../common/FoodImage';
import { VegBadge } from '../common/VegBadge';

interface MenuItemCardProps {
  item: MenuItem;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({ item }) => {
  const { cart, addItem, updateQuantity } = useCart();

  const cartItem = cart.find((ci) => ci.menuItem.id === item.id);
  const currentQuantity = cartItem ? cartItem.quantity : 0;

  const handleAdd = () => {
    if (item.isAvailable) {
      addItem(item, 1);
    }
  };

  const handleIncrement = () => {
    if (item.isAvailable) {
      updateQuantity(item.id, currentQuantity + 1);
    }
  };

  const handleDecrement = () => {
    updateQuantity(item.id, currentQuantity - 1);
  };

  return (
    <article
      className={`group bg-white rounded-2xl border transition-all duration-300 flex flex-col h-full overflow-hidden ${
        item.isAvailable
          ? 'border-warmgray-200 hover:border-brand-300 hover:shadow-warm-hover'
          : 'border-warmgray-200 opacity-70 bg-warmgray-50'
      }`}
    >
      {/* Top Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-warmgray-100">
        <FoodImage
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Veg/Non-Veg & Status Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 items-center z-10">
          <div className="bg-white/95 backdrop-blur-sm px-2 py-1 rounded-lg shadow-sm">
            <VegBadge isVegetarian={item.isVegetarian} showLabel={true} />
          </div>
          {item.isPopular && item.isAvailable && (
            <span className="bg-brand-600 text-white text-[11px] font-bold px-2 py-1 rounded-lg shadow-sm">
              Popular
            </span>
          )}
        </div>

        {/* Availability Badge */}
        {!item.isAvailable && (
          <div className="absolute inset-0 bg-charcoal-900/60 backdrop-blur-[2px] flex items-center justify-center z-20">
            <span className="bg-charcoal-900 text-white text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border border-warmgray-400">
              Unavailable Today
            </span>
          </div>
        )}

        {/* Rating and Prep Time overlay */}
        <div className="absolute bottom-3 right-3 flex items-center gap-2 z-10">
          {item.rating && (
            <div className="bg-white/95 backdrop-blur-sm px-2 py-1 rounded-lg shadow-sm flex items-center gap-1 text-xs font-bold text-charcoal-900">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
              <span>{item.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex flex-col flex-1 justify-between">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-lg text-charcoal-900 group-hover:text-brand-600 transition-colors leading-snug">
              {item.name}
            </h3>
          </div>

          <p className="text-xs text-warmgray-400 font-medium">
            Category: <span className="text-charcoal-800 font-semibold">{item.category}</span>
          </p>

          <p className="text-sm text-warmgray-400 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Bottom Price & Add to Cart Controls */}
        <div className="pt-4 mt-4 border-t border-warmgray-100 flex items-center justify-between gap-2">
          <div>
            <span className="text-xs text-warmgray-400 block font-medium">Price</span>
            <span className="text-xl font-extrabold text-charcoal-900">
              ₹{item.price}
            </span>
          </div>

          <div>
            {!item.isAvailable ? (
              <button
                disabled
                className="px-4 py-2 rounded-xl text-xs font-semibold text-warmgray-400 bg-warmgray-200 cursor-not-allowed"
              >
                Sold Out
              </button>
            ) : currentQuantity > 0 ? (
              <div className="flex items-center bg-brand-50 border border-brand-300 rounded-xl p-1 shadow-sm">
                <button
                  type="button"
                  onClick={handleDecrement}
                  aria-label={`Decrease quantity of ${item.name}`}
                  className="w-8 h-8 rounded-lg bg-white text-brand-700 hover:bg-brand-600 hover:text-white transition-colors flex items-center justify-center font-bold shadow-xs"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center text-sm font-bold text-brand-900">
                  {currentQuantity}
                </span>
                <button
                  type="button"
                  onClick={handleIncrement}
                  aria-label={`Increase quantity of ${item.name}`}
                  className="w-8 h-8 rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition-colors flex items-center justify-center font-bold shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleAdd}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 active:scale-95 transition-all shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                <Plus className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>
            )}
          </div>
        </div>

        {item.preparationTime && (
          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-warmgray-400">
            <Clock className="w-3 h-3 text-warmgray-400" />
            <span>Avg. prep time: {item.preparationTime}</span>
          </div>
        )}
      </div>
    </article>
  );
};
