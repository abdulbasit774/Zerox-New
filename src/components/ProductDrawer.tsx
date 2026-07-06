import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Star, ShoppingBag, Truck, ShieldAlert, BadgeCheck, Check, Cpu } from 'lucide-react';
import { Sneaker, Colorway } from '../types';

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

interface ProductDrawerProps {
  sneaker: Sneaker;
  onClose: () => void;
  onAddToCart: (sneaker: Sneaker, selectedColorway: Colorway, selectedSize: number) => void;
}

export default function ProductDrawer({ sneaker, onClose, onAddToCart }: ProductDrawerProps) {
  const [selectedColorway, setSelectedColorway] = useState<Colorway>(sneaker.colorways[0]);
  const [selectedSize, setSelectedSize] = useState<number>(sneaker.sizes[0]);
  const [activeTab, setActiveTab] = useState<'details' | 'specs' | 'features' | 'reviews' | 'qa'>('details');
  const [addedMessage, setAddedMessage] = useState(false);
  const [userRating, setUserRating] = useState(5);
  const [userReviewText, setUserReviewText] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Sync selected colorway when sneaker changes
  useEffect(() => {
    setSelectedColorway(sneaker.colorways[0]);
    setSelectedSize(sneaker.sizes[0]);
  }, [sneaker]);

  const handleAddToCart = () => {
    onAddToCart(sneaker, selectedColorway, selectedSize);
    setAddedMessage(true);
    setTimeout(() => {
      setAddedMessage(false);
    }, 2500);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm select-none"
    >
      {/* Backdrop Closer */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Slide-over Panel */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 220 }}
        className="relative w-full max-w-2xl h-full bg-neutral-950 border-l border-neutral-900 flex flex-col justify-between overflow-y-auto"
      >
        {/* Header bar */}
        <div className="sticky top-0 bg-neutral-950/90 backdrop-blur-md border-b border-neutral-900 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2 font-mono text-[9px] tracking-widest text-[#C9A227]">
            <BadgeCheck className="w-4 h-4 text-[#C9A227]" />
            <span>ZEROX_VERIFIED_AUTHENTIC</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-900 rounded-full transition-colors text-neutral-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 flex-1 space-y-8">
          
          {/* Main Visual Carousel Display with premium Studio Lighting */}
          <div className="relative w-full h-[280px] sm:h-[350px] overflow-hidden rounded-2xl bg-neutral-950 border border-neutral-900 shadow-2xl flex items-center justify-center select-none group/studio">
            {/* 1. Extended Background Blur (eliminates letterbox/empty margins by scale & blur) */}
            <img
              src={selectedColorway.image}
              alt=""
              className="absolute inset-0 w-full h-full object-cover scale-[1.75] blur-[28px] opacity-25 saturate-150 brightness-50 pointer-events-none"
              referrerPolicy="no-referrer"
            />

            {/* 2. Softbox Dynamic Studio Lighting Overlay */}
            <div 
              className="absolute inset-0 transition-all duration-700 ease-out"
              style={getStudioLightingStyle(selectedColorway.hex)}
            />

            {/* 3. High-Contrast Studio Cove Inner-Shadow */}
            <div className="absolute inset-0 rounded-2xl pointer-events-none shadow-[inset_0_4px_40px_rgba(0,0,0,0.95)] border border-white/[0.04] z-10" />

            {/* 4. Luxury Ground Reflection */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-full h-1/3 overflow-hidden opacity-[0.16] pointer-events-none scale-y-[-1] blur-[0.8px] z-0 select-none">
              <img
                src={selectedColorway.image}
                alt=""
                className="w-auto h-full mx-auto object-contain scale-x-[1.15] translate-y-[15%]"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent" />
            </div>

            {/* 5. Clean, Professional Shadow Drop (soft ambient contact shadow) */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[75%] h-3.5 bg-black/75 blur-md rounded-full scale-y-[0.35] opacity-85 pointer-events-none" />

            {/* 6. Foreground Shoe Component (scaled 85-90% of the drawer viewport) */}
            <motion.img
              key={selectedColorway.image}
              initial={{ scale: 0.8, opacity: 0, y: 15 }}
              animate={{ scale: 0.88, opacity: 1, y: 0 }}
              whileHover={{ scale: 0.94, rotate: -2, y: -5 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              src={selectedColorway.image}
              alt={sneaker.name}
              className="h-[88%] w-auto max-h-[220px] sm:max-h-[280px] object-contain brightness-[1.06] contrast-[1.03] drop-shadow-[0_24px_45px_rgba(0,0,0,0.85)] relative z-20 cursor-pointer"
              referrerPolicy="no-referrer"
            />

            {/* Price Badge Overlay */}
            <div className="absolute bottom-4 left-4 bg-black/80 border border-neutral-800 rounded-lg px-3.5 py-1.5 backdrop-blur-md z-30">
              <span className="font-sans font-black tracking-tight text-white text-lg">
                ${sneaker.price.toFixed(2)}
              </span>
            </div>

            {/* Category tag */}
            <div className="absolute top-4 right-4 bg-amber-500/10 border border-[#C9A227]/40 rounded-full px-3 py-1 backdrop-blur-md font-mono text-[8px] uppercase tracking-[0.25em] text-[#C9A227] font-bold z-30">
              {sneaker.category}
            </div>
          </div>

          {/* Heading lockup */}
          <div>
            <span className="font-mono text-[10px] text-[#C9A227] uppercase tracking-[0.3em] font-semibold mb-2 block">
              ZEROX FOOTWEAR SYSTEM
            </span>
            <h2 className="text-2xl sm:text-3xl font-sans font-black tracking-tight text-white mb-1.5">
              {sneaker.name}
            </h2>
            <p className="text-neutral-400 font-mono text-[10.5px] uppercase tracking-wider font-medium">
              {sneaker.tagline}
            </p>

            {/* Rating Stars */}
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${i < Math.floor(sneaker.rating) ? 'text-[#C9A227] fill-[#C9A227]' : 'text-neutral-800'}`}
                  />
                ))}
                <span className="font-mono text-xs text-white ml-1.5 font-bold">{sneaker.rating.toFixed(1)}</span>
              </div>
              <div className="h-[3px] w-[3px] rounded-full bg-neutral-800" />
              <span className="font-mono text-xs text-neutral-500 uppercase tracking-widest">
                {sneaker.reviewsCount} GLOBAL REVIEWS
              </span>
            </div>
          </div>

          {/* Tab Navigation (Details, Specifications, Technology, Reviews, Q&A) */}
          <div className="border-b border-neutral-900 flex gap-6 overflow-x-auto">
            {(['details', 'specs', 'features', 'reviews', 'qa'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 font-mono text-xs uppercase tracking-widest border-b-2 transition-colors relative whitespace-nowrap ${activeTab === tab ? 'border-[#C9A227] text-white font-bold' : 'border-transparent text-neutral-500 hover:text-neutral-300'}`}
              >
                {tab === 'qa' ? 'Q&A' : tab}
              </button>
            ))}
          </div>

          {/* Tab Content Panels */}
          <div className="min-h-[110px]">
            {activeTab === 'details' && (
              <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed font-sans">
                {sneaker.description}
              </p>
            )}

            {activeTab === 'specs' && (
              <div className="grid grid-cols-2 gap-4 font-mono text-xs uppercase tracking-wider">
                <div className="bg-neutral-950/50 border border-neutral-900 rounded-xl p-3">
                  <span className="text-neutral-500 text-[8.5px] block mb-1">TOTAL SYSTEM WEIGHT</span>
                  <span className="text-neutral-200 font-bold">{sneaker.specs.weight}</span>
                </div>
                <div className="bg-neutral-950/50 border border-neutral-900 rounded-xl p-3">
                  <span className="text-neutral-500 text-[8.5px] block mb-1">MIDSOLE CUSHIONING</span>
                  <span className="text-neutral-200 font-bold">{sneaker.specs.cushioning}</span>
                </div>
                <div className="bg-neutral-950/50 border border-neutral-900 rounded-xl p-3">
                  <span className="text-neutral-500 text-[8.5px] block mb-1">HEEL-TO-TOE DROPS</span>
                  <span className="text-neutral-200 font-bold">{sneaker.specs.offset}</span>
                </div>
                <div className="bg-neutral-950/50 border border-neutral-900 rounded-xl p-3">
                  <span className="text-neutral-500 text-[8.5px] block mb-1">PROPULSION PLATE</span>
                  <span className="text-neutral-200 font-bold">{sneaker.specs.propulsion}</span>
                </div>
              </div>
            )}

            {activeTab === 'features' && (
              <div className="space-y-3">
                {sneaker.features.map((f, i) => (
                  <div key={i} className="flex gap-3 bg-neutral-950/50 border border-neutral-900 p-3 rounded-xl">
                    <div className="p-1.5 bg-neutral-900 rounded-lg text-[#C9A227] self-start mt-0.5">
                      <Cpu className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-white font-sans font-bold text-xs tracking-tight uppercase mb-1">{f.title}</h4>
                      <p className="text-neutral-400 text-[11px] leading-relaxed">{f.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* REVIEWS TAB */}
            {activeTab === 'reviews' && (
              <div className="space-y-4">
                <button
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="w-full py-2 px-3 bg-[#C9A227]/10 hover:bg-[#C9A227]/20 border border-[#C9A227]/30 text-[#C9A227] rounded-lg font-mono text-xs uppercase tracking-widest transition-colors"
                >
                  {showReviewForm ? '- CANCEL' : '+ WRITE REVIEW'}
                </button>

                {showReviewForm && (
                  <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-4 space-y-3">
                    <div>
                      <label className="font-mono text-[8px] text-neutral-500 uppercase block mb-2">RATING</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setUserRating(star)}
                            className="text-2xl transition-transform hover:scale-110"
                          >
                            {star <= userRating ? '★' : '☆'}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="font-mono text-[8px] text-neutral-500 uppercase block mb-2">YOUR REVIEW</label>
                      <textarea
                        value={userReviewText}
                        onChange={(e) => setUserReviewText(e.target.value)}
                        placeholder="Share your thoughts about this product..."
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white text-xs font-sans placeholder-neutral-600 focus:border-[#C9A227] focus:outline-none"
                        rows={3}
                      />
                    </div>
                    <button className="w-full py-2 bg-[#C9A227] hover:bg-amber-500 text-black font-mono text-xs uppercase font-bold rounded-lg transition-colors">
                      SUBMIT REVIEW
                    </button>
                  </div>
                )}

                <div className="space-y-3">
                  {[
                    { name: 'APEX FOUNDER', rating: 5, text: 'Absolutely revolutionary design. The engineering is second to none!' },
                    { name: 'Creator Elite', rating: 5, text: 'Worth every penny. Premium quality and comfort.' },
                    { name: 'Challenger Pro', rating: 4, text: 'Great product, slightly tight fit for my feet.' }
                  ].map((review, i) => (
                    <div key={i} className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-sans font-bold text-white text-xs">{review.name}</span>
                        <span className="text-[#C9A227]">{'★'.repeat(review.rating)}</span>
                      </div>
                      <p className="font-sans text-neutral-400 text-[11px]">{review.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Q&A TAB */}
            {activeTab === 'qa' && (
              <div className="space-y-3">
                <div className="space-y-3">
                  {[
                    { q: 'What is the sizing like?', a: 'Runs true to size. Recommended to go half size up if you have wide feet.' },
                    { q: 'Is it water resistant?', a: 'Yes, the premium materials provide excellent water resistance for daily use.' },
                    { q: 'How long is shipping?', a: 'Standard shipping takes 3-5 business days. Express shipping available.' }
                  ].map((qa, i) => (
                    <details key={i} className="group bg-neutral-900/50 border border-neutral-800 rounded-lg p-3 cursor-pointer">
                      <summary className="font-sans font-bold text-white text-xs uppercase flex justify-between items-center">
                        {qa.q}
                        <span className="group-open:rotate-180 transition-transform">▼</span>
                      </summary>
                      <p className="font-sans text-neutral-400 text-[11px] mt-2">{qa.a}</p>
                    </details>
                  ))}
                </div>
                <button className="w-full py-2 px-3 bg-[#C9A227]/10 hover:bg-[#C9A227]/20 border border-[#C9A227]/30 text-[#C9A227] rounded-lg font-mono text-xs uppercase tracking-widest transition-colors">
                  + ASK A QUESTION
                </button>
              </div>
            )}
          </div>

          {/* Colorway Switcher Selector */}
          <div>
            <span className="font-mono text-[9px] tracking-widest text-neutral-500 uppercase block mb-3">
              SELECT PREMIUM COLORWAY
            </span>
            <div className="flex gap-3.5">
              {sneaker.colorways.map((c) => {
                const isSelected = selectedColorway.name === c.name;
                return (
                  <button
                    key={c.name}
                    onClick={() => setSelectedColorway(c)}
                    className="flex flex-col items-center gap-1.5 bg-transparent border-0 focus:outline-none cursor-pointer group"
                  >
                    <div
                      className={`w-8 h-8 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${isSelected ? 'border-[#C9A227] scale-110 shadow-[0_0_8px_#C9A227]' : 'border-neutral-800 hover:border-neutral-700'}`}
                      style={{ backgroundColor: c.hex }}
                    >
                      {isSelected && (
                        <Check className={`w-3.5 h-3.5 ${c.hex === '#FFFFFF' ? 'text-black' : 'text-white'}`} />
                      )}
                    </div>
                    <span className="font-mono text-[7.5px] tracking-wider text-neutral-500 group-hover:text-neutral-300 uppercase transition-colors">
                      {c.name.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Size Picker Selector */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="font-mono text-[9px] tracking-widest text-neutral-500 uppercase">
                SELECT ATHLETIC SIZE (US)
              </span>
              <button className="font-mono text-[8.5px] text-[#C9A227] tracking-widest uppercase underline border-0 bg-transparent cursor-pointer">
                SIZING GUIDE
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {sneaker.sizes.map((size) => {
                const isSelected = selectedSize === size;
                return (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-10 h-10 rounded-xl border font-mono text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${isSelected ? 'bg-white border-white text-black font-bold' : 'bg-neutral-900 border-neutral-900 text-neutral-400 hover:border-neutral-800'}`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Brand Shipping Narrative */}
          <div className="bg-neutral-900/30 border border-neutral-900 rounded-xl p-4 space-y-2.5">
            <div className="flex items-center gap-2.5 text-xs font-mono tracking-wide text-neutral-300">
              <Truck className="w-4 h-4 text-[#C9A227]" />
              <span>FREE LUXURY EXPRESS GLOBAL SHIPPING</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs font-mono tracking-wide text-neutral-300">
              <ShieldAlert className="w-4 h-4 text-[#C9A227]" />
              <span>30-DAY COMPLIMENTARY TRIAL EXCHANGE PERIOD</span>
            </div>
          </div>

        </div>

        {/* Footer actions bar */}
        <div className="sticky bottom-0 bg-neutral-950/90 backdrop-blur-md border-t border-neutral-900 p-6 flex flex-col gap-3.5 z-10">
          <button
            onClick={handleAddToCart}
            className="w-full bg-gradient-to-r from-amber-600 to-[#C9A227] hover:from-amber-500 hover:to-amber-400 text-black font-sans font-bold text-sm uppercase py-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-[0_4px_20px_rgba(201,162,39,0.25)] hover:shadow-[0_4px_25px_rgba(201,162,39,0.35)] hover:-translate-y-0.5 cursor-pointer active:translate-y-0"
          >
            <ShoppingBag className="w-4 h-4" />
            ADD TO SECURE BAG — ${sneaker.price.toFixed(2)}
          </button>

          {addedMessage && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center text-xs font-mono tracking-widest text-emerald-400 uppercase font-semibold"
            >
              ✓ SYSTEM SUCCESS: MODEL SUCCESSFULLY COMMITTED TO BAG
            </motion.div>
          )}
        </div>

      </motion.div>
    </motion.div>
  );
}
