import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { INITIAL_MENU_ITEMS } from '../../data/menuData';
import { MenuItemCard } from '../menu/MenuItemCard';

export const PopularDishes: React.FC = () => {
  const popularDishes = INITIAL_MENU_ITEMS.filter((item) => item.isPopular && item.isAvailable).slice(0, 4);

  return (
    <section className="py-16 bg-cream-50 border-y border-warmgray-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-brand-600 mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Customer Favorites</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-900">
              Popular Dishes
            </h2>
            <p className="text-sm text-warmgray-400 mt-1 max-w-xl">
              Hand-picked bestsellers loved by our daily diners in Bengaluru. Prepared fresh to order.
            </p>
          </div>

          <Link
            to="/menu"
            className="inline-flex items-center gap-2 text-sm font-bold text-brand-600 hover:text-brand-700 transition-colors group"
          >
            <span>See All Dishes ({INITIAL_MENU_ITEMS.length})</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {popularDishes.map((dish) => (
            <MenuItemCard key={dish.id} item={dish} />
          ))}
        </div>
      </div>
    </section>
  );
};
