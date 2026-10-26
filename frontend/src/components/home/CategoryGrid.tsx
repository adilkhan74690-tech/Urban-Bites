import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { CategoryType } from '../../types';
import { FoodImage } from '../common/FoodImage';

interface CategoryCardData {
  name: Exclude<CategoryType, 'All'>;
  description: string;
  image: string;
  count: number;
}

const CATEGORIES: CategoryCardData[] = [
  {
    name: 'Burgers',
    description: 'Double smashed patties & artisanal brioche',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
    count: 4,
  },
  {
    name: 'Pizza',
    description: '48hr slow-fermented Neapolitan style crusts',
    image: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=600&q=80',
    count: 4,
  },
  {
    name: 'Indian',
    description: 'Clay-oven charred tikka & rich heritage gravies',
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80',
    count: 4,
  },
  {
    name: 'Starters',
    description: 'Crispy calamari, spicy wings & creamy dips',
    image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=600&q=80',
    count: 4,
  },
  {
    name: 'Desserts',
    description: 'Warm molten lava cake & fusion tres leches',
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80',
    count: 3,
  },
  {
    name: 'Beverages',
    description: 'Craft mocktails, cold brews & sparkling sodas',
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
    count: 3,
  },
];

export const CategoryGrid: React.FC = () => {
  return (
    <section className="py-16 bg-cream-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-brand-600 block mb-2">
              Curated Menu Collections
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-900">
              Explore by Category
            </h2>
          </div>
          <Link
            to="/menu"
            className="inline-flex items-center gap-2 text-sm font-bold text-brand-600 hover:text-brand-700 transition-colors group"
          >
            <span>View Full Menu</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              to={`/menu?category=${cat.name}`}
              className="group relative rounded-2xl overflow-hidden bg-white border border-warmgray-200 hover:border-brand-300 shadow-sm hover:shadow-warm-hover transition-all duration-300 flex flex-col"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-warmgray-200">
                <FoodImage
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/80 via-charcoal-900/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-brand-300 bg-charcoal-900/60 px-2 py-0.5 rounded-md inline-block mb-1">
                    {cat.count} Delicacies
                  </span>
                  <h3 className="font-serif text-2xl font-bold leading-tight">
                    {cat.name}
                  </h3>
                </div>
              </div>
              <div className="p-4 flex items-center justify-between text-xs text-charcoal-800 bg-white">
                <span className="line-clamp-1">{cat.description}</span>
                <span className="text-brand-600 font-bold group-hover:translate-x-0.5 transition-transform shrink-0 ml-2">
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
