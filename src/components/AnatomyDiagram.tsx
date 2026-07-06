import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Zap, Layers, RefreshCw } from 'lucide-react';
import AnimatedTypography from './AnimatedTypography';

interface Hotspot {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  top: string;
  left: string;
}

export default function AnatomyDiagram() {
  const [activeId, setActiveId] = useState<string | null>('carbon-shank');

  const hotspots: Hotspot[] = [
    {
      id: 'upper',
      title: 'TetherWeave™ Engineered Upper',
      description: 'Woven with featherlight, high-tensile polymer fibers that adjust dynamically to foot expansion. Offers continuous structural support and targeted ventilation.',
      icon: <ShieldCheck className="w-4 h-4 text-[#C9A227]" />,
      top: '32%',
      left: '38%'
    },
    {
      id: 'cushioning',
      title: 'Air-Float™ Responsive Pods',
      description: 'Dual-zone chambers filled with pressurized medical-grade nitrogen. Rebounds instantly upon impact, releasing stored energy back into your stride.',
      icon: <Layers className="w-4 h-4 text-[#C9A227]" />,
      top: '72%',
      left: '60%'
    },
    {
      id: 'carbon-shank',
      title: 'Z-Plate™ Autoclaved Carbon Shank',
      description: 'A 100% real pre-preg carbon fiber composite running full length. Delivers exceptional torsional rigidity, limits energy loss, and propels your heel lift.',
      icon: <Zap className="w-4 h-4 text-[#C9A227]" />,
      top: '84%',
      left: '48%'
    },
    {
      id: 'collar',
      title: 'Locked-Down Ergonomic Collar',
      description: 'Sculpted anatomical fit with dual-density memory foam padding. Eliminates lateral friction, ensures rigid heel support, and hugs the ankle like a glove.',
      icon: <RefreshCw className="w-4 h-4 text-[#C9A227]" />,
      top: '46%',
      left: '18%'
    }
  ];

  return (
    <div id="anatomy-section" className="relative w-full bg-neutral-950 border border-neutral-900 rounded-3xl py-16 px-6 sm:px-12 overflow-hidden my-12">
      {/* Subtle gold glow behind the diagram */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#C9A227]/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12 z-10">
        
        {/* Left column: Text Narrative */}
        <div className="w-full lg:w-5/12 flex flex-col justify-center">
          <span className="font-mono text-xs text-[#C9A227] tracking-[0.3em] uppercase mb-3">
            BIOMECHANICAL ENGINEERING
          </span>
          <h2 className="text-3xl sm:text-4xl font-sans font-extrabold tracking-tight text-white mb-6 uppercase">
            <AnimatedTypography variant="word" text="The Anatomy of ZEROX Speed" className="text-white font-extrabold" />
          </h2>
          <p className="text-neutral-400 text-sm leading-relaxed mb-8 uppercase">
            <AnimatedTypography variant="blur-reveal" text="Every millimeter of a ZEROX shoe is engineered with aerospace-grade raw materials and advanced sports science. Hover or tap the active radar circles on the shoe to inspect the core performance modules." className="text-neutral-400 font-mono tracking-wider leading-relaxed" />
          </p>

          {/* Feature Card */}
          <div className="min-h-[160px] bg-neutral-900/40 border border-neutral-900 rounded-2xl p-6 backdrop-blur-md">
            <AnimatePresence mode="wait">
              {activeId ? (
                (() => {
                  const active = hotspots.find(h => h.id === activeId);
                  if (!active) return null;
                  return (
                    <motion.div
                      key={active.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.3 }}
                      className="flex gap-4"
                    >
                      <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 self-start">
                        {active.icon}
                      </div>
                      <div>
                        <h4 className="text-white font-sans font-bold text-base tracking-tight mb-2">
                          {active.title}
                        </h4>
                        <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed">
                          {active.description}
                        </p>
                      </div>
                    </motion.div>
                  );
                })()
              ) : (
                <div className="flex items-center justify-center h-full text-neutral-500 font-mono text-xs tracking-widest uppercase">
                  SELECT A MODULE TO INSPECT
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right column: Interactive Visual Shoe Plate */}
        <div className="w-full lg:w-7/12 relative flex items-center justify-center min-h-[340px] sm:min-h-[460px] pb-12">
          
          {/* Dynamic 3D Ground Shadow that scales with levitation */}
          <motion.div 
            className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[70%] h-5 bg-black/60 rounded-full blur-xl pointer-events-none"
            animate={{
              scaleX: [1, 0.82, 1],
              opacity: [0.65, 0.3, 0.65],
              filter: ['blur(12px)', 'blur(20px)', 'blur(12px)']
            }}
            transition={{
              repeat: Infinity,
              duration: 5,
              ease: 'easeInOut'
            }}
          />

          {/* Main Shoe Image */}
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 0 }}
            animate={{ 
              scale: 1, 
              opacity: 1,
              y: [0, -14, 0],
            }}
            transition={{ 
              scale: { duration: 1.2, ease: [0.16, 1, 0.3, 1] },
              opacity: { duration: 1.2 },
              y: { repeat: Infinity, duration: 5, ease: 'easeInOut' }
            }}
            className="w-full max-w-[500px] relative select-none group z-10"
          >
            <img
              src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=85"
              alt="ZEROX Biomechanical Platform"
              className="w-full h-auto object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.55)] transition-all duration-300 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />

            {/* Elegant Luxury Gloss Reflection Sweep */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-3xl">
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-150%]"
                animate={{ translateX: ['-150%', '150%'] }}
                transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut', repeatDelay: 3 }}
              />
            </div>
          </motion.div>

          {/* Interactive Hotspots Overlay */}
          {hotspots.map((hs) => {
            const isActive = activeId === hs.id;
            return (
              <button
                key={hs.id}
                onClick={() => setActiveId(hs.id)}
                className="absolute flex items-center justify-center cursor-pointer group focus:outline-none z-20"
                style={{ top: hs.top, left: hs.left }}
              >
                {/* Expanding outer pulsing ring */}
                <span className={`absolute inline-flex h-8 w-8 rounded-full bg-amber-500/30 transition-all duration-300 ${isActive ? 'scale-150 opacity-40 animate-ping' : 'scale-100 opacity-0 group-hover:scale-125 group-hover:opacity-20'}`} />

                {/* Inner glowing core */}
                <span className={`relative flex h-5 w-5 rounded-full border transition-all duration-300 items-center justify-center ${isActive ? 'bg-[#C9A227] border-white shadow-[0_0_12px_#C9A227]' : 'bg-neutral-950 border-[#C9A227]/60 group-hover:bg-[#C9A227]/30'}`}>
                  <span className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${isActive ? 'bg-black' : 'bg-[#C9A227]'}`} />
                </span>

                {/* Micro tooltip label */}
                <span className="absolute left-6 font-mono text-[9px] tracking-widest uppercase bg-neutral-950/90 text-white px-2.5 py-1 rounded-md border border-neutral-800 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                  {hs.title.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
}
