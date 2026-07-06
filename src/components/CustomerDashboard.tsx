import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User, LogOut, Heart, Package, Settings, CreditCard, Bell, Lock, ChevronRight,
  MapPin, Mail, Phone, Edit2, Save, X, ShieldCheck, Award, TrendingUp, 
  Download, Undo2, AlertCircle, CheckCircle, Clock, Truck, Check, Eye,
  Trash2, Edit3, Plus, Star, Eye as ViewIcon, ShoppingCart, Gift, Home
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { UserProfile } from '../types';
import { db } from '../lib/firebase';
import { collection, getDocs, query, where, doc, updateDoc, setDoc, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';

type DashboardTab = 'profile' | 'orders' | 'addresses' | 'wishlist' | 'settings' | 'security';

interface CustomerDashboardProps {
  user?: UserProfile;
  onLogout?: () => void;
}

export default function CustomerDashboard({ user: propsUser, onLogout }: CustomerDashboardProps) {
  const authContext = useAuth();
  // Use props user if provided, otherwise use auth context user
  const displayUser = propsUser ? { displayName: propsUser.name, email: propsUser.email } : authContext.user;
  const loggedIn = propsUser?.loggedIn || authContext.loggedIn;
  
  const [activeTab, setActiveTab] = useState<DashboardTab>('profile');
  const [orders, setOrders] = useState<any[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [editingProfile, setEditingProfile] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState<any | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState<'cancel' | 'return' | 'refund' | null>(null);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  // Profile edit states
  const [editName, setEditName] = useState(displayUser?.displayName || '');
  const [editPhone, setEditPhone] = useState('+1 (000) 000-0000');
  const [editEmail, setEditEmail] = useState(displayUser?.email || '');
  const [editPassword, setEditPassword] = useState('');
  const [editPasswordConfirm, setEditPasswordConfirm] = useState('');

  // Address form fields
  const [addressForm, setAddressForm] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
    isDefault: false,
    isBilling: false
  });

  useEffect(() => {
    if (loggedIn) {
      loadWishlist();
      if (authContext.user?.uid) {
        fetchOrders();
        fetchAddresses();
        fetchPaymentMethods();
        fetchNotifications();
      }
    }
  }, [loggedIn, authContext.user?.uid]);

  const fetchOrders = async () => {
    try {
      if (!authContext.user?.uid) return;
      const q = query(collection(db, 'orders'), where('userId', '==', authContext.user.uid));
      const snapshot = await getDocs(q);
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load orders');
    }
  };

  const fetchAddresses = async () => {
    try {
      if (!authContext.user?.uid) return;
      const q = query(collection(db, `users/${authContext.user.uid}/addresses`));
      const snapshot = await getDocs(q);
      setSavedAddresses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      if (!authContext.user?.uid) return;
      const q = query(collection(db, `users/${authContext.user.uid}/paymentMethods`));
      const snapshot = await getDocs(q);
      setPaymentMethods(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      if (!authContext.user?.uid) return;
      const q = query(collection(db, `users/${authContext.user.uid}/notifications`));
      const snapshot = await getDocs(q);
      const notifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setNotifications(notifs);
      const unread = notifs.filter((n: any) => !n.read).length;
      setUnreadNotifications(unread);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const loadWishlist = () => {
    const saved = localStorage.getItem('zerox_wishlist');
    setWishlist(saved ? JSON.parse(saved) : []);
  };

  const saveWishlist = (items: string[]) => {
    setWishlist(items);
    localStorage.setItem('zerox_wishlist', JSON.stringify(items));
  };

  const removeFromWishlist = (itemId: string) => {
    const updated = wishlist.filter(id => id !== itemId);
    saveWishlist(updated);
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      if (!authContext.user?.uid) return;
      await updateDoc(doc(db, `users/${authContext.user.uid}/notifications`, notificationId), { read: true });
      await fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      if (!authContext.user?.uid) return;
      await deleteDoc(doc(db, `users/${authContext.user.uid}/notifications`, notificationId));
      await fetchNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const addAddress = async (address: any) => {
    try {
      setLoading(true);
      if (!authContext.user?.uid) return;
      await addDoc(collection(db, `users/${authContext.user.uid}/addresses`), {
        ...address,
        createdAt: serverTimestamp()
      });
      await fetchAddresses();
      setShowAddressForm(false);
      setAddressForm({ name: '', address: '', city: '', state: '', zip: '', phone: '', isDefault: false, isBilling: false });
      setSuccess('Address added successfully');
      setError(null);
    } catch (err) {
      setError('Failed to add address');
      console.error('Error adding address:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateAddress = async (addressId: string, updates: any) => {
    try {
      setLoading(true);
      if (!authContext.user?.uid) return;
      await updateDoc(doc(db, `users/${authContext.user.uid}/addresses`, addressId), updates);
      await fetchAddresses();
      setEditingAddressId(null);
      setSuccess('Address updated successfully');
      setError(null);
    } catch (err) {
      setError('Failed to update address');
      console.error('Error updating address:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteAddress = async (addressId: string) => {
    try {
      setLoading(true);
      if (!authContext.user?.uid) return;
      await deleteDoc(doc(db, `users/${authContext.user.uid}/addresses`, addressId));
      await fetchAddresses();
      setSuccess('Address deleted successfully');
    } catch (err) {
      setError('Failed to delete address');
      console.error('Error deleting address:', err);
    } finally {
      setLoading(false);
    }
  };

  const submitRequest = async (type: 'cancel' | 'return' | 'refund', reason: string) => {
    try {
      setLoading(true);
      if (!authContext.user?.uid || !selectedOrderForDetail) return;
      
      await addDoc(collection(db, 'requests'), {
        userId: authContext.user.uid,
        orderId: selectedOrderForDetail.id,
        type,
        reason,
        status: 'PENDING',
        createdAt: serverTimestamp()
      });
      
      setShowRequestForm(null);
      setError(null);
    } catch (err) {
      setError('Failed to submit request');
      console.error('Error submitting request:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateInvoicePDF = () => {
    if (!selectedOrderForDetail) return;
    console.log('[v0] Generating PDF for order:', selectedOrderForDetail.id);
    // PDF generation PENDING CONFIGURATION - requires jsPDF or similar library
    alert('PDF invoice download feature requires PDF library configuration');
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      if (onLogout) {
        onLogout();
      } else if (authContext.logout) {
        await authContext.logout();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (!loggedIn || !displayUser) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <p className="font-mono text-sm text-neutral-400 mb-2">NOT AUTHENTICATED</p>
          <p className="font-sans text-xl font-black">Please log in to access your dashboard</p>
        </div>
      </div>
    );
  }

  const initials = (displayUser.displayName || 'User').split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <div className="w-full min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-neutral-950 to-black border-b border-neutral-900 p-8">
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-[#C9A227] to-amber-600 rounded-full flex items-center justify-center text-black font-sans font-black text-2xl border-2 border-[#C9A227]">
                {initials}
              </div>
              <div>
                <h1 className="font-sans text-3xl font-black text-white mb-2">{displayUser.displayName || 'Collector'}</h1>
                <p className="font-mono text-xs text-neutral-400 tracking-wider uppercase mb-2">{displayUser.email}</p>
                {propsUser && (
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-[#C9A227]" />
                    <span className="font-mono text-xs text-[#C9A227] tracking-wider font-semibold">{propsUser.membershipTier}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-3 hover:bg-neutral-900 rounded-xl transition-colors relative"
                >
                  <Bell className="w-5 h-5 text-neutral-400 hover:text-[#C9A227]" />
                  {unreadNotifications > 0 && (
                    <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">{unreadNotifications}</span>
                  )}
                </button>
              </div>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="px-6 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl font-mono text-sm font-semibold tracking-wider uppercase transition-all cursor-pointer disabled:opacity-50"
              >
                <LogOut className="w-4 h-4 inline mr-2" />
                {isLoggingOut ? 'LOGGING OUT...' : 'LOGOUT'}
              </button>
            </div>
          </div>

          {/* Stats */}
          {propsUser && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-neutral-900/50 border border-neutral-900 rounded-xl p-4">
                <p className="font-mono text-xs text-neutral-500 mb-1 tracking-wider uppercase">Creator Rank</p>
                <p className="font-sans text-2xl font-black text-white">{propsUser.creatorRank}</p>
              </div>
              <div className="bg-neutral-900/50 border border-neutral-900 rounded-xl p-4">
                <p className="font-mono text-xs text-neutral-500 mb-1 tracking-wider uppercase">Challenger Points</p>
                <p className="font-sans text-2xl font-black text-[#C9A227]">+{propsUser.challengerPoints}</p>
              </div>
              <div className="bg-neutral-900/50 border border-neutral-900 rounded-xl p-4">
                <p className="font-mono text-xs text-neutral-500 mb-1 tracking-wider uppercase">Total Orders</p>
                <p className="font-sans text-2xl font-black text-white">{orders.length}</p>
              </div>
              <div className="bg-neutral-900/50 border border-neutral-900 rounded-xl p-4">
                <p className="font-mono text-xs text-neutral-500 mb-1 tracking-wider uppercase">Wishlist Items</p>
                <p className="font-sans text-2xl font-black text-white">{wishlist.length}</p>
              </div>
            </div>
          )}
        </div>

        {/* Tabs Navigation */}
        <div className="border-b border-neutral-900 bg-neutral-950/50 sticky top-0 z-10 overflow-x-auto">
          <div className="max-w-7xl mx-auto px-8 flex gap-1">
            {[
              { id: 'profile', label: 'Profile', icon: User },
              { id: 'orders', label: 'Orders', icon: Package },
              { id: 'addresses', label: 'Addresses', icon: MapPin },
              { id: 'wishlist', label: 'Wishlist', icon: Heart },
              { id: 'settings', label: 'Settings', icon: Settings },
              { id: 'security', label: 'Security', icon: Lock },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as DashboardTab)}
                  className={`px-4 py-4 font-mono text-xs tracking-wider uppercase border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-[#C9A227] text-[#C9A227] font-bold'
                      : 'border-transparent text-neutral-500 hover:text-neutral-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-8">
          <AnimatePresence mode="wait">
            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-2xl"
              >
                <h2 className="text-2xl font-black mb-8">Account Information</h2>
                
                {editingProfile ? (
                  <div className="space-y-6">
                    <div>
                      <label className="font-mono text-xs text-neutral-400 block mb-2 tracking-wider uppercase">Full Name</label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-900 focus:border-[#C9A227] rounded-xl px-4 py-3 text-white focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="font-mono text-xs text-neutral-400 block mb-2 tracking-wider uppercase">Email</label>
                      <input
                        type="email"
                        value={displayUser.email || ''}
                        disabled
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-neutral-500 cursor-not-allowed"
                      />
                      <p className="text-xs text-neutral-500 mt-1 font-mono">Email cannot be changed</p>
                    </div>
                    <div>
                      <label className="font-mono text-xs text-neutral-400 block mb-2 tracking-wider uppercase">Phone</label>
                      <input
                        type="tel"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-900 focus:border-[#C9A227] rounded-xl px-4 py-3 text-white focus:outline-none transition-colors"
                      />
                    </div>
                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={() => {
                          setEditingProfile(false);
                          setEditName(displayUser.displayName || '');
                        }}
                        className="flex-1 py-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-white rounded-xl font-mono text-xs font-semibold tracking-wider uppercase cursor-pointer transition-colors"
                      >
                        CANCEL
                      </button>
                      <button
                        onClick={() => setEditingProfile(false)}
                        className="flex-1 py-3 bg-[#C9A227] hover:bg-amber-500 text-black rounded-xl font-mono text-xs font-semibold tracking-wider uppercase cursor-pointer transition-colors flex items-center justify-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        SAVE CHANGES
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-neutral-950/50 border border-neutral-900 rounded-2xl p-6 space-y-4">
                    <div className="flex items-center justify-between pb-4 border-b border-neutral-900">
                      <div>
                        <p className="font-mono text-xs text-neutral-500 mb-1 tracking-wider uppercase">Full Name</p>
                        <p className="font-sans text-lg font-semibold">{displayUser.displayName || 'Not set'}</p>
                      </div>
                      <button
                        onClick={() => setEditingProfile(true)}
                        className="p-2 hover:bg-neutral-900 rounded-lg transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4 text-neutral-400" />
                      </button>
                    </div>
                    <div>
                      <p className="font-mono text-xs text-neutral-500 mb-1 tracking-wider uppercase">Email</p>
                      <p className="font-sans text-lg">{displayUser.email}</p>
                    </div>
                    <div>
                      <p className="font-mono text-xs text-neutral-500 mb-1 tracking-wider uppercase">Phone</p>
                      <p className="font-sans text-lg">{editPhone}</p>
                    </div>
                    {authContext.user?.profile?.identityVerified && (
                      <div className="flex items-center gap-2 pt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span className="font-mono text-xs text-emerald-400 tracking-wider uppercase">Identity Verified</span>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* ORDERS TAB */}
            {activeTab === 'orders' && (
              <motion.div
                key="orders"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <h2 className="text-2xl font-black mb-8">Order History</h2>
                {orders.length === 0 ? (
                  <div className="text-center py-16">
                    <Package className="w-12 h-12 text-neutral-700 mx-auto mb-4" />
                    <p className="font-mono text-sm text-neutral-400 mb-2">NO ORDERS YET</p>
                    <p className="font-sans text-neutral-500">Start shopping to see your orders here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order, index) => {
                      const statusColors: Record<string, string> = {
                        'PENDING': 'text-amber-400 bg-amber-500/10 border-amber-500/30',
                        'PROCESSING': 'text-blue-400 bg-blue-500/10 border-blue-500/30',
                        'SHIPPED': 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
                        'DELIVERED': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
                        'CANCELLED': 'text-red-400 bg-red-500/10 border-red-500/30'
                      };
                      const status = order.status || 'PENDING';
                      const colorClass = statusColors[status] || statusColors['PENDING'];
                      
                      return (
                        <motion.div 
                          key={order.id} 
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => setSelectedOrderForDetail(order)}
                          className="bg-gradient-to-r from-neutral-950/60 to-neutral-950/20 border border-neutral-900 rounded-2xl p-6 hover:border-[#C9A227]/50 transition-all hover:shadow-lg hover:shadow-[#C9A227]/10 group cursor-pointer"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            {/* Order Info */}
                            <div className="flex-1">
                              <div className="flex items-start gap-4 mb-3">
                                <div className="w-12 h-12 bg-[#C9A227]/10 border border-[#C9A227]/30 rounded-xl flex items-center justify-center">
                                  <Package className="w-6 h-6 text-[#C9A227]" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="font-sans font-black text-white">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                                  </div>
                                  <p className="font-mono text-xs text-neutral-500 tracking-wider">{new Date(order.createdAt?.toDate?.() || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                </div>
                              </div>
                              
                              {/* Order Items Preview */}
                              {order.items && order.items.length > 0 && (
                                <div className="ml-16 text-xs text-neutral-400 mb-2">
                                  <span className="font-mono">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
                                </div>
                              )}
                            </div>

                            {/* Status & Price */}
                            <div className="flex items-center justify-between sm:flex-col sm:items-end gap-4">
                              <div>
                                <p className="font-mono text-xs text-neutral-500 tracking-wider uppercase mb-1">Status</p>
                                <span className={`inline-block px-3 py-1.5 rounded-lg font-mono text-xs font-semibold tracking-wider uppercase border ${colorClass}`}>
                                  {status}
                                </span>
                              </div>
                              <div className="text-right">
                                <p className="font-mono text-xs text-neutral-500 tracking-wider uppercase mb-1">Total</p>
                                <p className="font-sans font-black text-[#C9A227] text-lg">${(order.totalPrice || 0).toFixed(2)}</p>
                              </div>
                            </div>
                          </div>

                          {/* Tracking Progress */}
                          {status !== 'CANCELLED' && status !== 'PENDING' && (
                            <div className="mt-4 pt-4 border-t border-neutral-900">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-1 bg-neutral-900 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full ${
                                      status === 'DELIVERED' ? 'w-full bg-emerald-500' :
                                      status === 'SHIPPED' ? 'w-2/3 bg-cyan-500' :
                                      'w-1/3 bg-blue-500'
                                    } transition-all duration-500`}
                                  />
                                </div>
                                <span className="font-mono text-xs text-neutral-500">
                                  {status === 'DELIVERED' ? '100%' : status === 'SHIPPED' ? '67%' : '33%'}
                                </span>
                              </div>
                              <p className="font-mono text-[10px] text-neutral-600 mt-2 uppercase tracking-wider">
                                {status === 'DELIVERED' ? 'Delivered to address' : 
                                 status === 'SHIPPED' ? 'In transit' : 
                                 'Processing your order'}
                              </p>
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* ADDRESSES TAB */}
            {activeTab === 'addresses' && (
              <motion.div
                key="addresses"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-black">Saved Addresses</h2>
                  <button 
                    onClick={() => setShowAddressForm(!showAddressForm)}
                    className="px-4 py-2 bg-[#C9A227] hover:bg-amber-500 text-black rounded-lg font-mono text-xs font-semibold tracking-wider uppercase cursor-pointer transition-colors"
                  >
                    {showAddressForm ? '- CANCEL' : '+ ADD ADDRESS'}
                  </button>
                </div>

                {showAddressForm && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6 mb-6 space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={addressForm.name}
                        onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                        className="col-span-2 bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white placeholder-neutral-600 focus:border-[#C9A227] focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Address"
                        value={addressForm.address}
                        onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                        className="col-span-2 bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white placeholder-neutral-600 focus:border-[#C9A227] focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="City"
                        value={addressForm.city}
                        onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                        className="bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white placeholder-neutral-600 focus:border-[#C9A227] focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="State"
                        value={addressForm.state}
                        onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                        className="bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white placeholder-neutral-600 focus:border-[#C9A227] focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="ZIP"
                        value={addressForm.zip}
                        onChange={(e) => setAddressForm({ ...addressForm, zip: e.target.value })}
                        className="bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white placeholder-neutral-600 focus:border-[#C9A227] focus:outline-none"
                      />
                      <input
                        type="tel"
                        placeholder="Phone"
                        value={addressForm.phone}
                        onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                        className="bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white placeholder-neutral-600 focus:border-[#C9A227] focus:outline-none"
                      />
                      <label className="col-span-1 flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={addressForm.isDefault}
                          onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                          className="w-4 h-4 rounded border-neutral-600"
                        />
                        <span className="font-mono text-xs text-neutral-400">Default Address</span>
                      </label>
                      <label className="col-span-1 flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={addressForm.isBilling}
                          onChange={(e) => setAddressForm({ ...addressForm, isBilling: e.target.checked })}
                          className="w-4 h-4 rounded border-neutral-600"
                        />
                        <span className="font-mono text-xs text-neutral-400">Billing Address</span>
                      </label>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setShowAddressForm(false);
                          setAddressForm({ name: '', address: '', city: '', state: '', zip: '', phone: '', isDefault: false, isBilling: false });
                        }}
                        className="flex-1 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-white rounded-lg font-mono text-xs font-semibold tracking-wider uppercase cursor-pointer transition-colors"
                      >
                        CANCEL
                      </button>
                      <button
                        onClick={() => addAddress(addressForm)}
                        disabled={loading || !addressForm.name || !addressForm.address}
                        className="flex-1 py-2 bg-[#C9A227] hover:bg-amber-500 text-black rounded-lg font-mono text-xs font-semibold tracking-wider uppercase cursor-pointer transition-colors disabled:opacity-50"
                      >
                        {loading ? 'SAVING...' : 'SAVE'}
                      </button>
                    </div>
                  </motion.div>
                )}

                {savedAddresses.length === 0 ? (
                  <div className="text-center py-16">
                    <MapPin className="w-12 h-12 text-neutral-700 mx-auto mb-4" />
                    <p className="font-mono text-sm text-neutral-400 mb-2">NO ADDRESSES YET</p>
                    <p className="font-sans text-neutral-500">Add a shipping address for faster checkout</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {savedAddresses.map((addr) => (
                      <motion.div
                        key={addr.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-gradient-to-r from-neutral-950/60 to-neutral-950/20 border border-neutral-900 rounded-xl p-4 hover:border-[#C9A227]/50 transition-all"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-sans font-semibold text-white">{addr.name}</p>
                              {addr.isDefault && (
                                <span className="px-2 py-1 bg-[#C9A227]/20 border border-[#C9A227]/50 text-[#C9A227] rounded-md font-mono text-[10px] font-bold uppercase">Default</span>
                              )}
                              {addr.isBilling && (
                                <span className="px-2 py-1 bg-blue-500/20 border border-blue-500/50 text-blue-400 rounded-md font-mono text-[10px] font-bold uppercase">Billing</span>
                              )}
                            </div>
                            <p className="text-sm text-neutral-400 mb-1">{addr.address}</p>
                            <p className="text-sm text-neutral-400 mb-2">{addr.city}, {addr.state} {addr.zip}</p>
                            {addr.phone && <p className="text-xs text-neutral-500">{addr.phone}</p>}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setEditingAddressId(addr.id);
                                setAddressForm(addr);
                              }}
                              className="p-2 hover:bg-neutral-900 rounded-lg transition-colors"
                              title="Edit address"
                            >
                              <Edit3 className="w-4 h-4 text-neutral-400 hover:text-[#C9A227]" />
                            </button>
                            <button
                              onClick={() => deleteAddress(addr.id)}
                              disabled={loading}
                              className="p-2 hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                              title="Delete address"
                            >
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* WISHLIST TAB */}
            {activeTab === 'wishlist' && (
              <motion.div
                key="wishlist"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <h2 className="text-2xl font-black mb-8">Wishlist ({wishlist.length})</h2>
                {wishlist.length === 0 ? (
                  <div className="text-center py-16">
                    <Heart className="w-12 h-12 text-neutral-700 mx-auto mb-4" />
                    <p className="font-mono text-sm text-neutral-400 mb-2">WISHLIST EMPTY</p>
                    <p className="font-sans text-neutral-500">Save your favorite sneakers for later</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {wishlist.map((itemId) => (
                      <motion.div
                        key={itemId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-neutral-950/50 border border-neutral-900 rounded-xl p-4 flex items-center justify-between hover:border-[#C9A227]/50 transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <Heart className="w-5 h-5 text-[#C9A227]" />
                          <div>
                            <p className="font-sans font-semibold text-white">Item #{itemId.substring(0, 8)}</p>
                            <p className="text-xs text-neutral-500">Saved for later</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="px-3 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-white rounded-lg font-mono text-xs font-semibold tracking-wider uppercase cursor-pointer transition-colors flex items-center gap-1">
                            <ShoppingCart className="w-3 h-3" />
                            ADD TO CART
                          </button>
                          <button 
                            onClick={() => removeFromWishlist(itemId)}
                            className="p-2 hover:bg-red-900/20 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* SETTINGS TAB */}
            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <h2 className="text-2xl font-black mb-8">Account Settings</h2>
                
                {/* Payment Methods */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-sans text-lg font-bold">Payment Methods</h3>
                    <button className="px-3 py-1.5 bg-[#C9A227] hover:bg-amber-500 text-black rounded-lg font-mono text-xs font-semibold tracking-wider uppercase cursor-pointer transition-colors flex items-center gap-1">
                      <Plus className="w-3 h-3" />
                      ADD CARD
                    </button>
                  </div>
                  {paymentMethods.length === 0 ? (
                    <div className="text-center py-8 bg-neutral-950/50 border border-neutral-900 rounded-xl">
                      <CreditCard className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
                      <p className="text-sm text-neutral-400">No payment methods saved</p>
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      {paymentMethods.map((method) => (
                        <div key={method.id} className="bg-neutral-950/50 border border-neutral-900 rounded-lg p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <CreditCard className="w-4 h-4 text-[#C9A227]" />
                            <div>
                              <p className="font-sans font-semibold text-white">{method.brand} •••• {method.last4}</p>
                              <p className="text-xs text-neutral-500">Expires {method.expiry}</p>
                            </div>
                          </div>
                          <button className="text-red-400 hover:text-red-300 font-mono text-xs uppercase">Remove</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Other Settings */}
                <div className="space-y-3">
                  {[
                    { icon: Bell, label: 'Notifications', desc: 'Manage email and push notifications' },
                    { icon: TrendingUp, label: 'Preferences', desc: 'Personalize your experience' },
                    { icon: Gift, label: 'Gift Cards', desc: 'Redeem or check balance' },
                  ].map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <button key={idx} className="w-full bg-neutral-950/50 hover:bg-neutral-900/50 border border-neutral-900 rounded-xl p-4 flex items-center justify-between transition-colors cursor-pointer group">
                        <div className="flex items-center gap-4 text-left">
                          <Icon className="w-5 h-5 text-neutral-400 group-hover:text-[#C9A227] transition-colors" />
                          <div>
                            <p className="font-sans font-semibold text-white">{item.label}</p>
                            <p className="text-xs text-neutral-500 mt-1">{item.desc}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-neutral-600 group-hover:text-neutral-400 transition-colors" />
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* SECURITY TAB */}
            {activeTab === 'security' && (
              <motion.div
                key="security"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <h2 className="text-2xl font-black mb-8">Security & Privacy</h2>
                <div className="space-y-6">
                  {/* Change Password */}
                  <motion.div className="bg-gradient-to-r from-neutral-950/60 to-neutral-950/20 border border-neutral-900 rounded-xl p-6 hover:border-[#C9A227]/30 transition-all">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Lock className="w-4 h-4 text-[#C9A227]" />
                          <p className="font-sans font-semibold text-white">Change Password</p>
                        </div>
                        <p className="text-xs text-neutral-500">Update your account password regularly</p>
                      </div>
                      <button className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-white rounded-lg font-mono text-xs font-semibold tracking-wider uppercase cursor-pointer transition-colors">
                        CHANGE
                      </button>
                    </div>
                  </motion.div>

                  {/* Two-Factor Authentication */}
                  <motion.div className="bg-gradient-to-r from-neutral-950/60 to-neutral-950/20 border border-neutral-900 rounded-xl p-6 hover:border-[#C9A227]/30 transition-all">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                          <p className="font-sans font-semibold text-white">Two-Factor Authentication</p>
                        </div>
                        <p className="text-xs text-neutral-500">Add an extra layer of security to your account</p>
                      </div>
                      <button className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-white rounded-lg font-mono text-xs font-semibold tracking-wider uppercase cursor-pointer transition-colors">
                        ENABLE
                      </button>
                    </div>
                  </motion.div>

                  {/* Login Activity */}
                  <motion.div className="bg-gradient-to-r from-neutral-950/60 to-neutral-950/20 border border-neutral-900 rounded-xl p-6 hover:border-[#C9A227]/30 transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Eye className="w-4 h-4 text-cyan-400" />
                          <p className="font-sans font-semibold text-white">Active Sessions</p>
                        </div>
                        <p className="text-xs text-neutral-500">Manage devices accessing your account</p>
                      </div>
                      <button className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-white rounded-lg font-mono text-xs font-semibold tracking-wider uppercase cursor-pointer transition-colors">
                        VIEW
                      </button>
                    </div>
                    <div className="grid gap-3">
                      <div className="bg-neutral-950/50 rounded-lg p-3 flex items-center justify-between">
                        <div>
                          <p className="font-sans text-sm font-semibold text-white">Current Device</p>
                          <p className="text-xs text-neutral-500">Chrome on macOS</p>
                        </div>
                        <span className="text-xs text-emerald-400 font-semibold">ACTIVE</span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Privacy Settings */}
                  <motion.div className="bg-gradient-to-r from-neutral-950/60 to-neutral-950/20 border border-neutral-900 rounded-xl p-6 hover:border-[#C9A227]/30 transition-all">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Lock className="w-4 h-4 text-blue-400" />
                          <p className="font-sans font-semibold text-white">Privacy Settings</p>
                        </div>
                        <p className="text-xs text-neutral-500">Control data and visibility</p>
                      </div>
                      <button className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-white rounded-lg font-mono text-xs font-semibold tracking-wider uppercase cursor-pointer transition-colors">
                        MANAGE
                      </button>
                    </div>
                  </motion.div>

                  {/* Delete Account (Danger Zone) */}
                  <motion.div className="bg-red-500/5 border border-red-500/30 rounded-xl p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <AlertCircle className="w-4 h-4 text-red-400" />
                          <p className="font-sans font-semibold text-red-400">Delete Account</p>
                        </div>
                        <p className="text-xs text-neutral-500">Permanently delete your account and all data</p>
                      </div>
                      <button className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg font-mono text-xs font-semibold tracking-wider uppercase cursor-pointer transition-colors">
                        DELETE
                      </button>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Notifications Panel */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div
            key="notifications-panel"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="fixed top-20 right-8 w-96 bg-neutral-950 border border-neutral-900 rounded-2xl shadow-2xl z-40 max-h-[500px] overflow-y-auto"
          >
            <div className="sticky top-0 bg-gradient-to-r from-neutral-950 to-black border-b border-neutral-900 p-4 flex items-center justify-between">
              <h3 className="font-sans font-bold text-white">Notifications</h3>
              <button
                onClick={() => setShowNotifications(false)}
                className="p-1 hover:bg-neutral-900 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-neutral-400" />
              </button>
            </div>
            {notifications.length === 0 ? (
              <div className="text-center py-8 px-4">
                <Bell className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
                <p className="text-sm text-neutral-400">No notifications yet</p>
              </div>
            ) : (
              <div className="space-y-2 p-2">
                {notifications.map((notif) => (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      notif.read
                        ? 'bg-neutral-950 border-neutral-900'
                        : 'bg-[#C9A227]/10 border-[#C9A227]/30 hover:border-[#C9A227]/50'
                    }`}
                    onClick={() => !notif.read && markNotificationAsRead(notif.id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className={`font-sans text-sm font-semibold ${notif.read ? 'text-neutral-400' : 'text-white'}`}>
                          {notif.title}
                        </p>
                        <p className="text-xs text-neutral-500 mt-1">{notif.message}</p>
                        <p className="text-[10px] text-neutral-600 mt-1">{new Date(notif.date).toLocaleDateString()}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notif.id);
                        }}
                        className="p-1 hover:bg-red-900/20 rounded transition-colors"
                      >
                        <X className="w-3 h-3 text-neutral-400" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrderForDetail && (
          <motion.div
            key="order-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedOrderForDetail(null)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-neutral-950 border border-neutral-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-gradient-to-r from-neutral-950 to-black border-b border-neutral-900 p-6 flex items-center justify-between">
                <div>
                  <p className="font-mono text-xs text-neutral-500 tracking-wider uppercase mb-1">Order Details</p>
                  <h3 className="font-sans text-2xl font-black text-white">#{selectedOrderForDetail.id.slice(0, 8).toUpperCase()}</h3>
                </div>
                <button
                  onClick={() => setSelectedOrderForDetail(null)}
                  className="p-2 hover:bg-neutral-900 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-neutral-400" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Order Status */}
                <div>
                  <p className="font-mono text-xs text-neutral-500 tracking-wider uppercase mb-3">Status</p>
                  <div className="flex items-center gap-4">
                    <span className={`px-4 py-2 rounded-lg font-mono text-sm font-semibold tracking-wider uppercase border ${
                      selectedOrderForDetail.status === 'DELIVERED' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' :
                      selectedOrderForDetail.status === 'SHIPPED' ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' :
                      selectedOrderForDetail.status === 'PROCESSING' ? 'text-blue-400 bg-blue-500/10 border-blue-500/30' :
                      'text-amber-400 bg-amber-500/10 border-amber-500/30'
                    }`}>
                      {selectedOrderForDetail.status || 'PENDING'}
                    </span>
                    <p className="text-neutral-500 text-sm">{new Date(selectedOrderForDetail.createdAt?.toDate?.() || Date.now()).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Order Items */}
                {selectedOrderForDetail.items && selectedOrderForDetail.items.length > 0 && (
                  <div>
                    <p className="font-mono text-xs text-neutral-500 tracking-wider uppercase mb-4">Items</p>
                    <div className="space-y-3">
                      {selectedOrderForDetail.items.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-neutral-900/50 rounded-lg border border-neutral-800">
                          <div className="flex-1">
                            <p className="font-sans font-semibold text-white mb-1">{item.name}</p>
                            <p className="text-xs text-neutral-500">Qty: {item.quantity}</p>
                          </div>
                          <p className="font-sans font-bold text-[#C9A227]">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Order Summary */}
                <div className="border-t border-neutral-900 pt-6">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-400">Subtotal:</span>
                      <span className="text-white font-semibold">${(selectedOrderForDetail.subtotal || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-400">Shipping:</span>
                      <span className="text-white font-semibold">${(selectedOrderForDetail.shipping || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-400">Tax:</span>
                      <span className="text-white font-semibold">${(selectedOrderForDetail.tax || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg border-t border-neutral-900 pt-3">
                      <span className="font-semibold text-white">Total:</span>
                      <span className="font-bold text-[#C9A227]">${(selectedOrderForDetail.totalPrice || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Shipping Info */}
                {selectedOrderForDetail.shippingAddress && (
                  <div>
                    <p className="font-mono text-xs text-neutral-500 tracking-wider uppercase mb-3">Shipping Address</p>
                    <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-4">
                      <p className="font-sans font-semibold text-white mb-1">{selectedOrderForDetail.shippingAddress.name}</p>
                      <p className="text-sm text-neutral-400 mb-1">{selectedOrderForDetail.shippingAddress.address}</p>
                      <p className="text-sm text-neutral-400">{selectedOrderForDetail.shippingAddress.city}, {selectedOrderForDetail.shippingAddress.state} {selectedOrderForDetail.shippingAddress.zip}</p>
                    </div>
                  </div>
                )}

                {/* Order Tracking Timeline */}
                {selectedOrderForDetail.status && (
                  <div>
                    <p className="font-mono text-xs text-neutral-500 tracking-wider uppercase mb-4">Tracking Timeline</p>
                    <div className="space-y-3">
                      {[
                        { status: 'PENDING', label: 'Order Placed', icon: Clock },
                        { status: 'PROCESSING', label: 'Processing', icon: Clock },
                        { status: 'SHIPPED', label: 'Shipped', icon: Truck },
                        { status: 'DELIVERED', label: 'Delivered', icon: Check }
                      ].map((step, idx) => {
                        const isCompleted = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'].indexOf(step.status) <= ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'].indexOf(selectedOrderForDetail.status);
                        const StepIcon = step.icon;
                        return (
                          <div key={idx} className="flex gap-4">
                            <div className="flex flex-col items-center">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isCompleted ? 'bg-emerald-500 text-black' : 'bg-neutral-800 text-neutral-500'}`}>
                                <StepIcon className="w-4 h-4" />
                              </div>
                              {idx < 3 && <div className={`w-0.5 h-8 ${isCompleted ? 'bg-emerald-500' : 'bg-neutral-800'}`} />}
                            </div>
                            <div className="pt-1">
                              <p className={`font-sans font-semibold ${isCompleted ? 'text-white' : 'text-neutral-500'}`}>{step.label}</p>
                              {isCompleted && <p className="text-xs text-neutral-400">{new Date().toLocaleDateString()}</p>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-4 border-t border-neutral-900">
                  <button
                    onClick={() => setSelectedOrderForDetail(null)}
                    className="py-2.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-white rounded-lg font-mono text-xs font-semibold tracking-wider uppercase cursor-pointer transition-colors"
                  >
                    CLOSE
                  </button>
                  <button
                    onClick={generateInvoicePDF}
                    className="py-2.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-[#C9A227] rounded-lg font-mono text-xs font-semibold tracking-wider uppercase cursor-pointer transition-colors flex items-center justify-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    PDF
                  </button>
                  <button
                    onClick={() => setShowRequestForm('return')}
                    className="py-2.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-amber-400 rounded-lg font-mono text-xs font-semibold tracking-wider uppercase cursor-pointer transition-colors"
                  >
                    RETURN
                  </button>
                  <button
                    onClick={() => setShowRequestForm('refund')}
                    className="py-2.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-rose-400 rounded-lg font-mono text-xs font-semibold tracking-wider uppercase cursor-pointer transition-colors"
                  >
                    REFUND
                  </button>
                </div>

                {/* Request Form */}
                {showRequestForm && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-neutral-900/50 border border-amber-500/30 rounded-lg p-4 space-y-3"
                  >
                    <p className="font-mono text-xs text-amber-400 tracking-wider uppercase">Submit {showRequestForm.toUpperCase()} Request</p>
                    <textarea
                      placeholder="Please explain your reason..."
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white text-sm placeholder-neutral-600 focus:border-amber-500 focus:outline-none"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowRequestForm(null)}
                        className="flex-1 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-white rounded-lg font-mono text-xs font-semibold tracking-wider uppercase cursor-pointer transition-colors"
                      >
                        CANCEL
                      </button>
                      <button
                        onClick={async () => {
                          const reason = (event?.target as any)?.parentElement?.querySelector('textarea')?.value || '';
                          await submitRequest(showRequestForm, reason);
                        }}
                        className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-black rounded-lg font-mono text-xs font-semibold tracking-wider uppercase cursor-pointer transition-colors"
                      >
                        SUBMIT
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
