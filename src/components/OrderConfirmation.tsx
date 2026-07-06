import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Award, Printer, MapPin, ExternalLink, Calendar, CheckCircle2, 
  RefreshCw, Mail, Receipt, Ban, HelpCircle, CornerUpLeft, ArrowRight,
  ShieldCheck, Sparkles, Send, FileText
} from 'lucide-react';
import { Order } from '../types';
import Logo from './Logo';
import { db } from '../lib/firebase';
import { doc, updateDoc, setDoc, addDoc, collection } from 'firebase/firestore';

interface OrderConfirmationProps {
  order: Order;
  onReturnToShop: () => void;
}

export default function OrderConfirmation({ order, onReturnToShop }: OrderConfirmationProps) {
  const [showTransitMap, setShowTransitMap] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  
  // Interactive Customer Operations
  const [activeOpsTab, setActiveOpsTab] = useState<'receipt' | 'cancel' | 'refund' | 'return' | null>(null);
  
  // Simulation States
  const [opsLoading, setOpsLoading] = useState(false);
  const [opsSuccessMsg, setOpsSuccessMsg] = useState('');
  const [opsErrorMsg, setOpsErrorMsg] = useState('');
  const [currentOrderStatus, setCurrentOrderStatus] = useState(order.status);

  // Email simulation fields
  const [receiptEmail, setReceiptEmail] = useState(order.deliveryAddress.email);

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 1200);
  };

  // 1. Cancel Order Action
  const handleCancelOrder = async () => {
    setOpsLoading(true);
    setOpsErrorMsg('');
    setOpsSuccessMsg('');
    try {
      // Update order in Firestore
      const orderRef = doc(db, 'orders', order.id);
      await updateDoc(orderRef, {
        status: 'Cancelled'
      });
      
      // Dispatch a notification
      await addDoc(collection(db, 'notifications'), {
        title: 'ORDER CANCELLED BY USER',
        message: `Order ${order.id} was cancelled. Any authorized capital holds have been released.`,
        type: 'alert',
        date: new Date().toISOString(),
        orderId: order.id,
        read: false
      });

      setCurrentOrderStatus('Cancelled');
      setOpsSuccessMsg('ORDER SUCCESSFULLY DE-COMMITTED IN FIRESTORE.');
    } catch (err) {
      setOpsErrorMsg('FAILED TO REMOVE FROM DECENTRALIZED LEDGER.');
    } finally {
      setOpsLoading(false);
    }
  };

  // 2. Request Refund Action
  const handleRequestRefund = async (reason: string) => {
    setOpsLoading(true);
    setOpsErrorMsg('');
    setOpsSuccessMsg('');
    try {
      // Register request in firestore
      const claimId = `REF-${Math.floor(Math.random() * 90000 + 10000)}`;
      await setDoc(doc(db, 'refund_requests', claimId), {
        id: claimId,
        orderId: order.id,
        reason,
        amount: order.total,
        status: 'Pending Review',
        createdAt: new Date().toISOString(),
        customerEmail: order.deliveryAddress.email
      });

      // Update order status
      const orderRef = doc(db, 'orders', order.id);
      await updateDoc(orderRef, {
        status: 'Refund Requested'
      });

      // Notification
      await addDoc(collection(db, 'notifications'), {
        title: 'REFUND CLAIM SUBMITTED',
        message: `Refund claim ${claimId} for $${order.total.toFixed(2)} is pending administration audit.`,
        type: 'alert',
        date: new Date().toISOString(),
        orderId: order.id,
        read: false
      });

      setCurrentOrderStatus('Refund Requested');
      setOpsSuccessMsg(`REFUND CLAIM ${claimId} SUBMITTED TO THE COMPLIANCE TERMINAL.`);
    } catch (err) {
      setOpsErrorMsg('ERROR REGISTERING CLAIM.');
    } finally {
      setOpsLoading(false);
    }
  };

  // 3. Return & Exchange Request
  const handleExchangeRequest = async (itemIndex: number, targetSize: number) => {
    setOpsLoading(true);
    setOpsErrorMsg('');
    setOpsSuccessMsg('');
    try {
      const claimId = `EXC-${Math.floor(Math.random() * 90000 + 10000)}`;
      await setDoc(doc(db, 'returns', claimId), {
        id: claimId,
        orderId: order.id,
        itemIndex,
        requestedSize: targetSize,
        status: 'Authorized (Awaiting Return Shipment)',
        createdAt: new Date().toISOString(),
        type: 'Exchange'
      });

      // Update order status
      const orderRef = doc(db, 'orders', order.id);
      await updateDoc(orderRef, {
        status: 'Exchange Pending'
      });

      // Notification
      await addDoc(collection(db, 'notifications'), {
        title: 'EXCHANGE TICKET ISSUED',
        message: `An exchange ticket was issued. Drop the original pair at any courier point.`,
        type: 'alert',
        date: new Date().toISOString(),
        orderId: order.id,
        read: false
      });

      setCurrentOrderStatus('Exchange Pending');
      setOpsSuccessMsg(`EXCHANGE GRANTED. PARCEL LABEL CODE: ${claimId}`);
    } catch (err) {
      setOpsErrorMsg('ERROR PROCESSING EXCHANGE.');
    } finally {
      setOpsLoading(false);
    }
  };

  // Simulate Email Receipt Dispatch
  const handleSendEmailReceipt = () => {
    setOpsLoading(true);
    setTimeout(() => {
      setOpsLoading(false);
      setOpsSuccessMsg(`HIGH-FIDELITY INVOICE EMAIL SUCCESSFULLY DISPATCHED TO ${receiptEmail.toUpperCase()}`);
    }, 1500);
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-12 px-4 sm:px-6 select-none text-white">
      
      {/* Top status block */}
      <div className="text-center mb-10 space-y-3">
        <div className="inline-flex items-center justify-center p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-400 mb-2">
          <CheckCircle2 className="w-8 h-8 animate-pulse" />
        </div>
        <span className="font-mono text-xs text-[#C9A227] tracking-[0.35em] uppercase block font-semibold">
          TRANSACTION APPROVED & COMMITTED
        </span>
        <h2 className="text-3xl sm:text-4xl font-sans font-black tracking-tight text-white uppercase">
          Welcome to the ZEROX Club
        </h2>
        <p className="text-neutral-400 text-xs sm:text-sm max-w-lg mx-auto uppercase tracking-wide font-mono leading-relaxed">
          Your co-creation index is authenticated. Below is your official, unique certificate of footwear authenticity & real-time distribution specs.
        </p>
      </div>

      {/* LUXURY DIGITAL CERTIFICATE OF AUTHENTICITY */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full bg-gradient-to-br from-neutral-900 via-neutral-950 to-black rounded-3xl border-2 border-[#C9A227]/40 p-6 sm:p-10 relative overflow-hidden shadow-[0_20px_50px_rgba(201,162,39,0.15)] mb-8"
      >
        {/* Subtle gold shimmer background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(201,162,39,0.06)_0%,transparent_60%)] pointer-events-none" />

        {/* Corner framing indicators */}
        <div className="absolute top-4 left-4 h-4 w-4 border-t-2 border-l-2 border-[#C9A227]/60" />
        <div className="absolute top-4 right-4 h-4 w-4 border-t-2 border-r-2 border-[#C9A227]/60" />
        <div className="absolute bottom-4 left-4 h-4 w-4 border-b-2 border-l-2 border-[#C9A227]/60" />
        <div className="absolute bottom-4 right-4 h-4 w-4 border-b-2 border-r-2 border-[#C9A227]/60" />

        <div className="relative flex flex-col md:flex-row gap-8 justify-between items-start z-10">
          
          {/* Left Certificate Area */}
          <div className="flex-1 space-y-6">
            
            <div className="flex items-center gap-4">
              <Award className="w-10 h-10 text-[#C9A227] shrink-0" />
              <div>
                <h3 className="text-[#C9A227] font-sans font-extrabold text-lg tracking-wide uppercase">
                  Certificate of Authenticity
                </h3>
                <span className="font-mono text-[8px] tracking-[0.25em] text-neutral-500 uppercase font-bold block">
                  FIRESTORE CRYPTOGRAPHIC SHIELD ATTESTATION
                </span>
              </div>
            </div>

            {/* Ledger Matrix Table */}
            <div className="grid grid-cols-2 gap-y-4 gap-x-6 border-t border-b border-neutral-900 py-6 font-mono text-[10px] uppercase tracking-wider text-neutral-400">
              <div>
                <span className="text-neutral-600 text-[8px] block mb-0.5">ISSUED TO SPORTSMAN:</span>
                <span className="text-white font-bold">{order.deliveryAddress.name}</span>
              </div>
              <div>
                <span className="text-neutral-600 text-[8px] block mb-0.5">REGISTRATION DATE:</span>
                <span className="text-white font-bold">{order.date.split(' at')[0]}</span>
              </div>
              <div>
                <span className="text-neutral-600 text-[8px] block mb-0.5">SECURE LEDGER NODE:</span>
                <span className="text-white font-bold">{order.id}</span>
              </div>
              <div>
                <span className="text-neutral-600 text-[8px] block mb-0.5">ACTIVE LEDGER STATUS:</span>
                <span className="text-emerald-400 font-extrabold">{currentOrderStatus.toUpperCase()}</span>
              </div>
            </div>

            {/* Assets details */}
            <div className="space-y-3">
              <span className="font-mono text-[8px] tracking-widest text-neutral-600 uppercase block font-black">
                COMMITTED PHYSICAL ASSETS
              </span>
              <div className="space-y-2">
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between items-center bg-neutral-950/80 border border-neutral-900 rounded-xl p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-neutral-900 rounded-lg flex items-center justify-center p-0.5">
                        <img
                          src={item.selectedColorway.image}
                          alt={item.sneaker.name}
                          className="max-h-8 w-auto object-contain"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div>
                        <h5 className="text-white font-sans font-bold text-xs uppercase tracking-tight">{item.isCustom ? 'ZEROX BESPOKE CUSTOM' : item.sneaker.name}</h5>
                        <p className="font-mono text-[8px] text-neutral-500 uppercase mt-0.5">SIZE US {item.selectedSize} / {item.selectedColorway.name}</p>
                      </div>
                    </div>
                    <span className="font-mono text-xs font-black text-white">${(item.sneaker.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-neutral-900">
              <span className="font-mono text-xs text-neutral-500">SECURED CAPITAL TRANSFERRED:</span>
              <span className="font-sans font-black text-xl text-[#C9A227]">${order.total.toFixed(2)}</span>
            </div>

          </div>

          {/* Right Verification QR Block */}
          <div className="w-full md:w-56 flex flex-col items-center justify-between self-stretch bg-neutral-950/60 border border-neutral-900 rounded-2xl p-6 text-center">
            
            <Logo variant="compact" className="scale-75 mb-4" />

            <div className="bg-white p-2.5 rounded-xl flex flex-col items-center justify-center mb-4 shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:scale-105 transition-transform">
              <img
                src={order.qrCode}
                alt="ZEROX Cryptographic Validation QR"
                className="w-24 h-24"
              />
              <span className="font-mono text-[6.5px] text-neutral-800 tracking-wider font-extrabold uppercase mt-1.5 block">
                SCAN TO AUDIT LEDGER
              </span>
            </div>

            <div className="w-full pt-4 border-t border-neutral-900">
              <span className="font-mono text-[7px] text-neutral-600 tracking-widest uppercase block mb-1">
                DESIGN DIRECTOR ATTESTATION
              </span>
              <div className="font-serif italic text-xs text-neutral-300 tracking-wider font-bold">
                X_ZEROX_DESIGN
              </div>
              <span className="font-mono text-[6px] text-neutral-500 tracking-widest uppercase mt-0.5 block">
                {order.digitalSignature}
              </span>
            </div>

          </div>

        </div>
      </motion.div>

      {/* SATELLITE TRANSIT ROUTING TIMELINE */}
      {showTransitMap && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="w-full bg-neutral-950 border border-neutral-900 rounded-3xl p-6 sm:p-8 mb-8 overflow-hidden"
        >
          <span className="font-mono text-[9px] tracking-widest text-[#C9A227] uppercase block mb-3">
            SATELLITE DISTRIBUTION DIRECTIVE
          </span>
          <h4 className="text-white font-sans font-black text-lg uppercase tracking-tight mb-4">
            Active Priority Drone Dispatch
          </h4>

          <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center py-6 gap-6 sm:gap-0">
            <div className="absolute top-1/2 left-4 right-4 h-[1px] bg-neutral-900 -translate-y-1/2 hidden sm:block z-0" />

            {[
              { id: 1, title: 'LEDGER SECURED', desc: 'Secure node authenticated', status: currentOrderStatus === 'Cancelled' ? 'cancelled' : 'completed' },
              { id: 2, title: 'FABRICATION FINISH', desc: 'Custom sole calibrations', status: currentOrderStatus === 'Cancelled' ? 'cancelled' : 'current' },
              { id: 3, title: 'DRONE DISTRIBUTION', desc: 'Priority distribution shuttle', status: 'pending' },
              { id: 4, title: 'CHALLENGER DROP', desc: 'Secure hand-delivery NYC', status: 'pending' }
            ].map((step, idx) => (
              <div key={idx} className="relative z-10 flex sm:flex-col items-center gap-4 sm:gap-2 sm:text-center shrink-0 w-full sm:w-1/4">
                <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-mono text-xs font-bold ${
                  step.status === 'completed' ? 'bg-[#C9A227] border-[#C9A227] text-black' : 
                  step.status === 'current' ? 'bg-neutral-900 border-[#C9A227] text-[#C9A227] animate-pulse' : 
                  step.status === 'cancelled' ? 'bg-red-950 border-red-500 text-red-500' :
                  'bg-neutral-950 border-neutral-800 text-neutral-600'
                }`}>
                  {step.id}
                </div>
                <div>
                  <h5 className={`font-sans font-black text-xs uppercase tracking-tight ${step.status === 'completed' || step.status === 'current' ? 'text-white' : 'text-neutral-500'}`}>
                    {step.title}
                  </h5>
                  <p className="font-mono text-[8px] text-neutral-500 uppercase mt-0.5 max-w-[130px] sm:mx-auto">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-neutral-900 flex justify-between items-center font-mono text-[9px] text-neutral-400">
            <span>DISPATCH CENTER: <span className="text-white">NYC_CENTRAL_01</span></span>
            <span className="text-emerald-400 font-bold">CARRIER OUTLET ONLINE</span>
          </div>
        </motion.div>
      )}

      {/* OPERATIONS & COMPLIANCE ACTIONS PANEL */}
      <div className="bg-neutral-950 border border-neutral-900 rounded-3xl p-6 sm:p-8 mb-8 space-y-6">
        <div className="flex flex-wrap border-b border-neutral-900 pb-4 gap-3">
          <button 
            onClick={() => { setActiveOpsTab('receipt'); setOpsSuccessMsg(''); setOpsErrorMsg(''); }}
            className={`px-4 py-2 rounded-xl border text-xs font-mono uppercase cursor-pointer transition-colors ${activeOpsTab === 'receipt' ? 'bg-[#C9A227]/15 border-[#C9A227] text-[#C9A227]' : 'bg-neutral-900 border-neutral-850 text-neutral-400 hover:text-white'}`}
          >
            📧 Send Email Receipt
          </button>
          {currentOrderStatus !== 'Cancelled' && currentOrderStatus !== 'Refund Requested' && (
            <>
              <button 
                onClick={() => { setActiveOpsTab('cancel'); setOpsSuccessMsg(''); setOpsErrorMsg(''); }}
                className={`px-4 py-2 rounded-xl border text-xs font-mono uppercase cursor-pointer transition-colors ${activeOpsTab === 'cancel' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-neutral-900 border-neutral-850 text-neutral-400 hover:text-white'}`}
              >
                🚫 Cancel Order
              </button>
              <button 
                onClick={() => { setActiveOpsTab('refund'); setOpsSuccessMsg(''); setOpsErrorMsg(''); }}
                className={`px-4 py-2 rounded-xl border text-xs font-mono uppercase cursor-pointer transition-colors ${activeOpsTab === 'refund' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-neutral-900 border-neutral-850 text-neutral-400 hover:text-white'}`}
              >
                💸 Claim Refund
              </button>
              <button 
                onClick={() => { setActiveOpsTab('return'); setOpsSuccessMsg(''); setOpsErrorMsg(''); }}
                className={`px-4 py-2 rounded-xl border text-xs font-mono uppercase cursor-pointer transition-colors ${activeOpsTab === 'return' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'bg-neutral-900 border-neutral-850 text-neutral-400 hover:text-white'}`}
              >
                🔄 Returns & Exchange
              </button>
            </>
          )}
        </div>

        {/* Display feedback messages */}
        {opsSuccessMsg && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[9px] uppercase tracking-wider rounded-xl text-center">
            ✨ {opsSuccessMsg}
          </div>
        )}
        {opsErrorMsg && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 font-mono text-[9px] uppercase tracking-wider rounded-xl text-center">
            ⚠️ {opsErrorMsg}
          </div>
        )}

        {/* Action Form Contents */}
        <AnimatePresence mode="wait">
          {activeOpsTab === 'receipt' && (
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} className="space-y-3.5">
              <span className="font-mono text-[9.5px] text-[#C9A227] uppercase tracking-wider block font-bold">DISPATCH SECURE INVOICE RECEIPT</span>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  value={receiptEmail}
                  onChange={e => setReceiptEmail(e.target.value)}
                  className="flex-1 bg-neutral-900 border border-neutral-850 text-xs px-3.5 py-2.5 rounded-xl font-mono text-white" 
                  placeholder="ATHLETE@EMAIL.COM" 
                />
                <button 
                  onClick={handleSendEmailReceipt}
                  disabled={opsLoading}
                  className="px-6 py-2.5 bg-[#C9A227] text-black font-sans font-black text-xs uppercase rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  {opsLoading ? 'SENDING...' : 'TRANSMIT'}
                </button>
              </div>
            </motion.div>
          )}

          {activeOpsTab === 'cancel' && (
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <span className="font-mono text-[9.5px] text-red-400 uppercase tracking-wider block font-black">DE-COMMIT ORDER FROM LEDGER</span>
              <p className="font-mono text-[8.5px] text-neutral-500 uppercase leading-relaxed">
                Caution: De-committing releases stock allocations. Once triggered, fabrication cores will be halted.
              </p>
              <button 
                onClick={handleCancelOrder}
                disabled={opsLoading}
                className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-sans font-black text-xs uppercase rounded-xl cursor-pointer"
              >
                {opsLoading ? 'REMOVING...' : 'CONFIRM DE-COMMIT CANCEL'}
              </button>
            </motion.div>
          )}

          {activeOpsTab === 'refund' && (
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <span className="font-mono text-[9.5px] text-amber-400 uppercase tracking-wider block font-black">LODGE CAPTURED REFUND CLAIM</span>
              <p className="font-mono text-[8.5px] text-neutral-500 uppercase leading-relaxed">
                Claims are reviewed automatically by our compliance engine. Approved values post back to your source account in 1-2 hours.
              </p>
              <div className="space-y-3">
                <label className="font-mono text-[8px] text-neutral-600 block uppercase font-bold">REASON FOR CLAIM REVERSAL</label>
                <select className="w-full bg-neutral-900 border border-neutral-850 rounded-xl p-3 font-mono text-xs text-white">
                  <option value="accidental">Accidental Duplicate Order</option>
                  <option value="size">Selected Wrong Size</option>
                  <option value="change_mind">Founders Mindset Change</option>
                </select>
                <button 
                  onClick={() => handleRequestRefund('Customer Accidental Duplicate')}
                  disabled={opsLoading}
                  className="px-6 py-3 bg-[#C9A227] text-black font-sans font-black text-xs uppercase rounded-xl cursor-pointer"
                >
                  {opsLoading ? 'REGISTERING...' : 'SUBMIT REFUND AUDIT'}
                </button>
              </div>
            </motion.div>
          )}

          {activeOpsTab === 'return' && (
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <span className="font-mono text-[9.5px] text-blue-400 uppercase tracking-wider block font-black">RETURNS & CALIBRATED EXCHANGE EXECUTOR</span>
              <p className="font-mono text-[8.5px] text-neutral-500 uppercase leading-relaxed">
                Choose the chassis asset and select your updated size calibration.
              </p>
              <div className="space-y-3">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-neutral-900/60 p-3 rounded-xl border border-neutral-850">
                    <div>
                      <span className="font-sans font-bold text-xs text-white uppercase block">{item.sneaker.name}</span>
                      <span className="font-mono text-[8px] text-neutral-500 uppercase block">CURRENT SIZE: US {item.selectedSize}</span>
                    </div>
                    <button 
                      onClick={() => handleExchangeRequest(idx, item.selectedSize + 0.5)}
                      disabled={opsLoading}
                      className="px-4 py-2 bg-neutral-950 border border-neutral-850 hover:border-[#C9A227] text-[8.5px] font-mono text-[#C9A227] uppercase rounded-lg cursor-pointer"
                    >
                      Exchange for US {item.selectedSize + 0.5}
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Primary bottom control board */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <button
          onClick={handlePrint}
          className="w-full sm:w-auto bg-neutral-900 hover:bg-neutral-800 text-white font-mono text-xs tracking-widest uppercase py-3 px-8 rounded-xl flex items-center justify-center gap-2 border border-neutral-800 cursor-pointer transition-colors"
        >
          <Printer className="w-4 h-4 text-[#C9A227]" />
          {isPrinting ? 'COMPILING CERTIFICATE...' : 'PRINT OFFICIAL CERTIFICATE'}
        </button>

        <button
          onClick={() => setShowTransitMap(!showTransitMap)}
          className="w-full sm:w-auto bg-neutral-900 hover:bg-neutral-800 text-white font-mono text-xs tracking-widest uppercase py-3 px-8 rounded-xl flex items-center justify-center gap-2 border border-neutral-800 cursor-pointer transition-colors"
        >
          <MapPin className="w-4 h-4 text-[#C9A227]" />
          {showTransitMap ? 'HIDE DISPATCH TIMELINE' : 'TRACK DRONE TRANSIT'}
        </button>

        <button
          onClick={onReturnToShop}
          className="w-full sm:w-auto bg-gradient-to-r from-amber-600 to-[#C9A227] text-black font-sans font-black text-xs tracking-widest uppercase py-3.5 px-10 rounded-xl cursor-pointer transition-all hover:-translate-y-0.5 active:translate-y-0 shadow-[0_4px_15px_rgba(201,162,39,0.2)]"
        >
          RETURN TO SHOP PLAZA
        </button>
      </div>

    </div>
  );
}
