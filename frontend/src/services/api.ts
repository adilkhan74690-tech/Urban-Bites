import { MenuItem, Order, Reservation, OrderType, PaymentMethod } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://urban-bites-eun2.vercel.app/api';

export interface CreateOrderPayload {
  customerName: string;
  phone: string;
  email: string;
  orderType: OrderType;
  deliveryAddress?: string;
  notes?: string;
  items: Array<{
    menuItemId: string;
    quantity: number;
    price?: number;
  }>;
  paymentMethod: PaymentMethod;
}

export interface CreateReservationPayload {
  customerName: string;
  phone: string;
  email: string;
  reservationDate: string;
  timeSlot: string;
  guests: number;
  specialRequests?: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  count?: number;
  errors?: Array<{ field: string; message: string }>;
}

/**
 * Normalizes MongoDB document by ensuring `id` is set from `_id`
 */
const normalizeMenuItem = (raw: any): MenuItem => {
  return {
    id: raw._id ? raw._id.toString() : raw.id,
    name: raw.name,
    description: raw.description,
    price: raw.price,
    image: raw.image,
    category: raw.category,
    isVegetarian: Boolean(raw.isVegetarian),
    isAvailable: raw.isAvailable !== undefined ? Boolean(raw.isAvailable) : true,
    isPopular: Boolean(raw.isPopular),
    rating: raw.rating || 4.8,
    preparationTime: raw.preparationTime || '15-20 min',
    tags: raw.tags || [],
  };
};

/**
 * Check backend API health
 */
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    const res = await fetch(`${API_BASE_URL}/health`, { signal: AbortSignal.timeout(3000) });
    const data = await res.json();
    return data.success === true;
  } catch {
    return false;
  }
};

/**
 * Fetch menu items from Express API
 */
export const fetchMenuItems = async (params?: {
  category?: string;
  isVegetarian?: boolean;
  search?: string;
}): Promise<MenuItem[]> => {
  const query = new URLSearchParams();
  if (params?.category && params.category !== 'All') {
    query.set('category', params.category);
  }
  if (params?.isVegetarian) {
    query.set('isVegetarian', 'true');
  }
  if (params?.search && params.search.trim()) {
    query.set('search', params.search.trim());
  }

  const queryString = query.toString() ? `?${query.toString()}` : '';
  const response = await fetch(`${API_BASE_URL}/menu${queryString}`, {
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to fetch menu (${response.status})`);
  }

  const json: ApiResponse<any[]> = await response.json();
  return (json.data || []).map(normalizeMenuItem);
};

/**
 * Fetch a single menu item by ID
 */
export const fetchMenuItemById = async (id: string): Promise<MenuItem> => {
  const response = await fetch(`${API_BASE_URL}/menu/${id}`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Menu item not found');
  }
  const json: ApiResponse<any> = await response.json();
  return normalizeMenuItem(json.data);
};

/**
 * Create a new order with authoritative backend calculation and MongoDB persistence
 */
export const createOrder = async (payload: CreateOrderPayload): Promise<Order> => {
  const response = await fetch(`${API_BASE_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const json: ApiResponse<Order> = await response.json();

  if (!response.ok) {
    const msg = json.message || 'Failed to place order';
    const validationDetails = json.errors?.map((e) => e.message).join(', ');
    throw new Error(validationDetails ? `${msg}: ${validationDetails}` : msg);
  }

  return json.data;
};

/**
 * Fetch order by unique orderId
 */
export const fetchOrderById = async (orderId: string): Promise<Order> => {
  const response = await fetch(`${API_BASE_URL}/orders/${orderId}`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Order not found');
  }
  const json: ApiResponse<Order> = await response.json();
  return json.data;
};

/**
 * Fetch all orders (admin / staff)
 */
export const fetchAllOrders = async (status?: string): Promise<Order[]> => {
  const query = status && status !== 'all' ? `?status=${status}` : '';
  const response = await fetch(`${API_BASE_URL}/orders${query}`);
  if (!response.ok) {
    throw new Error('Failed to fetch orders');
  }
  const json: ApiResponse<Order[]> = await response.json();
  return json.data || [];
};

/**
 * Update order status (admin / staff)
 */
export const updateOrderStatus = async (orderId: string, status: string): Promise<Order> => {
  const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to update order status');
  }
  const json: ApiResponse<Order> = await response.json();
  return json.data;
};

/**
 * Create a table reservation in MongoDB
 */
export const createReservation = async (payload: CreateReservationPayload): Promise<Reservation> => {
  const response = await fetch(`${API_BASE_URL}/reservations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const json: ApiResponse<Reservation> = await response.json();

  if (!response.ok) {
    const msg = json.message || 'Failed to reserve table';
    const validationDetails = json.errors?.map((e) => e.message).join(', ');
    throw new Error(validationDetails ? `${msg}: ${validationDetails}` : msg);
  }

  return json.data;
};

/**
 * Fetch reservation by reference code
 */
export const fetchReservationByRef = async (referenceCode: string): Promise<Reservation> => {
  const response = await fetch(`${API_BASE_URL}/reservations/${referenceCode}`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Reservation not found');
  }
  const json: ApiResponse<Reservation> = await response.json();
  return json.data;
};

/**
 * Fetch all reservations (admin / staff)
 */
export const fetchAllReservations = async (date?: string): Promise<Reservation[]> => {
  const query = date ? `?date=${date}` : '';
  const response = await fetch(`${API_BASE_URL}/reservations${query}`);
  if (!response.ok) {
    throw new Error('Failed to fetch reservations');
  }
  const json: ApiResponse<any[]> = await response.json();
  return (json.data || []).map((r) => ({
    ...r,
    id: r._id ? r._id.toString() : r.id,
  }));
};

/* ========================================================
   ADMIN AUTHENTICATION & MANAGEMENT API METHODS (PHASE 4)
   ======================================================== */

export const ADMIN_TOKEN_KEY = 'urban_bites_admin_jwt';

export const getAdminToken = (): string | null => {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
};

export const setAdminToken = (token: string): void => {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
};

export const removeAdminToken = (): void => {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
};

const getAuthHeaders = (): Record<string, string> => {
  const token = getAdminToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export interface AdminLoginResponse {
  token: string;
  admin: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  activeOrders: number;
  activeReservations: number;
  totalDishes: number;
  availableDishes: number;
}

/**
 * Admin Login via Express API
 */
export const adminLoginApi = async (credentials: {
  email: string;
  password: string;
}): Promise<AdminLoginResponse> => {
  const response = await fetch(`${API_BASE_URL}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.message || 'Login failed. Please check credentials.');
  }

  setAdminToken(json.token);
  return {
    token: json.token,
    admin: json.admin,
  };
};

/**
 * Get dashboard overview metrics
 */
export const adminGetStats = async (): Promise<DashboardStats> => {
  const response = await fetch(`${API_BASE_URL}/admin/stats`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const json = await response.json().catch(() => ({}));
    throw new Error(json.message || 'Failed to fetch dashboard statistics');
  }

  const json = await response.json();
  return json.data;
};

/**
 * Admin: Create a new menu item
 */
export const adminCreateMenuItem = async (dishData: Partial<MenuItem>): Promise<MenuItem> => {
  const response = await fetch(`${API_BASE_URL}/admin/menu`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(dishData),
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.message || 'Failed to create menu item');
  }

  return normalizeMenuItem(json.data);
};

