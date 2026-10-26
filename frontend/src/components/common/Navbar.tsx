import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, UtensilsCrossed, Menu, X, Calendar, ShieldCheck } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { itemCount } = useCart();
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Menu', path: '/menu' },
    { name: 'Reservations', path: '/reservations' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-50 bg-cream-50/95 backdrop-blur-md border-b border-warmgray-200 transition-all shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-lg p-1"
          >
            <div className="w-11 h-11 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-md group-hover:bg-brand-700 transition-colors">
              <UtensilsCrossed className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-2xl font-bold tracking-tight text-charcoal-900 leading-none">
                Urban<span className="text-brand-600">Bites</span>
              </span>
              <span className="text-[11px] font-medium uppercase tracking-widest text-warmgray-400 mt-1">
                Artisanal Kitchen
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                  isActive(link.path)
                    ? 'bg-brand-50 text-brand-600 shadow-sm border border-brand-200'
                    : 'text-charcoal-800 hover:text-brand-600 hover:bg-cream-200/60'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            {/* Book Table Button (Desktop) */}
            <Link
              to="/reservations"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider text-charcoal-800 bg-cream-200 hover:bg-cream-300 transition-all border border-warmgray-200 hover:border-warmgray-300"
            >
              <Calendar className="w-4 h-4 text-brand-600" />
              <span>Book Table</span>
            </Link>

            {/* Cart Button */}
            <Link
              to="/cart"
              aria-label="View Shopping Cart"
              className="relative p-2.5 rounded-full text-charcoal-900 bg-white hover:bg-cream-200 border border-warmgray-200 shadow-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              <ShoppingBag className="w-5 h-5 text-charcoal-800" />
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[22px] h-[22px] px-1.5 flex items-center justify-center text-[11px] font-extrabold text-white bg-brand-600 rounded-full shadow-md animate-scaleIn">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              type="button"
              className="p-2.5 rounded-xl text-charcoal-800 hover:text-brand-600 md:hidden hover:bg-cream-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-warmgray-200 bg-cream-50 px-4 pt-3 pb-6 space-y-2 shadow-lg animate-fadeIn">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                isActive(link.path)
                  ? 'bg-brand-50 text-brand-600 font-semibold border border-brand-200'
                  : 'text-charcoal-800 hover:bg-cream-200'
              }`}
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-3 border-t border-warmgray-200 flex flex-col gap-2">
            <Link
              to="/reservations"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 transition-colors shadow-sm"
            >
              <Calendar className="w-4 h-4" />
              Book a Table
            </Link>
            <Link
              to="/admin/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold text-warmgray-400 hover:text-charcoal-800 hover:bg-cream-200 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin Portal
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
