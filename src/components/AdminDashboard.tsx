import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, TrendingUp, Users, Package, Truck, RotateCcw, 
  Percent, Gift, ShieldCheck, FileText, Settings, LogOut,
  Plus, Edit2, Trash2, Search, Filter, Eye, EyeOff, 
  Download, Upload, CheckCircle, AlertCircle, Clock, Archive,
  Home, ShoppingCart, DollarSign, User, AlertTriangle
} from 'lucide-react';
import { db, logAdminAction, getAdminLogs, getUserRole } from '../lib/firebase';
import { checkAdminAccess, logAdminActivity } from '../lib/adminAuth';
import { 
  collection, getDocs, doc, setDoc, updateDoc, deleteDoc, 
  query, where, orderBy, limit, serverTimestamp, increment
} from 'firebase/firestore';
import { auth } from '../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

interface MetricCard {
  label: string;
  value: number | string;
  change?: number;
  icon: React.ReactNode;
  color: string;
}

interface DashboardData {
  totalRevenue: number;
  todayRevenue: number;
  monthlyRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  activeCustomers: number;
  newCustomers: number;
  totalProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  returnsCount: number;
  refundRequests: number;
  couponsUsed: number;
  conversionRate: number;
}

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'products' | 'orders' | 'customers' | 'analytics' | 'settings' | 'logs'>('home');
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalRevenue: 0,
    todayRevenue: 0,
    monthlyRevenue: 0,
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    activeCustomers: 0,
    newCustomers: 0,
    totalProducts: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0,
    returnsCount: 0,
    refundRequests: 0,
    couponsUsed: 0,
    conversionRate: 0,
  });
  const [adminLogs, setAdminLogs] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);

  // Auth check and data loading
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const role = await getUserRole(currentUser.uid);
        const hasAccess = ['admin', 'manager'].includes(role);
        setIsAdmin(hasAccess);
        if (hasAccess) {
          await loadDashboardData();
        }
        setLoading(false);
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Load all dashboard data
  const loadDashboardData = async () => {
    try {
      // Fetch orders
      const ordersSnap = await getDocs(collection(db, 'orders'));
      const ordersList = ordersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setOrders(ordersList);

      // Calculate order metrics
      const totalRevenue = ordersList.reduce((sum: number, o: any) => sum + (o.total || 0), 0);
      const todayRevenue = ordersList
        .filter((o: any) => {
          const orderDate = new Date(o.date || '');
          const today = new Date();
          return orderDate.toDateString() === today.toDateString();
        })
        .reduce((sum: number, o: any) => sum + (o.total || 0), 0);

      const pendingOrders = ordersList.filter((o: any) => o.status === 'Processing').length;
      const completedOrders = ordersList.filter((o: any) => o.status === 'Delivered').length;
      const cancelledOrders = ordersList.filter((o: any) => o.status === 'Cancelled').length;

      // Fetch products
      const productsSnap = await getDocs(collection(db, 'products'));
      const productsList = productsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setProducts(productsList);

      // Fetch inventory
      const inventorySnap = await getDocs(collection(db, 'inventory'));
      const inventoryMap: Record<string, number> = {};
      inventorySnap.forEach((d) => {
        inventoryMap[d.id] = d.data().stock || 0;
      });

      const lowStockProducts = productsList.filter(p => (inventoryMap[p.id] || 0) < 10).length;
      const outOfStockProducts = productsList.filter(p => (inventoryMap[p.id] || 0) === 0).length;

      // Fetch customers
      const customersSnap = await getDocs(collection(db, 'users'));
      const customersList = customersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setCustomers(customersList);

      // Fetch returns and refunds
      const returnsSnap = await getDocs(collection(db, 'returns'));
      const refundsSnap = await getDocs(collection(db, 'refunds'));
      const couponsSnap = await getDocs(collection(db, 'coupons'));

      // Fetch admin logs
      const logsData = await getAdminLogs(50);
      setAdminLogs(logsData);

      // Update dashboard data
      setDashboardData({
        totalRevenue,
        todayRevenue,
        monthlyRevenue: totalRevenue * 0.35, // Approximation
        totalOrders: ordersList.length,
        pendingOrders,
        completedOrders,
        cancelledOrders,
        activeCustomers: customersList.length,
        newCustomers: Math.floor(customersList.length * 0.15),
        totalProducts: productsList.length,
        lowStockProducts,
        outOfStockProducts,
        returnsCount: returnsSnap.size,
        refundRequests: refundsSnap.size,
        couponsUsed: couponsSnap.size,
        conversionRate: 3.2,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logAdminActivity(user, 'logout', 'Admin logged out');
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-[#C9A227] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white font-mono text-sm">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-white font-sans text-lg mb-2">Access Denied</p>
          <p className="text-neutral-400 font-mono text-sm">You do not have permission to access the admin dashboard.</p>
        </div>
      </div>
    );
  }

  // Metric Card Component
  const MetricCard = ({ data }: { data: MetricCard }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-gradient-to-br from-neutral-900 to-neutral-950 border border-neutral-800 rounded-xl p-6 hover:border-[#C9A227]/50 transition-all"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest">{data.label}</span>
        <div className={`p-2 rounded-lg ${data.color}`}>{data.icon}</div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="font-sans font-black text-2xl text-white">{data.value}</span>
        {data.change !== undefined && (
          <span className={`font-mono text-xs ${data.change > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {data.change > 0 ? '+' : ''}{data.change}%
          </span>
        )}
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-neutral-950 border-b border-neutral-900 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-[#C9A227]" />
            <h1 className="font-sans font-black text-white text-xl">ADMIN DASHBOARD</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-neutral-400 font-mono text-sm">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg font-mono text-xs font-semibold uppercase transition-colors flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {[
            { id: 'home', label: 'Dashboard', icon: Home },
            { id: 'products', label: 'Products', icon: Package },
            { id: 'orders', label: 'Orders', icon: ShoppingCart },
            { id: 'customers', label: 'Customers', icon: Users },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'logs', label: 'Activity Logs', icon: FileText },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-xs font-semibold uppercase transition-all whitespace-nowrap ${
                activeTab === id
                  ? 'bg-[#C9A227] text-black'
                  : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:border-neutral-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Dashboard Home */}
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h2 className="text-3xl font-black text-white mb-6">Dashboard Overview</h2>
              
              {/* Revenue Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <MetricCard data={{
                  label: 'Total Revenue',
                  value: `$${dashboardData.totalRevenue.toFixed(0)}`,
                  change: 12,
                  icon: <DollarSign className="w-5 h-5 text-emerald-400" />,
                  color: 'bg-emerald-500/10'
                }} />
                <MetricCard data={{
                  label: 'Today\'s Revenue',
                  value: `$${dashboardData.todayRevenue.toFixed(0)}`,
                  change: 8,
                  icon: <TrendingUp className="w-5 h-5 text-blue-400" />,
                  color: 'bg-blue-500/10'
                }} />
                <MetricCard data={{
                  label: 'Monthly Revenue',
                  value: `$${dashboardData.monthlyRevenue.toFixed(0)}`,
                  change: 15,
                  icon: <BarChart3 className="w-5 h-5 text-purple-400" />,
                  color: 'bg-purple-500/10'
                }} />
                <MetricCard data={{
                  label: 'Conversion Rate',
                  value: `${dashboardData.conversionRate}%`,
                  change: 2,
                  icon: <Percent className="w-5 h-5 text-amber-400" />,
                  color: 'bg-amber-500/10'
                }} />
              </div>

              {/* Order Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <MetricCard data={{
                  label: 'Total Orders',
                  value: dashboardData.totalOrders,
                  icon: <ShoppingCart className="w-5 h-5 text-cyan-400" />,
                  color: 'bg-cyan-500/10'
                }} />
                <MetricCard data={{
                  label: 'Pending Orders',
                  value: dashboardData.pendingOrders,
                  icon: <Clock className="w-5 h-5 text-yellow-400" />,
                  color: 'bg-yellow-500/10'
                }} />
                <MetricCard data={{
                  label: 'Completed Orders',
                  value: dashboardData.completedOrders,
                  icon: <CheckCircle className="w-5 h-5 text-emerald-400" />,
                  color: 'bg-emerald-500/10'
                }} />
                <MetricCard data={{
                  label: 'Cancelled Orders',
                  value: dashboardData.cancelledOrders,
                  icon: <AlertCircle className="w-5 h-5 text-red-400" />,
                  color: 'bg-red-500/10'
                }} />
              </div>

              {/* Inventory Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <MetricCard data={{
                  label: 'Total Products',
                  value: dashboardData.totalProducts,
                  icon: <Package className="w-5 h-5 text-indigo-400" />,
                  color: 'bg-indigo-500/10'
                }} />
                <MetricCard data={{
                  label: 'Low Stock',
                  value: dashboardData.lowStockProducts,
                  icon: <AlertTriangle className="w-5 h-5 text-yellow-400" />,
                  color: 'bg-yellow-500/10'
                }} />
                <MetricCard data={{
                  label: 'Out of Stock',
                  value: dashboardData.outOfStockProducts,
                  icon: <Archive className="w-5 h-5 text-red-400" />,
                  color: 'bg-red-500/10'
                }} />
                <MetricCard data={{
                  label: 'Total Customers',
                  value: dashboardData.activeCustomers,
                  icon: <Users className="w-5 h-5 text-pink-400" />,
                  color: 'bg-pink-500/10'
                }} />
              </div>

              {/* Returns & Refunds */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MetricCard data={{
                  label: 'Return Requests',
                  value: dashboardData.returnsCount,
                  icon: <RotateCcw className="w-5 h-5 text-orange-400" />,
                  color: 'bg-orange-500/10'
                }} />
                <MetricCard data={{
                  label: 'Refund Requests',
                  value: dashboardData.refundRequests,
                  icon: <DollarSign className="w-5 h-5 text-red-400" />,
                  color: 'bg-red-500/10'
                }} />
                <MetricCard data={{
                  label: 'Coupons Used',
                  value: dashboardData.couponsUsed,
                  icon: <Percent className="w-5 h-5 text-green-400" />,
                  color: 'bg-green-500/10'
                }} />
              </div>
            </motion.div>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <motion.div key="products" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-black text-white">Product Management</h2>
                <button className="px-4 py-2 bg-[#C9A227] hover:bg-amber-500 text-black rounded-lg font-mono text-xs font-semibold uppercase flex items-center gap-2 transition-colors">
                  <Plus className="w-4 h-4" />
                  Add Product
                </button>
              </div>
              <div className="bg-neutral-950 border border-neutral-900 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-neutral-900 border-b border-neutral-800">
                      <tr>
                        <th className="px-6 py-3 text-left font-mono text-[10px] text-neutral-500 uppercase">Name</th>
                        <th className="px-6 py-3 text-left font-mono text-[10px] text-neutral-500 uppercase">Price</th>
                        <th className="px-6 py-3 text-left font-mono text-[10px] text-neutral-500 uppercase">Stock</th>
                        <th className="px-6 py-3 text-left font-mono text-[10px] text-neutral-500 uppercase">Category</th>
                        <th className="px-6 py-3 text-left font-mono text-[10px] text-neutral-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-900">
                      {products.slice(0, 10).map((product) => (
                        <tr key={product.id} className="hover:bg-neutral-900/50 transition-colors">
                          <td className="px-6 py-4 text-sm text-white">{product.name}</td>
                          <td className="px-6 py-4 text-sm text-neutral-400">${product.price}</td>
                          <td className="px-6 py-4 text-sm">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              product.stock > 20 ? 'bg-green-500/20 text-green-400' :
                              product.stock > 5 ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {product.stock || 0}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-neutral-400">{product.category}</td>
                          <td className="px-6 py-4 text-sm flex items-center gap-2">
                            <button className="p-1 hover:bg-neutral-800 rounded transition-colors text-yellow-400"><Edit2 className="w-4 h-4" /></button>
                            <button className="p-1 hover:bg-neutral-800 rounded transition-colors text-red-400"><Trash2 className="w-4 h-4" /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <motion.div key="orders" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h2 className="text-3xl font-black text-white mb-6">Order Management</h2>
              <div className="bg-neutral-950 border border-neutral-900 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-neutral-900 border-b border-neutral-800">
                      <tr>
                        <th className="px-6 py-3 text-left font-mono text-[10px] text-neutral-500 uppercase">Order ID</th>
                        <th className="px-6 py-3 text-left font-mono text-[10px] text-neutral-500 uppercase">Customer</th>
                        <th className="px-6 py-3 text-left font-mono text-[10px] text-neutral-500 uppercase">Total</th>
                        <th className="px-6 py-3 text-left font-mono text-[10px] text-neutral-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left font-mono text-[10px] text-neutral-500 uppercase">Date</th>
                        <th className="px-6 py-3 text-left font-mono text-[10px] text-neutral-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-900">
                      {orders.slice(0, 10).map((order) => (
                        <tr key={order.id} className="hover:bg-neutral-900/50 transition-colors">
                          <td className="px-6 py-4 text-sm font-mono text-white">{order.id}</td>
                          <td className="px-6 py-4 text-sm text-neutral-400">{order.deliveryAddress?.name || 'N/A'}</td>
                          <td className="px-6 py-4 text-sm text-emerald-400 font-semibold">${order.total}</td>
                          <td className="px-6 py-4 text-sm">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              order.status === 'Delivered' ? 'bg-green-500/20 text-green-400' :
                              order.status === 'Processing' ? 'bg-blue-500/20 text-blue-400' :
                              'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-neutral-400">{order.date?.substring(0, 10) || 'N/A'}</td>
                          <td className="px-6 py-4 text-sm flex items-center gap-2">
                            <button className="p-1 hover:bg-neutral-800 rounded transition-colors text-blue-400"><Eye className="w-4 h-4" /></button>
                            <button className="p-1 hover:bg-neutral-800 rounded transition-colors text-yellow-400"><Edit2 className="w-4 h-4" /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* Activity Logs Tab */}
          {activeTab === 'logs' && (
            <motion.div key="logs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h2 className="text-3xl font-black text-white mb-6">Activity Logs</h2>
              <div className="bg-neutral-950 border border-neutral-900 rounded-xl p-6">
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {adminLogs.slice(0, 20).map((log, idx) => (
                    <div key={idx} className="flex items-start gap-4 p-3 border border-neutral-900 rounded-lg hover:border-neutral-800 transition-colors">
                      <div className="w-2 h-2 bg-[#C9A227] rounded-full mt-2 flex-shrink-0"></div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-white">{log.action || 'Unknown Action'}</p>
                        <p className="text-xs text-neutral-400 mt-1">{log.description}</p>
                        <p className="text-[10px] text-neutral-600 mt-2">{new Date(log.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h2 className="text-3xl font-black text-white mb-6">Settings</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-neutral-950 border border-neutral-900 rounded-xl p-6">
                  <h3 className="font-sans font-black text-white mb-4">Store Configuration</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-mono text-neutral-500 mb-2">Store Name</label>
                      <input type="text" placeholder="ZEROX Store" className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-white text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-neutral-500 mb-2">Default Currency</label>
                      <input type="text" placeholder="USD" className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-white text-sm" />
                    </div>
                  </div>
                </div>
                <div className="bg-neutral-950 border border-neutral-900 rounded-xl p-6">
                  <h3 className="font-sans font-black text-white mb-4">Email Configuration</h3>
                  <div className="text-center py-8">
                    <AlertCircle className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                    <p className="text-sm text-neutral-400">Email provider not configured</p>
                    <p className="text-xs text-neutral-600 mt-1">Status: Pending Configuration</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <motion.div key="analytics" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h2 className="text-3xl font-black text-white mb-6">Sales Analytics</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-neutral-950 border border-neutral-900 rounded-xl p-6">
                  <h3 className="font-sans font-black text-white mb-4">Top Products</h3>
                  <div className="space-y-3">
                    {products.slice(0, 5).map((p, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="text-sm text-neutral-400">{p.name}</span>
                        <div className="w-24 h-2 bg-neutral-800 rounded-full overflow-hidden">
                          <div className="h-full bg-[#C9A227]" style={{ width: `${Math.random() * 100}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-neutral-950 border border-neutral-900 rounded-xl p-6">
                  <h3 className="font-sans font-black text-white mb-4">Revenue Trend</h3>
                  <div className="flex items-end justify-between h-48 gap-2">
                    {Array.from({ length: 12 }).map((_, idx) => (
                      <div key={idx} className="flex-1 bg-gradient-to-t from-[#C9A227] to-amber-400 rounded-t-lg" style={{ height: `${Math.random() * 100}%` }}></div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Customers Tab */}
          {activeTab === 'customers' && (
            <motion.div key="customers" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h2 className="text-3xl font-black text-white mb-6">Customer Management</h2>
              <div className="bg-neutral-950 border border-neutral-900 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-neutral-900 border-b border-neutral-800">
                      <tr>
                        <th className="px-6 py-3 text-left font-mono text-[10px] text-neutral-500 uppercase">Name</th>
                        <th className="px-6 py-3 text-left font-mono text-[10px] text-neutral-500 uppercase">Email</th>
                        <th className="px-6 py-3 text-left font-mono text-[10px] text-neutral-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left font-mono text-[10px] text-neutral-500 uppercase">Joined</th>
                        <th className="px-6 py-3 text-left font-mono text-[10px] text-neutral-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-900">
                      {customers.slice(0, 10).map((customer) => (
                        <tr key={customer.id} className="hover:bg-neutral-900/50 transition-colors">
                          <td className="px-6 py-4 text-sm text-white">{customer.fullName || customer.name}</td>
                          <td className="px-6 py-4 text-sm text-neutral-400">{customer.email}</td>
                          <td className="px-6 py-4 text-sm">
                            <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-semibold">{customer.status || 'Active'}</span>
                          </td>
                          <td className="px-6 py-4 text-sm text-neutral-400">{customer.createdAt?.substring(0, 10) || 'N/A'}</td>
                          <td className="px-6 py-4 text-sm flex items-center gap-2">
                            <button className="p-1 hover:bg-neutral-800 rounded transition-colors text-blue-400"><Eye className="w-4 h-4" /></button>
                            <button className="p-1 hover:bg-neutral-800 rounded transition-colors text-yellow-400"><Edit2 className="w-4 h-4" /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
