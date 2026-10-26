import React from 'react';
import { Flame, Leaf, PackageCheck } from 'lucide-react';

export const ReviewsSection: React.FC = () => {
  const standards = [
    {
      icon: Flame,
      title: 'Slow Fermentation, Hot Hearth',
      description:
        'Our pizza dough undergoes a 48-hour cold fermentation process, then bakes at 450°C in our stone oven to produce light, airy, and easily digestible crusts.',
      highlight: '48-Hr Fermented Crust',
    },
    {
      icon: Leaf,
      title: 'Whole Spices & Pure Ghee',
      description:
        'Heritage gravies and curries are simmered in pure butter and cold-pressed oils. Our chefs roast and grind whole spices daily for honest, aromatic depth.',
      highlight: 'Zero Artificial Additives',
    },
    {
      icon: PackageCheck,
      title: 'Piping Hot Delivery Packaging',
      description:
        'Specially engineered ventilated cartons preserve the crispness of our smash burgers and pizzas, ensuring doorstep orders taste as fresh as dine-in.',
      highlight: 'Thermal Packaging',
    },
  ];

  return (
    <section className="py-20 bg-cream-50 border-t border-warmgray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-600 block">
            Our Kitchen Standards
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-900">
            Crafted Without Compromise
          </h2>
          <p className="text-sm text-charcoal-800 leading-relaxed">
            Every dish leaving our kitchen reflects our commitment to honest ingredients, time-honored techniques, and genuine hospitality.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {standards.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-7 border border-warmgray-200 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-charcoal-900 leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs text-charcoal-800 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-warmgray-100">
                  <span className="text-[11px] font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-md">
                    {item.highlight}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
