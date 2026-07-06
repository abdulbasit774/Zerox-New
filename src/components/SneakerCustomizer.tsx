import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sliders, Check, Hammer, ShoppingBag, Eye, Lock } from 'lucide-react';
import { Colorway } from '../types';
import Sneaker3DViewer from './Sneaker3DViewer';
import AnimatedTypography from './AnimatedTypography';

interface SneakerCustomizerProps {
  onAddCustomToCart: (customItem: {
    name: string;
    price: number;
    colors: { upper: string; midsole: string; laces: string; accent: string };
    engraving: string;
    size: number;
  }) => void;
}

export default function SneakerCustomizer({ onAddCustomToCart }: SneakerCustomizerProps) {
  const [selectedPart, setSelectedPart] = useState<'upper' | 'midsole' | 'laces' | 'accent'>('upper');
  
  // Custom Color States (defaults match ZEROX flagship style)
  const [colors, setColors] = useState({
    upper: '#000000',      // Carbon Black
    midsole: '#FFFFFF',    // Arctic White
    laces: '#FFFFFF',      // Arctic White
    accent: '#C9A227'      // Premium Gold
  });

  const [engraving, setEngraving] = useState('ZRX-01');
  const [selectedSize, setSelectedSize] = useState<number>(9);
  const [addedMessage, setAddedMessage] = useState(false);

  const parts = [
    { id: 'upper', name: 'Upper Body', description: 'TetherWeave™ performance mesh' },
    { id: 'midsole', name: 'Cushioned Midsole', description: 'Dual nitrogen-infused pods' },
    { id: 'laces', name: 'Premium Laces', description: 'Ribbed athletic dynamic straps' },
    { id: 'accent', name: 'Heel Accent Plate', description: 'Polished metallic stabilizer clip' }
  ] as const;

  const colorPalette = [
    { name: 'Carbon Black', hex: '#000000' },
    { name: 'Arctic White', hex: '#FFFFFF' },
    { name: 'Premium Gold', hex: '#C9A227' },
    { name: 'Racing Crimson', hex: '#E53E3E' },
    { name: 'Cyber Royal', hex: '#3182CE' },
    { name: 'Emerald Forest', hex: '#2F855A' },
    { name: 'Slate Gray', hex: '#4A5568' }
  ];

  const handleColorSelect = (hex: string) => {
    setColors(prev => ({
      ...prev,
      [selectedPart]: hex
    }));
  };

  const handleAddToCart = () => {
    onAddCustomToCart({
      name: 'ZEROX Lab Customizer',
      price: 395,
      colors: { ...colors },
      engraving: engraving.toUpperCase(),
      size: selectedSize
    });
    setAddedMessage(true);
    setTimeout(() => setAddedMessage(false), 3000);
  };

  return (
    <div id="customizer-section" className="w-full bg-black border border-neutral-900 rounded-3xl py-12 px-6 sm:px-10 overflow-hidden my-12">
      <div className="flex flex-col lg:flex-row gap-12 max-w-6xl mx-auto">
        
        {/* Left Interactive Canvas Panel */}
        <div className="w-full lg:w-7/12 flex flex-col justify-between items-center bg-gradient-to-b from-neutral-950 to-neutral-900 rounded-2xl border border-neutral-900 p-6 relative min-h-[400px]">
          {/* Subtle gold radial background glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(201,162,39,0.06)_0%,transparent_60%)] pointer-events-none" />

          {/* Top Title Bar */}
          <div className="w-full flex justify-between items-center z-10">
            <div className="flex items-center gap-2">
              <Hammer className="w-4 h-4 text-[#C9A227]" />
              <span className="font-mono text-[10px] tracking-widest text-neutral-400 uppercase font-semibold">
                Bespoke Design Lab
              </span>
            </div>
            <div className="px-3 py-1 bg-neutral-950/80 border border-neutral-800 rounded-full font-mono text-[8px] tracking-[0.25em] text-[#C9A227]">
              LIVE RENDER ENG
            </div>
          </div>

          {/* Premium Interactive 3D Sneaker Canvas */}
          <div className="relative w-full h-[320px] sm:h-[400px] flex items-center justify-center z-10 my-4 bg-black/20 rounded-xl overflow-hidden">
            <Sneaker3DViewer
              colors={colors}
              engraving={engraving}
              className="w-full h-full"
              autoRotate={true}
              interactive={true}
              showAmbientGlow={true}
            />
          </div>

          {/* Dynamic Specs Panel */}
          <div className="w-full flex justify-between items-center bg-black/40 border border-neutral-900 rounded-xl p-3 z-10 font-mono text-[9px] tracking-widest text-neutral-400">
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-neutral-500" />
              HEEL ENGRAVING: <span className="text-[#C9A227] font-bold">{engraving ? engraving.toUpperCase() : 'NONE'}</span>
            </span>
            <span>$395.00 EST</span>
          </div>

        </div>

        {/* Right Styling & Tuning Panel */}
        <div className="w-full lg:w-5/12 flex flex-col justify-between">
          <div>
            <span className="font-mono text-xs text-[#C9A227] tracking-[0.3em] uppercase mb-2 block">
              ZEROX_LAB_ENGINE
            </span>
            <h3 className="text-2xl sm:text-3xl font-sans font-black tracking-tight text-white mb-2 uppercase">
              <AnimatedTypography variant="word" text="Bespoke Lab Studio" className="text-white font-black" />
            </h3>
            <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed mb-6 uppercase">
              <AnimatedTypography variant="blur-reveal" text="Co-create your footwear with our materials engineers. Select a shoe region below and calibrate its finish. Add personal laser-embossed heel branding." className="text-neutral-400 font-mono tracking-wide" />
            </p>

            {/* Step 1: Select Shoe Region */}
            <div className="mb-6">
              <span className="font-mono text-[9px] tracking-widest text-neutral-500 uppercase block mb-3">
                [01] SELECT REGION
              </span>
              <div className="grid grid-cols-2 gap-2">
                {parts.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPart(p.id)}
                    className={`text-left p-3 rounded-xl border text-xs transition-all duration-300 ${selectedPart === p.id ? 'bg-[#C9A227]/10 border-[#C9A227] text-white' : 'bg-neutral-950 border-neutral-900 text-neutral-400 hover:border-neutral-800'}`}
                  >
                    <div className="font-bold font-sans flex items-center justify-between">
                      {p.name}
                      {selectedPart === p.id && <Check className="w-3 h-3 text-[#C9A227]" />}
                    </div>
                    <div className="font-mono text-[8px] text-neutral-500 mt-1 uppercase tracking-wide">
                      {p.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Calibrate Color */}
            <div className="mb-6">
              <span className="font-mono text-[9px] tracking-widest text-neutral-500 uppercase block mb-3">
                [02] CALIBRATE FINISH COLOR
              </span>
              <div className="flex flex-wrap gap-2.5">
                {colorPalette.map((color) => {
                  const isCurrent = colors[selectedPart] === color.hex;
                  return (
                    <button
                      key={color.name}
                      onClick={() => handleColorSelect(color.hex)}
                      className="group flex flex-col items-center gap-1 bg-transparent border-0 focus:outline-none cursor-pointer"
                    >
                      <div
                        className={`w-9 h-9 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${isCurrent ? 'border-[#C9A227] scale-110 shadow-[0_0_8px_#C9A227]' : 'border-neutral-800 hover:border-neutral-700'}`}
                        style={{ backgroundColor: color.hex }}
                      >
                        {isCurrent && (
                          <Check className={`w-4 h-4 ${color.hex === '#FFFFFF' ? 'text-black' : 'text-white'}`} />
                        )}
                      </div>
                      <span className="font-mono text-[7.5px] tracking-wider text-neutral-500 group-hover:text-neutral-300 uppercase transition-colors">
                        {color.name.split(' ')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Laser Engraving */}
            <div className="mb-6">
              <span className="font-mono text-[9px] tracking-widest text-neutral-500 uppercase block mb-2">
                [03] LASER-ENGRAVED INITIALS
              </span>
              <input
                type="text"
                maxLength={6}
                value={engraving}
                onChange={(e) => setEngraving(e.target.value.toUpperCase())}
                placeholder="E.G. ZRX-88"
                className="w-full bg-neutral-950 border border-neutral-900 rounded-xl px-4 py-2.5 font-mono text-sm tracking-widest text-white focus:outline-none focus:border-[#C9A227] placeholder-neutral-700 transition-colors uppercase"
              />
              <span className="font-mono text-[8px] text-neutral-500 tracking-wider uppercase mt-1.5 block">
                MAXIMUM 6 ALPHANUMERIC CHARACTERS. debossed onto standard leather heel panel.
              </span>
            </div>

            {/* Step 4: Choose Size */}
            <div className="mb-6">
              <span className="font-mono text-[9px] tracking-widest text-neutral-500 uppercase block mb-3">
                [04] SELECT SIZE (US)
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[7, 8, 9, 10, 11, 12, 13].map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-9 h-9 rounded-lg border font-mono text-xs font-semibold flex items-center justify-center transition-all ${selectedSize === size ? 'bg-white border-white text-black font-bold' : 'bg-neutral-950 border-neutral-900 text-neutral-400 hover:border-neutral-800'}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action Trigger */}
          <div className="mt-4 pt-6 border-t border-neutral-900 flex items-center gap-4">
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-gradient-to-r from-amber-600 to-[#C9A227] hover:from-amber-500 hover:to-amber-400 text-black font-sans font-bold text-sm uppercase py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-[0_4px_20px_rgba(201,162,39,0.25)] hover:shadow-[0_4px_25px_rgba(201,162,39,0.35)] hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              ADD BESPOKE TO BAG ($395.00)
            </button>
          </div>

          {/* Quick confirmation notification banner */}
          {addedMessage && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-3 text-center text-xs font-mono tracking-widest text-emerald-400 uppercase font-semibold"
            >
              ✓ BESPOKE MODEL ADDED TO BAG SUCCESS
            </motion.div>
          )}

        </div>

      </div>
    </div>
  );
}
