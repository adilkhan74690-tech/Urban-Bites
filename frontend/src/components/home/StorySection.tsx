import React from 'react';
import { Link } from 'react-router-dom';
import { ChefHat, ShieldCheck, Leaf, ArrowRight } from 'lucide-react';
import { FoodImage } from '../common/FoodImage';

export const StorySection: React.FC = () => {
  return (
    <section className="py-20 bg-cream-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Visual Grid */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-4 relative">
            <div className="space-y-4">
              <div className="rounded-2xl overflow-hidden shadow-md aspect-[3/4] bg-warmgray-200">
                <FoodImage
                  src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80"
                  alt="Urban Bites warm dining ambience"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4 rounded-2xl bg-white border border-warmgray-200 text-center shadow-xs">
                <p className="font-serif text-3xl font-bold text-brand-600">100%</p>
                <p className="text-xs text-charcoal-800 font-semibold mt-1">Farm-Fresh Ingredients</p>
              </div>
            </div>

            <div className="space-y-4 pt-8">
              <div className="p-4 rounded-2xl bg-brand-600 text-white text-center shadow-sm">
                <ChefHat className="w-8 h-8 mx-auto mb-1 text-cream-100" />
                <p className="font-serif text-2xl font-bold">Artisanal</p>
                <p className="text-xs text-brand-100 mt-0.5">Wood-Fired &amp; Handcrafted</p>
              </div>
              <div className="rounded-2xl overflow-hidden shadow-md aspect-[3/4] bg-warmgray-200">
                <FoodImage
                  src="https://images.unsplash.com/photo-1578474846511-04ba529f0b88?auto=format&fit=crop&w=600&q=80"
                  alt="Fresh artisan kitchen prep"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Right Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-brand-600">
              <span>Our Culinary Journey</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-charcoal-900 leading-tight">
              Crafting food that warms <br />
              <span className="text-brand-600 italic">the soul and sparks joy.</span>
            </h2>

            <p className="text-base text-charcoal-800 leading-relaxed">
              At <strong className="text-charcoal-900">Urban Bites</strong>, we set out with a simple conviction: restaurant food should never cut corners. Our sourdough crusts rest for 48 hours for effortless digestion, our heritage gravies simmer gently on embers for over 18 hours, and our patties are smashed to order on roaring chrome griddles.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-warmgray-200">
                <Leaf className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-bold text-sm text-charcoal-900">Ethically Sourced</h4>
                  <p className="text-xs text-warmgray-400 mt-0.5">Local dairy, organic greens, and hormone-free meats.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-warmgray-200">
                <ShieldCheck className="w-5 h-5 text-brand-600 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-bold text-sm text-charcoal-900">Clean Kitchen Standard</h4>
                  <p className="text-xs text-warmgray-400 mt-0.5">Highest hygiene protocols with an open kitchen view.</p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/about"
                className="inline-flex items-center gap-2 text-sm font-bold text-brand-600 hover:text-brand-700 transition-colors group"
              >
                <span>Read more about our story &amp; team</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
