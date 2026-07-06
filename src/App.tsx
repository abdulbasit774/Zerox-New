import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, SlidersHorizontal, ArrowRight, ShieldCheck, Zap, Sparkles, Award, Star, Heart, HeartOff, ChevronLeft } from 'lucide-react';

import { SNEAKER_CATALOG } from './components/SneakerData';
import { CartItem, UserProfile, Order, Sneaker, Colorway } from './types';

import Logo from './components/Logo';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import SplashLoader from './components/SplashLoader';
import AnatomyDiagram from './components/AnatomyDiagram';
import SneakerCustomizer from './components/SneakerCustomizer';
import ProductDrawer from './components/ProductDrawer';
import CheckoutPortal from './components/CheckoutPortal';
import OrderConfirmation from './components/OrderConfirmation';
import LoginPortal from './components/LoginPortal';
import Sneaker3DViewer from './components/Sneaker3DViewer';
import MagneticButton from './components/MagneticButton';
import AnimatedTypography from './components/AnimatedTypography';
import KineticScrollStorytelling from './components/KineticScrollStorytelling';
import AdminPanel from './components/AdminPanel';
import CustomCursor from './components/CustomCursor';
import WayfinderConsole from './components/WayfinderConsole';
import CustomerDashboard from './components/CustomerDashboard';

