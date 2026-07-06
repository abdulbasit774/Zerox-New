export interface Colorway {
  name: string;
  hex: string;
  image: string;
}

export interface SneakerFeature {
  title: string;
  description: string;
}

export interface Sneaker {
  id: string;
  name: string;
  tagline: string;
  price: number;
  rating: number;
  reviewsCount: number;
  description: string;
  category: 'Performance' | 'Luxury' | 'Limited Drop' | 'Futuristic';
  image: string;
  colorways: Colorway[];
  sizes: number[];
  specs: {
    weight: string;
    cushioning: string;
    offset: string;
    propulsion: string;
  };
  features: SneakerFeature[];
}

export interface CartItem {
  id: string; // unique cart item id (combines sneakerId + colorName + size + engraving)
  sneaker: Sneaker;
  selectedColorway: Colorway;
  selectedSize: number;
  quantity: number;
  engraving?: string;
  isCustom?: boolean;
}

export interface UserProfile {
  // Authentication
  uid?: string;
  email: string;
  name: string;
  phone?: string;
  photoURL?: string;
  loggedIn: boolean;
  
  // Profile Management
  fullName?: string;
  emailVerified?: boolean;
  provider?: 'email' | 'google' | 'apple' | 'facebook' | 'phone';
  role?: 'user' | 'admin' | 'moderator';
  
  // Membership & Status
  membershipTier: 'Challenger' | 'Elite' | 'Apex Founder';
  creatorRank: number;
  challengerPoints: number;
  status?: 'active' | 'inactive' | 'suspended';
  
  // Metadata
  createdAt?: string;
  updatedAt?: string;
  lastLogin?: string;
  identityVerified?: boolean;
  
  // Order History
  orderHistory: Order[];
}

export interface Order {
  id: string;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  date: string;
  status: 'Processing' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled' | 'Refund Requested' | 'Exchange Pending';
  serialNumber: string;
  qrCode: string;
  digitalSignature: string;
  deliveryAddress: {
    name: string;
    email: string;
    address: string;
    city: string;
    country: string;
  };
  createdAt?: string;
  shippingMethod?: 'standard' | 'express' | 'priority';
  couponCode?: string | null;
  discountAmount?: number;
  taxAmount?: number;
  paymentMethod?: string;
  trackingNumber?: string;
  estimatedDeliveryDate?: string;
}

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  method: 'card' | 'stripe' | 'express' | 'paypal' | 'bank' | 'cod';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  cardBrand?: string;
  cardLast4?: string;
  timestamp: string;
  externalPaymentId?: string;
}

export interface Transaction {
  id: string;
  paymentId: string;
  orderId: string;
  amount: number;
  type: 'payment' | 'refund' | 'adjustment';
  status: 'pending' | 'completed' | 'failed';
  timestamp: string;
}

export interface Refund {
  id: string;
  orderId: string;
  paymentId: string;
  userId: string;
  amount: number;
  reason: string;
  type: 'full' | 'partial';
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface Return {
  id: string;
  orderId: string;
  userId: string;
  items: Array<{ itemId: string; quantity: number }>;
  reason: string;
  status: 'requested' | 'approved' | 'rejected' | 'shipped' | 'received' | 'refunded';
  createdAt: string;
  updatedAt: string;
}
