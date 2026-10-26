import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Sparkles, Clock, Flame } from 'lucide-react';
import { FoodImage } from '../common/FoodImage';

export const Hero: React.FC = () => {
  return (
    <section className="relative overflow-hidden pt-8 pb-16 lg:pt-16 lg:pb-24 bg-gradient-to-b from-cream-50 via-cream-100 to-cream-100">
      {/* Decorative Warm Backdrops */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-200/30 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-brand-100/40 rounded-full blur-2xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-100/80 border border-brand-300 text-brand-800 text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              <span>Indiranagar's Favorite Artisanal Kitchen</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-charcoal-900 leading-[1.15]">
              Good Food. <br />
              <span className="text-brand-600 italic font-serif">Great Mood.</span>
            </h1>

            {/* Supporting Copy */}
            <p className="text-base sm:text-lg text-charcoal-800 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Welcome to <span className="font-semibold text-charcoal-900">Urban Bites</span>, where gourmet passion meets everyday warmth. Indulge in 48-hour fermented sourdough pizzas, double smashed prime burgers, slow-simmered Indian heritage curries, and handcrafted desserts — made fresh to order.
            </p>

            {/* CTA Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5">
              <Link
                to="/menu"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 active:scale-95 transition-all shadow-md hover:shadow-warm-hover"
              >
                <span>Explore Menu</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/reservations"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-full text-sm font-bold text-charcoal-900 bg-white hover:bg-cream-200 active:scale-95 transition-all border border-warmgray-300 shadow-sm"
              >
                <Calendar className="w-4 h-4 text-brand-600" />
                <span>Book a Table</span>
              </Link>
            </div>

            {/* Trust highlights */}
            <div className="pt-6 grid grid-cols-3 gap-4 border-t border-warmgray-200/80 text-charcoal-800 max-w-lg mx-auto lg:mx-0">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-brand-600 shrink-0" />
                <div className="text-left">
                  <p className="text-xs font-bold text-charcoal-900">100% Fresh</p>
                  <p className="text-[11px] text-warmgray-400">Never frozen</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-brand-600 shrink-0" />
                <div className="text-left">
                  <p className="text-xs font-bold text-charcoal-900">30 Min Delivery</p>
                  <p className="text-[11px] text-warmgray-400">Piping hot</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-600 shrink-0" />
                <div className="text-left">
                  <p className="text-xs font-bold text-charcoal-900">Artisanal Craft</p>
                  <p className="text-[11px] text-warmgray-400">Small batch recipes</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Image Composition */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Main Food Photo Frame */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-[4/5] sm:aspect-square bg-warmgray-100">
                <FoodImage
                  src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1000&q=80"
                  alt="Appetizing gourmet feast at Urban Bites"
                  className="w-full h-full object-cover"
                  loading="eager"
                />
              </div>

              {/* Floating Highlight Card 1: Best Seller */}
              <div className="absolute -top-4 -left-4 sm:-left-6 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-warmgray-200 flex items-center gap-3 animate-float">
                <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-charcoal-900">Wood-Fired Pizza</p>
                  <p className="text-[11px] text-brand-600 font-semibold">Crust fermented 48 hrs</p>
                </div>
              </div>

              {/* Floating Highlight Card 2: Quality */}
              <div className="absolute -bottom-5 -right-4 sm:-right-6 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-warmgray-200 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-charcoal-900">Heritage Recipes</p>
                  <p className="text-[11px] text-warmgray-400">Pure butter &amp; stone-ground spices</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
