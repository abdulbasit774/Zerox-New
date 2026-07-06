import React from 'react';

interface LogoProps {
  variant?: 'full' | 'symbol' | 'compact' | 'horizontal';
  className?: string;
  glow?: boolean;
}

export default function Logo({ variant = 'full', className = '', glow = false }: LogoProps) {
  // Customized SVG representing the premium ZEROX stylized 'Z' symbol
  const symbolSVG = (
    <svg
      viewBox="0 0 100 65"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      <defs>
        {/* Luxury Gold Gradient */}
        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF1BE" />
          <stop offset="50%" stopColor="#C9A227" />
          <stop offset="100%" stopColor="#87680D" />
        </linearGradient>
        {/* Platinum/Chrome Gradient */}
        <linearGradient id="silverGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#9E9E9E" />
        </linearGradient>
        {/* Radial Ambient Glow */}
        <filter id="logoGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* The Stylized High-Performance Z Shape */}
      <path
        d="M 36.5 34.2 C 36.5 34.2 39.5 30 43 30 H 70 L 65.5 34.2 L 43.5 56.5 H 62.5 L 58 60.7 H 33 L 39 54.8 L 54.5 39.2 L 41 39.2 L 36.5 34.2 Z"
        fill="currentColor"
        filter={glow ? "url(#logoGlow)" : undefined}
      />
    </svg>
  );

  // Compact layout: Symbol + "ZEROX" text
  if (variant === 'symbol') {
    return (
      <div className={`relative flex items-center justify-center ${className}`}>
        <div className="w-12 h-12 text-white hover:text-amber-500 transition-colors duration-300">
          {symbolSVG}
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`flex flex-col items-center justify-center ${className}`}>
        <div className="w-14 h-10 text-white">
          {symbolSVG}
        </div>
        <h1 className="text-white font-sans font-black tracking-[0.25em] text-lg mt-1 select-none">
          ZEROX
        </h1>
      </div>
    );
  }

  if (variant === 'horizontal') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="w-10 h-8 text-white">
          {symbolSVG}
        </div>
        <span className="text-white font-sans font-black tracking-[0.2em] text-base select-none">
          ZEROX
        </span>
      </div>
    );
  }

  // Full brand lockup: Symbol + "ZEROX" + "— MOVE BEYOND LIMITS —"
  return (
    <div className={`flex flex-col items-center text-center justify-center ${className}`}>
      {/* Big Z Symbol */}
      <div className="w-32 h-20 text-white hover:scale-105 transition-transform duration-500">
        {symbolSVG}
      </div>

      {/* ZEROX Wide Brand Font */}
      <h1 className="text-white font-sans font-black tracking-[0.35em] text-4xl sm:text-5xl mt-2 select-none">
        ZEROX
      </h1>

      {/* Line + Tagline + Line */}
      <div className="flex items-center justify-center w-full max-w-[340px] mt-4 gap-2 select-none">
        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-amber-500/60" />
        <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.45em] text-[#C9A227] font-semibold font-mono whitespace-nowrap">
          MOVE BEYOND LIMITS
        </span>
        <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-amber-500/60" />
      </div>
    </div>
  );
}
