import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShoppingBag,
  Users,
  UtensilsCrossed,
  IndianRupee,
  LogOut,
  Eye,
  RefreshCw,
  Loader2,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  AlertCircle,
} from 'lucide-react';
import { Order, Reservation, MenuItem, OrderStatus, CategoryType } from '../types';
import {
  getAdminToken,
  removeAdminToken,
  adminGetStats,
  fetchAllOrders,
  updateOrderStatus,
  fetchAllReservations,
  adminUpdateReservationStatus,
  fetchMenuItems,
  adminCreateMenuItem,
  adminUpdateMenuItem,
  adminUpdateAvailability,
  adminDeleteMenuItem,
  DashboardStats,
} from '../services/api';
import { VegBadge } from '../components/common/VegBadge';
import { FoodImage } from '../components/common/FoodImage';

const CATEGORIES: Array<Exclude<CategoryType, 'All'>> = [
  'Burgers',
  'Pizza',
  'Indian',
  'Starters',
  'Desserts',
  'Beverages',
];

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();

  // Authentication check
  useEffect(() => {
    const token = getAdminToken();
    if (!token) {
      navigate('/admin/login');
    }
  }, [navigate]);

  const [activeTab, setActiveTab] = useState<'orders' | 'reservations' | 'menu'>('orders');

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Menu Modal State
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<MenuItem | null>(null);
  const [dishFormData, setDishFormData] = useState({
    name: '',
    description: '',
    price: 349,
    category: 'Burgers' as Exclude<CategoryType, 'All'>,
    image: '',
    isVegetarian: false,
    isPopular: false,
    preparationTime: '15-20 min',
  });
  const [isSubmittingDish, setIsSubmittingDish] = useState(false);
  const [dishFormError, setDishFormError] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 3500);
  };

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [statsData, ordersData, resData, menuData] = await Promise.all([
        adminGetStats().catch(() => null),
        fetchAllOrders().catch(() => []),
        fetchAllReservations().catch(() => []),
        fetchMenuItems().catch(() => []),
      ]);

      if (statsData) setStats(statsData);
      setOrders(ordersData);
      setReservations(resData);
      setMenuItems(menuData);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleLogout = () => {
    removeAdminToken();
    navigate('/admin/login');
  };

  // --- Order Status Management ---
  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const updated = await updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.orderId === orderId || o.id === orderId ? updated : o))
      );
      showNotification(`Order ${orderId} updated to ${newStatus}`);
    } catch (err: any) {
      alert(`Error updating order: ${err.message}`);
    }
  };

  // --- Reservation Status Management ---
  const handleUpdateReservationStatus = async (id: string, newStatus: string) => {
    try {
      const updated = await adminUpdateReservationStatus(id, newStatus);
      setReservations((prev) => prev.map((r) => (r.id === id ? updated : r)));
      showNotification(`Reservation status updated to ${newStatus}`);
    } catch (err: any) {
      alert(`Error updating reservation: ${err.message}`);
    }
  };

  // --- Menu Availability Toggle ---
  const handleToggleAvailability = async (item: MenuItem) => {
    try {
      const updated = await adminUpdateAvailability(item.id, !item.isAvailable);
      setMenuItems((prev) => prev.map((m) => (m.id === item.id ? updated : m)));
      showNotification(`"${item.name}" is now ${updated.isAvailable ? 'Available' : 'Sold Out'}`);
    } catch (err: any) {
      alert(`Error toggling availability: ${err.message}`);
    }
  };

  // --- Menu Item Delete ---
  const handleDeleteMenuItem = async (item: MenuItem) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${item.name}" from the menu?`)) {
      return;
    }
    try {
      await adminDeleteMenuItem(item.id);
      setMenuItems((prev) => prev.filter((m) => m.id !== item.id));
      showNotification(`"${item.name}" was removed from the menu.`);
    } catch (err: any) {
      alert(`Error deleting menu item: ${err.message}`);
    }
  };

  // --- Menu Item Create & Edit Modal ---
  const openCreateModal = () => {
    setEditingDish(null);
    setDishFormData({
      name: '',
      description: '',
      price: 299,
      category: 'Burgers',
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
      isVegetarian: false,
      isPopular: false,
      preparationTime: '15-20 min',
    });
    setDishFormError(null);
    setIsMenuModalOpen(true);
  };

  const openEditModal = (dish: MenuItem) => {
    setEditingDish(dish);
    setDishFormData({
      name: dish.name,
      description: dish.description,
      price: dish.price,
      category: dish.category as Exclude<CategoryType, 'All'>,
      image: dish.image,
      isVegetarian: dish.isVegetarian,
      isPopular: Boolean(dish.isPopular),
      preparationTime: dish.preparationTime || '15-20 min',
    });
    setDishFormError(null);
    setIsMenuModalOpen(true);
  };

  const handleSaveDish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dishFormData.name.trim() || !dishFormData.description.trim() || !dishFormData.image.trim()) {
      setDishFormError('Please fill in dish name, description, and image URL.');
      return;
    }
    if (dishFormData.price < 0) {
      setDishFormError('Price must be greater than or equal to 0.');
      return;
    }

    setIsSubmittingDish(true);
    setDishFormError(null);

    try {
      if (editingDish) {
        // Update existing dish
        const updated = await adminUpdateMenuItem(editingDish.id, dishFormData);
        setMenuItems((prev) => prev.map((m) => (m.id === editingDish.id ? updated : m)));
        showNotification(`"${updated.name}" updated successfully.`);
      } else {
        // Create new dish
        const created = await adminCreateMenuItem(dishFormData);
        setMenuItems((prev) => [created, ...prev]);
        showNotification(`"${created.name}" created and added to menu.`);
      }
      setIsMenuModalOpen(false);
    } catch (err: any) {
      setDishFormError(err.message || 'Failed to save menu item.');
    } finally {
      setIsSubmittingDish(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (orderStatusFilter === 'all') return true;
    return o.orderStatus === orderStatusFilter;
  });

  return (
    <div className="py-8 bg-cream-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-3xl p-6 border border-warmgray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-600 flex items-center justify-center text-white shadow-md">
              <UtensilsCrossed className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-2xl font-bold text-charcoal-900">
                  Urban Bites Staff Portal
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Staff Portal
                </span>
              </div>
              <p className="text-xs text-charcoal-800">
                Kitchen operations, order fulfillment, and table reservation management
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadAllData}
              type="button"
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-charcoal-800 bg-cream-100 hover:bg-cream-200 transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <Link
              to="/"
              className="px-4 py-2 rounded-xl text-xs font-semibold text-charcoal-800 bg-cream-100 hover:bg-cream-200 transition-colors flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5 text-brand-600" />
              <span>Public Website</span>
            </Link>
            <button
              onClick={handleLogout}
              type="button"
              className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Action Notification Alert */}
        {actionMessage && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fadeIn shadow-xs">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{actionMessage}</span>
          </div>
        )}

        {/* Dashboard Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-5 border border-warmgray-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-warmgray-400 uppercase tracking-wider">Total Orders</p>
              <p className="text-2xl font-extrabold text-charcoal-900 mt-1">
                {stats?.totalOrders ?? orders.length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600">
              <ShoppingBag className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-warmgray-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-warmgray-400 uppercase tracking-wider">Total Revenue</p>
              <p className="text-2xl font-extrabold text-charcoal-900 mt-1">
                ₹{stats?.totalRevenue ?? orders.reduce((s, o) => s + (o.total || 0), 0)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <IndianRupee className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-warmgray-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-warmgray-400 uppercase tracking-wider">Active Bookings</p>
              <p className="text-2xl font-extrabold text-charcoal-900 mt-1">
                {stats?.activeReservations ?? reservations.length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-warmgray-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-warmgray-400 uppercase tracking-wider">Live Dishes</p>
              <p className="text-2xl font-extrabold text-charcoal-900 mt-1">
                {menuItems.filter((m) => m.isAvailable).length} / {menuItems.length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-cream-200 flex items-center justify-center text-brand-600">
              <UtensilsCrossed className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-warmgray-200 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`px-5 py-3 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'orders'
                ? 'border-brand-600 text-brand-600 bg-white rounded-t-xl'
                : 'border-transparent text-charcoal-800 hover:text-charcoal-900'
            }`}
          >
            Live Orders Dispatch ({orders.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('reservations')}
            className={`px-5 py-3 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'reservations'
                ? 'border-brand-600 text-brand-600 bg-white rounded-t-xl'
                : 'border-transparent text-charcoal-800 hover:text-charcoal-900'
            }`}
          >
            Table Reservations ({reservations.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('menu')}
            className={`px-5 py-3 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'menu'
                ? 'border-brand-600 text-brand-600 bg-white rounded-t-xl'
                : 'border-transparent text-charcoal-800 hover:text-charcoal-900'
            }`}
          >
            Menu CRUD Catalog ({menuItems.length})
          </button>
        </div>

        {isLoading ? (
          <div className="p-16 text-center space-y-3 bg-white rounded-3xl border border-warmgray-200">
            <Loader2 className="w-8 h-8 text-brand-600 animate-spin mx-auto" />
            <p className="text-xs font-semibold text-charcoal-800">
              Loading records...
            </p>
          </div>
        ) : (
          <>
            {/* TAB 1: Live Orders */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-warmgray-200">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-charcoal-900">Filter Status:</span>
                    <select
                      value={orderStatusFilter}
                      onChange={(e) => setOrderStatusFilter(e.target.value)}
                      className="px-3 py-1.5 rounded-lg bg-cream-50 border border-warmgray-200 text-xs font-semibold text-charcoal-900"
                    >
                      <option value="all">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="preparing">Preparing</option>
                      <option value="ready">Ready</option>
                      <option value="out_for_delivery">Out for Delivery</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <span className="text-xs text-warmgray-400">
                    Showing {filteredOrders.length} orders
                  </span>
                </div>

                <div className="bg-white rounded-3xl border border-warmgray-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-cream-50 border-b border-warmgray-200 text-warmgray-400 uppercase tracking-wider font-bold">
                        <tr>
                          <th className="p-4">Order Reference</th>
                          <th className="p-4">Customer Details</th>
                          <th className="p-4">Type</th>
                          <th className="p-4">Items Summary</th>
                          <th className="p-4">Total</th>
                          <th className="p-4">Payment</th>
                          <th className="p-4">Status</th>
                          <th className="p-4">Update Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-warmgray-100">
                        {filteredOrders.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="p-8 text-center text-warmgray-400">
                              No orders found.
                            </td>
                          </tr>
                        ) : (
                          filteredOrders.map((ord) => (
                            <tr key={ord.orderId || ord.id} className="hover:bg-cream-50/50 transition-colors">
                              <td className="p-4 font-mono font-bold text-charcoal-900">
                                {ord.orderId || ord.id}
                              </td>
                              <td className="p-4">
                                <p className="font-bold text-charcoal-900">{ord.customerName}</p>
                                <p className="text-[11px] text-warmgray-400">{ord.phone}</p>
                                {ord.deliveryAddress && (
                                  <p className="text-[10px] text-charcoal-800 truncate max-w-xs">{ord.deliveryAddress}</p>
                                )}
                              </td>
                              <td className="p-4">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                    ord.orderType === 'delivery'
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-purple-100 text-purple-800'
                                  }`}
                                >
                                  {ord.orderType}
                                </span>
                              </td>
                              <td className="p-4 max-w-xs truncate">
                                {ord.items.map((i) => `${i.quantity}x ${i.name || i.menuItem?.name}`).join(', ')}
                              </td>
                              <td className="p-4 font-extrabold text-charcoal-900">
                                ₹{ord.total}
                              </td>
                              <td className="p-4">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    ord.paymentStatus === 'paid'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : ord.paymentStatus === 'failed'
                                      ? 'bg-rose-100 text-rose-800'
                                      : 'bg-amber-100 text-amber-800'
                                  }`}
                                >
                                  {(ord.paymentMethod || 'COD').toUpperCase()} ({ord.paymentStatus})
                                </span>
                                {ord.razorpayPaymentId && (
                                  <p className="text-[10px] font-mono text-warmgray-400 mt-0.5 truncate max-w-[120px]" title={ord.razorpayPaymentId}>
                                    {ord.razorpayPaymentId}
                                  </p>
                                )}
                              </td>
                              <td className="p-4">
                                <span
                                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                    ord.orderStatus === 'delivered'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : ord.orderStatus === 'preparing'
                                      ? 'bg-brand-100 text-brand-800 animate-pulse'
                                      : 'bg-warmgray-200 text-charcoal-800'
                                  }`}
                                >
                                  {ord.orderStatus}
                                </span>
                              </td>
                              <td className="p-4">
                                <select
                                  value={ord.orderStatus}
                                  onChange={(e) =>
                                    handleUpdateOrderStatus(
                                      ord.orderId || ord.id,
                                      e.target.value as OrderStatus
                                    )
                                  }
                                  className="p-1.5 rounded-lg bg-cream-100 border border-warmgray-200 text-[11px] font-semibold text-charcoal-900 focus:outline-none focus:ring-1 focus:ring-brand-500"
                                >
                                  <option value="pending">Pending</option>
                                  <option value="confirmed">Confirmed</option>
                                  <option value="preparing">Preparing</option>
                                  <option value="ready">Ready</option>
                                  <option value="out_for_delivery">Out for Delivery</option>
                                  <option value="delivered">Delivered</option>
                                  <option value="cancelled">Cancelled</option>
                                </select>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Table Reservations */}
            {activeTab === 'reservations' && (
              <div className="bg-white rounded-3xl border border-warmgray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-cream-50 border-b border-warmgray-200 text-warmgray-400 uppercase tracking-wider font-bold">
                      <tr>
                        <th className="p-4">Ref Code</th>
                        <th className="p-4">Guest Name</th>
                        <th className="p-4">Contact</th>
                        <th className="p-4">Date</th>
                        <th className="p-4">Time Slot</th>
                        <th className="p-4">Guests</th>
                        <th className="p-4">Special Requests</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-warmgray-100">
                      {reservations.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="p-8 text-center text-warmgray-400">
                            No reservations recorded yet.
                          </td>
                        </tr>
                      ) : (
                        reservations.map((res) => (
                          <tr key={res.referenceCode || res.id} className="hover:bg-cream-50/50 transition-colors">
                            <td className="p-4 font-mono font-bold text-brand-600">
                              {res.referenceCode}
                            </td>
                            <td className="p-4 font-bold text-charcoal-900">
                              {res.customerName}
                            </td>
                            <td className="p-4">
                              <p>{res.phone}</p>
                              <p className="text-[11px] text-warmgray-400">{res.email}</p>
                            </td>
                            <td className="p-4 font-semibold text-charcoal-900">
                              {res.reservationDate}
                            </td>
                            <td className="p-4 font-bold text-charcoal-900">
                              {res.timeSlot}
                            </td>
                            <td className="p-4 font-semibold">
                              {res.guests} Guests
                            </td>
                            <td className="p-4 text-warmgray-400 max-w-xs truncate">
                              {res.specialRequests || '—'}
                            </td>
                            <td className="p-4">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                  res.status === 'confirmed'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {res.status}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-1.5">
                                {res.status !== 'confirmed' && (
                                  <button
                                    onClick={() => handleUpdateReservationStatus(res.id || (res as any)._id || res.referenceCode, 'confirmed')}
                                    className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[10px] font-bold"
                                  >
                                    Confirm
                                  </button>
                                )}
                                {res.status !== 'cancelled' && (
                                  <button
                                    onClick={() => handleUpdateReservationStatus(res.id || (res as any)._id || res.referenceCode, 'cancelled')}
                                    className="px-2 py-1 rounded bg-rose-50 text-rose-700 hover:bg-rose-100 text-[10px] font-bold"
                                  >
                                    Cancel
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: Menu CRUD Management */}
            {activeTab === 'menu' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-warmgray-200">
                  <div>
                    <h3 className="font-bold text-sm text-charcoal-900">Restaurant Menu Catalog</h3>
                    <p className="text-xs text-warmgray-400">Add, edit, toggle availability, or remove items from the live menu.</p>
                  </div>
                  <button
                    onClick={openCreateModal}
                    type="button"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Dish</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {menuItems.map((dish) => (
                    <div
                      key={dish.id}
                      className={`bg-white rounded-2xl border transition-all overflow-hidden flex flex-col justify-between ${
                        dish.isAvailable ? 'border-warmgray-200 shadow-xs' : 'border-warmgray-200 opacity-60 bg-warmgray-50'
                      }`}
                    >
                      <div className="relative aspect-[16/9] w-full overflow-hidden bg-warmgray-100">
                        <FoodImage src={dish.image} alt={dish.name} className="w-full h-full object-cover" />
                        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                          <div className="bg-white/95 px-2 py-0.5 rounded shadow-xs">
                            <VegBadge isVegetarian={dish.isVegetarian} showLabel={true} />
                          </div>
                        </div>
                        <div className="absolute top-2.5 right-2.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shadow-xs ${
                              dish.isAvailable ? 'bg-emerald-600 text-white' : 'bg-charcoal-900 text-white'
                            }`}
                          >
                            {dish.isAvailable ? 'In Stock' : 'Sold Out'}
                          </span>
                        </div>
                      </div>

                      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase text-brand-600 tracking-wider">
                              {dish.category}
                            </span>
                            <span className="font-extrabold text-base text-charcoal-900">
                              ₹{dish.price}
                            </span>
                          </div>
                          <h4 className="font-bold text-sm text-charcoal-900 mt-1">{dish.name}</h4>
                          <p className="text-xs text-warmgray-400 line-clamp-2 mt-1 leading-relaxed">
                            {dish.description}
                          </p>
                        </div>

                        {/* Action buttons */}
                        <div className="pt-3 border-t border-warmgray-100 flex items-center justify-between gap-2">
                          <button
                            onClick={() => handleToggleAvailability(dish)}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                              dish.isAvailable
                                ? 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                            }`}
                          >
                            {dish.isAvailable ? 'Mark Sold Out' : 'Mark Available'}
                          </button>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => openEditModal(dish)}
                              aria-label="Edit dish"
                              className="p-1.5 rounded-lg bg-cream-100 text-charcoal-800 hover:bg-cream-200 transition-colors"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteMenuItem(dish)}
                              aria-label="Delete dish"
                              className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Modal for Create / Edit Menu Item */}
        {isMenuModalOpen && (
          <div className="fixed inset-0 z-50 bg-charcoal-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 border border-warmgray-200 shadow-2xl relative my-8">
              <div className="flex items-center justify-between border-b border-warmgray-100 pb-3">
                <h3 className="font-serif text-xl font-bold text-charcoal-900">
                  {editingDish ? 'Edit Menu Item' : 'Add New Menu Item'}
                </h3>
                <button
                  onClick={() => setIsMenuModalOpen(false)}
                  className="p-1.5 rounded-lg text-warmgray-400 hover:text-charcoal-900 hover:bg-cream-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {dishFormError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{dishFormError}</span>
                </div>
              )}

              <form onSubmit={handleSaveDish} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-charcoal-900 uppercase">Dish Name *</label>
                  <input
                    type="text"
                    value={dishFormData.name}
                    onChange={(e) => setDishFormData({ ...dishFormData, name: e.target.value })}
                    placeholder="e.g. Artisanal Truffle Pizza"
                    required
                    className="w-full p-2.5 rounded-xl bg-cream-50 border border-warmgray-200 text-xs text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-charcoal-900 uppercase">Category *</label>
                    <select
                      value={dishFormData.category}
                      onChange={(e) =>
                        setDishFormData({
                          ...dishFormData,
                          category: e.target.value as Exclude<CategoryType, 'All'>,
                        })
                      }
                      className="w-full p-2.5 rounded-xl bg-cream-50 border border-warmgray-200 text-xs text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-charcoal-900 uppercase">Price (INR ₹) *</label>
                    <input
                      type="number"
                      min={0}
                      value={dishFormData.price}
                      onChange={(e) => setDishFormData({ ...dishFormData, price: Number(e.target.value) })}
                      required
                      className="w-full p-2.5 rounded-xl bg-cream-50 border border-warmgray-200 text-xs text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-charcoal-900 uppercase">Description *</label>
                  <textarea
                    rows={2}
                    value={dishFormData.description}
                    onChange={(e) => setDishFormData({ ...dishFormData, description: e.target.value })}
                    placeholder="Ingredients, preparation method and rich culinary notes..."
                    required
                    className="w-full p-2.5 rounded-xl bg-cream-50 border border-warmgray-200 text-xs text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-charcoal-900 uppercase">Image URL (Unsplash or Local) *</label>
                  <input
                    type="url"
                    value={dishFormData.image}
                    onChange={(e) => setDishFormData({ ...dishFormData, image: e.target.value })}
                    placeholder="https://images.unsplash.com/photo-..."
                    required
                    className="w-full p-2.5 rounded-xl bg-cream-50 border border-warmgray-200 text-xs text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <label className="flex items-center gap-2 p-3 rounded-xl bg-cream-50 border border-warmgray-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dishFormData.isVegetarian}
                      onChange={(e) => setDishFormData({ ...dishFormData, isVegetarian: e.target.checked })}
                      className="rounded text-brand-600 focus:ring-brand-500"
                    />
                    <span className="text-xs font-semibold text-charcoal-900">Vegetarian Dish</span>
                  </label>

                  <label className="flex items-center gap-2 p-3 rounded-xl bg-cream-50 border border-warmgray-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dishFormData.isPopular}
                      onChange={(e) => setDishFormData({ ...dishFormData, isPopular: e.target.checked })}
                      className="rounded text-brand-600 focus:ring-brand-500"
                    />
                    <span className="text-xs font-semibold text-charcoal-900">Feature as Popular</span>
                  </label>
                </div>

                <div className="pt-3 flex items-center justify-end gap-3 border-t border-warmgray-100">
                  <button
                    type="button"
                    onClick={() => setIsMenuModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-charcoal-800 hover:bg-cream-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingDish}
                    className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm flex items-center gap-2"
                  >
                    {isSubmittingDish && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>{editingDish ? 'Save Changes' : 'Create Dish'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
