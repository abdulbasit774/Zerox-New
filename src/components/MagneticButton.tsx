import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  strength?: number; // scale factor of pull strength (default 0.35)
}

export default function MagneticButton({
  children,
  className = '',
  onClick,
  strength = 0.35,
}: MagneticButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  // Motion values for smooth physical drag spring response
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 15, stiffness: 150, mass: 0.1 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: MouseEvent) => {
    if (!buttonRef.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = buttonRef.current.getBoundingClientRect();

    // Center of the button
    const centerX = left + width / 2;
    const centerY = top + height / 2;

    // Distance from mouse to center
    const distDeltaX = clientX - centerX;
    const distDeltaY = clientY - centerY;

    const distance = Math.hypot(distDeltaX, distDeltaY);

    // Pull button coordinates if within magnetic field (button bounds + extra padding)
    const activeRadius = Math.max(width, height) * 1.5;

    if (distance < activeRadius) {
      setIsHovered(true);
      // Pull strength scaled by distance
      x.set(distDeltaX * strength);
      y.set(distDeltaY * strength);
    } else {
      setIsHovered(false);
      x.set(0);
      y.set(0);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [strength]);

  return (
    <motion.button
      ref={buttonRef}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{ x: springX, y: springY }}
      className={`relative select-none outline-none focus:outline-none transition-shadow ${className}`}
    >
      {/* Interactive hover glow circle background */}
      <motion.div
        animate={{ scale: isHovered ? 1.05 : 0.98 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 bg-white/[0.02] rounded-xl border border-neutral-800 group-hover:border-neutral-700 pointer-events-none"
      />
      
      {/* Content wrapper with secondary magnet drag offset for three-dimensional parallax */}
      <span className="relative z-10 block pointer-events-none">
        {children}
      </span>
    </motion.button>
  );
}
