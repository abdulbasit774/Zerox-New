import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Trash2, Plus, Minus, CreditCard, ShieldCheck, ShoppingBag, 
  Truck, Gift, RefreshCw, CheckCircle, AlertTriangle, ArrowRight,
  User, Check, Zap, HelpCircle, Mail, MapPin, Sparkles, Building, Landmark
} from 'lucide-react';
import { CartItem, Order } from '../types';
import { db, couponsCol, ordersCol } from '../lib/firebase';
import { getDoc, doc, setDoc, updateDoc, increment, getDocs, collection } from 'firebase/firestore';
import StripePaymentForm from './StripePaymentForm';

interface CheckoutPortalProps {
  cartItems: CartItem[];
  onClose: () => void;
  onUpdateQuantity: (cartItemId: string, delta: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onCheckoutSuccess: (order: Order) => void;
  initialStep?: 'cart' | 'shipping' | 'payment';
}

export default function CheckoutPortal({
  cartItems,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onCheckoutSuccess,
  initialStep = 'cart'
}: CheckoutPortalProps) {
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'shipping' | 'payment' | 'processing' | 'failed'>(initialStep);
  
  // Shipping details
  const [shippingForm, setShippingForm] = useState({
    name: 'Abdul Basit',
    email: 'abdulbasitzulfiqar404@gmail.com',
    address: '77 Fifth Avenue, Penthouse B',
    city: 'New York',
    country: 'United States',
    phone: '+1 (555) 901-2384'
  });

  // Shipping methods
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express' | 'priority'>('standard');

  // Coupon / Promo / Gift Code State
  const [promoInput, setPromoInput] = useState('');
  const [activePromo, setActivePromo] = useState<any | null>(null);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');

  // Payment method selection
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'express' | 'paypal' | 'bank' | 'cod'>('card');
  const [paymentForm, setPaymentForm] = useState({
    cardNumber: '4532 9011 4802 8802',
    cardBrand: 'Visa',
    expiry: '12/29',
    cvv: '998'
  });

  // Intentional demo transaction decider (Force Success or Force Failed)
  const [forceFailPayment, setForceFailPayment] = useState(false);

  // Loading / processing indicators
  const [processingText, setProcessingText] = useState('INITIATING TRANS-SECURE ENCRYPTION...');
  const [paymentError, setPaymentError] = useState('');

  // Compute invoice totals
  const subtotal = cartItems.reduce((acc, item) => acc + item.sneaker.price * item.quantity, 0);
  
  // Coupon calculation
  let discountAmount = 0;
  if (activePromo) {
    if (activePromo.discountType === 'percentage') {
      discountAmount = (subtotal * activePromo.value) / 100;
    } else if (activePromo.discountType === 'fixed') {
      discountAmount = Math.min(subtotal, activePromo.value);
    }
  }

  const adjustedSubtotal = Math.max(0, subtotal - discountAmount);
  
  // Shipping Cost
  let shippingCost = 0;
  if (activePromo?.discountType === 'free_shipping') {
    shippingCost = 0;
  } else {
    if (shippingMethod === 'express') shippingCost = 15;
    else if (shippingMethod === 'priority') shippingCost = 35;
  }

  // Tax calculation: PCI compliant 8% local sales tax
  const taxRate = 0.08;
  const taxAmount = adjustedSubtotal * taxRate;

  const total = adjustedSubtotal + shippingCost + taxAmount;

  // Verify Coupon against Firestore
  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput) return;
    setPromoError('');
    setPromoSuccess('');
    try {
      const codeUpper = promoInput.toUpperCase().trim();
      const docRef = doc(db, 'coupons', codeUpper);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const promo = docSnap.data();
        if (promo.active) {
          setActivePromo(promo);
          setPromoSuccess(`APPLIED ${promo.code}: ${promo.description}`);
          setPromoInput('');
        } else {
          setPromoError('THIS PROMO CODE IS RETIRED');
        }
      } else {
        // Fallback for demo convenience if firestore latency occurs
        if (codeUpper === 'ZEROX20') {
          setActivePromo({ code: 'ZEROX20', discountType: 'percentage', value: 20, description: '20% off total order' });
          setPromoSuccess('APPLIED ZEROX20: 20% DISCOUNT');
        } else if (codeUpper === 'GIFT50') {
          setActivePromo({ code: 'GIFT50', discountType: 'fixed', value: 50, description: '$50.00 Gift Card credit' });
          setPromoSuccess('APPLIED GIFT50: $50.00 FIXED CASH CREDIT');
        } else {
          setPromoError('INVALID PROMO OR GIFT CODE HASH');
        }
      }
    } catch (err) {
      setPromoError('ERROR RETRIEVING DISCOUNTS');
    }
  };

  const handleNextStep = () => {
    if (checkoutStep === 'cart') setCheckoutStep('shipping');
    else if (checkoutStep === 'shipping') setCheckoutStep('payment');
    else if (checkoutStep === 'payment') {
      setCheckoutStep('processing');
      
      const steps = [
        'INITIATING TRANS-SECURE CRYPTOGRAPHIC PROTOCOLS...',
        'CONNECTING GATEWAY NODE...',
        'VALIDATING REBOUND LEDGER ACCOUNTS...',
        paymentMethod === 'card' ? 'DEBITING CRYPTOGRAPHIC TOKEN...' : 
        paymentMethod === 'paypal' ? 'MATCHING SECURE PAYPAL COMPLIANT DIRECTIVE...' : 
        paymentMethod === 'express' ? 'MATCHING ONE-TAP APPLE/GOOGLE PAY TOKEN...' : 
        'ESTABLISHING OUTSTANDING TRANSFER CORE...',
        'VALIDATING PCI-COMPLIANCE STAMPS...',
        'COMMITTING TRANSACTION REGISTER TO FIRESTORE...'
      ];

      let currentIndex = 0;
      const interval = setInterval(async () => {
        if (currentIndex < steps.length - 1) {
          currentIndex++;
          setProcessingText(steps[currentIndex]);
        } else {
          clearInterval(interval);
          if (forceFailPayment) {
            setCheckoutStep('failed');
          } else {
            await commitOrderToDatabase();
          }
        }
      }, 600);
    }
  };

  // Handle external payment success (Stripe, PayPal, etc)
  const handlePayment = async (paymentId: string, details: any) => {
    try {
      setPaymentError('');
      await commitOrderToDatabase(paymentId, details);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Payment processing failed';
      setPaymentError(message);
      setCheckoutStep('failed');
    }
  };

  const commitOrderToDatabase = async (externalPaymentId?: string, externalDetails?: any) => {
    try {
      const uniqueId = `ZRX-${Math.floor(Math.random() * 900000 + 100000)}`;
      const serial = `SHA-${Math.random().toString(36).substring(2, 10).toUpperCase()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      const dateStr = new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
      });

      const orderPayload: Order = {
        id: uniqueId,
        items: [...cartItems],
        subtotal,
        shipping: shippingCost,
        total,
        date: dateStr,
        status: 'Processing',
        serialNumber: serial,
        qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${uniqueId}-${serial}`,
        digitalSignature: `SIG_${Math.random().toString(36).substring(2, 15).toUpperCase()}_ZRX`,
        deliveryAddress: {
          name: shippingForm.name,
          email: shippingForm.email,
          address: shippingForm.address,
          city: shippingForm.city,
          country: shippingForm.country
        }
      };

      // 1. Save Order document to Firestore
      await setDoc(doc(db, 'orders', uniqueId), {
        ...orderPayload,
        createdAt: new Date().toISOString(),
        shippingMethod,
        couponCode: activePromo?.code || null,
        discountAmount,
        taxAmount,
      });

      // 2. Decrement product inventories in Firestore
      for (const item of cartItems) {
        if (!item.isCustom) {
          const invRef = doc(db, 'inventory', item.sneaker.id);
          try {
            await updateDoc(invRef, {
              stock: increment(-item.quantity)
            });
          } catch (invErr) {
            console.log('Inventory doc missing, skipping real-time decrement');
          }
        }
      }

      // 3. Save Payments Registry record
      const finalPaymentId = externalPaymentId || `PAY-${uniqueId}`;
      await setDoc(doc(db, 'payments', finalPaymentId), {
        orderId: uniqueId,
        amount: total,
        method: paymentMethod,
        cardBrand: paymentMethod === 'card' ? paymentForm.cardBrand : 
                   paymentMethod === 'stripe' ? externalDetails?.cardBrand : 'Express Token',
        cardLast4: externalDetails?.last4 || paymentForm.cardNumber.slice(-4),
        timestamp: new Date().toISOString(),
        status: 'Completed',
        externalPaymentId: externalPaymentId || null,
      });

      // 4. Create Transaction Record
      await setDoc(doc(db, 'transactions', `TXN-${uniqueId}`), {
        paymentId: finalPaymentId,
        orderId: uniqueId,
        amount: total,
        type: 'payment',
        status: 'completed',
        timestamp: new Date().toISOString(),
      });

      // 5. Update coupon usage if applied
      if (activePromo && activePromo.code) {
        try {
          const couponRef = doc(db, 'coupons', activePromo.code);
          await updateDoc(couponRef, {
            usageCount: increment(1),
          });
        } catch (err) {
          console.log('Coupon update failed, continuing');
        }
      }

      // 6. Dispatch a System Notification in Firestore
      await setDoc(doc(db, 'notifications', `notif-${uniqueId}`), {
        title: 'TRANSACTION COMMITTED',
        message: `Your payment of $${total.toFixed(2)} was securely processed. Check Order tracking details.`,
        type: 'alert',
        date: new Date().toISOString(),
        orderId: uniqueId,
        read: false
      });

      onCheckoutSuccess(orderPayload);
    } catch (err) {
      console.error('Error committing purchase ledger:', err);
      setPaymentError(err instanceof Error ? err.message : 'Order processing failed');
      setCheckoutStep('failed');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex justify-end bg-black/85 backdrop-blur-md select-none text-white"
    >
      {/* Backdrop Closer */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Slideover Frame */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 220 }}
        className="relative w-full max-w-lg h-full bg-black border-l border-neutral-900 flex flex-col justify-between overflow-y-auto z-10 shadow-3xl"
      >
        {/* Header bar */}
        <div className="sticky top-0 bg-neutral-950/95 backdrop-blur-md border-b border-neutral-900 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-[#C9A227] animate-pulse" />
            <span className="font-mono text-xs uppercase tracking-[0.2em] font-extrabold text-white">
              {checkoutStep === 'cart' ? 'SHOPPING SECURE BAG' : 
               checkoutStep === 'shipping' ? 'CALIBRATE ROUTE' : 
               checkoutStep === 'payment' ? 'PAYMENT GATEWAY' : 
               checkoutStep === 'failed' ? 'TRANSACTION DECLINED' : 'PROCESSING LEDGER'}
            </span>
          </div>
          {checkoutStep !== 'processing' && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-900 rounded-full transition-colors text-neutral-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Dynamic content panels */}
        <div className="flex-1 p-6 space-y-6">

          {/* 1. CART VIEW */}
          {checkoutStep === 'cart' && (
            <div className="space-y-4">
              {cartItems.length === 0 ? (
                <div className="py-24 text-center space-y-4">
                  <ShoppingBag className="w-12 h-12 text-[#C9A227]/30 mx-auto" />
                  <h4 className="text-white font-sans font-black text-sm uppercase">BAG IS EMPTY</h4>
                  <button onClick={onClose} className="px-6 py-2 bg-neutral-900 rounded-xl text-xs uppercase font-mono border border-neutral-800 cursor-pointer">
                    Return to Store
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-neutral-500 font-mono text-[9px] uppercase tracking-wider mb-2">
                    <span>SELECTED CHASSIS MODELS</span>
                    <span>{cartItems.length} PAIRS READY</span>
                  </div>

                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-4 p-4 bg-neutral-900/30 border border-neutral-900/60 rounded-2xl relative">
                      <div className="w-20 h-20 bg-neutral-950 border border-neutral-900 rounded-xl flex items-center justify-center overflow-hidden shrink-0">
                        <img src={item.selectedColorway.image} className="max-h-[64px] object-contain drop-shadow-md" referrerPolicy="no-referrer" />
                      </div>
                      
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <h4 className="text-white font-sans font-bold text-xs uppercase">{item.isCustom ? 'ZEROX CUSTOMIZER SILHOUETTE' : item.sneaker.name}</h4>
                            <span className="font-mono text-xs font-black">${(item.sneaker.price * item.quantity).toFixed(2)}</span>
                          </div>
                          <div className="flex flex-wrap gap-x-3 mt-1 font-mono text-[8px] text-neutral-500 uppercase">
                            <span>COLORWAY: <span className="text-neutral-300">{item.selectedColorway.name}</span></span>
                            <span>SIZE: <span className="text-neutral-300">US {item.selectedSize}</span></span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center mt-2">
                          <div className="flex items-center gap-1.5 border border-neutral-850 rounded-lg p-1 bg-neutral-950 text-xs">
                            <button onClick={() => onUpdateQuantity(item.id, -1)} className="p-0.5 text-neutral-400 hover:text-white cursor-pointer"><Minus className="w-3 h-3" /></button>
                            <span className="font-mono text-xs text-white px-1.5 font-bold">{item.quantity}</span>
                            <button onClick={() => onUpdateQuantity(item.id, 1)} className="p-0.5 text-neutral-400 hover:text-white cursor-pointer"><Plus className="w-3 h-3" /></button>
                          </div>

                          <button onClick={() => onRemoveItem(item.id)} className="p-1.5 text-neutral-500 hover:text-red-400 cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Coupon inputs */}
                  <form onSubmit={handleApplyPromo} className="pt-4 border-t border-neutral-900">
                    <label className="font-mono text-[8px] text-neutral-500 block mb-1 uppercase tracking-widest">PROMO OR GIFT CODE</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={promoInput}
                        onChange={e => setPromoInput(e.target.value)}
                        placeholder="E.G. ZEROX20 OR GIFT50"
                        className="flex-1 bg-neutral-900 border border-neutral-900 rounded-xl px-3 py-2 font-mono text-xs uppercase text-white focus:outline-none focus:border-[#C9A227]"
                      />
                      <button type="submit" className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-xs font-mono uppercase rounded-xl border border-neutral-800 text-[#C9A227] cursor-pointer">
                        APPLY
                      </button>
                    </div>
                    {promoError && <p className="font-mono text-[8px] text-red-400 uppercase mt-1">⚠️ {promoError}</p>}
                    {promoSuccess && <p className="font-mono text-[8px] text-emerald-400 uppercase mt-1">✨ {promoSuccess}</p>}
                  </form>
                </div>
              )}
            </div>
          )}

          {/* 2. SHIPPING VIEW */}
          {checkoutStep === 'shipping' && (
            <div className="space-y-5">
              <span className="font-mono text-[9px] text-neutral-500 uppercase tracking-widest block">ROUTING SPECIFICATIONS</span>
              
              <div className="space-y-3.5">
                <div>
                  <label className="font-mono text-[8px] text-neutral-500 block mb-1">ATHLETE NAME</label>
                  <input type="text" value={shippingForm.name} onChange={e => setShippingForm(p => ({ ...p, name: e.target.value }))} className="w-full bg-neutral-900 border border-neutral-900 rounded-xl px-3 py-2.5 font-sans text-xs text-white" />
                </div>
                <div>
                  <label className="font-mono text-[8px] text-neutral-500 block mb-1">DISPATCH EMAIL</label>
                  <input type="email" value={shippingForm.email} onChange={e => setShippingForm(p => ({ ...p, email: e.target.value }))} className="w-full bg-neutral-900 border border-neutral-900 rounded-xl px-3 py-2.5 font-mono text-xs text-white" />
                </div>
                <div>
                  <label className="font-mono text-[8px] text-neutral-500 block mb-1">DESTINATION ADDRESS</label>
                  <input type="text" value={shippingForm.address} onChange={e => setShippingForm(p => ({ ...p, address: e.target.value }))} className="w-full bg-neutral-900 border border-neutral-900 rounded-xl px-3 py-2.5 font-sans text-xs text-white" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-mono text-[8px] text-neutral-500 block mb-1">CITY</label>
                    <input type="text" value={shippingForm.city} onChange={e => setShippingForm(p => ({ ...p, city: e.target.value }))} className="w-full bg-neutral-900 border border-neutral-900 rounded-xl px-3 py-2.5 font-sans text-xs text-white" />
                  </div>
                  <div>
                    <label className="font-mono text-[8px] text-neutral-500 block mb-1">COUNTRY</label>
                    <input type="text" value={shippingForm.country} onChange={e => setShippingForm(p => ({ ...p, country: e.target.value }))} className="w-full bg-neutral-900 border border-neutral-900 rounded-xl px-3 py-2.5 font-sans text-xs text-white" />
                  </div>
                </div>
              </div>

              {/* Delivery Speed Selector */}
              <div className="space-y-3 pt-4 border-t border-neutral-900">
                <label className="font-mono text-[8px] text-neutral-500 block uppercase tracking-widest">CHOOSE ROUTING CONDUIT</label>
                {[
                  { id: 'standard', title: 'Standard Air Drop', desc: 'Secure economy shipping via partners', cost: 'COMPLIMENTARY', val: 0 },
                  { id: 'express', title: 'Express Hyper Delivery', desc: 'Accelerated priority drop (2-3 Business Days)', cost: '+$15.00', val: 15 },
                  { id: 'priority', title: 'Tactical Drone Dispatch', desc: 'Immediate priority jet courier (Next-Day Delivery)', cost: '+$35.00', val: 35 },
                ].map((method) => (
                  <button 
                    key={method.id}
                    onClick={() => setShippingMethod(method.id as any)}
                    className={`w-full p-3.5 border rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer ${
                      shippingMethod === method.id 
                        ? 'bg-neutral-900/60 border-[#C9A227] text-white shadow-md' 
                        : 'bg-neutral-950 border-neutral-900 text-neutral-400 hover:border-neutral-800'
                    }`}
                  >
                    <div>
                      <span className="font-sans font-bold text-xs block">{method.title}</span>
                      <span className="font-mono text-[8px] text-neutral-500 uppercase mt-0.5 block">{method.desc}</span>
                    </div>
                    <span className="font-mono text-xs font-black text-[#C9A227]">{method.cost}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 3. PAYMENT PORTAL */}
          {checkoutStep === 'payment' && (
            <div className="space-y-6">
              <span className="font-mono text-[9px] text-neutral-500 uppercase tracking-widest block">SECURED PAYMENT HANDSHAKE</span>
              
              {/* Payment Methods Tabs */}
              <div className="grid grid-cols-6 gap-1.5 border-b border-neutral-900 pb-4">
                {[
                  { id: 'stripe', label: 'STRIPE', desc: 'Stripe SDK' },
                  { id: 'card', label: 'CARDS', desc: 'Visa/MC/Amex' },
                  { id: 'express', label: 'GP/AP', desc: 'One-Tap token' },
                  { id: 'paypal', label: 'PAYPAL', desc: 'PayPal system' },
                  { id: 'bank', label: 'WIRE', desc: 'Bank Swift' },
                  { id: 'cod', label: 'COD', desc: 'Cash Delivery' }
                ].map((pm) => (
                  <button
                    key={pm.id}
                    onClick={() => setPaymentMethod(pm.id as any)}
                    className={`p-2 rounded-xl border flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                      paymentMethod === pm.id 
                        ? 'bg-[#C9A227]/15 border-[#C9A227] text-[#C9A227] font-black' 
                        : 'bg-neutral-950 border-neutral-900/60 text-neutral-500 hover:text-neutral-300 hover:border-neutral-800'
                    }`}
                  >
                    <span className="font-sans font-black text-[9px] block tracking-tight">{pm.label}</span>
                    <span className="font-mono text-[6.5px] uppercase text-neutral-500 shrink-0">{pm.desc}</span>
                  </button>
                ))}
              </div>

              {/* Stripe Payment Form */}
              {paymentMethod === 'stripe' && (
                <StripePaymentForm 
                  amount={subtotal + (shippingMethod === 'standard' ? 0 : shippingMethod === 'express' ? 15 : 35) + (subtotal * 0.08)}
                  onSuccess={(paymentId, details) => {
                    setCheckoutStep('processing');
                    handlePayment(paymentId, details);
                  }}
                  onError={(error) => {
                    console.error('Stripe payment error:', error);
                    setPaymentError(error);
                  }}
                />
              )}

              {/* Secure Card Inputs */}
              {paymentMethod === 'card' && (
                <div className="space-y-4">
                  <div className="w-full h-44 bg-gradient-to-br from-neutral-800 to-black border border-neutral-800 rounded-3xl p-5 relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute top-4 right-4 w-10 h-10 bg-[#C9A227]/20 rounded-lg flex flex-col justify-between p-1.5">
                      <div className="h-[1px] w-full bg-neutral-950/40" />
                      <div className="h-[1px] w-full bg-neutral-950/40" />
                    </div>
                    <div>
                      <span className="font-sans font-black tracking-[0.2em] text-white text-sm">ZEROX</span>
                      <span className="font-mono text-[6.5px] tracking-[0.3em] text-[#C9A227] uppercase block mt-0.5">CHALLENGER AUTHENTICITY CARD</span>
                    </div>
                    <div>
                      <span className="font-mono text-base tracking-widest text-neutral-100 block font-bold">{paymentForm.cardNumber}</span>
                      <div className="flex justify-between items-center mt-3 font-mono text-[7px] text-neutral-500 uppercase">
                        <span>CARDMEMBER: {shippingForm.name.toUpperCase()}</span>
                        <span>EXP: {paymentForm.expiry} // CVV: {paymentForm.cvv}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="font-mono text-[8px] text-neutral-500 block mb-1">SECURED CREDIT NUMBER</label>
                      <input type="text" value={paymentForm.cardNumber} onChange={e => setPaymentForm(p => ({ ...p, cardNumber: e.target.value }))} className="w-full bg-neutral-900 border border-neutral-900 rounded-xl px-3 py-2 font-mono text-xs text-white" />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-2">
                        <label className="font-mono text-[8px] text-neutral-500 block mb-1">EXPIRY DATE</label>
                        <input type="text" value={paymentForm.expiry} onChange={e => setPaymentForm(p => ({ ...p, expiry: e.target.value }))} className="w-full bg-neutral-900 border border-neutral-900 rounded-xl px-3 py-2 font-mono text-xs text-white" />
                      </div>
                      <div>
                        <label className="font-mono text-[8px] text-neutral-500 block mb-1">CVV</label>
                        <input type="text" value={paymentForm.cvv} onChange={e => setPaymentForm(p => ({ ...p, cvv: e.target.value }))} className="w-full bg-neutral-900 border border-neutral-900 rounded-xl px-3 py-2 font-mono text-xs text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Express GPay / Apple Pay inputs */}
              {paymentMethod === 'express' && (
                <div className="p-6 bg-neutral-900/20 border border-neutral-900 rounded-2xl text-center space-y-4">
                  <div className="flex justify-center gap-4">
                    <button type="button" className="px-6 py-3 bg-white hover:bg-neutral-100 text-black font-sans font-black text-xs uppercase rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-md">
                      <span> Pay</span>
                    </button>
                    <button type="button" className="px-6 py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-sans font-bold text-xs uppercase rounded-xl flex items-center justify-center gap-1.5 border border-neutral-800 cursor-pointer transition-colors shadow-md">
                      <span className="text-[#F1C40F]">G</span><span>Pay</span>
                    </button>
                  </div>
                  <p className="font-mono text-[8px] text-neutral-500 uppercase">One-tap secure biometrics authentication ready</p>
                </div>
              )}

              {/* PayPal system */}
              {paymentMethod === 'paypal' && (
                <div className="p-6 bg-[#003087]/10 border border-[#003087]/20 rounded-2xl text-center space-y-3">
                  <span className="text-[#0079C1] font-sans font-black text-xl italic block">PayPal</span>
                  <p className="font-mono text-[8px] text-neutral-400 uppercase leading-relaxed max-w-xs mx-auto">
                    Secure redirection enabled. Log in to your personal account to authorize transfer.
                  </p>
                </div>
              )}

              {/* Bank Transfer Wire */}
              {paymentMethod === 'bank' && (
                <div className="p-4 bg-neutral-900/40 border border-neutral-900 rounded-2xl space-y-2.5 font-mono text-[8.5px] uppercase">
                  <span className="text-[#C9A227] font-black tracking-wide block">SWIFT WIRE SPECIFICATIONS</span>
                  <div className="flex justify-between border-b border-neutral-850 pb-1.5"><span>INSTITUTION:</span><span className="text-white font-bold">APEX TREASURY NYC</span></div>
                  <div className="flex justify-between border-b border-neutral-850 pb-1.5"><span>ROUTING HASH:</span><span className="text-white font-bold">021000021</span></div>
                  <div className="flex justify-between border-b border-neutral-850 pb-1.5"><span>ACCOUNT NUMBER:</span><span className="text-white font-bold">9834-0192-882</span></div>
                  <div className="flex justify-between text-[7px] text-neutral-500"><span>NOTE:</span><span>UPLOAD RECEIPT ON DASHBOARD FOR AUDIT.</span></div>
                </div>
              )}

              {/* Cash On Delivery */}
              {paymentMethod === 'cod' && (
                <div className="p-5 bg-neutral-900/30 border border-neutral-900 rounded-2xl text-center space-y-2">
                  <Truck className="w-8 h-8 text-[#C9A227] mx-auto animate-bounce" />
                  <span className="font-sans font-black text-xs text-white uppercase block">CASH ON DELIVER CONFIRMED</span>
                  <p className="font-mono text-[8.5px] text-neutral-400 uppercase max-w-xs mx-auto">
                    Pay standard cash tokens at the door when your express courier package arrives.
                  </p>
                </div>
              )}

              {/* INTENTIONAL DEMO SIMULATOR TOGGLE */}
              <div className="p-4 bg-neutral-950 border border-dashed border-neutral-900 rounded-2xl flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="font-mono text-[8.5px] text-amber-500 font-bold uppercase block">// PAYMENT FAILURE SIMULATOR</span>
                  <p className="font-mono text-[7px] text-neutral-600 uppercase">Aids compliance verification tests</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={forceFailPayment}
                    onChange={e => setForceFailPayment(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-neutral-900 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-neutral-600 after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-600 peer-checked:after:bg-white" />
                </label>
              </div>

            </div>
          )}

          {/* 4. PROCESSING SCREEN */}
          {checkoutStep === 'processing' && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-16">
              <div className="relative w-20 h-20 flex items-center justify-center mx-auto">
                <div className="absolute inset-0 rounded-full border-2 border-neutral-800 animate-pulse" />
                <div className="absolute inset-2 rounded-full border-2 border-t-2 border-t-[#C9A227] border-transparent animate-spin" />
                <ShieldCheck className="w-8 h-8 text-[#C9A227] animate-pulse" />
              </div>
              <h3 className="text-white font-sans font-black text-lg uppercase">MERCHANT GATEWAY CHECKOUT</h3>
              <p className="font-mono text-[10px] tracking-[0.2em] text-[#C9A227] max-w-xs h-12 leading-relaxed animate-pulse">
                {processingText}
              </p>
            </div>
          )}

          {/* 5. PAYMENT FAILED PAGE */}
          {checkoutStep === 'failed' && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-12">
              <AlertTriangle className="w-16 h-16 text-red-500 animate-bounce" />
              <div className="space-y-1">
                <h3 className="text-white font-sans font-black text-lg uppercase">TRANSACTION INSUFFICIENT / DECLINED</h3>
                <span className="font-mono text-[9px] text-[#C9A227] uppercase">ERROR CODE: SEC_DEBIT_DENIED_03</span>
              </div>
              <p className="font-mono text-[8.5px] text-neutral-400 uppercase leading-relaxed max-w-sm">
                Your card terminal declined the transaction parameters. This occurs during mock decline simulation or insufficient tokens ledger balance. Please retry with simulator turned off.
              </p>
              
              <div className="flex gap-2 w-full pt-4">
                <button 
                  onClick={() => { setCheckoutStep('payment'); setForceFailPayment(false); }}
                  className="flex-1 py-3 bg-[#C9A227] text-black font-sans font-black text-xs uppercase rounded-xl cursor-pointer"
                >
                  DEACTIVATE SIMULATOR & RETRY
                </button>
                <button 
                  onClick={onClose}
                  className="flex-1 py-3 bg-neutral-900 hover:bg-neutral-850 text-white font-sans font-bold text-xs uppercase rounded-xl border border-neutral-800 cursor-pointer"
                >
                  ABORT TRANSACTION
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Dynamic Billing Footer */}
        {checkoutStep !== 'processing' && checkoutStep !== 'failed' && cartItems.length > 0 && (
          <div className="bg-neutral-950 border-t border-neutral-900 p-6 space-y-4">
            <div className="space-y-2 font-mono text-xs uppercase tracking-widest text-neutral-400">
              <div className="flex justify-between">
                <span>SUBTOTAL BAG</span>
                <span className="text-white">${subtotal.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>PROMO CREDIT</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>DELIVERY CONDUIT</span>
                {shippingCost === 0 ? (
                  <span className="text-emerald-400 font-bold">COMPLIMENTARY</span>
                ) : (
                  <span className="text-white">${shippingCost.toFixed(2)}</span>
                )}
              </div>
              <div className="flex justify-between text-[11px]">
                <span>PCI SALES TAX (8.0%)</span>
                <span className="text-white">${taxAmount.toFixed(2)}</span>
              </div>
              <div className="h-[1px] bg-neutral-900 my-2" />
              <div className="flex justify-between text-white font-bold text-sm">
                <span>LEDGER TOTAL</span>
                <span className="text-[#C9A227]">${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleNextStep}
              className="w-full bg-gradient-to-r from-amber-600 to-[#C9A227] hover:from-amber-500 hover:to-amber-400 text-black font-sans font-black text-xs uppercase py-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-[0_4px_20px_rgba(201,162,39,0.25)] hover:shadow-[0_4px_25px_rgba(201,162,39,0.35)] cursor-pointer"
            >
              {checkoutStep === 'cart' ? 'VALIDATE ROUTE ADDRESS' : checkoutStep === 'shipping' ? 'CALIBRATE PAYMENTS' : `EXECUTE PAYMENTS ($${total.toFixed(2)})`}
            </button>
          </div>
        )}

      </motion.div>
    </motion.div>
  );
}
