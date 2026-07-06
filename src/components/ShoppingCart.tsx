import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Minus, ShoppingCart as CartIcon, Heart, Trash2, Gift } from 'lucide-react';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  color?: string;
  size?: string;
}

interface ShoppingCartProps {
  items: CartItem[];
  couponCode?: string;
  onAddItem?: (item: CartItem) => void;
  onRemoveItem?: (itemId: string) => void;
  onUpdateQuantity?: (itemId: string, quantity: number) => void;
  onApplyCoupon?: (code: string) => void;
  onCheckout?: () => void;
}

export default function ShoppingCart({
  items,
  couponCode,
  onAddItem,
  onRemoveItem,
  onUpdateQuantity,
  onApplyCoupon,
  onCheckout
}: ShoppingCartProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);

  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
  const shipping = subtotal > 100 ? 0 : 10;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax - appliedDiscount;

  const handleApplyCoupon = () => {
    if (couponInput.toUpperCase() === 'SAVE10') {
      setAppliedDiscount(subtotal * 0.1);
      onApplyCoupon?.(couponInput);
      setCouponInput('');
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-40">
      {/* Cart Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-14 h-14 bg-[#C9A227] hover:bg-amber-500 text-black rounded-full flex items-center justify-center font-bold shadow-lg transition-all hover:scale-110"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <CartIcon className="w-6 h-6" />
        {items.length > 0 && (
          <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {items.length}
          </span>
        )}
      </motion.button>

      {/* Cart Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />

            {/* Cart Panel */}
            <motion.div
              initial={{ opacity: 0, x: 400 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 400 }}
              className="fixed right-0 top-0 h-screen w-96 bg-black border-l border-neutral-900 z-50 flex flex-col shadow-2xl"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-neutral-950 to-black border-b border-neutral-900 p-6 flex items-center justify-between">
                <h2 className="font-sans text-xl font-black text-white">Shopping Cart</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-neutral-900 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Items */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <CartIcon className="w-12 h-12 text-neutral-600 mb-4" />
                    <p className="font-mono text-sm text-neutral-400 mb-2">CART EMPTY</p>
                    <p className="text-xs text-neutral-500">Add items to get started</p>
                  </div>
                ) : (
                  items.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-neutral-950/50 border border-neutral-900 rounded-xl p-3 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="font-sans font-semibold text-white text-sm">{item.name}</p>
                          {item.color && (
                            <p className="text-xs text-neutral-500 mt-1">{item.color}</p>
                          )}
                          {item.size && (
                            <p className="text-xs text-neutral-500">Size: {item.size}</p>
                          )}
                        </div>
                        <button
                          onClick={() => onRemoveItem?.(item.id)}
                          className="p-1 hover:bg-red-900/20 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <p className="font-sans font-bold text-[#C9A227]">${(item.price * item.quantity).toFixed(2)}</p>
                        <div className="flex items-center gap-2 bg-neutral-900 rounded-lg p-1">
                          <button
                            onClick={() => onUpdateQuantity?.(item.id, Math.max(1, item.quantity - 1))}
                            className="p-1 hover:bg-neutral-800 rounded transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => onUpdateQuantity?.(item.id, item.quantity + 1)}
                            className="p-1 hover:bg-neutral-800 rounded transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Coupon & Summary */}
              {items.length > 0 && (
                <>
                  {/* Coupon Input */}
                  <div className="border-t border-neutral-900 p-6 space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Coupon Code"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white text-sm placeholder-neutral-600 focus:border-[#C9A227] focus:outline-none"
                      />
                      <button
                        onClick={handleApplyCoupon}
                        className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-white rounded-lg font-mono text-xs font-semibold uppercase cursor-pointer transition-colors"
                      >
                        Apply
                      </button>
                    </div>
                    <p className="text-[10px] text-neutral-600">Try: SAVE10</p>

                    {/* Summary */}
                    <div className="space-y-2 pt-3 border-t border-neutral-900">
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-400">Subtotal:</span>
                        <span className="font-semibold">${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-400">Shipping:</span>
                        <span className="font-semibold">
                          {shipping === 0 ? <span className="text-emerald-400">FREE</span> : `$${shipping.toFixed(2)}`}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-400">Tax:</span>
                        <span className="font-semibold">${tax.toFixed(2)}</span>
                      </div>
                      {appliedDiscount > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-emerald-400">Discount:</span>
                          <span className="font-semibold text-emerald-400">-${appliedDiscount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-lg border-t border-neutral-900 pt-2">
                        <span className="font-semibold">Total:</span>
                        <span className="font-bold text-[#C9A227]">${total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <div className="border-t border-neutral-900 p-6 space-y-2">
                    <button
                      onClick={() => {
                        onCheckout?.();
                        setIsOpen(false);
                      }}
                      className="w-full py-3 bg-[#C9A227] hover:bg-amber-500 text-black rounded-xl font-mono text-sm font-bold tracking-wider uppercase cursor-pointer transition-colors"
                    >
                      Proceed to Checkout
                    </button>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="w-full py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-white rounded-xl font-mono text-xs font-semibold tracking-wider uppercase cursor-pointer transition-colors"
                    >
                      Continue Shopping
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