/**
 * Admin: Update menu item
 */
export const adminUpdateMenuItem = async (
  id: string,
  dishData: Partial<MenuItem>
): Promise<MenuItem> => {
  const response = await fetch(`${API_BASE_URL}/admin/menu/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(dishData),
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.message || 'Failed to update menu item');
  }

  return normalizeMenuItem(json.data);
};

/**
 * Admin: Update dish availability
 */
export const adminUpdateAvailability = async (
  id: string,
  isAvailable: boolean
): Promise<MenuItem> => {
  const response = await fetch(`${API_BASE_URL}/admin/menu/${id}/availability`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ isAvailable }),
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.message || 'Failed to update dish availability');
  }

  return normalizeMenuItem(json.data);
};

/**
 * Admin: Delete menu item
 */
export const adminDeleteMenuItem = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/admin/menu/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const json = await response.json().catch(() => ({}));
    throw new Error(json.message || 'Failed to delete menu item');
  }
};

/**
 * Admin: Update reservation status
 */
export const adminUpdateReservationStatus = async (
  id: string,
  status: string
): Promise<Reservation> => {
  const response = await fetch(`${API_BASE_URL}/admin/reservations/${id}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.message || 'Failed to update reservation status');
  }

  return json.data;
};

/* ========================================================
   RAZORPAY PAYMENT INTEGRATION API METHODS (PHASE 5)
   ======================================================== */

export interface PaymentConfigResponse {
  success: boolean;
  isConfigured: boolean;
  mode: string;
  keyId: string | null;
  currency: string;
}

export interface CreatePaymentOrderResponse {
  success: boolean;
  isConfigured?: boolean;
  message?: string;
  orderId: string;
  razorpayOrderId?: string;
  amount: number;
  total?: number;
  currency: string;
  keyId?: string;
  customer?: {
    name: string;
    email: string;
    phone: string;
  };
}

export interface VerifyPaymentPayload {
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface PaymentFailurePayload {
  orderId: string;
  reason?: string;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
}

/**
 * Fetch public payment config (whether test mode is configured and public keyId)
 */
export const fetchPaymentConfig = async (): Promise<PaymentConfigResponse> => {
  const response = await fetch(`${API_BASE_URL}/payment/config`);
  if (!response.ok) {
    throw new Error('Failed to fetch payment configuration');
  }
  return response.json();
};

/**
 * Create a server-side Razorpay order with INR amount calculated on backend
 */
export const createRazorpayPaymentOrder = async (
  orderId: string
): Promise<CreatePaymentOrderResponse> => {
  const response = await fetch(`${API_BASE_URL}/payment/create-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId }),
  });

  const json = await response.json();
  if (!response.ok && json.success === false && json.isConfigured !== false) {
    throw new Error(json.message || 'Failed to initialize payment');
  }
  return json;
};

/**
 * Verify Razorpay payment signature on backend with timing-safe HMAC SHA-256
 */
export const verifyRazorpayPayment = async (
  payload: VerifyPaymentPayload
): Promise<{ success: boolean; message: string; data: Order }> => {
  const response = await fetch(`${API_BASE_URL}/payment/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.message || 'Payment verification failed');
  }
  return json;
};

/**
 * Record a payment cancellation or modal dismissal
 */
export const recordPaymentFailureApi = async (
  payload: PaymentFailurePayload
): Promise<void> => {
  try {
    await fetch(`${API_BASE_URL}/payment/failure`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error('Failed to log payment failure:', err);
  }
};

/**
 * Fallback to switch an unpaid Razorpay order to Cash on Delivery
 */
export const switchToCodApi = async (orderId: string): Promise<Order> => {
  const response = await fetch(`${API_BASE_URL}/payment/switch-to-cod`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId }),
  });

  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.message || 'Failed to switch to Cash on Delivery');
  }
  return json.data;
};


