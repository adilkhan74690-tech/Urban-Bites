export type CategoryType = 
  | 'All' 
  | 'Burgers' 
  | 'Pizza' 
  | 'Indian' 
  | 'Starters' 
  | 'Desserts' 
  | 'Beverages';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number; // in INR
  image: string;
  category: Exclude<CategoryType, 'All'>;
  isVegetarian: boolean;
  isAvailable: boolean;
  isPopular?: boolean;
  rating?: number;
  preparationTime?: string;
  tags?: string[];
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

export interface OrderItem {
  menuItem?: MenuItem | string;
  name?: string;
  price: number;
  quantity: number;
  itemTotal?: number;
}

export type OrderType = 'delivery' | 'pickup';
export type PaymentMethod = 'razorpay' | 'cod';
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface Order {
  id: string;
  orderId?: string;
  customerName: string;
  phone: string;
  email: string;
  orderType: OrderType;
  deliveryAddress?: string;
  notes?: string;
  items: Array<CartItem | OrderItem | any>;
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  paymentFailureReason?: string;
  createdAt: string;
}

export interface Reservation {
  id: string;
  referenceCode: string;
  customerName: string;
  phone: string;
  email: string;
  reservationDate: string;
  timeSlot: string;
  guests: number;
  specialRequests?: string;
  status: 'confirmed' | 'cancelled' | 'pending';
  createdAt: string;
}

export interface CustomerReview {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  dishRecommended: string;
  avatar: string;
}