const getStudioLightingStyle = (hex: string) => {
  if (!hex) return {};
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16) || 201;
  const g = parseInt(cleanHex.substring(2, 4), 16) || 162;
  const b = parseInt(cleanHex.substring(4, 6), 16) || 39;
  return {
    background: `radial-gradient(circle at 50% 35%, rgba(${r}, ${g}, ${b}, 0.22) 0%, rgba(20, 20, 20, 0.75) 55%, rgba(6, 6, 6, 1) 100%)`
  };
};

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [activeView, setActiveView] = useState<'shop' | 'customizer' | 'anatomy' | 'vip' | 'admin' | 'wishlist' | 'dashboard'>('shop');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedSneaker, setSelectedSneaker] = useState<Sneaker | null>(null);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

  // Cart and login view options to enable test routes dynamically
  const [cartInitialStep, setCartInitialStep] = useState<'cart' | 'shipping' | 'payment'>('cart');
  const [loginInitialMode, setLoginInitialMode] = useState<'login' | 'signup'>('login');

  // Persistent Wishlist state
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('zerox_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save wishlist on change
  useEffect(() => {
    localStorage.setItem('zerox_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const handleToggleWishlist = (sneakerId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setWishlist((prev) =>
      prev.includes(sneakerId) ? prev.filter((id) => id !== sneakerId) : [...prev, sneakerId]
    );
  };

  // Elite default login to delight the user instantly
  const [user, setUser] = useState<UserProfile>({
    name: 'Abdul Basit',
    email: 'abdulbasitzulfiqar404@gmail.com',
    loggedIn: true,
    membershipTier: 'Apex Founder',
    creatorRank: 48,
    challengerPoints: 12450,
    orderHistory: []
  });

  // Shop View Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'All' | 'Performance' | 'Luxury' | 'Limited Drop' | 'Futuristic'>('All');

  // Track card level active colorways for preview swapping inside cards
  const [cardColors, setCardColors] = useState<Record<string, Colorway>>({});

  useEffect(() => {
    // Populate card colors defaults on load
    const initialColors: Record<string, Colorway> = {};
    SNEAKER_CATALOG.forEach((s) => {
      initialColors[s.id] = s.colorways[0];
    });
    setCardColors(initialColors);
  }, []);

  const handleCardColorSelect = (sneakerId: string, color: Colorway, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering open card detail
    setCardColors((prev) => ({
      ...prev,
      [sneakerId]: color
    }));
  };

  const handleAddCustomToCart = (customDetails: {
    name: string;
    price: number;
    colors: { upper: string; midsole: string; laces: string; accent: string };
    engraving: string;
    size: number;
  }) => {
    // Generate a unique sneaker model profile for the cart
    const tempSneaker: Sneaker = {
      id: `custom-${Date.now()}`,
      name: customDetails.name,
      tagline: `BESPOKE CALIBRATION ENG: ${customDetails.engraving || 'ZRX'}`,
      price: customDetails.price,
      rating: 5.0,
      reviewsCount: 1,
      description: `Bespoke customization with custom Upper: ${customDetails.colors.upper}, Midsole: ${customDetails.colors.midsole}, Laces: ${customDetails.colors.laces}, Accent: ${customDetails.colors.accent}. Custom debossed engraving: "${customDetails.engraving}".`,
      category: 'Futuristic',
      image: 'https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?auto=format&fit=crop&w=1000&q=85',
      colorways: [{ name: 'Custom Design', hex: customDetails.colors.accent, image: 'https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?auto=format&fit=crop&w=1000&q=85' }],
      sizes: [customDetails.size],
      specs: {
        weight: '280 grams',
        cushioning: 'Dual nitrogen-infused pods',
        offset: '6.0 mm',
        propulsion: 'Z-Plate carbon fiber shank'
      },
      features: [{ title: 'Bespoke Custom Build', description: 'Handcrafted according to unique creator parameters.' }]
    };

    const newCartItem: CartItem = {
      id: `cart-custom-${Date.now()}`,
      sneaker: tempSneaker,
      selectedColorway: tempSneaker.colorways[0],
      selectedSize: customDetails.size,
      quantity: 1,
      engraving: customDetails.engraving,
      isCustom: true
    };

    setCart((prev) => [...prev, newCartItem]);
  };

  const handleAddStandardToCart = (sneaker: Sneaker, selectedColorway: Colorway, selectedSize: number) => {
    const cartItemId = `${sneaker.id}-${selectedColorway.name}-${selectedSize}`;
    
    setCart((prev) => {
      const existingIdx = prev.findIndex((item) => item.id === cartItemId);
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += 1;
        return updated;
      } else {
        const newItem: CartItem = {
          id: cartItemId,
          sneaker,
          selectedColorway,
          selectedSize,
          quantity: 1,
          isCustom: false
        };
        return [...prev, newItem];
      }
    });
  };

  const handleUpdateQuantity = (cartItemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === cartItemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  const handleRemoveItem = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const handleCheckoutSuccess = (order: Order) => {
    // Add order to history
    setUser((prev) => ({
      ...prev,
      orderHistory: [order, ...prev.orderHistory],
      challengerPoints: prev.challengerPoints + 250 // Reward for purchase!
    }));

    setCart([]); // Clear cart
    setIsCartOpen(false); // Close panel
    setActiveOrder(order); // Store order to show Certificate directly
    setActiveView('shop'); // Reset main view
  };

  const handleLogin = (name: string, email: string) => {
    setUser((prev) => ({
      ...prev,
      name,
      email,
      loggedIn: true
    }));
  };

  const handleLogout = () => {
    setUser((prev) => ({
      ...prev,
      loggedIn: false,
      orderHistory: []
    }));
  };

  // Filter Catalog
  const filteredCatalog = SNEAKER_CATALOG.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.tagline.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || s.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between selection:bg-[#C9A227] selection:text-black">
      
      {/* Dynamic Animated Splash Loader Screen */}
      <AnimatePresence>
        {showSplash && (
          <SplashLoader onComplete={() => setShowSplash(false)} />
        )}
      </AnimatePresence>

      {!showSplash && (
        <>
          {/* Custom Interactive Floating Cursor */}
          <CustomCursor />

          {/* Main Floating Glass Navbar */}
          <Navbar
            cartItems={cart}
            user={user}
            activeView={activeView}
            onViewChange={(view) => {
              setActiveView(view);
              setActiveOrder(null); // Dismiss order confirmation view if switching panels
            }}
            onOpenCart={() => setIsCartOpen(true)}
          />

          {/* Secure Slideover Drawer Shopping Cart */}
          <AnimatePresence>
            {isCartOpen && (
              <CheckoutPortal
                cartItems={cart}
                onClose={() => setIsCartOpen(false)}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveItem}
                onCheckoutSuccess={handleCheckoutSuccess}
                initialStep={cartInitialStep}
              />
            )}
          </AnimatePresence>

          {/* Immersive detailed modal explore sheet */}
          <AnimatePresence>
            {selectedSneaker && (
              <ProductDrawer
                sneaker={selectedSneaker}
                onClose={() => setSelectedSneaker(null)}
                onAddToCart={(sn, col, sz) => {
                  handleAddStandardToCart(sn, col, sz);
                  setSelectedSneaker(null); // Auto close on successful bag commit
                }}
              />
            )}
          </AnimatePresence>

          {/* Main Display Body Area */}
          <main className="flex-grow">
            <AnimatePresence mode="wait">
              
              {/* ORDER CONFIRMATION / DIGITAL CERTIFICATE SCREEN OVERLAY */}
              {activeOrder ? (
                <motion.div
                  key="order-confirmation"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="px-4 py-8"
                >
                  <OrderConfirmation
                    order={activeOrder}
                    onReturnToShop={() => setActiveOrder(null)}
                  />
                </motion.div>
              ) : (
                (() => {
                  switch (activeView) {
                    
                    /* VIEW 1: PLAZA SNEAKER STORE CATALOG */
                    case 'shop':
                      return (
                        <motion.div
                          key="shop"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.5 }}
                          className="space-y-16 pb-20"
                        >
                          {/* Immersive Cinematic Editorial Hero Banner WITH 3D CAPABILITIES */}
                          <section className="relative w-full min-h-[620px] lg:h-[680px] flex items-center overflow-hidden border-b border-neutral-950 px-6 sm:px-12 md:px-20 select-none py-16 lg:py-0">
                            {/* Deep radial gold glow */}
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(201,162,39,0.06)_0%,transparent_60%)] pointer-events-none" />
                            {/* Carbon weave mesh subtle background texture */}
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.003)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.003)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none" />

                            <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center z-10 relative">
                              
                              {/* Left Text Column: Staggered reveal typography and Magnetic Buttons */}
                              <div className="lg:col-span-7 space-y-6 text-left flex flex-col items-start justify-center">
                                {/* Brand logo stamp overlay */}
                                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900/60 border border-neutral-800 rounded-full font-mono text-[8px] uppercase tracking-[0.3em] text-[#C9A227] font-extrabold mb-2 shadow-inner">
                                  <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                                  FLIGHT_CENTRAL_LAUNCH
                                </div>

                                <h1 className="text-4xl sm:text-6xl md:text-7.5xl font-sans font-black tracking-tight leading-none text-white uppercase select-none max-w-2xl">
                                  <AnimatedTypography variant="word" text="Move Beyond Limits" className="text-white block font-black" />
                                </h1>

                                <p className="text-neutral-400 font-mono text-xs sm:text-sm tracking-widest max-w-xl leading-relaxed uppercase">
                                  ZEROX is a premium luxury footwear brand built for athletes, creators, dreamers, and people who challenge their limits every day.
                                </p>

                                <div className="flex flex-col sm:flex-row gap-4 pt-4 w-full sm:w-auto">
                                  <MagneticButton
                                    onClick={() => {
                                      const gridEl = document.getElementById('catalog-grid-top');
                                      gridEl?.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                    className="px-0 cursor-pointer"
                                  >
                                    <motion.span 
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.98 }}
                                      className="w-full sm:w-auto bg-gradient-to-r from-amber-600 to-[#C9A227] hover:from-amber-500 hover:to-amber-400 text-black font-sans font-black text-xs uppercase py-3.5 px-8 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-[0_4px_20px_rgba(201,162,39,0.25)] hover:shadow-[0_8px_35px_rgba(201,162,39,0.4)]"
                                    >
                                      EXPLORE PLAZA STORE
                                      <motion.span
                                        animate={{ x: [0, 4, 0] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                      >
                                        <ArrowRight className="w-4 h-4" />
                                      </motion.span>
                                    </motion.span>
                                  </MagneticButton>

                                  <MagneticButton
                                    onClick={() => setActiveView('customizer')}
                                    className="px-0 cursor-pointer"
                                  >
                                    <motion.span 
                                      whileHover={{ scale: 1.05, borderColor: 'rgba(201, 162, 39, 0.6)' }}
                                      whileTap={{ scale: 0.98 }}
                                      className="w-full sm:w-auto bg-neutral-950 hover:bg-neutral-900 text-white border border-neutral-800 font-mono text-xs tracking-widest uppercase py-3.5 px-8 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 hover:shadow-[0_0_20px_rgba(201,162,39,0.3)]"
                                    >
                                      BESPOKE DESIGN LAB
                                      <motion.span
                                        animate={{ rotate: [0, 10, 0] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                      >
                                        <Zap className="w-4 h-4 text-[#C9A227]" />
                                      </motion.span>
                                    </motion.span>
                                  </MagneticButton>
                                </div>
                              </div>

                              {/* Right Interactive 3D Showcase Column */}
                              <div className="lg:col-span-5 h-[350px] sm:h-[450px] w-full bg-neutral-950/10 border border-neutral-900/60 rounded-3xl relative overflow-hidden flex items-center justify-center shadow-3xl">
                                {/* Subtle internal spotlight background */}
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(201,162,39,0.06)_0%,transparent_60%)] pointer-events-none" />
                                
                                <Sneaker3DViewer
                                  colors={{
                                    upper: '#000000',
                                    midsole: '#FFFFFF',
                                    laces: '#FFFFFF',
                                    accent: '#C9A227'
                                  }}
                                  engraving="ZEROX"
                                  className="w-full h-full"
                                  autoRotate={true}
                                  interactive={true}
                                  showAmbientGlow={true}
                                />
                                
                                <div className="absolute top-4 left-4 flex items-center gap-1.5 font-mono text-[8.5px] text-neutral-500 tracking-wider">
                                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                  <span>CORE ENGINE SHOWCASE</span>
                                </div>
                              </div>

                            </div>

                            {/* Corner border markings representing structural high performance precision */}
                            <div className="absolute top-10 left-10 flex gap-2 hidden lg:flex">
                              <div className="h-[1px] w-8 bg-neutral-900" />
                              <span className="font-mono text-[8px] text-neutral-600 tracking-[0.25em]">SYS_STANDBY_NYC_01</span>
                            </div>
                            <div className="absolute bottom-10 right-10 flex items-center gap-3 hidden lg:flex">
                              <span className="font-mono text-[8px] text-neutral-600 tracking-[0.25em]">ZEROX_PROPULSION_CORE</span>
                              <div className="h-[1px] w-8 bg-neutral-900" />
                            </div>
                          </section>

                          {/* Plaza Catalog Segment */}
                          <section className="max-w-7xl mx-auto px-4 sm:px-8 space-y-8">
                            
                            {/* Filtering controls bar */}
                            <div id="catalog-grid-top" className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-neutral-950 pb-6 scroll-mt-24">
                              <div>
                                <span className="font-mono text-[9px] text-[#C9A227] tracking-[0.3em] uppercase block font-semibold mb-1">
                                  ACTIVE CURATION DROPS
                                </span>
                                <h3 className="text-2xl sm:text-3xl font-sans font-black tracking-tight text-white uppercase">
                                  <AnimatedTypography variant="word" text="Summer Solstice Plaza" className="text-white font-black" />
                                </h3>
                              </div>

                              {/* Search & Category tabs */}
                              <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                                {/* Search input */}
                                <div className="relative flex-1 sm:w-64">
                                  <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="SEARCH MODEL PAIRS..."
                                    className="w-full bg-neutral-950 border border-neutral-900 rounded-xl pl-10 pr-4 py-2.5 font-mono text-xs text-white focus:outline-none focus:border-[#C9A227] placeholder-neutral-700 transition-colors uppercase tracking-widest"
                                  />
                                  <Search className="w-4 h-4 text-neutral-600 absolute left-3.5 top-3.5" />
                                </div>

                                {/* Category filter selectors */}
                                <div className="flex gap-1 overflow-x-auto bg-neutral-950 border border-neutral-900 p-1.5 rounded-xl">
                                  {(['All', 'Performance', 'Luxury', 'Limited Drop', 'Futuristic'] as const).map((cat) => (
                                    <button
                                      key={cat}
                                      onClick={() => setCategoryFilter(cat)}
                                      className={`px-3 py-1.5 rounded-lg font-mono text-[9.5px] uppercase tracking-wider whitespace-nowrap transition-all border-0 cursor-pointer ${categoryFilter === cat ? 'bg-[#C9A227] text-black font-extrabold shadow-sm' : 'text-neutral-500 hover:text-neutral-300 hover:bg-neutral-900/40'}`}
                                    >
                                      {cat === 'All' ? 'ALL DROPS' : cat}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Sneaker Grid Layout */}
                            {filteredCatalog.length === 0 ? (
                              <div className="py-24 text-center border border-neutral-900 rounded-2xl">
                                <p className="text-neutral-500 font-mono text-sm uppercase tracking-widest">
                                  NO CORRESPONDING MODEL FOUND MATCHING THE PARAMETERS
                                </p>
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                {filteredCatalog.map((s, idx) => {
                                  const activeCol = cardColors[s.id] || s.colorways[0];
                                  return (
                                    <motion.div
                                      key={s.id}
                                      initial={{ opacity: 0, y: 25 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ delay: idx * 0.08, duration: 0.5 }}
                                      whileHover={{ y: -8 }}
                                      onClick={() => setSelectedSneaker(s)}
                                      className="group bg-neutral-950/40 border border-neutral-900 hover:border-[#C9A227]/40 rounded-3xl p-5 relative overflow-hidden transition-all duration-500 flex flex-col justify-between cursor-pointer select-none hover:shadow-[0_25px_50px_rgba(201,162,39,0.2)]"
                                    >
                                      {/* Top Badge Details */}
                                      <div className="flex justify-between items-center z-10 relative">
                                        <div className="px-2.5 py-0.5 bg-neutral-900/90 border border-neutral-800 rounded-full font-mono text-[7px] uppercase tracking-widest text-[#C9A227] font-extrabold shadow-sm">
                                          {s.category}
                                        </div>
                                        <div className="flex items-center gap-3">
                                          <div className="flex items-center gap-1 font-mono text-[9px] text-neutral-400 font-bold">
                                            <Star className="w-3.5 h-3.5 text-[#C9A227] fill-[#C9A227]" />
                                            <span>{s.rating.toFixed(1)}</span>
                                          </div>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleToggleWishlist(s.id);
                                            }}
                                            className="p-1.5 hover:bg-neutral-900/80 rounded-full transition-colors cursor-pointer text-neutral-500 hover:text-red-500"
                                            title="Save to Wishlist"
                                          >
                                            <Heart className={`w-4 h-4 transition-transform active:scale-125 ${wishlist.includes(s.id) ? 'text-red-500 fill-red-500' : 'text-neutral-500 hover:text-red-400'}`} />
                                          </button>
                                        </div>
                                      </div>

                                      {/* Shoe Main Image Container with premium Studio Lighting */}
                                      <div className="relative w-full h-52 flex items-center justify-center my-4 overflow-hidden rounded-2xl bg-neutral-950 border border-neutral-900 shadow-2xl group/studio select-none">
                                        {/* 1. Extended Background Blur (eliminates letterbox/empty margins by scale & blur) */}
                                        <img
                                          src={activeCol.image}
                                          alt=""
                                          className="absolute inset-0 w-full h-full object-cover scale-[1.75] blur-[28px] opacity-25 saturate-150 brightness-50 pointer-events-none"
                                          referrerPolicy="no-referrer"
                                        />

                                        {/* 2. Softbox Dynamic Studio Lighting Overlay */}
                                        <div 
                                          className="absolute inset-0 transition-all duration-700 ease-out"
                                          style={getStudioLightingStyle(activeCol.hex)}
                                        />

                                        {/* 3. High-Contrast Studio Cove Inner-Shadow */}
                                        <div className="absolute inset-0 rounded-2xl pointer-events-none shadow-[inset_0_4px_30px_rgba(0,0,0,0.92)] border border-white/[0.04] z-10" />

                                        {/* 4. Luxury Ground Reflection */}
                                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-full h-1/3 overflow-hidden opacity-[0.14] pointer-events-none scale-y-[-1] blur-[0.8px] z-0 select-none">
                                          <img
                                            src={activeCol.image}
                                            alt=""
                                            className="w-auto h-full mx-auto object-contain scale-x-[1.1] translate-y-[20%]"
                                            referrerPolicy="no-referrer"
                                          />
                                          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent" />
                                        </div>

                                        {/* 5. Clean, Professional Shadow Drop (soft ambient contact shadow) */}
                                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[70%] h-3 bg-black/65 blur-md rounded-full scale-y-[0.3] opacity-80 pointer-events-none" />

                                        {/* 6. Foreground Shoe Component (scaled 85-90%) */}
                                        <motion.img
                                          key={activeCol.image}
                                          initial={{ scale: 0.8, opacity: 0, y: 5 }}
                                          animate={{ scale: 0.88, opacity: 1, y: 0 }}
                                          whileHover={{ scale: 0.94, rotate: -3, y: -4 }}
                                          transition={{ 
                                            type: 'spring',
                                            stiffness: 150,
                                            damping: 18
                                          }}
                                          src={activeCol.image}
                                          alt={s.name}
                                          className="h-[88%] w-auto max-h-[165px] object-contain brightness-[1.06] contrast-[1.03] drop-shadow-[0_16px_32px_rgba(0,0,0,0.85)] relative z-20 cursor-pointer"
                                          referrerPolicy="no-referrer"
                                        />
                                      </div>

                                      {/* Shoe Information lockup */}
                                      <div className="space-y-1">
                                        <h4 className="text-white font-sans font-black text-sm uppercase tracking-tight group-hover:text-[#C9A227] transition-colors">
                                          {s.name}
                                        </h4>
                                        <p className="text-neutral-500 font-mono text-[9px] uppercase tracking-wider truncate">
                                          {s.tagline}
                                        </p>
                                      </div>

                                      {/* Lower row: Color dots & Purchase action */}
                                      <div className="flex justify-between items-center mt-5 pt-4 border-t border-neutral-900 z-10 relative">
                                        
                                        {/* Small color dot selection preview */}
                                        <div className="flex gap-1.5">
                                          {s.colorways.map((c) => {
                                            const isSelected = activeCol.name === c.name;
                                            return (
                                              <button
                                                key={c.name}
                                                onClick={(e) => handleCardColorSelect(s.id, c, e)}
                                                className={`w-3.5 h-3.5 rounded-full border transition-all ${isSelected ? 'border-[#C9A227] scale-115 shadow-sm' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                                style={{ backgroundColor: c.hex }}
                                                title={c.name}
                                              />
                                            );
                                          })}
                                        </div>

                                        {/* Price indicator & buying buttons */}
                                        <div className="flex items-center gap-3">
                                          <span className="font-sans font-black text-sm text-neutral-300">
                                            ${s.price.toFixed(2)}
                                          </span>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleAddStandardToCart(s, activeCol, s.sizes[0]);
                                            }}
                                            className="px-3 py-1.5 bg-neutral-900 border border-neutral-800 hover:border-[#C9A227] hover:bg-neutral-950 text-white font-mono text-[8px] uppercase tracking-widest rounded-lg transition-all font-bold cursor-pointer"
                                          >
                                            BUY NOW
                                          </button>
                                        </div>

                                      </div>
                                    </motion.div>
                                  );
                                })}
                              </div>
                            )}

                          </section>

                           {/* Kinetic Scroll-Trigger storytelling section */}
                           <KineticScrollStorytelling />

                           {/* Anatomy of ZEROX speed biomechanical display section */}
                          <section className="max-w-7xl mx-auto px-4 sm:px-8">
                            <AnatomyDiagram />
                          </section>

                        </motion.div>
                      );

                    /* VIEW 2: BESPOKE LAB SNEAKER CUSTOMIZER */
                    case 'customizer':
                      return (
                        <motion.div
                          key="customizer"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="px-4 sm:px-8"
                        >
                          <SneakerCustomizer onAddCustomToCart={handleAddCustomToCart} />
                        </motion.div>
                      );

                    /* VIEW 3: BIOMECHANICAL ANATOMY DIAGRAM STANDALONE */
                    case 'anatomy':
                      return (
                        <motion.div
                          key="anatomy"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="px-4 sm:px-8"
                        >
                          <AnatomyDiagram />
                        </motion.div>
                      );

                    /* VIEW 4: VIP CREATORS CLUB PROFILE ACCOUNT PORTAL */
                    case 'vip':
                      return (
                        <motion.div
                          key="vip"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="px-4 sm:px-8"
                        >
                          <LoginPortal
                            user={user}
                            onLogin={handleLogin}
                            onLogout={handleLogout}
                            onViewOrder={(order) => {
                              setActiveOrder(order); // Live pop order certificate view
                            }}
                            initialMode={loginInitialMode}
                          />
                        </motion.div>
                      );

                    /* VIEW 5: ENTERPRISE ADMIN CONTROL DASHBOARD */
                    case 'admin':
                      return (
                        <motion.div
                          key="admin"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="px-4 sm:px-8"
                        >
                          <AdminPanel />
                        </motion.div>
                      );

                    /* VIEW 6: WISHLIST / SAVED GRAILS */
                    case 'wishlist':
                      return (
                        <motion.div
                          key="wishlist"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="max-w-7xl mx-auto px-6 sm:px-12 py-16 space-y-12 min-h-[600px]"
                        >
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-900 pb-6">
                            <div className="space-y-1.5">
                              <h2 className="text-2xl sm:text-4xl font-sans font-black uppercase tracking-tight text-white flex items-center gap-3">
                                <Heart className="w-8 h-8 text-red-500 fill-red-500" />
                                SAVED GRAILS
                              </h2>
                              <p className="font-mono text-xs text-neutral-500 uppercase tracking-widest">
                                Your catalog of curated biomechanical silhouettes
                              </p>
                            </div>
                            <button
                              onClick={() => setActiveView('shop')}
                              className="px-5 py-2.5 bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 rounded-xl font-mono text-xs uppercase text-neutral-300 flex items-center gap-2 cursor-pointer transition-colors"
                            >
                              <ChevronLeft className="w-4 h-4" />
                              Plaza Store
                            </button>
                          </div>

                          {wishlist.length === 0 ? (
                            <div className="py-24 text-center space-y-6 max-w-md mx-auto border border-dashed border-neutral-900 rounded-3xl bg-neutral-950/30 p-8">
                              <Heart className="w-12 h-12 text-neutral-800 mx-auto" />
                              <div className="space-y-1">
                                <h4 className="font-sans font-extrabold text-sm uppercase tracking-wide">NO GRAILS SAVED YET</h4>
                                <p className="font-mono text-[10px] text-neutral-500 uppercase leading-relaxed">
                                  Explore the dynamic curation and tap the heart icon on any model card to queue them for action here.
                                </p>
                              </div>
                              <button
                                onClick={() => setActiveView('shop')}
                                className="px-6 py-3 bg-[#C9A227] hover:bg-amber-500 text-black font-sans font-black text-xs uppercase rounded-xl transition-all duration-300 shadow-[0_4px_15px_rgba(201,162,39,0.2)] cursor-pointer"
                              >
                                EXPLORE MODELS
                              </button>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                              {SNEAKER_CATALOG.filter((s) => wishlist.includes(s.id)).map((s) => {
                                const activeCol = s.colorways[0];
                                return (
                                  <motion.div
                                    key={s.id}
                                    layout
                                    className="bg-neutral-950/40 border border-neutral-900 hover:border-neutral-800 rounded-3xl p-6 relative flex flex-col justify-between group transition-all duration-300"
                                  >
                                    <button
                                      onClick={() => handleToggleWishlist(s.id)}
                                      className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-red-500/10 border border-neutral-850 hover:border-red-500/40 rounded-full cursor-pointer transition-colors text-red-500 group-hover:scale-105 duration-300"
                                    >
                                      <Heart className="w-4.5 h-4.5 fill-red-500" />
                                    </button>

                                    <div className="space-y-4">
                                      <div className="relative w-full h-52 flex items-center justify-center my-4 overflow-hidden rounded-2xl bg-neutral-950 border border-neutral-900 shadow-2xl group/studio select-none">
                                        {/* 1. Extended Background Blur */}
                                        <img
                                          src={activeCol.image}
                                          alt=""
                                          className="absolute inset-0 w-full h-full object-cover scale-[1.75] blur-[28px] opacity-25 saturate-150 brightness-50 pointer-events-none"
                                          referrerPolicy="no-referrer"
                                        />

                                        {/* 2. Softbox Dynamic Studio Lighting Overlay */}
                                        <div 
                                          className="absolute inset-0 transition-all duration-700 ease-out"
                                          style={getStudioLightingStyle(activeCol.hex)}
                                        />

                                        {/* 3. High-Contrast Studio Cove Inner-Shadow */}
                                        <div className="absolute inset-0 rounded-2xl pointer-events-none shadow-[inset_0_4px_30px_rgba(0,0,0,0.92)] border border-white/[0.04] z-10" />

                                        {/* 4. Luxury Ground Reflection */}
                                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-full h-1/3 overflow-hidden opacity-[0.14] pointer-events-none scale-y-[-1] blur-[0.8px] z-0 select-none">
                                          <img
                                            src={activeCol.image}
                                            alt=""
                                            className="w-auto h-full mx-auto object-contain scale-x-[1.1] translate-y-[20%]"
                                            referrerPolicy="no-referrer"
                                          />
                                          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent" />
                                        </div>

                                        {/* 5. Clean, Professional Shadow Drop */}
                                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[70%] h-3 bg-black/65 blur-md rounded-full scale-y-[0.3] opacity-80 pointer-events-none" />

                                        {/* 6. Foreground Shoe Component */}
                                        <motion.img
                                          key={activeCol.image}
                                          initial={{ scale: 0.8, opacity: 0, y: 5 }}
                                          animate={{ scale: 0.88, opacity: 1, y: 0 }}
                                          whileHover={{ scale: 0.94, rotate: -3, y: -4 }}
                                          transition={{ 
                                            type: 'spring',
                                            stiffness: 150,
                                            damping: 18
                                          }}
                                          src={activeCol.image}
                                          alt={s.name}
                                          className="h-[88%] w-auto max-h-[165px] object-contain brightness-[1.06] contrast-[1.03] drop-shadow-[0_16px_32px_rgba(0,0,0,0.85)] relative z-20 cursor-pointer"
                                          referrerPolicy="no-referrer"
                                        />
                                      </div>

                                      <div className="space-y-1">
                                        <span className="font-mono text-[8px] text-[#C9A227] tracking-widest font-extrabold uppercase">
                                          {s.category}
                                        </span>
                                        <h3 className="font-sans font-bold text-base text-white uppercase tracking-tight">
                                          {s.name}
                                        </h3>
                                        <p className="font-mono text-[10px] text-neutral-500 uppercase truncate">
                                          {s.tagline}
                                        </p>
                                      </div>

                                      <div className="flex justify-between items-center pt-2">
                                        <span className="font-mono text-sm font-black text-[#C9A227]">
                                          ${s.price.toFixed(2)}
                                        </span>
                                        <button
                                          onClick={() => {
                                            handleAddStandardToCart(s, activeCol, s.sizes[0]);
                                            setIsCartOpen(true);
                                          }}
                                          className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-850 rounded-xl text-white font-mono text-[10px] uppercase font-bold cursor-pointer transition-colors"
                                        >
                                          ADD TO BAG
                                        </button>
                                      </div>
                                    </div>
                                  </motion.div>
                                );
                              })}
                            </div>
                          )}
                        </motion.div>
                      );

                    /* VIEW 7: CUSTOMER DASHBOARD */
                    case 'dashboard':
                      return (
                        <motion.div
                          key="dashboard"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="w-full"
                        >
                          <CustomerDashboard user={user} onLogout={() => setUser({ ...user, loggedIn: false })} />
                        </motion.div>
                      );

                    default:
                      return null;
                  }
                })()
              )}

            </AnimatePresence>
          </main>

          {/* Floating Wayfinder Developer Console */}
          <WayfinderConsole
            cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
            wishlistCount={wishlist.length}
            onNavigate={(route) => {
              if (route.view === 'wishlist') {
                setActiveView('wishlist');
                setActiveOrder(null);
                setIsCartOpen(false);
              } else if (route.view === 'shop') {
                setActiveView('shop');
                setActiveOrder(null);
                if (route.selectProduct) {
                  setSelectedSneaker(SNEAKER_CATALOG[0]);
                  setIsCartOpen(false);
                } else if (route.openCart) {
                  setIsCartOpen(true);
                  if (route.checkoutStep) {
                    setCartInitialStep(route.checkoutStep);
                  }
                } else {
                  setIsCartOpen(false);
                  setSelectedSneaker(null);
                }
              } else if (route.view === 'vip') {
                setActiveView('vip');
                setActiveOrder(null);
                setIsCartOpen(false);
                setSelectedSneaker(null);
                
                if (route.loggedInState !== undefined) {
                  setUser(prev => ({
                    ...prev,
                    loggedIn: route.loggedInState!
                  }));
                }
                if (route.loginMode) {
                  setLoginInitialMode(route.loginMode);
                }
              } else {
                setActiveView(route.view);
                setActiveOrder(null);
                setIsCartOpen(false);
                setSelectedSneaker(null);
              }
            }}
          />

          {/* Clean Spacious Editorial Footer */}
          <Footer />
        </>
      )}

    </div>
  );
}
