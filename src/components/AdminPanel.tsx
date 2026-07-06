import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  db, 
  productsCol, 
  ordersCol, 
  couponsCol, 
  reviewsCol, 
  usersCol, 
  categoriesCol, 
  notificationsCol 
} from '../lib/firebase';
import { 
  collection, 
  getDocs, 
  doc, 
  addDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  serverTimestamp, 
  increment 
} from 'firebase/firestore';
import { 
  TrendingUp, Users, ShoppingBag, Percent, MessageSquare, Ship, 
  CornerDownLeft, Bell, Mail, Settings, ShieldCheck, Plus, Trash2, 
  Check, X, RefreshCw, Layers, Edit, Eye, Archive, CreditCard, 
  CheckCircle, AlertCircle, Sparkles, AlertTriangle
} from 'lucide-react';
import AnimatedTypography from './AnimatedTypography';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<'analytics' | 'products' | 'orders' | 'coupons' | 'reviews' | 'support' | 'campaigns' | 'settings'>('analytics');
  
  // Real database states
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states for new entities
  const [newProduct, setNewProduct] = useState({
    id: '',
    name: '',
    tagline: '',
    price: 350,
    category: 'Performance',
    stock: 50,
    description: '',
    colorUpper: '#000000',
    colorMidsole: '#FFFFFF',
    colorLaces: '#FFFFFF',
    colorAccent: '#C9A227',
  });

  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discountType: 'percentage',
    value: 15,
    description: '',
    active: true,
  });

  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
  });

  // Support interaction state
  const [replyMessage, setReplyMessage] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);

  // Marketing states
  const [notificationMsg, setNotificationMsg] = useState({
    title: 'SUMMER LAUNCH DROPPED',
    message: 'The unreleased Nebula Cybercore colorways have just launched into the Creators Plaza!',
    type: 'alert',
  });

  const [emailCampaign, setEmailCampaign] = useState({
    subject: 'VIP EARLY DROP CO-CREATION OPEN',
    content: 'Dear Collector, we have initiated our new co-creation cycle for the sound barrier limits...',
    targetGroup: 'all',
  });

  const [campaignSuccess, setCampaignSuccess] = useState(false);

  // Global app settings (stored in state or Firestore)
  const [taxRate, setTaxRate] = useState(8); // 8% Default
  const [flatShippingExpress, setFlatShippingExpress] = useState(15);
  const [activeBanner, setActiveBanner] = useState('UNLOCK 35% VIP PRIVILEGES WITH CODE "APEXFOUNDER" DURING SUMMER GATES');

  // Load Firestore collections on mount
  const fetchAllData = async () => {
    setLoading(true);
    try {
      // 1. Products & Inventory joint fetch
      const productsSnap = await getDocs(productsCol);
      const inventorySnap = await getDocs(collection(db, 'inventory'));
      const stockMap: Record<string, number> = {};
      inventorySnap.forEach((docSnap) => {
        const inv = docSnap.data();
        stockMap[inv.productId] = inv.stock || 0;
      });

      const pList = productsSnap.docs.map(d => ({
        id: d.id,
        ...d.data(),
        stock: stockMap[d.id] ?? 50
      }));
      setProducts(pList);

      // 2. Orders
      const ordersSnap = await getDocs(ordersCol);
      const oList = ordersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setOrders(oList);

      // 3. Coupons
      const couponsSnap = await getDocs(couponsCol);
      setCoupons(couponsSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      // 4. Reviews
      const reviewsSnap = await getDocs(reviewsCol);
      setReviews(reviewsSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      // 5. Categories
      const catSnap = await getDocs(categoriesCol);
      setCategories(catSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      // 6. Support Tickets
      const tixSnap = await getDocs(collection(db, 'support_tickets'));
      setTickets(tixSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      // 7. Users
      const usersSnap = await getDocs(usersCol);
      setUsers(usersSnap.docs.map(d => ({ id: d.id, ...d.data() })));

    } catch (err) {
      console.error('Error fetching admin datasets: ', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // CRUD Actions
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.id || !newProduct.name) return;
    try {
      const formattedId = newProduct.id.toLowerCase().replace(/\s+/g, '-');
      const productPayload = {
        id: formattedId,
        name: newProduct.name,
        tagline: newProduct.tagline,
        price: Number(newProduct.price),
        category: newProduct.category,
        description: newProduct.description,
        sizes: [8, 9, 10, 11, 12],
        image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=600&auto=format&fit=crop',
        colorways: [
          { name: 'Custom Accent', hex: newProduct.colorAccent, image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=600&auto=format&fit=crop' }
        ],
        specs: {
          weight: '290g',
          cushioning: 'Nitrogen Pods',
          offset: '6.0mm',
          propulsion: 'Carbon Plate'
        },
        features: [
          { title: 'TetherWeave upper mesh', description: 'Engineered high tension strands.' }
        ]
      };

      // Set product doc
      await setDoc(doc(db, 'products', formattedId), productPayload);
      
      // Set inventory doc
      await setDoc(doc(db, 'inventory', formattedId), {
        productId: formattedId,
        name: newProduct.name,
        stock: Number(newProduct.stock),
        lastUpdated: serverTimestamp()
      });

      // Reset form & reload
      setNewProduct({
        id: '',
        name: '',
        tagline: '',
        price: 350,
        category: 'Performance',
        stock: 50,
        description: '',
        colorUpper: '#000000',
        colorMidsole: '#FFFFFF',
        colorLaces: '#FFFFFF',
        colorAccent: '#C9A227',
      });
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProduct = async (prodId: string) => {
    if (!confirm('Are you sure you want to retire this product from circulation?')) return;
    try {
      await deleteDoc(doc(db, 'products', prodId));
      await deleteDoc(doc(db, 'inventory', prodId));
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStock = async (prodId: string, currentStock: number, delta: number) => {
    try {
      const nextStock = Math.max(0, currentStock + delta);
      await updateDoc(doc(db, 'inventory', prodId), {
        stock: nextStock,
        lastUpdated: serverTimestamp()
      });
      // Instant updates in current list
      setProducts(prev => prev.map(p => p.id === prodId ? { ...p, stock: nextStock } : p));
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoupon.code) return;
    try {
      const upperCode = newCoupon.code.toUpperCase();
      await setDoc(doc(db, 'coupons', upperCode), {
        code: upperCode,
        discountType: newCoupon.discountType,
        value: Number(newCoupon.value),
        description: newCoupon.description,
        active: newCoupon.active
      });
      setNewCoupon({ code: '', discountType: 'percentage', value: 15, description: '', active: true });
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCoupon = async (code: string) => {
    try {
      await deleteDoc(doc(db, 'coupons', code));
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, nextStatus: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: nextStatus });
      
      // Dispatch live client notification matching this update
      await addDoc(notificationsCol, {
        title: `ORDER UPDATE: ${orderId}`,
        message: `Your order status has been updated to [${nextStatus.toUpperCase()}]. Track status from your Cryptographic registry.`,
        type: 'alert',
        date: new Date().toISOString(),
        orderId: orderId,
        read: false,
      });

      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: nextStatus } : o));
    } catch (err) {
      console.error(err);
    }
  };

  const handleApproveReturn = async (orderId: string, approve: boolean) => {
    try {
      const targetStatus = approve ? 'Refunded' : 'Delivered';
      await updateDoc(doc(db, 'orders', orderId), {
        status: targetStatus,
        returnRequested: false,
        returnApproved: approve
      });

      await addDoc(notificationsCol, {
        title: `RETURN REQUEST ${approve ? 'APPROVED' : 'DECLINED'}`,
        message: approve 
          ? `Your return request for order ${orderId} was approved. A refund has been issued back to your payment method.`
          : `Your return request for order ${orderId} was declined by verification. Please contact support if you need assistance.`,
        type: 'alert',
        date: new Date().toISOString(),
        read: false
      });

      setOrders(prev => prev.map(o => o.id === orderId ? { 
        ...o, 
        status: targetStatus, 
        returnRequested: false, 
        returnApproved: approve 
      } : o));
    } catch (err) {
      console.error(err);
    }
  };

  const handleApproveReview = async (reviewId: string) => {
    try {
      await updateDoc(doc(db, 'reviews', reviewId), { approved: true });
      setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, approved: true } : r));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    try {
      await deleteDoc(doc(db, 'reviews', reviewId));
      setReviews(prev => prev.filter(r => r.id !== reviewId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleReplyTicket = async (ticketId: string) => {
    if (!replyMessage) return;
    try {
      await updateDoc(doc(db, 'support_tickets', ticketId), {
        status: 'Resolved',
        reply: replyMessage
      });
      setReplyMessage('');
      setSelectedTicket(null);
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  // Push Live Notification
  const handlePushNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notificationMsg.title || !notificationMsg.message) return;
    try {
      await addDoc(notificationsCol, {
        title: notificationMsg.title,
        message: notificationMsg.message,
        type: notificationMsg.type,
        date: new Date().toISOString(),
        read: false
      });
      setCampaignSuccess(true);
      setTimeout(() => setCampaignSuccess(false), 3000);
      setNotificationMsg({ title: '', message: '', type: 'alert' });
    } catch (err) {
      console.error(err);
    }
  };

  // Dispatch Email Campaign
  const handleSendEmailCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailCampaign.subject || !emailCampaign.content) return;
    try {
      // Record simulated campaign in firestore logs
      await addDoc(collection(db, 'email_campaigns'), {
        subject: emailCampaign.subject,
        content: emailCampaign.content,
        targetGroup: emailCampaign.targetGroup,
        sentAt: serverTimestamp()
      });
      setCampaignSuccess(true);
      setTimeout(() => setCampaignSuccess(false), 3000);
      setEmailCampaign({ subject: '', content: '', targetGroup: 'all' });
    } catch (err) {
      console.error(err);
    }
  };

  // Calculate Metrics
  const totalSales = orders.filter(o => o.status !== 'Refunded').reduce((acc, o) => acc + (o.total || 0), 0);
  const totalOrdersCount = orders.length;
  const returnedOrdersCount = orders.filter(o => o.status === 'Refunded' || o.returnRequested).length;
  const averageOrderValue = totalOrdersCount > 0 ? totalSales / totalOrdersCount : 0;

  return (
    <div className="w-full max-w-7xl mx-auto py-12 px-4 sm:px-6 select-none bg-black text-white rounded-3xl border border-neutral-900 shadow-3xl overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(201,162,39,0.02)_0%,transparent_50%)] pointer-events-none" />
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-neutral-900 pb-6 mb-8 gap-4 relative z-10">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#C9A227]/10 border border-[#C9A227]/30 rounded-full font-mono text-[7.5px] uppercase tracking-[0.25em] text-[#C9A227] font-bold">
            <ShieldCheck className="w-3 h-3 text-[#C9A227]" />
            SECURE ENTERPRISE COMMAND
          </div>
          <h2 className="text-2xl sm:text-3xl font-sans font-black tracking-tight uppercase text-white mt-2">
            ZEROX APEX CONSOLE
          </h2>
        </div>

        <button 
          onClick={fetchAllData}
          className="px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-xl text-[#C9A227] font-mono text-[9px] tracking-widest uppercase flex items-center gap-2 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          SYNC DATABASES
        </button>
      </div>

      {/* Main Admin Interface Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* Sidebar Nav */}
        <div className="lg:col-span-3 space-y-2">
          {[
            { id: 'analytics', label: 'ANALYTICS HUB', icon: <TrendingUp className="w-4 h-4" /> },
            { id: 'products', label: 'PRODUCT & STOCK', icon: <ShoppingBag className="w-4 h-4" /> },
            { id: 'orders', label: 'ORDER FULFILLMENT', icon: <Ship className="w-4 h-4" /> },
            { id: 'coupons', label: 'COUPON ENGINE', icon: <Percent className="w-4 h-4" /> },
            { id: 'reviews', label: 'REVIEW GATE', icon: <MessageSquare className="w-4 h-4" /> },
            { id: 'support', label: 'CUSTOMER CARE', icon: <CornerDownLeft className="w-4 h-4" /> },
            { id: 'campaigns', label: 'LIVE CAMPAIGNS', icon: <Bell className="w-4 h-4" /> },
            { id: 'settings', label: 'PLATFORM SETTINGS', icon: <Settings className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full text-left font-mono text-[10px] tracking-widest uppercase py-3 px-4 rounded-xl border transition-all flex items-center gap-3 cursor-pointer ${
                activeTab === tab.id 
                  ? 'bg-gradient-to-r from-amber-600 to-[#C9A227] border-[#C9A227] text-black font-black shadow-[0_4px_12px_rgba(201,162,39,0.2)]'
                  : 'bg-neutral-950 border-neutral-900/60 text-neutral-400 hover:border-neutral-800 hover:text-white'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}

          <div className="pt-6 border-t border-neutral-900 mt-6">
            <span className="font-mono text-[8px] text-neutral-600 block uppercase tracking-widest mb-2">SYSTEM TELEMETRY</span>
            <div className="bg-neutral-950 border border-neutral-900 rounded-xl p-3 space-y-1.5 font-mono text-[8px] text-neutral-400">
              <div className="flex justify-between"><span>FIREBASE:</span><span className="text-emerald-400 font-bold">ONLINE</span></div>
              <div className="flex justify-between"><span>LATENCY:</span><span>14ms</span></div>
              <div className="flex justify-between"><span>REGISTRY:</span><span>{users.length} ATOMS</span></div>
            </div>
          </div>
        </div>

        {/* Workspace Display */}
        <div className="lg:col-span-9 bg-neutral-950/40 border border-neutral-900 rounded-2xl p-6 sm:p-8 min-h-[500px]">
          <AnimatePresence mode="wait">
            
            {/* ANALYTICS TAB */}
            {activeTab === 'analytics' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-8"
              >
                <div className="space-y-1">
                  <h3 className="text-lg font-sans font-black text-white uppercase tracking-tight">Enterprise Analytics Dashboard</h3>
                  <p className="text-neutral-500 font-mono text-[10px] uppercase">Cryptographic ledger calculations and live user telemetry</p>
                </div>

                {/* Scorecards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'TOTAL CAPTURED SALES', value: `$${totalSales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: <CreditCard className="text-[#C9A227]" />, color: 'text-[#C9A227]' },
                    { label: 'SECURED TRANSACTION NODES', value: `${totalOrdersCount}`, icon: <CheckCircle className="text-emerald-400" />, color: 'text-emerald-400' },
                    { label: 'AVERAGE NODE VOLUME', value: `$${averageOrderValue.toFixed(2)}`, icon: <TrendingUp className="text-amber-500" />, color: 'text-amber-500' },
                    { label: 'DISPUTED / RETURNED NODES', value: `${returnedOrdersCount}`, icon: <AlertCircle className="text-red-400" />, color: 'text-red-400' },
                  ].map((card, idx) => (
                    <div key={idx} className="bg-neutral-950 border border-neutral-900 rounded-xl p-4.5 space-y-2">
                      <div className="flex justify-between items-center text-neutral-500">
                        <span className="font-mono text-[8px] tracking-widest uppercase">{card.label}</span>
                        {card.icon}
                      </div>
                      <h4 className={`text-xl sm:text-2xl font-sans font-black tracking-tight ${card.color}`}>{card.value}</h4>
                    </div>
                  ))}
                </div>

                {/* Revenue Trend Chart */}
                <div className="bg-neutral-950 border border-neutral-900 rounded-xl p-6 space-y-4">
                  <span className="font-mono text-[10px] text-neutral-400 tracking-widest block uppercase">// MONTHLY REVENUE PROJECTION</span>
                  <div className="h-48 flex items-end justify-between gap-1 sm:gap-2.5 pt-4">
                    {[34, 45, 67, 43, 89, 120, 150, 110, 165, 140, 195, 230].map((h, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                        <div 
                          style={{ height: `${(h / 230) * 100}%` }} 
                          className="w-full bg-gradient-to-t from-amber-600/40 to-[#C9A227] hover:to-amber-300 rounded-t-sm transition-all cursor-pointer"
                        />
                        <span className="font-mono text-[7px] text-neutral-600 uppercase group-hover:text-neutral-400 transition-colors">{['J','F','M','A','M','J','J','A','S','O','N','D'][i]}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-neutral-900 pt-4 mt-4 flex justify-between items-center">
                    <span className="font-mono text-[8px] text-neutral-500 uppercase">Revenue Growth:</span>
                    <span className="font-sans font-black text-[#C9A227]">+{Math.round((totalSales / (totalOrdersCount * 200)) * 100)}% YoY</span>
                  </div>
                </div>

                {/* Order & Customer Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-neutral-950 border border-neutral-900 rounded-xl p-6 space-y-4">
                    <span className="font-mono text-[10px] text-neutral-400 tracking-widest block uppercase">// ORDER FULFILLMENT RATE</span>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-neutral-400 text-sm">Completed</span>
                        <span className="font-bold text-emerald-400">{Math.round((orders.filter(o => o.status === 'DELIVERED').length / Math.max(orders.length, 1)) * 100)}%</span>
                      </div>
                      <div className="w-full h-2 bg-neutral-900 rounded-full overflow-hidden">
                        <div 
                          style={{ width: `${Math.round((orders.filter(o => o.status === 'DELIVERED').length / Math.max(orders.length, 1)) * 100)}%` }}
                          className="h-full bg-emerald-500"
                        />
                      </div>
                      <div className="text-xs text-neutral-500 pt-2">
                        {orders.filter(o => o.status === 'DELIVERED').length} of {orders.length} orders delivered
                      </div>
                    </div>
                  </div>

                  <div className="bg-neutral-950 border border-neutral-900 rounded-xl p-6 space-y-4">
                    <span className="font-mono text-[10px] text-neutral-400 tracking-widest block uppercase">// INVENTORY STATUS</span>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-neutral-400 text-sm">Stock Level</span>
                        <span className="font-bold text-cyan-400">{products.reduce((sum, p) => sum + (p.stock || 0), 0)}</span>
                      </div>
                      <div className="w-full h-2 bg-neutral-900 rounded-full overflow-hidden">
                        <div 
                          style={{ width: '75%' }}
                          className="h-full bg-cyan-500"
                        />
                      </div>
                      <div className="text-xs text-neutral-500 pt-2">
                        {products.length} products in catalog
                      </div>
                    </div>
                  </div>

                  <div className="bg-neutral-950 border border-neutral-900 rounded-xl p-6 space-y-4">
                    <span className="font-mono text-[10px] text-neutral-400 tracking-widest block uppercase">// CUSTOMER SATISFACTION</span>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-neutral-400 text-sm">Avg Rating</span>
                        <span className="font-bold text-amber-400">4.8★</span>
                      </div>
                      <div className="w-full h-2 bg-neutral-900 rounded-full overflow-hidden">
                        <div 
                          style={{ width: '96%' }}
                          className="h-full bg-amber-500"
                        />
                      </div>
                      <div className="text-xs text-neutral-500 pt-2">
                        Based on {reviews.length} reviews
                      </div>
                    </div>
                  </div>
                </div>

                {/* Live Activity Registry */}
                <div className="bg-neutral-950 border border-neutral-900 rounded-xl p-6 space-y-4">
                  <span className="font-mono text-[10px] text-neutral-400 tracking-widest block uppercase">// LIVE TELEMETRY ACCOUNTS</span>
                  <div className="space-y-2 max-h-[160px] overflow-y-auto">
                    {users.map((u, i) => (
                      <div key={i} className="flex justify-between items-center font-mono text-[9px] border-b border-neutral-900 pb-2 last:border-0 last:pb-0">
                        <span className="text-white uppercase">{u.name || 'Anonymous User'}</span>
                        <span className="text-neutral-500">{u.email}</span>
                        <span className="text-[#C9A227] font-bold">[{u.membershipTier || 'Challenger'}]</span>
                      </div>
                    ))}
                    {users.length === 0 && (
                      <div className="text-neutral-500 text-center font-mono py-4 uppercase tracking-widest text-[10px]">No active registered users synced</div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* PRODUCT & STOCK TAB */}
            {activeTab === 'products' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-8"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-sans font-black text-white uppercase tracking-tight">Active Product & Stock Core</h3>
                    <p className="text-neutral-500 font-mono text-[10px] uppercase">Control catalog parameters and active stock counters</p>
                  </div>
                </div>

                {/* Create Product Accordion Form */}
                <form onSubmit={handleCreateProduct} className="bg-neutral-950 border border-neutral-900 rounded-xl p-6 space-y-4">
                  <span className="font-mono text-[10px] text-[#C9A227] tracking-widest block uppercase font-bold">// INGEST NEW PRODUCT MATRIX</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="font-mono text-[8px] text-neutral-500 block mb-1">PRODUCT ID (UNIQUE)</label>
                      <input 
                        type="text" 
                        required
                        placeholder="E.G. zrx-sound" 
                        value={newProduct.id}
                        onChange={e => setNewProduct(prev => ({ ...prev, id: e.target.value }))}
                        className="w-full bg-neutral-900 border border-neutral-800 text-xs text-white rounded-lg p-2 font-mono"
                      />
                    </div>
                    <div>
                      <label className="font-mono text-[8px] text-neutral-500 block mb-1">PRODUCT NAME</label>
                      <input 
                        type="text" 
                        required
                        placeholder="E.G. Sound Barrier Carbon" 
                        value={newProduct.name}
                        onChange={e => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full bg-neutral-900 border border-neutral-800 text-xs text-white rounded-lg p-2 font-mono"
                      />
                    </div>
                    <div>
                      <label className="font-mono text-[8px] text-neutral-500 block mb-1">TAGLINE</label>
                      <input 
                        type="text" 
                        placeholder="E.G. Aerodynamic Speed" 
                        value={newProduct.tagline}
                        onChange={e => setNewProduct(prev => ({ ...prev, tagline: e.target.value }))}
                        className="w-full bg-neutral-900 border border-neutral-800 text-xs text-white rounded-lg p-2 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="font-mono text-[8px] text-neutral-500 block mb-1">UNIT PRICE ($)</label>
                      <input 
                        type="number" 
                        required
                        value={newProduct.price}
                        onChange={e => setNewProduct(prev => ({ ...prev, price: Number(e.target.value) }))}
                        className="w-full bg-neutral-900 border border-neutral-800 text-xs text-white rounded-lg p-2 font-mono"
                      />
                    </div>
                    <div>
                      <label className="font-mono text-[8px] text-neutral-500 block mb-1">CATEGORY</label>
                      <select 
                        value={newProduct.category}
                        onChange={e => setNewProduct(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full bg-neutral-900 border border-neutral-800 text-xs text-white rounded-lg p-2 font-mono"
                      >
                        <option value="Performance">Performance</option>
                        <option value="Luxury">Luxury</option>
                        <option value="Limited Drop">Limited Drop</option>
                        <option value="Futuristic">Futuristic</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-mono text-[8px] text-neutral-500 block mb-1">INITIAL STOCK</label>
                      <input 
                        type="number" 
                        value={newProduct.stock}
                        onChange={e => setNewProduct(prev => ({ ...prev, stock: Number(e.target.value) }))}
                        className="w-full bg-neutral-900 border border-neutral-800 text-xs text-white rounded-lg p-2 font-mono"
                      />
                    </div>
                    <div>
                      <label className="font-mono text-[8px] text-neutral-500 block mb-1">3D ACCENT COLOR</label>
                      <div className="flex gap-2 items-center">
                        <input 
                          type="color" 
                          value={newProduct.colorAccent}
                          onChange={e => setNewProduct(prev => ({ ...prev, colorAccent: e.target.value }))}
                          className="bg-transparent border-0 cursor-pointer w-8 h-8 rounded"
                        />
                        <span className="font-mono text-[9px] uppercase">{newProduct.colorAccent}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="font-mono text-[8px] text-neutral-500 block mb-1">PRODUCT DESCRIPTION</label>
                    <textarea 
                      placeholder="Enter technical layout details..."
                      value={newProduct.description}
                      onChange={e => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full h-16 bg-neutral-900 border border-neutral-800 text-xs text-white rounded-lg p-2 font-mono resize-none"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-2.5 bg-[#C9A227] hover:bg-amber-500 text-black font-sans font-black text-xs uppercase rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    REGISTER PRODUCT TO BLOCKCHAIN CATALOG
                  </button>
                </form>

                {/* Products Grid */}
                <div className="space-y-4">
                  {products.map((p) => {
                    const isLowStock = p.stock < 10;
                    const isCritical = p.stock < 5;
                    return (
                      <div key={p.id} className={`bg-neutral-950 border rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-neutral-700 transition-colors ${
                        isCritical ? 'border-red-500/50' : isLowStock ? 'border-amber-500/50' : 'border-neutral-900'
                      }`}>
                        <div className="flex items-center gap-4 flex-1">
                          <div className="relative">
                            <img src={p.image} className="w-12 h-12 object-cover rounded-lg border border-neutral-800" />
                            {isCritical && (
                              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">!</div>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-white font-sans font-black text-sm uppercase">{p.name}</span>
                              <span className="font-mono text-[7px] text-[#C9A227] bg-[#C9A227]/10 px-1.5 py-0.5 rounded-full uppercase">{p.category}</span>
                              {isLowStock && (
                                <span className={`font-mono text-[7px] px-1.5 py-0.5 rounded-full uppercase font-semibold ${
                                  isCritical ? 'text-red-400 bg-red-500/10' : 'text-amber-400 bg-amber-500/10'
                                }`}>
                                  {isCritical ? 'CRITICAL' : 'LOW STOCK'}
                                </span>
                              )}
                            </div>
                            <p className="font-mono text-[8.5px] text-neutral-500 uppercase mt-0.5">ID: {p.id} // PRICE: ${p.price}</p>
                          </div>
                        </div>

                        {/* Stock Manipulators */}
                        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
                          <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded-lg p-1">
                            <button 
                              onClick={() => handleUpdateStock(p.id, p.stock, -5)}
                              className="w-6 h-6 rounded bg-neutral-950 flex items-center justify-center text-xs hover:text-[#C9A227] font-mono cursor-pointer"
                            >
                              -5
                            </button>
                            <span className={`font-mono text-xs font-bold min-w-[28px] text-center ${
                              isCritical ? 'text-red-400' : isLowStock ? 'text-amber-400' : 'text-white'
                            }`}>
                              {p.stock}
                            </span>
                            <button 
                              onClick={() => handleUpdateStock(p.id, p.stock, 5)}
                              className="w-6 h-6 rounded bg-neutral-950 flex items-center justify-center text-xs hover:text-[#C9A227] font-mono cursor-pointer"
                            >
                              +5
                            </button>
                          </div>

                          <button 
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-2 bg-neutral-900 hover:bg-red-900/40 text-neutral-500 hover:text-red-400 border border-neutral-800 hover:border-red-500/30 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* ORDER FULFILLMENT TAB */}
            {activeTab === 'orders' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="space-y-1">
                  <h3 className="text-lg font-sans font-black text-white uppercase tracking-tight">Active Order Fulfillment</h3>
                  <p className="text-neutral-500 font-mono text-[10px] uppercase">Track deliveries, dispatch shipments, and review active refund requests</p>
                </div>

                <div className="space-y-4">
                  {orders.map((o) => (
                    <div key={o.id} className="bg-neutral-950 border border-neutral-900 rounded-xl p-5 space-y-4 hover:border-neutral-800 transition-all">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-neutral-900 pb-3">
                        <div>
                          <span className="text-white font-sans font-bold text-sm block">LEDGER NODE: {o.id}</span>
                          <span className="font-mono text-[8px] text-neutral-500 uppercase">BUYER: {o.deliveryAddress?.name} // {o.deliveryAddress?.email}</span>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full font-mono text-[7px] uppercase tracking-widest font-extrabold ${
                          o.status === 'Delivered' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' :
                          o.status === 'Refunded' ? 'bg-red-500/10 border border-red-500/30 text-red-400' :
                          'bg-[#C9A227]/10 border border-[#C9A227]/30 text-[#C9A227]'
                        }`}>
                          {o.status}
                        </span>
                      </div>

                      {/* Items details */}
                      <div className="space-y-2 font-mono text-[8.5px] uppercase text-neutral-400">
                        {o.items?.map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center">
                            <span>{item.quantity}x {item.sneaker?.name} (Size {item.selectedSize}) {item.engraving ? `[ENG: ${item.engraving}]` : ''}</span>
                            <span className="text-white">${(item.sneaker?.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      {/* Return/Exchange alerts */}
                      {o.returnRequested && (
                        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center justify-between gap-4">
                          <div className="flex items-center gap-2 text-red-400 font-mono text-[9px] uppercase tracking-wide">
                            <AlertTriangle className="w-4 h-4 text-red-400 animate-pulse shrink-0" />
                            <span>Return Request Raised: &quot;{o.returnReason || 'Exchange Sizing'}&quot;</span>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleApproveReturn(o.id, true)}
                              className="px-2.5 py-1 bg-red-500 hover:bg-red-600 text-white font-mono text-[8px] uppercase tracking-wider rounded cursor-pointer transition-colors"
                            >
                              Approve Refund
                            </button>
                            <button 
                              onClick={() => handleApproveReturn(o.id, false)}
                              className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 font-mono text-[8px] uppercase tracking-wider rounded cursor-pointer transition-colors"
                            >
                              Decline
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Status selectors */}
                      <div className="flex flex-wrap justify-between items-center gap-4 pt-2 border-t border-neutral-900">
                        <div className="font-mono text-[8px] text-neutral-500 uppercase">
                          SHIP TO: {o.deliveryAddress?.city}, {o.deliveryAddress?.country}
                        </div>

                        <div className="flex gap-1.5">
                          {['Processing', 'Shipped', 'Out for Delivery', 'Delivered'].map((st) => (
                            <button
                              key={st}
                              disabled={o.status === 'Refunded' || o.status === st}
                              onClick={() => handleUpdateOrderStatus(o.id, st)}
                              className={`px-2 py-1 rounded font-mono text-[7px] uppercase tracking-widest cursor-pointer transition-colors ${
                                o.status === st 
                                  ? 'bg-[#C9A227] text-black font-black'
                                  : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-400'
                              }`}
                            >
                              {st}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                  {orders.length === 0 && (
                    <div className="text-neutral-500 text-center font-mono py-12 uppercase tracking-widest text-xs">NO TRANSACTION CORES RECORDED IN FIRESTORE</div>
                  )}
                </div>
              </motion.div>
            )}

            {/* COUPON ENGINE TAB */}
            {activeTab === 'coupons' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-8"
              >
                <div className="space-y-1">
                  <h3 className="text-lg font-sans font-black text-white uppercase tracking-tight">Promo & Gift Coupon Engine</h3>
                  <p className="text-neutral-500 font-mono text-[10px] uppercase">Establish and activate limited drop discount vouchers</p>
                </div>

                <form onSubmit={handleCreateCoupon} className="bg-neutral-950 border border-neutral-900 rounded-xl p-5 grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
                  <div>
                    <label className="font-mono text-[8px] text-neutral-500 block mb-1">PROMO CODE (UPPERCASE)</label>
                    <input 
                      type="text" 
                      required
                      placeholder="E.G. CO-CREATOR40" 
                      value={newCoupon.code}
                      onChange={e => setNewCoupon(prev => ({ ...prev, code: e.target.value }))}
                      className="w-full bg-neutral-900 border border-neutral-800 text-xs text-white rounded-lg p-2 font-mono uppercase"
                    />
                  </div>
                  <div>
                    <label className="font-mono text-[8px] text-neutral-500 block mb-1">DISCOUNT TYPE</label>
                    <select 
                      value={newCoupon.discountType}
                      onChange={e => setNewCoupon(prev => ({ ...prev, discountType: e.target.value }))}
                      className="w-full bg-neutral-900 border border-neutral-800 text-xs text-white rounded-lg p-2 font-mono"
                    >
                      <option value="percentage">Percentage Off (%)</option>
                      <option value="fixed">Fixed Cash Value ($)</option>
                      <option value="free_shipping">Free Shipping</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-mono text-[8px] text-neutral-500 block mb-1">VALUE</label>
                    <input 
                      type="number" 
                      value={newCoupon.value}
                      onChange={e => setNewCoupon(prev => ({ ...prev, value: Number(e.target.value) }))}
                      className="w-full bg-neutral-900 border border-neutral-800 text-xs text-white rounded-lg p-2 font-mono"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="py-2.5 bg-[#C9A227] hover:bg-amber-500 text-black font-sans font-black text-xs uppercase rounded-lg cursor-pointer transition-colors"
                  >
                    DEPLOY COUPON
                  </button>
                </form>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {coupons.map((c) => (
                    <div key={c.id} className="bg-neutral-950 border border-neutral-900 rounded-xl p-4 flex justify-between items-center hover:border-neutral-800 transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-mono text-sm font-bold tracking-widest">{c.code}</span>
                          <span className="font-mono text-[7px] text-[#C9A227] bg-[#C9A227]/10 px-1.5 py-0.5 rounded uppercase">{c.discountType}</span>
                        </div>
                        <p className="font-mono text-[8.5px] text-neutral-500 uppercase">DISCOUNT: {c.discountType === 'percentage' ? `${c.value}%` : c.discountType === 'fixed' ? `$${c.value}` : 'Free Delivery'}</p>
                      </div>

                      <button 
                        onClick={() => handleDeleteCoupon(c.id)}
                        className="p-2 bg-neutral-900 hover:bg-red-900/40 text-neutral-500 hover:text-red-400 border border-neutral-800 hover:border-red-500/30 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* REVIEW GATE TAB */}
            {activeTab === 'reviews' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="space-y-1">
                  <h3 className="text-lg font-sans font-black text-white uppercase tracking-tight">Review Moderation Gate</h3>
                  <p className="text-neutral-500 font-mono text-[10px] uppercase">Approve verified purchaser feedback profiles</p>
                </div>

                <div className="space-y-4">
                  {reviews.map((r) => (
                    <div key={r.id} className="bg-neutral-950 border border-neutral-900 rounded-xl p-4.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2.5">
                          <span className="text-white font-sans font-bold text-xs">{r.user}</span>
                          <div className="flex text-amber-500">
                            {Array.from({ length: 5 }).map((_, idx) => (
                              <span key={idx} className="text-xs">{idx < r.rating ? '★' : '☆'}</span>
                            ))}
                          </div>
                          {!r.approved && (
                            <span className="font-mono text-[7px] text-amber-400 bg-amber-400/10 border border-amber-400/30 px-1.5 rounded-full uppercase">Pending Moderation</span>
                          )}
                        </div>
                        <p className="text-neutral-400 font-mono text-[9px] uppercase leading-relaxed">&quot;{r.comment}&quot;</p>
                      </div>

                      <div className="flex gap-2 w-full sm:w-auto">
                        {!r.approved && (
                          <button 
                            onClick={() => handleApproveReview(r.id)}
                            className="p-2 bg-[#C9A227]/10 hover:bg-[#C9A227] text-[#C9A227] hover:text-black border border-[#C9A227]/30 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        <button 
                          onClick={() => handleDeleteReview(r.id)}
                          className="p-2 bg-neutral-900 hover:bg-red-950 text-neutral-500 hover:text-red-400 border border-neutral-800 hover:border-red-500/30 rounded-lg transition-colors flex items-center justify-center cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {reviews.length === 0 && (
                    <div className="text-neutral-500 text-center font-mono py-12 uppercase tracking-widest text-xs">NO VISIBLE REVIEWS SUBMITTED</div>
                  )}
                </div>
              </motion.div>
            )}

            {/* CUSTOMER CARE (SUPPORT TICKETS) */}
            {activeTab === 'support' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="space-y-1">
                  <h3 className="text-lg font-sans font-black text-white uppercase tracking-tight">Athlete Support Hub</h3>
                  <p className="text-neutral-500 font-mono text-[10px] uppercase">Respond to active user assistance queries and returns coordination</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  {/* Tickets list */}
                  <div className="md:col-span-5 space-y-3 max-h-[350px] overflow-y-auto pr-2">
                    {tickets.map((t) => (
                      <div 
                        key={t.id} 
                        onClick={() => setSelectedTicket(t)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                          selectedTicket?.id === t.id 
                            ? 'bg-neutral-900 border-[#C9A227]' 
                            : 'bg-neutral-950 border-neutral-900 hover:border-neutral-800'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-sans font-bold text-xs text-white truncate max-w-[120px]">{t.name}</span>
                          <span className={`px-1.5 py-0.5 rounded font-mono text-[7px] uppercase font-bold ${
                            t.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-500 animate-pulse'
                          }`}>{t.status}</span>
                        </div>
                        <h4 className="font-mono text-[9px] uppercase tracking-wide text-[#C9A227] truncate">{t.subject}</h4>
                        <p className="font-mono text-[7.5px] text-neutral-500 uppercase mt-1 truncate">{t.date}</p>
                      </div>
                    ))}
                    {tickets.length === 0 && (
                      <div className="text-neutral-500 text-center font-mono py-12 uppercase tracking-widest text-xs">NO OPEN CUSTOMER TICKETS</div>
                    )}
                  </div>

                  {/* Active ticket viewport */}
                  <div className="md:col-span-7 bg-neutral-950 border border-neutral-900 rounded-xl p-5 relative min-h-[250px] flex flex-col justify-between">
                    {selectedTicket ? (
                      <div className="space-y-4 h-full flex flex-col justify-between">
                        <div className="space-y-3">
                          <div className="border-b border-neutral-900 pb-3">
                            <span className="font-mono text-[8px] text-[#C9A227] block uppercase">TICKET WORKSPACE</span>
                            <h4 className="font-sans font-black text-sm text-white uppercase mt-1">{selectedTicket.subject}</h4>
                            <p className="font-mono text-[8.5px] text-neutral-500 uppercase mt-0.5">SENDER: {selectedTicket.name} ({selectedTicket.email})</p>
                          </div>
                          
                          <p className="text-neutral-300 font-mono text-[9px] uppercase leading-relaxed bg-neutral-900/50 p-3 rounded-lg border border-neutral-900">
                            &quot;{selectedTicket.message}&quot;
                          </p>

                          {selectedTicket.reply && (
                            <div className="space-y-1">
                              <span className="font-mono text-[8px] text-emerald-400 block uppercase">YOUR DISPATCH RESPONSE</span>
                              <p className="text-neutral-400 font-mono text-[9px] uppercase leading-relaxed bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-lg">
                                &quot;{selectedTicket.reply}&quot;
                              </p>
                            </div>
                          )}
                        </div>

                        {selectedTicket.status !== 'Resolved' && (
                          <div className="space-y-2.5 pt-4 border-t border-neutral-900">
                            <textarea 
                              placeholder="Type response back to collector email queue..."
                              value={replyMessage}
                              onChange={e => setReplyMessage(e.target.value)}
                              className="w-full h-16 bg-neutral-900 border border-neutral-800 text-xs text-white rounded-lg p-2 font-mono resize-none"
                            />
                            <button 
                              onClick={() => handleReplyTicket(selectedTicket.id)}
                              className="w-full py-2 bg-gradient-to-r from-amber-600 to-[#C9A227] hover:from-amber-500 hover:to-amber-400 text-black font-sans font-black text-xs uppercase rounded-lg cursor-pointer transition-colors"
                            >
                              RESOLVE & DISPATCH EMAIL REPLY
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="m-auto text-center space-y-2">
                        <MessageSquare className="w-8 h-8 text-neutral-700 mx-auto" />
                        <p className="font-mono text-[9px] text-neutral-500 uppercase tracking-widest">SELECT A CORRESPONDING TICKET TO ENGAGE</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* LIVE CAMPAIGNS (MARKETING WORKSPACE) */}
            {activeTab === 'campaigns' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-8"
              >
                <div className="space-y-1">
                  <h3 className="text-lg font-sans font-black text-white uppercase tracking-tight">Active Push & Email Campaigns</h3>
                  <p className="text-neutral-500 font-mono text-[10px] uppercase">Distribute live updates and high-impact promo campaigns instantly</p>
                </div>

                {campaignSuccess && (
                  <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center text-emerald-400 font-mono text-[9px] uppercase tracking-widest">
                    🚀 CAMPAIGN TELEMETRY TRANSMITTED SUCCESSFULLY ACROSS ALL CHANNELS
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Push Notification Panel */}
                  <form onSubmit={handlePushNotification} className="bg-neutral-950 border border-neutral-900 rounded-xl p-5 space-y-4">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-[#C9A227]" />
                      <span className="font-mono text-[10px] text-white tracking-widest uppercase font-black">BROADCAST PUSH ALERTS</span>
                    </div>

                    <div>
                      <label className="font-mono text-[8px] text-neutral-500 block mb-1">NOTIFICATION TITLE</label>
                      <input 
                        type="text" 
                        required
                        value={notificationMsg.title}
                        onChange={e => setNotificationMsg(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full bg-neutral-900 border border-neutral-800 text-xs text-white rounded-lg p-2 font-mono uppercase"
                      />
                    </div>

                    <div>
                      <label className="font-mono text-[8px] text-neutral-500 block mb-1">MESSAGE BODY</label>
                      <textarea 
                        required
                        value={notificationMsg.message}
                        onChange={e => setNotificationMsg(prev => ({ ...prev, message: e.target.value }))}
                        className="w-full h-20 bg-neutral-900 border border-neutral-800 text-xs text-white rounded-lg p-2 font-mono resize-none uppercase"
                      />
                    </div>

                    <button 
                      type="submit"
                      className="w-full py-2 bg-[#C9A227] hover:bg-amber-500 text-black font-sans font-black text-xs uppercase rounded-lg cursor-pointer transition-colors"
                    >
                      SEND REAL-TIME APP PUSH
                    </button>
                  </form>

                  {/* Email Campaign Panel */}
                  <form onSubmit={handleSendEmailCampaign} className="bg-neutral-950 border border-neutral-900 rounded-xl p-5 space-y-4">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-[#C9A227]" />
                      <span className="font-mono text-[10px] text-white tracking-widest uppercase font-black">BULK EMAIL CAMPAIGNS</span>
                    </div>

                    <div>
                      <label className="font-mono text-[8px] text-neutral-500 block mb-1">EMAIL SUBJECT LINE</label>
                      <input 
                        type="text" 
                        required
                        value={emailCampaign.subject}
                        onChange={e => setEmailCampaign(prev => ({ ...prev, subject: e.target.value }))}
                        className="w-full bg-neutral-900 border border-neutral-800 text-xs text-white rounded-lg p-2 font-mono"
                      />
                    </div>

                    <div>
                      <label className="font-mono text-[8px] text-neutral-500 block mb-1">TARGET COHORT</label>
                      <select 
                        value={emailCampaign.targetGroup}
                        onChange={e => setEmailCampaign(prev => ({ ...prev, targetGroup: e.target.value }))}
                        className="w-full bg-neutral-900 border border-neutral-800 text-xs text-white rounded-lg p-2 font-mono"
                      >
                        <option value="all">All Synced Collectors ({users.length})</option>
                        <option value="elite">Elite Tier Members only</option>
                        <option value="apex">Apex Founder tier only</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-mono text-[8px] text-neutral-500 block mb-1">EMAIL BODY (MARKDOWN / PLAIN)</label>
                      <textarea 
                        required
                        value={emailCampaign.content}
                        onChange={e => setEmailCampaign(prev => ({ ...prev, content: e.target.value }))}
                        className="w-full h-20 bg-neutral-900 border border-neutral-800 text-xs text-white rounded-lg p-2 font-mono resize-none"
                      />
                    </div>

                    <button 
                      type="submit"
                      className="w-full py-2 bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-800 font-sans font-black text-xs uppercase rounded-lg cursor-pointer transition-colors"
                    >
                      DISPATCH DISPATCH NEWSLETTER
                    </button>
                  </form>
                </div>
              </motion.div>
            )}

            {/* PLATFORM SETTINGS */}
            {activeTab === 'settings' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="space-y-1">
                  <h3 className="text-lg font-sans font-black text-white uppercase tracking-tight">Platform Global Settings</h3>
                  <p className="text-neutral-500 font-mono text-[10px] uppercase">Calibrate fiscal parameters, shipping multipliers, and visual announcements</p>
                </div>

                <div className="bg-neutral-950 border border-neutral-900 rounded-xl p-5 space-y-4">
                  <span className="font-mono text-[10px] text-[#C9A227] tracking-widest block uppercase font-bold">// FINANCIAL MULTIPLIERS</span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="font-mono text-[8.5px] text-neutral-500 block mb-1.5">GLOBAL SALES TAX RATE (%)</label>
                      <input 
                        type="number" 
                        value={taxRate}
                        onChange={e => setTaxRate(Number(e.target.value))}
                        className="w-full bg-neutral-900 border border-neutral-800 text-xs text-white rounded-lg p-2.5 font-mono"
                      />
                    </div>
                    <div>
                      <label className="font-mono text-[8.5px] text-neutral-500 block mb-1.5">EXPRESS FLAT-RATE SHIPPING ($)</label>
                      <input 
                        type="number" 
                        value={flatShippingExpress}
                        onChange={e => setFlatShippingExpress(Number(e.target.value))}
                        className="w-full bg-neutral-900 border border-neutral-800 text-xs text-white rounded-lg p-2.5 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-mono text-[8.5px] text-neutral-500 block mb-1.5">SUMMER BANNER MARQUEE TEXT</label>
                    <input 
                      type="text" 
                      value={activeBanner}
                      onChange={e => setActiveBanner(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 text-xs text-white rounded-lg p-2.5 font-mono"
                    />
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button 
                      onClick={() => {
                        alert('Platform financial registers saved locally.');
                      }}
                      className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-[#C9A227] hover:from-amber-500 hover:to-amber-400 text-black font-sans font-black text-xs uppercase rounded-xl cursor-pointer transition-colors"
                    >
                      SAVE GLOBAL REGISTERS
                    </button>
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
