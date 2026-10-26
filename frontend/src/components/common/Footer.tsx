import React from 'react';
import { Link } from 'react-router-dom';
import { UtensilsCrossed, Phone, Mail, MapPin, Clock, ShieldCheck } from 'lucide-react';
import { RESTAURANT_INFO } from '../../data/menuData';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-charcoal-900 text-warmgray-200 pt-16 pb-12 border-t border-charcoal-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 pb-12 border-b border-charcoal-800">
          {/* Col 1: Brand Info */}
          <div className="space-y-4">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-md">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <span className="font-serif text-2xl font-bold tracking-tight text-white">
                Urban<span className="text-brand-500">Bites</span>
              </span>
            </Link>
            <p className="text-sm text-warmgray-300 leading-relaxed">
              Good Food. Great Mood. Crafting memorable culinary memories with wood-fired pizzas, gourmet smash burgers, authentic heritage Indian curries, and handcrafted desserts.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-brand-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Kitchen Open &amp; Accepting Orders
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              Explore Urban Bites
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="text-warmgray-300 hover:text-brand-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/menu" className="text-warmgray-300 hover:text-brand-400 transition-colors">
                  Interactive Menu &amp; Specials
                </Link>
              </li>
              <li>
                <Link to="/reservations" className="text-warmgray-300 hover:text-brand-400 transition-colors">
                  Reserve a Table
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-warmgray-300 hover:text-brand-400 transition-colors">
                  Our Culinary Story
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-warmgray-300 hover:text-brand-400 transition-colors">
                  Contact &amp; Location
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-warmgray-300 hover:text-brand-400 transition-colors">
                  Online Order Cart
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Hours & Dining */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              Opening Hours
            </h3>
            <div className="space-y-3 text-sm text-warmgray-300">
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-brand-400 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-white">Monday – Friday</p>
                  <p className="text-xs text-warmgray-400">{RESTAURANT_INFO.hours.weekdays}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-brand-400 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-white">Saturday – Sunday</p>
                  <p className="text-xs text-warmgray-400">{RESTAURANT_INFO.hours.weekends}</p>
                </div>
              </div>
              <p className="text-xs text-warmgray-400 pt-1">
                Last kitchen order accepted 30 minutes before closing.
              </p>
            </div>
          </div>

          {/* Col 4: Contact & Address */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              Get in Touch
            </h3>
            <ul className="space-y-3 text-sm text-warmgray-300">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-brand-400 mt-1 shrink-0" />
                <span className="text-xs leading-relaxed">{RESTAURANT_INFO.address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-brand-400 shrink-0" />
                <a href={`tel:${RESTAURANT_INFO.phone}`} className="text-xs hover:text-brand-400 transition-colors">
                  {RESTAURANT_INFO.phone}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-brand-400 shrink-0" />
                <a href={`mailto:${RESTAURANT_INFO.email}`} className="text-xs hover:text-brand-400 transition-colors">
                  {RESTAURANT_INFO.email}
                </a>
              </li>
              <li className="pt-2">
                <Link
                  to="/admin/login"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-warmgray-300 hover:text-white bg-charcoal-800 hover:bg-charcoal-950 transition-colors border border-charcoal-700"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-brand-400" />
                  Staff / Admin Login
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-warmgray-400">
          <p>© {new Date().getFullYear()} Urban Bites. Artisanal Kitchen &amp; Dining. All rights reserved.</p>
          <div className="flex items-center gap-1 text-center md:text-right">
            <span>Crafted with passion for memorable culinary experiences.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
