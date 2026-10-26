import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, RotateCcw, Utensils, Check } from 'lucide-react';
import { CategoryType, MenuItem } from '../types';
import { INITIAL_MENU_ITEMS } from '../data/menuData';
import { MenuItemCard } from '../components/menu/MenuItemCard';
import { VegBadge } from '../components/common/VegBadge';
import { fetchMenuItems } from '../services/api';

const CATEGORIES: CategoryType[] = [
  'All',
  'Burgers',
  'Pizza',
  'Indian',
  'Starters',
  'Desserts',
  'Beverages',
];

type SortOption = 'default' | 'price-asc' | 'price-desc' | 'rating-desc';

export const MenuPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') as CategoryType | null;

  const [selectedCategory, setSelectedCategory] = useState<CategoryType>(
    categoryParam && CATEGORIES.includes(categoryParam) ? categoryParam : 'All'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [vegOnly, setVegOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('default');

  // Backend API state
  const [dishes, setDishes] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadMenu = async () => {
    setIsLoading(true);
    try {
      const items = await fetchMenuItems();
      if (items && items.length > 0) {
        setDishes(items);
      } else {
        setDishes(INITIAL_MENU_ITEMS);
      }
    } catch (err: any) {
      console.warn('Backend API connection note:', err.message);
      setDishes(INITIAL_MENU_ITEMS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMenu();
  }, []);

  // Sync category param with URL query
  useEffect(() => {
    if (categoryParam && CATEGORIES.includes(categoryParam)) {
      setSelectedCategory(categoryParam);
    }
  }, [categoryParam]);

  const handleCategorySelect = (cat: CategoryType) => {
    setSelectedCategory(cat);
    if (cat === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', cat);
    }
    setSearchParams(searchParams, { replace: true });
  };

  const resetFilters = () => {
    setSelectedCategory('All');
    setSearchQuery('');
    setVegOnly(false);
    setSortBy('default');
    searchParams.delete('category');
    setSearchParams(searchParams, { replace: true });
  };

  const filteredItems = useMemo(() => {
    return dishes.filter((item: MenuItem) => {
      // Category match
      if (selectedCategory !== 'All' && item.category !== selectedCategory) {
        return false;
      }
      // Veg only match
      if (vegOnly && !item.isVegetarian) {
        return false;
      }
      // Search query match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        const matchesCat = item.category.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesCat) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating-desc') return (b.rating || 0) - (a.rating || 0);
      return 0;
    });
  }, [dishes, selectedCategory, searchQuery, vegOnly, sortBy]);

  const hasActiveFilters = selectedCategory !== 'All' || searchQuery !== '' || vegOnly || sortBy !== 'default';

  return (
    <div className="py-10 bg-cream-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-600 block">
            Artisanal Dining &amp; Takeaway
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-charcoal-900">
            Our Interactive Menu
          </h1>
          <p className="text-sm text-charcoal-800">
            Explore freshly prepared dishes crafted with passion, quality spices, and honest ingredients.
          </p>
        </div>


        {/* Filter & Search Bar */}
        <div className="bg-white rounded-3xl p-4 sm:p-6 border border-warmgray-200 shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-warmgray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by dish name (e.g. Smashed Burger, Butter Chicken, Pizza)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-cream-50 border border-warmgray-200 text-sm text-charcoal-900 placeholder:text-warmgray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-3 text-xs text-warmgray-400 hover:text-charcoal-900"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Controls: Veg Only Toggle & Sort Dropdown */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Veg Toggle */}
              <button
                type="button"
                onClick={() => setVegOnly(!vegOnly)}
                className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                  vegOnly
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-2 ring-emerald-400/20'
                    : 'bg-white text-charcoal-800 border-warmgray-200 hover:bg-cream-100'
                }`}
              >
                <VegBadge isVegetarian={true} />
                <span>Vegetarian Only</span>
                {vegOnly && <Check className="w-3.5 h-3.5 text-emerald-600" />}
              </button>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-warmgray-400 hidden sm:block" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="px-3.5 py-2.5 rounded-xl bg-cream-50 border border-warmgray-200 text-xs font-semibold text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="default">Sort: Recommended</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating-desc">Highest Rated</option>
                </select>
              </div>

              {/* Reset button */}
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none pt-2 border-t border-warmgray-100">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => handleCategorySelect(category)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                  selectedCategory === category
                    ? 'bg-brand-600 text-white shadow-sm ring-2 ring-brand-600/30'
                    : 'bg-cream-100 text-charcoal-800 hover:bg-cream-200 hover:text-charcoal-900 border border-warmgray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Results summary bar */}
        <div className="flex items-center justify-between text-xs text-warmgray-400 px-1">
          <span>
            Showing <strong className="text-charcoal-900">{filteredItems.length}</strong> {filteredItems.length === 1 ? 'dish' : 'dishes'}
            {selectedCategory !== 'All' ? ` in ${selectedCategory}` : ''}
          </span>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-brand-600 hover:underline font-semibold"
            >
              Clear all filters
            </button>
          )}
        </div>

        {/* Loading Skeleton */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-warmgray-200 p-4 space-y-4">
                <div className="aspect-[4/3] rounded-xl bg-warmgray-200" />
                <div className="h-4 bg-warmgray-200 rounded w-3/4" />
                <div className="h-3 bg-warmgray-200 rounded w-1/2" />
                <div className="pt-4 flex justify-between items-center border-t border-warmgray-100">
                  <div className="h-5 bg-warmgray-200 rounded w-16" />
                  <div className="h-8 bg-warmgray-200 rounded-xl w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredItems.length > 0 ? (
          /* Dish Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((dish) => (
              <MenuItemCard key={dish.id} item={dish} />
            ))}
          </div>
        ) : (
          /* Empty Filter State */
          <div className="bg-white rounded-3xl p-12 text-center border border-warmgray-200 max-w-lg mx-auto space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-cream-200 text-brand-600 mx-auto flex items-center justify-center">
              <Utensils className="w-8 h-8" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-charcoal-900">
              No Dishes Found
            </h3>
            <p className="text-sm text-warmgray-400">
              We couldn't find any dishes matching your current filter or search criteria.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 transition-colors shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters &amp; View All</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
