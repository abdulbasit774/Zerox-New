import React, { useEffect, useState, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';

export default function CustomCursor() {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [clickActive, setClickActive] = useState(false);
  const cursorRef = useRef<HTMLDivElement>(null);

  // Position of cursor
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 350, mass: 0.2 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  useEffect(() => {
    // Hide cursor if touch device is detected
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) {
      setIsVisible(false);
      return;
    }

    const moveCursor = (e: MouseEvent) => {
      mouseX.set(e.clientX - 10);
      mouseY.set(e.clientY - 10);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    // Global listener for hover interaction tags
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const isClickable = 
        target.closest('button') ||
        target.closest('a') ||
        target.closest('[role="button"]') ||
        target.closest('.cursor-pointer') ||
        target.closest('input') ||
        target.closest('select') ||
        target.closest('textarea') ||
        window.getComputedStyle(target).cursor === 'pointer';

      setIsHovered(!!isClickable);
    };

    const handleMouseDown = () => setClickActive(true);
    const handleMouseUp = () => setClickActive(false);

    window.addEventListener('mousemove', moveCursor);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);
    window.addEventListener('mouseover', handleMouseOver);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    // Hide standard cursor
    document.body.style.cursor = 'none';

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'auto';
    };
  }, [mouseX, mouseY, isVisible]);

  if (!isVisible) return null;

  return (
    <>
      {/* Outer Glow Ring */}
      <motion.div
        ref={cursorRef}
        className="fixed top-0 left-0 w-5 h-5 rounded-full pointer-events-none z-50 mix-blend-screen transform-gpu"
        style={{
          x: cursorX,
          y: cursorY,
          border: isHovered ? '1px solid rgba(201,162,39,0.8)' : '1px solid rgba(255,255,255,0.4)',
          backgroundColor: isHovered ? 'rgba(201,162,39,0.1)' : 'transparent',
          boxShadow: isHovered ? '0 0 15px rgba(201,162,39,0.5)' : 'none',
        }}
        animate={{
          scale: clickActive ? 0.75 : isHovered ? 2.0 : 1,
        }}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 20,
        }}
      />

      {/* Inner Pinpoint Core */}
      <motion.div
        className="fixed top-0 left-0 w-1.5 h-1.5 bg-[#C9A227] rounded-full pointer-events-none z-50 transform-gpu"
        style={{
          x: useSpring(mouseX, { damping: 15, stiffness: 500, mass: 0.1 }),
          y: useSpring(mouseY, { damping: 15, stiffness: 500, mass: 0.1 }),
          left: '7px',
          top: '7px',
        }}
        animate={{
          scale: isHovered ? 0.5 : 1,
          backgroundColor: isHovered ? '#FFFFFF' : '#C9A227',
        }}
      />
    </>
  );
}
