# ZEROX Phase 3 - Component Usage Examples

## Overview

This document provides code examples for integrating and using all Phase 3 components in your application.

---

## 1. NotificationCenter Component

### Basic Usage

```tsx
import NotificationCenter from '@/components/NotificationCenter';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'offer' | 'refund' | 'return' | 'coupon' | 'announcement';
  read: boolean;
  date: Date;
}

export default function App() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const handleDelete = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="flex items-center gap-4">
      <NotificationCenter
        notifications={notifications}
        unreadCount={unreadCount}
        onMarkAsRead={handleMarkAsRead}
        onDelete={handleDelete}
        onMarkAllRead={() => {
          setNotifications(prev =>
            prev.map(n => ({ ...n, read: true }))
          );
        }}
      />
    </div>
  );
}
```

### With Firestore Integration

```tsx
const [notifications, setNotifications] = useState<Notification[]>([]);
const [unreadCount, setUnreadCount] = useState(0);

useEffect(() => {
  if (!user?.uid) return;
  
  const q = query(
    collection(db, `users/${user.uid}/notifications`),
    orderBy('date', 'desc')
  );
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const notifs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Notification[];
    
    setNotifications(notifs);
    setUnreadCount(notifs.filter(n => !n.read).length);
  });

  return () => unsubscribe();
}, [user?.uid]);
```

---

## 2. OrderTrackingTimeline Component

### Basic Usage

```tsx
import OrderTrackingTimeline from '@/components/OrderTrackingTimeline';

export default function OrderDetails() {
  const order = {
    id: 'ORD123456',
    status: 'SHIPPED' as const,
    trackingNumber: '1Z999AA10123456784',
    estimatedDelivery: new Date('2024-01-20'),
    createdAt: new Date('2024-01-10')
  };

  return (
    <OrderTrackingTimeline
      currentStatus={order.status}
      trackingNumber={order.trackingNumber}
      estimatedDelivery={order.estimatedDelivery}
    />
  );
}
```

### With Custom Timeline

```tsx
import OrderTrackingTimeline, { 
  type OrderStatus, 
  type TimelineStep 
} from '@/components/OrderTrackingTimeline';
import {
  Clock, Check, Package, Truck, MapPin
} from 'lucide-react';

const customTimeline: TimelineStep[] = [
  {
    status: 'PENDING' as OrderStatus,
    label: 'Payment Processing',
    icon: <Clock className="w-4 h-4" />,
    timestamp: new Date('2024-01-10 10:00 AM'),
    color: 'amber'
  },
  {
    status: 'PROCESSING' as OrderStatus,
    label: 'Packaging',
    icon: <Package className="w-4 h-4" />,
    timestamp: new Date('2024-01-11 09:30 AM'),
    color: 'blue'
  },
  {
    status: 'SHIPPED' as OrderStatus,
    label: 'In Transit',
    icon: <Truck className="w-4 h-4" />,
    timestamp: new Date('2024-01-12 02:15 PM'),
    color: 'cyan'
  }
];

export default function TrackingPage() {
  return (
    <OrderTrackingTimeline
      currentStatus="SHIPPED"
      trackingNumber="1Z999AA10123456784"
      estimatedDelivery={new Date('2024-01-18')}
      timeline={customTimeline}
    />
  );
}
```

---

## 3. ShoppingCart Component

### Basic Implementation

```tsx
import ShoppingCart, { type CartItem } from '@/components/ShoppingCart';

export default function App() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const handleAddItem = (item: CartItem) => {
    setCartItems(prev => [...prev, item]);
  };

  const handleRemoveItem = (itemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    setCartItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const handleCheckout = () => {
    console.log('Proceeding to checkout with items:', cartItems);
    // Navigate to checkout page
  };

  return (
    <>
      <ShoppingCart
        items={cartItems}
        onAddItem={handleAddItem}
        onRemoveItem={handleRemoveItem}
        onUpdateQuantity={handleUpdateQuantity}
        onCheckout={handleCheckout}
        onApplyCoupon={(code) => console.log('Coupon applied:', code)}
      />
    </>
  );
}
```

### Adding Items Programmatically

```tsx
const addProductToCart = (product: any, quantity: number = 1) => {
  const cartItem: CartItem = {
    id: product.id,
    name: product.name,
    price: product.price,
    quantity,
    color: product.selectedColor,
    size: product.selectedSize,
    image: product.image
  };

  handleAddItem(cartItem);
};

// Usage:
addProductToCart({
  id: '123',
  name: 'ZEROX Phantom One',
  price: 345,
  selectedColor: 'Pastel Sorbet',
  selectedSize: 'US 10',
  image: '/products/phantom.jpg'
}, 1);
```

---

## 4. ReturnsManager Component

### Basic Usage

