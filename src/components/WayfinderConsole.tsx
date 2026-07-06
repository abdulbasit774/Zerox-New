import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Navigation, ShoppingBag, CreditCard, User, LogIn, UserPlus, 
  ShieldAlert, Heart, ClipboardList, Award, Sliders, ChevronRight, X, Sparkles, Star
} from 'lucide-react';

interface WayfinderConsoleProps {
  onNavigate: (route: {
    view: 'shop' | 'customizer' | 'anatomy' | 'vip' | 'admin' | 'wishlist';
    openCart?: boolean;
    checkoutStep?: 'cart' | 'shipping' | 'payment';
    selectProduct?: boolean;
    loginMode?: 'login' | 'signup';
    loggedInState?: boolean;
  }) => void;
  cartCount: number;
  wishlistCount: number;
}

export default function WayfinderConsole({ onNavigate, cartCount, wishlistCount }: WayfinderConsoleProps) {
  const [isOpen, setIsOpen] = useState(false);

  const testRoutes = [
    {
      id: 'shop',
      title: '1. Plaza Store (Shop)',
      desc: 'Browse dynamic curation catalog & filters.',
      icon: <ShoppingBag className="w-4 h-4 text-amber-500" />,
      action: () => onNavigate({ view: 'shop', openCart: false })
    },
    {
      id: 'product-details',
      title: '2. Sneaker Spec (Product Details)',
      desc: 'Open unreleased 3D model drawer details.',
      icon: <Star className="w-4 h-4 text-[#C9A227]" />,
      action: () => onNavigate({ view: 'shop', selectProduct: true })
    },
    {
      id: 'cart',
      title: '3. Secure Bag (Cart)',
      desc: 'Slide out transactional cart drawer.',
      icon: <ShoppingBag className="w-4 h-4 text-emerald-400" />,
      action: () => onNavigate({ view: 'shop', openCart: true, checkoutStep: 'cart' })
    },
    {
      id: 'checkout',
      title: '4. Checkout Terminal',
      desc: 'Execute payments & simulate declines.',
      icon: <CreditCard className="w-4 h-4 text-blue-400" />,
      action: () => onNavigate({ view: 'shop', openCart: true, checkoutStep: 'shipping' })
    },
    {
      id: 'login',
      title: '5. Login Terminal',
      desc: 'Sign in via secure email or phone credentials.',
      icon: <LogIn className="w-4 h-4 text-[#C9A227]" />,
      action: () => onNavigate({ view: 'vip', loggedInState: false, loginMode: 'login' })
    },
    {
      id: 'register',
      title: '6. Register Ledger',
      desc: 'Establish new accounts in Firebase Firestore.',
      icon: <UserPlus className="w-4 h-4 text-purple-400" />,
      action: () => onNavigate({ view: 'vip', loggedInState: false, loginMode: 'signup' })
    },
    {
      id: 'dashboard',
      title: '7. Creators VIP (Dashboard)',
      desc: 'Access rank tracking, streak values & logs.',
      icon: <Award className="w-4 h-4 text-amber-400" />,
      action: () => onNavigate({ view: 'vip', loggedInState: true })
    },
    {
      id: 'admin',
      title: '8. Apex Console (Admin)',
      desc: 'Manage inventory, stock, coupons & orders.',
      icon: <Sliders className="w-4 h-4 text-rose-500" />,
      action: () => onNavigate({ view: 'admin' })
    },
    {
      id: 'wishlist',
      title: '9. Saved Grails (Wishlist)',
      desc: 'Review and cart saved sneaker models.',
      icon: <Heart className="w-4 h-4 text-red-500 fill-red-500/20" />,
      action: () => onNavigate({ view: 'wishlist' })
    },
    {
      id: 'orders',
      title: '10. Orders Registry',
      desc: 'Review order nodes and validate certificates.',
      icon: <ClipboardList className="w-4 h-4 text-indigo-400" />,
      action: () => onNavigate({ view: 'vip', loggedInState: true })
    },
    {
      id: 'profile',
      title: '11. Profile & Biometric KYC',
      desc: 'Manage membership & submit KYC passport files.',
      icon: <User className="w-4 h-4 text-teal-400" />,
      action: () => onNavigate({ view: 'vip', loggedInState: true })
    }
  ];

  return (
    <>
      {/* Floating Launcher Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="h-12 px-4 bg-gradient-to-r from-neutral-950 to-neutral-900 border border-[#C9A227]/40 hover:border-[#C9A227] text-[#C9A227] rounded-full flex items-center gap-2.5 shadow-[0_8px_30px_rgba(201,162,39,0.15)] cursor-pointer group"
        >
          <div className="relative flex items-center justify-center">
            <Navigation className={`w-4 h-4 transition-transform duration-500 ${isOpen ? 'rotate-90 text-white' : ''}`} />
            {!isOpen && (
              <span className="absolute top-0 right-0 h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </div>
          <span className="font-mono text-[9px] tracking-[0.2em] font-extrabold uppercase">
            {isOpen ? 'CLOSE WAYFINDER' : 'ROUTE NAVIGATOR'}
          </span>
        </motion.button>
      </div>

      {/* Slide-out Wayfinder Control Panel Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-22 right-6 z-50 w-80 sm:w-96 max-h-[580px] bg-black/95 backdrop-blur-md border border-neutral-800 rounded-3xl p-5 shadow-3xl flex flex-col justify-between overflow-hidden select-none text-white"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(201,162,39,0.03)_0%,transparent_60%)] pointer-events-none" />

            {/* Header segment */}
            <div className="flex justify-between items-center border-b border-neutral-900 pb-3.5 mb-3.5 relative z-10">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#C9A227] animate-pulse" />
                <div>
                  <h4 className="text-[11px] font-sans font-black uppercase tracking-wider text-white">ROUTE COMPLIANCE MATRIX</h4>
                  <span className="font-mono text-[7px] text-neutral-500 uppercase tracking-widest">Verify 11/11 app routes instantly</span>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-neutral-900 rounded-full transition-colors cursor-pointer text-neutral-500 hover:text-white"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Routes List Container */}
            <div className="flex-1 space-y-1.5 overflow-y-auto max-h-[380px] pr-1.5 relative z-10 scrollbar-thin">
              {testRoutes.map((route) => (
                <button
                  key={route.id}
                  onClick={() => {
                    route.action();
                    setIsOpen(false);
                  }}
                  className="w-full text-left p-2.5 bg-neutral-900/30 hover:bg-neutral-900 border border-neutral-900 hover:border-neutral-850 rounded-xl flex items-center justify-between gap-3 group transition-all duration-300 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-black rounded-lg border border-neutral-800 flex items-center justify-center shrink-0 transition-colors group-hover:border-[#C9A227]/30">
                      {route.icon}
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-sans font-bold text-white uppercase block group-hover:text-[#C9A227] transition-colors">
                        {route.title}
                      </span>
                      <p className="font-mono text-[8px] text-neutral-500 uppercase group-hover:text-neutral-400 transition-colors">
                        {route.desc}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-neutral-600 group-hover:text-[#C9A227] group-hover:translate-x-0.5 transition-all" />
                </button>
              ))}
            </div>

            {/* Status indicators footer */}
            <div className="mt-4 pt-3 border-t border-neutral-900 flex justify-between items-center text-neutral-500 font-mono text-[7.5px] uppercase tracking-wider relative z-10">
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>PREVIEW VERIFIED ACTIVE</span>
              </div>
              <span className="text-[#C9A227] font-bold">11/11 INTERLOCKED</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
