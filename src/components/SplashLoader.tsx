import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Logo from './Logo';

interface SplashLoaderProps {
  onComplete: () => void;
}

export default function SplashLoader({ onComplete }: SplashLoaderProps) {
  const [loadingText, setLoadingText] = useState('INITIATING CORE PROTOCOLS...');
  const [progress, setProgress] = useState(0);

  const loadingPhrases = [
    'INITIATING CORE PROTOCOLS...',
    'CALIBRATING INTEGRATED CARBON CHASSIS...',
    'SYNCHRONIZING ZEROX CLOUD LAB...',
    'OPTIMIZING DUAL-ZONE AIR-FLOAT CELLS...',
    'LAUNCHING GLOBAL CREATOR ECOSYSTEM...',
    'MOVE BEYOND LIMITS.'
  ];

  useEffect(() => {
    // Progress increment loop
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        // Speed up near the end
        const increment = prev < 30 ? 1.5 : prev < 75 ? 2.5 : 4;
        return Math.min(prev + increment, 100);
      });
    }, 45);

    return () => clearInterval(progressInterval);
  }, []);

  useEffect(() => {
    // Dynamic loading phrase based on progress
    const index = Math.min(
      Math.floor((progress / 100) * loadingPhrases.length),
      loadingPhrases.length - 1
    );
    setLoadingText(loadingPhrases[index]);

    if (progress === 100) {
      const delay = setTimeout(() => {
        onComplete();
      }, 900);
      return () => clearTimeout(delay);
    }
  }, [progress]);

  return (
    <motion.div
      id="splash-loader"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black select-none overflow-hidden"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, y: -40 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* High-end radial cinematic lighting overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(201,162,39,0.15)_0%,transparent_70%)] pointer-events-none animate-pulse duration-[4000ms]" />

      {/* Cyberpunk ambient matrix dots for premium texture */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,18,18,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(18,18,18,0.1)_1px,transparent_1px)] bg-[size:32px_32px] opacity-25" />

      {/* Main Content Container */}
      <div className="relative flex flex-col items-center justify-center max-w-md px-6">
        {/* Animated ZEROX Logo Lockup */}
        <motion.div
          initial={{ scale: 0.82, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          className="w-full text-white"
        >
          <Logo variant="full" glow={true} />
        </motion.div>

        {/* Dynamic Loading Meter */}
        <div className="w-64 mt-12 flex flex-col items-center gap-3">
          <div className="relative w-full h-[2px] bg-neutral-900 overflow-hidden rounded-full border border-neutral-900/40">
            {/* Glowing gold filling indicator */}
            <motion.div
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-amber-600 via-[#C9A227] to-amber-300 rounded-full shadow-[0_0_8px_#C9A227]"
              style={{ width: `${progress}%` }}
              layoutId="splash-progress"
            />
          </div>

          {/* Performance Data Metrics */}
          <div className="flex justify-between w-full font-mono text-[9px] tracking-widest text-neutral-500">
            <span>SYS_ACTIVATE</span>
            <span className="text-[#C9A227] font-semibold">{Math.floor(progress)}%</span>
          </div>

          {/* Interactive Loading Phrase */}
          <AnimatePresence mode="wait">
            <motion.span
              key={loadingText}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25 }}
              className="font-mono text-[9px] tracking-[0.25em] text-neutral-400 text-center uppercase mt-1 h-4 font-medium"
            >
              {loadingText}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      {/* Futuristic Border Markings */}
      <div className="absolute top-8 left-8 flex gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-[#C9A227]/40 animate-ping" />
        <span className="font-mono text-[8px] text-neutral-500 tracking-[0.3em]">ZRX_SYSTEM_ONLINE_NYC</span>
      </div>
      <div className="absolute bottom-8 right-8 flex items-center gap-3">
        <span className="font-mono text-[8px] text-neutral-500 tracking-[0.3em]">LATENCY_0.02MS</span>
        <div className="h-[1px] w-8 bg-neutral-800" />
      </div>
    </motion.div>
  );
}
