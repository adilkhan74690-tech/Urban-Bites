import React from 'react';
import { Link } from 'react-router-dom';
import { ChefHat, Flame, Leaf, Award, Heart, Sparkles, ArrowRight } from 'lucide-react';
import { FoodImage } from '../components/common/FoodImage';

export const AboutPage: React.FC = () => {
  const pillars = [
    {
      icon: Flame,
      title: 'Wood-Fired Gastronomy',
      description: 'Our custom Neapolitan hearth reaches blistering 450°C temperatures, blistering dough in 90 seconds while sealing in vibrant flavor.',
    },
    {
      icon: Leaf,
      title: 'Ethical Local Sourcing',
      description: 'We partner directly with organic farmers in Karnataka for daily produce, antibiotic-free meats, and pasture-raised churned butter.',
    },
    {
      icon: ChefHat,
      title: 'Heritage Meets Modern',
      description: 'From 24-hour slow-simmered black lentils to contemporary smash burger techniques, our recipes bridge classic heritage and urban creativity.',
    },
    {
      icon: Award,
      title: 'Clean Kitchen Guarantee',
      description: 'Hospital-grade sanitary protocols, 100% open kitchen viewing gallery, and zero artificial preservatives or food dyes.',
    },
  ];

  return (
    <div className="py-12 bg-cream-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-100 text-brand-800 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Our Heritage &amp; Passion</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-charcoal-900 leading-tight">
            Good Food. <br />
            <span className="text-brand-600 italic">Crafted with Great Mood.</span>
          </h1>
          <p className="text-base sm:text-lg text-charcoal-800 leading-relaxed font-normal">
            Urban Bites was born in Indiranagar, Bengaluru, out of a profound love for comforting, soul-satisfying food that doesn't compromise on gourmet culinary craft.
          </p>
        </div>

        {/* Narrative & Image Composition */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-5 text-charcoal-800 leading-relaxed">
            <h2 className="font-serif text-3xl font-bold text-charcoal-900">
              The Urban Bites Story
            </h2>
            <p>
              Founded in 2023, Urban Bites started as a neighborhood experiment: What if a casual dining kitchen held itself to the uncompromising standards of a Michelin-starred dining room?
            </p>
            <p>
              We discarded commercial dough mixes, pre-ground spices, and microwave reheat shortcuts. Instead, our bakers wake up at 5:00 AM to hand-knead sourdough with wild yeast cultures. Our tandoor master carefully grinds whole spices fresh every morning.
            </p>
            <p>
              Whether you are dining in with loved ones, enjoying a quick lunch, or ordering doorstep dinner on a rainy Bangalore evening, we prepare every dish with heart, soul, and precision.
            </p>

            <div className="pt-2 flex items-center gap-4">
              <div className="border-l-4 border-brand-600 pl-4 py-1 italic font-serif text-lg text-charcoal-900">
                "We don't serve anything we wouldn't proudly serve to our own families."
                <span className="block text-xs font-sans font-bold text-warmgray-400 mt-1 not-italic">
                  — Chef Kabir Sen, Culinary Director
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="rounded-3xl overflow-hidden aspect-[4/5] shadow-md bg-warmgray-200">
                <FoodImage
                  src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80"
                  alt="Urban Bites Warm Dining Room"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="space-y-4 pt-8">
              <div className="rounded-3xl overflow-hidden aspect-[4/5] shadow-md bg-warmgray-200">
                <FoodImage
                  src="https://images.unsplash.com/photo-1578474846511-04ba529f0b88?auto=format&fit=crop&w=800&q=80"
                  alt="Chefs prepping artisanal ingredients"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 4 Pillars Grid */}
        <div className="space-y-8">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="font-serif text-3xl font-bold text-charcoal-900">
              Our Core Kitchen Principles
            </h2>
            <p className="text-sm text-charcoal-800 mt-1">
              Every dish served at Urban Bites is guided by four non-negotiable promises.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-3xl p-6 border border-warmgray-200 shadow-sm hover:shadow-warm transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-serif text-xl font-bold text-charcoal-900">
                      {pillar.title}
                    </h3>
                    <p className="text-xs text-charcoal-800 leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Ambient Gallery */}
        <div className="space-y-6">
          <h2 className="font-serif text-2xl font-bold text-charcoal-900 text-center">
            Kitchen &amp; Ambiance Moments
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-2xl overflow-hidden aspect-square bg-warmgray-200 shadow-sm">
              <FoodImage
                src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80"
                alt="Dining Room Seating"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="rounded-2xl overflow-hidden aspect-square bg-warmgray-200 shadow-sm">
              <FoodImage
                src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80"
                alt="Wood-Fired Oven"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="rounded-2xl overflow-hidden aspect-square bg-warmgray-200 shadow-sm">
              <FoodImage
                src="https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=600&q=80"
                alt="Chef preparing signature seasoning"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="rounded-2xl overflow-hidden aspect-square bg-warmgray-200 shadow-sm">
              <FoodImage
                src="https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=600&q=80"
                alt="Bar and mocktail station"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Bottom CTA Banner */}
        <div className="bg-brand-600 rounded-3xl p-8 sm:p-12 text-white text-center space-y-6 shadow-xl">
          <div className="max-w-2xl mx-auto space-y-3">
            <Heart className="w-10 h-10 mx-auto text-cream-100 fill-cream-100/20" />
            <h2 className="font-serif text-3xl sm:text-4xl font-bold">
              Ready to Taste the Difference?
            </h2>
            <p className="text-sm text-brand-100">
              Join us for lunch or dinner, or order online for fast doorstep delivery.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              to="/menu"
              className="px-7 py-3.5 rounded-full bg-white text-charcoal-900 font-bold text-sm shadow-md hover:bg-cream-100 transition-all inline-flex items-center gap-2"
            >
              <span>Explore Our Menu</span>
              <ArrowRight className="w-4 h-4 text-brand-600" />
            </Link>
            <Link
              to="/reservations"
              className="px-7 py-3.5 rounded-full bg-brand-700 text-white font-bold text-sm border border-brand-500 hover:bg-brand-800 transition-all"
            >
              Book a Dine-In Table
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
