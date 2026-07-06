import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ShieldCheck, Zap, Sparkles, Award, Star, Activity, Cpu, Compass } from 'lucide-react';
import AnimatedTypography from './AnimatedTypography';

// Register GSAP plugin safely
gsap.registerPlugin(ScrollTrigger);

export default function KineticScrollStorytelling() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const horizontalRef = useRef<HTMLDivElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const metricRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    // 1. Staggered reveal of static details
    const ctx = gsap.context(() => {
      // Metric counter animation triggered by ScrollTrigger
      if (metricRef.current) {
        gsap.fromTo(
          metricRef.current,
          { textContent: '00' },
          {
            textContent: '98',
            duration: 2.5,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: metricRef.current,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
            snap: { textContent: 1 },
            onUpdate: function () {
              if (metricRef.current) {
                metricRef.current.innerHTML = Math.round(Number(metricRef.current.textContent)) + '%';
              }
            }
          }
        );
      }

      // Parallax shifts on visual items
      gsap.utils.toArray('.parallax-item').forEach((item: any) => {
        const speed = item.dataset.speed || 1;
        gsap.to(item, {
          yPercent: -20 * speed,
          ease: 'none',
          scrollTrigger: {
            trigger: item,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          }
        });
      });

      // Staggered reveal for Kinetic cards
      gsap.fromTo(
        '.story-card',
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.2,
          scrollTrigger: {
            trigger: '.story-grid-trigger',
            start: 'top 75%',
          }
        }
      );
    }, sectionRef);

    return () => ctx.revert(); // Cleanup GSAP animations on unmount
  }, []);

  return (
    <div ref={sectionRef} className="w-full bg-[#030303] text-white py-24 border-t border-neutral-900 overflow-hidden relative">
      {/* Abstract technical grid vector backdrop */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(201,162,39,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(201,162,39,0.015)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-[radial-gradient(circle_at_center,rgba(201,162,39,0.03)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[radial-gradient(circle_at_center,rgba(201,162,39,0.02)_0%,transparent_70%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-12 relative z-10">
        
        {/* Header Block */}
        <div className="text-center space-y-4 mb-20">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-900 border border-neutral-800 rounded-full font-mono text-[8px] uppercase tracking-[0.3em] text-[#C9A227] font-semibold">
            <Compass className="w-3.5 h-3.5 animate-spin-slow text-[#C9A227]" />
            KINETIC_STORY_TIMELINE
          </div>
          
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-sans font-black tracking-tight uppercase leading-none max-w-4xl mx-auto">
            The Science of <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C9A227] via-amber-200 to-[#C9A227]">
              Zero-Gravity Propulsion
            </span>
          </h2>
          
          <p className="text-neutral-400 font-mono text-xs sm:text-sm tracking-widest uppercase max-w-2xl mx-auto leading-relaxed">
            Every fiber calibrated. Every ounce optimized. Scroll to inspect the sub-millimeter biomechanical design sequence of the ZEROX-01 flagship core.
          </p>
        </div>

        {/* Cinematic Parallax Dual Row Layout */}
        <div className="grid grid-col-1 lg:grid-cols-12 gap-12 items-center mb-24">
          
          {/* Left Column: Big Interactive Meter Showcase */}
          <div className="lg:col-span-5 bg-gradient-to-b from-neutral-950 to-[#050505] border border-neutral-900 rounded-3xl p-8 sm:p-10 relative overflow-hidden flex flex-col justify-between min-h-[420px] shadow-2xl">
            {/* Tech corner markings */}
            <div className="absolute top-4 left-4 font-mono text-[8px] text-neutral-600">SYS.ENG // VER_4.80</div>
            <div className="absolute top-4 right-4 font-mono text-[8px] text-[#C9A227]">[CALIBRATED]</div>

            <div className="my-auto space-y-4">
              <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest block">
                [01] ENERGY TRANSFER EFFICIENCY
              </span>
              <div className="text-7xl sm:text-8xl font-sans font-black tracking-tight text-[#C9A227] select-none">
                <span ref={metricRef}>00%</span>
              </div>
              <p className="text-neutral-400 font-mono text-xs leading-relaxed uppercase tracking-wider">
                Our dual nitrogen-infused cushioning matrix returns a documented 98% of striking energy back to the runner's gait, minimizing quad fatigue by up to 14%.
              </p>
            </div>

            <div className="border-t border-neutral-900 pt-4 flex justify-between items-center font-mono text-[9px] text-neutral-500">
              <span>METRIC_ID: ZRX_RET_98</span>
              <span>TEST: GAIT_PROPULSION_09</span>
            </div>
          </div>

          {/* Right Column: Visual Floating Tech layers */}
          <div className="lg:col-span-7 space-y-6 relative">
            
            {/* Layer 1: TetherWeave */}
            <div className="parallax-item bg-neutral-950/40 border border-neutral-900/80 rounded-2xl p-6 flex gap-6 items-start hover:border-neutral-800 transition-all transform-gpu" data-speed="0.5">
              <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800 text-[#C9A227] shrink-0">
                <Activity className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h4 className="text-white font-sans font-black text-sm uppercase tracking-tight">TetherWeave™ Performance Mesh</h4>
                  <span className="font-mono text-[8px] text-[#C9A227] bg-[#C9A227]/10 px-1.5 py-0.5 rounded uppercase">U-Core</span>
                </div>
                <p className="text-neutral-400 text-xs leading-relaxed">
                  Engineered with specialized high-tension strands that lock down the midfoot during extreme lateral maneuvers while retaining maximum breathability.
                </p>
              </div>
            </div>

            {/* Layer 2: Carbon Fiber Z-Plate */}
            <div className="parallax-item bg-neutral-950/40 border border-neutral-900/80 rounded-2xl p-6 flex gap-6 items-start hover:border-neutral-800 transition-all transform-gpu" data-speed="1.2">
              <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800 text-amber-500 shrink-0">
                <Cpu className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h4 className="text-white font-sans font-black text-sm uppercase tracking-tight">Full-Length Z-Plate carbon shank</h4>
                  <span className="font-mono text-[8px] text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded uppercase">Propel</span>
                </div>
                <p className="text-neutral-400 text-xs leading-relaxed">
                  A curved, high-modulus 3D carbon fiber plate tuned to flex dynamically, delivering a snappy, biomechanical spring-forward lever effect with every stride.
                </p>
              </div>
            </div>

            {/* Layer 3: Nitrogen Cushioning Pods */}
            <div className="parallax-item bg-neutral-950/40 border border-neutral-900/80 rounded-2xl p-6 flex gap-6 items-start hover:border-neutral-800 transition-all transform-gpu" data-speed="0.8">
              <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800 text-amber-400 shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h4 className="text-white font-sans font-black text-sm uppercase tracking-tight">Nitrogen-Infused Lateral Pods</h4>
                  <span className="font-mono text-[8px] text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded uppercase">Cushion</span>
                </div>
                <p className="text-neutral-400 text-xs leading-relaxed">
                  Underneath the heel and forefoot, localized shock absorption chambers filled with micro-bubble pressurized gaseous nitrogen yield immediate shock dissipation.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Staggered Grid Segment - Activated on Scroll */}
        <div className="story-grid-trigger pt-12">
          <span className="font-mono text-[9px] text-[#C9A227] tracking-[0.3em] uppercase block text-center mb-10 font-bold">
            // PERFORMANCE METRICS CATALOGUE
          </span>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Story Card 1 */}
            <div className="story-card bg-neutral-950 border border-neutral-900 rounded-2xl p-6 space-y-4 hover:border-neutral-800 transition-colors">
              <div className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest flex justify-between items-center">
                <span>[MODULE_01]</span>
                <span className="text-[#C9A227]">LIGHTWEIGHT</span>
              </div>
              <h3 className="text-xl font-sans font-black text-white uppercase tracking-tight">280g Aeroshield</h3>
              <p className="text-neutral-400 text-xs leading-relaxed font-mono uppercase tracking-wide">
                Reduced overall chassis density without compromising lateral structural integrity. Feels completely weightless on track runs.
              </p>
            </div>

            {/* Story Card 2 */}
            <div className="story-card bg-neutral-950 border border-neutral-900 rounded-2xl p-6 space-y-4 hover:border-neutral-800 transition-colors">
              <div className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest flex justify-between items-center">
                <span>[MODULE_02]</span>
                <span className="text-amber-500">PROPULSIVE</span>
              </div>
              <h3 className="text-xl font-sans font-black text-white uppercase tracking-tight">Offset 6.0mm</h3>
              <p className="text-neutral-400 text-xs leading-relaxed font-mono uppercase tracking-wide">
                The perfect heel-to-toe drop ratio calculated for rapid transition phases, ensuring quicker forward acceleration.
              </p>
            </div>

            {/* Story Card 3 */}
            <div className="story-card bg-neutral-950 border border-neutral-900 rounded-2xl p-6 space-y-4 hover:border-neutral-800 transition-colors">
              <div className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest flex justify-between items-center">
                <span>[MODULE_03]</span>
                <span className="text-amber-400">CERTIFIED</span>
              </div>
              <h3 className="text-xl font-sans font-black text-white uppercase tracking-tight">Apex Standard</h3>
              <p className="text-neutral-400 text-xs leading-relaxed font-mono uppercase tracking-wide">
                Rigorously field-tested by over 40 top-tier international marathoners and professional sprinters across extreme weather parameters.
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