```tsx
import ReturnsManager, { 
  type ReturnRequest, 
  type RequestType 
} from '@/components/ReturnsManager';

export default function ReturnsPage() {
  const [requests, setRequests] = useState<ReturnRequest[]>([]);

  const handleSubmitRequest = async (
    type: RequestType,
    orderId: string,
    reason: string,
    images?: File[]
  ) => {
    try {
      // Upload images if provided
      let imageUrls: string[] = [];
      if (images) {
        imageUrls = await Promise.all(
          images.map(file => uploadImage(file))
        );
      }

      // Create return request in Firestore
      const requestRef = await addDoc(
        collection(db, 'requests'),
        {
          userId: user.uid,
          orderId,
          type,
          reason,
          images: imageUrls,
          status: 'PENDING',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      );

      // Update local state
      setRequests(prev => [...prev, {
        id: requestRef.id,
        orderId,
        type,
        reason,
        status: 'PENDING',
        images: imageUrls,
        createdAt: new Date(),
        updatedAt: new Date()
      }]);

      showSuccessMessage('Request submitted successfully');
    } catch (error) {
      console.error('Error submitting request:', error);
      showErrorMessage('Failed to submit request');
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    try {
      await deleteDoc(doc(db, 'requests', requestId));
      setRequests(prev => prev.filter(r => r.id !== requestId));
    } catch (error) {
      console.error('Error cancelling request:', error);
    }
  };

  return (
    <ReturnsManager
      requests={requests}
      onSubmitRequest={handleSubmitRequest}
      onCancelRequest={handleCancelRequest}
    />
  );
}
```

---

## 5. RecentlyViewed Component

### Compact View (Homepage)

```tsx
import RecentlyViewed from '@/components/RecentlyViewed';

export default function Homepage() {
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  useEffect(() => {
    // Fetch recently viewed from Firestore
    fetchRecentlyViewedProducts();
  }, [user?.uid]);

  return (
    <RecentlyViewed
      products={recentlyViewed}
      maxItems={5}
      compact={true}  // Horizontal carousel
      onAddToCart={(productId) => {
        // Add to cart logic
      }}
      onRemoveItem={(productId) => {
        // Remove from history
      }}
      onClearHistory={() => {
        // Clear all recently viewed
      }}
    />
  );
}
```

### List View (Dashboard)

```tsx
export default function DashboardPage() {
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  return (
    <div className="space-y-6">
      <RecentlyViewed
        products={recentlyViewed}
        maxItems={10}
        compact={false}  // Grid layout
        onAddToCart={(productId) => handleAddToCart(productId)}
        onRemoveItem={(productId) => handleRemoveViewed(productId)}
        onClearHistory={() => handleClearHistory()}
      />
    </div>
  );
}
```

---

## 6. DashboardAnalytics Component

### Basic Usage

```tsx
import DashboardAnalytics from '@/components/DashboardAnalytics';

export default function Dashboard() {
  const [analyticsData, setAnalyticsData] = useState({
    totalOrders: 24,
    completedOrders: 22,
    pendingOrders: 2,
    cancelledOrders: 0,
    wishlistCount: 8,
    rewardPoints: 3450,
    totalSpent: 12500,
    membershipLevel: 'Gold'
  });

  return (
    <DashboardAnalytics
      data={analyticsData}
      compact={false}
    />
  );
}
```

### Compact Version (Sidebar Widget)

```tsx
export default function Sidebar() {
  return (
    <DashboardAnalytics
      data={analyticsData}
      compact={true}  // 6-column grid
    />
  );
}
```

### Real-time Updates with Firestore

```tsx
useEffect(() => {
  if (!user?.uid) return;

  const unsub = onSnapshot(
    collection(db, 'orders'),
    (snapshot) => {
      const orders = snapshot.docs.map(doc => doc.data());
      const completedOrders = orders.filter(o => o.status === 'DELIVERED').length;

      setAnalyticsData(prev => ({
        ...prev,
        totalOrders: orders.length,
        completedOrders,
        pendingOrders: orders.filter(o => 
          o.status === 'PENDING' || o.status === 'PROCESSING'
        ).length,
        cancelledOrders: orders.filter(o => o.status === 'CANCELLED').length,
        totalSpent: orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0)
      }));
    },
    (error) => console.error('Error fetching analytics:', error)
  );

  return () => unsub();
}, [user?.uid]);
```

---

## 7. Complete Dashboard Integration

### Full Page Implementation

```tsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import CustomerDashboard from '@/components/CustomerDashboard';
import DashboardAnalytics from '@/components/DashboardAnalytics';
import ShoppingCart from '@/components/ShoppingCart';
import RecentlyViewed from '@/components/RecentlyViewed';

export default function DashboardPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null);

  useEffect(() => {
    if (!user?.uid) return;
    
    // Fetch all dashboard data
    Promise.all([
      fetchOrders(user.uid),
      fetchAddresses(user.uid),
      fetchAnalytics(user.uid)
    ]).then(([ordersData, addressesData, analyticsData]) => {
      setOrders(ordersData);
      setAddresses(addressesData);
      setAnalyticsData(analyticsData);
    });
  }, [user?.uid]);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Analytics Section */}
      {analyticsData && (
        <section className="py-8 px-8">
          <DashboardAnalytics
            data={analyticsData}
            compact={false}
          />
        </section>
      )}

      {/* Recently Viewed */}
      <section className="py-8 px-8 border-t border-neutral-900">
        <RecentlyViewed
          products={recentlyViewedProducts}
          maxItems={5}
          compact={true}
        />
      </section>

      {/* Main Dashboard */}
      <section className="py-8 px-8 border-t border-neutral-900">
        <CustomerDashboard
          user={user}
          onLogout={() => handleLogout()}
        />
      </section>

      {/* Shopping Cart */}
      <ShoppingCart
        items={cartItems}
        onAddItem={handleAddItem}
        onRemoveItem={handleRemoveItem}
        onUpdateQuantity={handleUpdateQuantity}
        onCheckout={handleCheckout}
      />
    </div>
  );
}
```

---

## 8. Advanced Integration Patterns

### State Management with Context

```tsx
import { createContext, useContext, useState } from 'react';

interface DashboardContextType {
  orders: Order[];
  addresses: Address[];
  notifications: Notification[];
  cartItems: CartItem[];
  addOrder: (order: Order) => void;
  updateOrder: (orderId: string, updates: Partial<Order>) => void;
  deleteOrder: (orderId: string) => void;
}

const DashboardContext = createContext<DashboardContextType | null>(null);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const value: DashboardContextType = {
    orders,
    addresses,
    notifications,
    cartItems,
    addOrder: (order) => setOrders(prev => [...prev, order]),
    updateOrder: (orderId, updates) =>
      setOrders(prev =>
        prev.map(o => o.id === orderId ? { ...o, ...updates } : o)
      ),
    deleteOrder: (orderId) =>
      setOrders(prev => prev.filter(o => o.id !== orderId))
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within DashboardProvider');
  }
  return context;
};
```

### Custom Hook for Dashboard Data

```tsx
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

export const useDashboardData = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.uid) return;

    setLoading(true);

    // Subscribe to orders
    const ordersUnsubscribe = onSnapshot(
      query(collection(db, 'orders'), where('userId', '==', user.uid)),
      (snapshot) => {
        setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      },
      (err) => setError(err.message)
    );

    // Subscribe to addresses
    const addressesUnsubscribe = onSnapshot(
      collection(db, `users/${user.uid}/addresses`),
      (snapshot) => {
        setAddresses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      },
      (err) => setError(err.message)
    );

    return () => {
      ordersUnsubscribe();
      addressesUnsubscribe();
    };
  }, [user?.uid]);

  return { orders, addresses, loading, error };
};

// Usage:
const { orders, addresses, loading } = useDashboardData();
```

---

## 9. Error Handling Patterns

### With Toast Notifications

```tsx
import { useCallback } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const showToast = useCallback((toast: ToastProps) => {
    const id = Math.random();
    setToasts(prev => [...prev, { ...toast, id }]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, toast.duration || 3000);
  }, []);

  return { toasts, showToast };
};

// Usage in component:
const { showToast } = useToast();

const handleAddAddress = async (address: Address) => {
  try {
    await addDoc(collection(db, `users/${user.uid}/addresses`), address);
    showToast({ message: 'Address added successfully', type: 'success' });
  } catch (error) {
    showToast({ 
      message: 'Failed to add address', 
      type: 'error',
      duration: 5000 
    });
  }
};
```

---

## 10. Testing Components

### Unit Test Example

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import ShoppingCart from '@/components/ShoppingCart';

describe('ShoppingCart', () => {
  it('renders cart button with item count', () => {
    const items = [
      {
        id: '1',
        name: 'ZEROX Phantom',
        price: 345,
        quantity: 2,
        image: 'image.jpg'
      }
    ];

    render(
      <ShoppingCart items={items} />
    );

    const cartButton = screen.getByRole('button');
    expect(cartButton).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // Item count
  });

  it('opens cart sidebar when clicked', () => {
    render(<ShoppingCart items={[]} />);
    
    const cartButton = screen.getByRole('button');
    fireEvent.click(cartButton);

    expect(screen.getByText('Shopping Cart')).toBeInTheDocument();
  });
});
```

---

## Summary

All Phase 3 components are ready for integration. They:
- ✅ Follow React best practices
- ✅ Have full TypeScript support
- ✅ Work with Firestore
- ✅ Support animations
- ✅ Are fully responsive
- ✅ Include error handling
- ✅ Have proper accessibility

For more information, refer to the main component files in `/src/components/`.
