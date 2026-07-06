import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User, LogOut, Heart, Package, Settings, CreditCard, Bell, Lock, ChevronRight,
  MapPin, Mail, Phone, Edit2, Save, X, ShieldCheck, Award, TrendingUp
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { UserProfile } from '../types';
import { db } from '../lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

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
  
  const [orders, setOrders] = useState<any[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [editingProfile, setEditingProfile] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState<any | null>(null);

  // Profile edit states
  const [editName, setEditName] = useState(displayUser?.displayName || '');
  const [editPhone, setEditPhone] = useState('+1 (000) 000-0000');

  useEffect(() => {
    if (loggedIn) {
      loadWishlist();
      // Try to fetch orders if auth context is available
      if (authContext.user?.uid) {
        fetchOrders();
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
    }
  };

  const loadWishlist = () => {
    const saved = localStorage.getItem('zerox_wishlist');
    setWishlist(saved ? JSON.parse(saved) : []);
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
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="px-6 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl font-mono text-sm font-semibold tracking-wider uppercase transition-all cursor-pointer disabled:opacity-50"
            >
              <LogOut className="w-4 h-4 inline mr-2" />
              {isLoggingOut ? 'LOGGING OUT...' : 'LOGOUT'}
            </button>
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
                          setEditName(user.displayName || '');
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
                        <p className="font-sans text-lg font-semibold">{user.displayName || 'Not set'}</p>
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
                  <button className="px-4 py-2 bg-[#C9A227] hover:bg-amber-500 text-black rounded-lg font-mono text-xs font-semibold tracking-wider uppercase cursor-pointer transition-colors">
                    ADD ADDRESS
                  </button>
                </div>
                <div className="text-center py-16">
                  <MapPin className="w-12 h-12 text-neutral-700 mx-auto mb-4" />
                  <p className="font-mono text-sm text-neutral-400 mb-2">NO ADDRESSES YET</p>
                  <p className="font-sans text-neutral-500">Add a shipping address for faster checkout</p>
                </div>
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
                  <p className="text-neutral-400">{wishlist.length} items saved</p>
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
                className="max-w-2xl"
              >
                <h2 className="text-2xl font-black mb-8">Account Settings</h2>
                <div className="space-y-4">
                  {[
                    { icon: Bell, label: 'Notifications', desc: 'Manage email and push notifications' },
                    { icon: CreditCard, label: 'Payment Methods', desc: 'Add or remove payment options' },
                    { icon: TrendingUp, label: 'Preferences', desc: 'Personalize your experience' },
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
                className="max-w-2xl"
              >
                <h2 className="text-2xl font-black mb-8">Security & Privacy</h2>
                <div className="space-y-6">
                  <div className="bg-neutral-950/50 border border-neutral-900 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="font-sans font-semibold text-white mb-1">Change Password</p>
                        <p className="text-xs text-neutral-500">Update your account password regularly</p>
                      </div>
                      <button className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-white rounded-lg font-mono text-xs font-semibold tracking-wider uppercase cursor-pointer transition-colors">
                        CHANGE
                      </button>
                    </div>
                  </div>
                  <div className="bg-neutral-950/50 border border-neutral-900 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="font-sans font-semibold text-white mb-1">Two-Factor Authentication</p>
                        <p className="text-xs text-neutral-500">Add an extra layer of security</p>
                      </div>
                      <button className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-white rounded-lg font-mono text-xs font-semibold tracking-wider uppercase cursor-pointer transition-colors">
                        ENABLE
                      </button>
                    </div>
                  </div>
                  <div className="bg-neutral-950/50 border border-neutral-900 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="font-sans font-semibold text-white mb-1">Login Activity</p>
                        <p className="text-xs text-neutral-500">View your recent login history</p>
                      </div>
                      <button className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-white rounded-lg font-mono text-xs font-semibold tracking-wider uppercase cursor-pointer transition-colors">
                        VIEW
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
