import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { RootLayout } from './layouts/RootLayout';

import { HomePage } from './pages/HomePage';
import { MenuPage } from './pages/MenuPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { ReservationsPage } from './pages/ReservationsPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

const NotFoundPage: React.FC = () => (
  <div className="py-24 text-center space-y-4">
    <h1 className="font-serif text-6xl font-bold text-brand-600">404</h1>
    <h2 className="font-serif text-2xl font-bold text-charcoal-900">Page Not Found</h2>
    <p className="text-sm text-charcoal-800">
      The recipe or page you're searching for seems to have left the kitchen!
    </p>
    <div className="pt-2">
      <Link
        to="/"
        className="px-6 py-3 rounded-full bg-brand-600 text-white font-bold text-xs shadow-md inline-block"
      >
        Return to Home
      </Link>
    </div>
  </div>
);

export const App: React.FC = () => {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootLayout />}>
            <Route index element={<HomePage />} />
            <Route path="menu" element={<MenuPage />} />
            <Route path="cart" element={<CartPage />} />
            <Route path="checkout" element={<CheckoutPage />} />
            <Route path="reservations" element={<ReservationsPage />} />
            <Route path="order-confirmation" element={<OrderConfirmationPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="admin/login" element={<AdminLoginPage />} />
            <Route path="admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
};

export default App;
