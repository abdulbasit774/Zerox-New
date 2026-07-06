import React, { useState } from 'react';
import { ShoppingBag, User, Menu, X, ShieldAlert, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CartItem, UserProfile } from '../types';
import Logo from './Logo';

interface NavbarProps {
  cartItems: CartItem[];
  user: UserProfile;
  activeView: 'shop' | 'customizer' | 'anatomy' | 'vip' | 'admin' | 'order-confirmation' | 'dashboard' | 'wishlist';
  onViewChange: (view: 'shop' | 'customizer' | 'anatomy' | 'vip' | 'admin' | 'dashboard' | 'wishlist') => void;
  onOpenCart: () => void;
}

export default function Navbar({
  cartItems,
  user,
  activeView,
  onViewChange,
  onOpenCart
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const totalCartQty = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const navLinks = [
    { id: 'shop', label: 'PLAZA STORE' },
    { id: 'customizer', label: 'ZEROX LAB' },
    { id: 'anatomy', label: 'ANATOMY BIOMECH' },
    { id: 'vip', label: 'CREATORS VIP' },
    { id: 'admin', label: 'ADMIN CONTROL' }
  ] as const;

  const handleLinkClick = (id: 'shop' | 'customizer' | 'anatomy' | 'vip' | 'admin' | 'dashboard' | 'wishlist') => {
    onViewChange(id);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-black/70 backdrop-blur-md border-b border-neutral-950 px-4 sm:px-8 py-4 select-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Brand Logo - Left (Horizontal combination) */}
          <button
            onClick={() => handleLinkClick('shop')}
            className="flex items-center gap-1 bg-transparent border-0 cursor-pointer focus:outline-none"
          >
            <Logo variant="horizontal" className="h-8 hover:scale-105 transition-transform duration-300" />
          </button>

          {/* Desktop Navigation Links - Center */}
          <nav className="hidden md:flex items-center gap-8 font-mono text-xs tracking-[0.2em] font-semibold">
            {navLinks.map((link) => {
              const isActive = activeView === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleLinkClick(link.id)}
                  className={`relative py-1 border-0 bg-transparent cursor-pointer transition-colors ${isActive ? 'text-[#C9A227] font-black' : 'text-neutral-400 hover:text-white'}`}
                >
                  {link.label}
                  {isActive && (
                    <motion.span
                      layoutId="active-nav-tab"
                      className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#C9A227] rounded-full"
                      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* User & Cart controls - Right */}
          <div className="flex items-center gap-4">
            
            {/* VIP Status Indicator (Desktop only) */}
            {user.loggedIn && (
              <button
                onClick={() => handleLinkClick('vip')}
                className="hidden lg:flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-neutral-900 to-black border border-[#C9A227]/30 rounded-full font-mono text-[8px] uppercase tracking-widest text-[#C9A227] font-bold"
              >
                <Award className="w-3 h-3 text-[#C9A227]" />
                {user.membershipTier}
              </button>
            )}

            {/* VIP User Account Trigger */}
            <button
              onClick={() => handleLinkClick('dashboard')}
              className={`p-2 rounded-full border bg-transparent cursor-pointer transition-all flex items-center justify-center relative ${user.loggedIn ? 'border-[#C9A227] text-[#C9A227] hover:bg-[#C9A227]/10' : 'border-neutral-900 text-neutral-400 hover:text-white hover:border-neutral-700'}`}
            >
              <User className="w-4.5 h-4.5" />
              {user.loggedIn && (
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-emerald-400 animate-pulse border border-black" />
              )}
            </button>

            {/* Secure Cart Indicator Bag */}
            <button
              onClick={onOpenCart}
              className="p-2 border border-neutral-900 hover:border-neutral-700 rounded-full text-neutral-400 hover:text-white bg-transparent cursor-pointer transition-all flex items-center justify-center relative"
            >
              <ShoppingBag className="w-4.5 h-4.5" />
              {totalCartQty > 0 && (
                <span className="absolute -top-1 -right-1 h-4 min-w-4 rounded-full bg-gradient-to-r from-amber-600 to-[#C9A227] text-black font-mono text-[9px] font-black flex items-center justify-center px-1 border border-black animate-bounce shadow-md">
                  {totalCartQty}
                </span>
              )}
            </button>

            {/* Mobile Drawer Trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 md:hidden border border-neutral-900 rounded-full text-neutral-400 hover:text-white bg-transparent cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-4.5 h-4.5" /> : <Menu className="w-4.5 h-4.5" />}
            </button>

          </div>

        </div>
      </header>

      {/* Mobile Drawer Navigation Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-30 bg-black/98 flex flex-col justify-between p-8 pt-28 md:hidden select-none"
          >
            <div className="space-y-6 flex flex-col">
              <span className="font-mono text-[9px] text-[#C9A227] tracking-[0.3em] uppercase block font-semibold border-b border-neutral-900 pb-2">
                ZEROX DIRECTORY
              </span>
              <div className="flex flex-col gap-4">
                {navLinks.map((link, idx) => {
                  const isActive = activeView === link.id;
                  return (
                    <motion.button
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 + 0.1 }}
                      key={link.id}
                      onClick={() => handleLinkClick(link.id)}
                      className={`text-left font-sans font-black tracking-wider text-xl uppercase py-1.5 bg-transparent border-0 cursor-pointer transition-colors ${isActive ? 'text-[#C9A227]' : 'text-neutral-400 hover:text-white'}`}
                    >
                      {link.label}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="space-y-4"
            >
              {user.loggedIn ? (
                <div className="flex items-center gap-3 p-4 bg-neutral-900/40 border border-neutral-900 rounded-2xl">
                  <div className="w-10 h-10 bg-neutral-950 rounded-full border border-[#C9A227] flex items-center justify-center text-[#C9A227] font-black text-sm">
                    {user.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-white font-sans font-bold text-xs">{user.name}</h4>
                    <span className="font-mono text-[8px] text-[#C9A227] tracking-wider uppercase">{user.membershipTier} Member</span>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => handleLinkClick('vip')}
                  className="w-full bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-white font-mono text-xs tracking-widest uppercase py-3 rounded-xl cursor-pointer"
                >
                  ACCESS MEMBERSHIP TERMINAL
                </button>
              )}
              <div className="text-center font-mono text-[7px] text-neutral-600 tracking-widest uppercase">
                🔒 CONNECTED VIA SECURE REGIONAL PLAZA NODE NYC.
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
