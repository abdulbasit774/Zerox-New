import React from 'react';
import { motion } from 'motion/react';

interface AnimatedTypographyProps {
  text: string;
  className?: string;
  variant?: 'word' | 'letter' | 'blur-reveal' | 'typewriter' | 'mask-reveal' | 'glow-wave';
  delay?: number;
  duration?: number;
}

export default function AnimatedTypography({
  text,
  className = '',
  variant = 'word',
  delay = 0,
  duration = 0.55,
}: AnimatedTypographyProps) {
  // Setup variations of word and letter groupings
  const words = text.split(' ');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: (customDelay: number) => ({
      opacity: 1,
      transition: {
        staggerChildren: variant === 'word' ? 0.08 : 0.03,
        delayChildren: customDelay,
      },
    }),
  };

  const getWordVariants = () => {
    switch (variant) {
      case 'mask-reveal':
        return {
          hidden: { y: '105%', opacity: 0 },
          visible: {
            y: 0,
            opacity: 1,
            transition: { duration: duration, ease: [0.16, 1, 0.3, 1] },
          },
        };
      case 'blur-reveal':
        return {
          hidden: { filter: 'blur(10px)', opacity: 0, scale: 0.96 },
          visible: {
            filter: 'blur(0px)',
            opacity: 1,
            scale: 1,
            transition: { duration: duration + 0.2, ease: [0.16, 1, 0.3, 1] },
          },
        };
      case 'glow-wave':
        return {
          hidden: { y: 15, opacity: 0 },
          visible: {
            y: 0,
            opacity: 1,
            textShadow: [
              '0 0 20px rgba(201, 162, 39, 0.9)',
              '0 0 8px rgba(201, 162, 39, 0.4)',
              '0 0 0px rgba(201, 162, 39, 0)',
            ],
            transition: { duration: duration + 0.1, ease: [0.16, 1, 0.3, 1] },
          },
        };
      case 'typewriter':
        return {
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { duration: 0.05 },
          },
        };
      case 'word':
      default:
        return {
          hidden: { y: '40%', opacity: 0 },
          visible: {
            y: 0,
            opacity: 1,
            transition: { duration: duration, ease: [0.16, 1, 0.3, 1] },
          },
        };
    }
  };

  const itemVariants = getWordVariants();

  // If word-based reveal, render word by word
  if (variant === 'word' || variant === 'blur-reveal' && words.length > 2) {
    return (
      <motion.span
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-5%' }}
        custom={delay}
        className={`inline-flex flex-wrap overflow-hidden leading-tight ${className}`}
      >
        {words.map((word, idx) => (
          <span
            key={idx}
            className="overflow-hidden inline-block mr-[0.25em] last:mr-0 py-0.5"
          >
            <motion.span
              variants={itemVariants}
              className="inline-block origin-bottom transform-gpu"
            >
              {word === '' ? '\u00A0' : word}
            </motion.span>
          </span>
        ))}
      </motion.span>
    );
  }

  // Otherwise, perform letter-by-letter, mask-reveal, glow-wave, or typewriter letter reveals
  return (
    <motion.span
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-5%' }}
      custom={delay}
      className={`inline-flex flex-wrap overflow-hidden leading-tight ${className}`}
    >
      {words.map((word, wIdx) => (
        <span key={wIdx} className="inline-block mr-[0.25em] last:mr-0 whitespace-nowrap overflow-hidden py-0.5">
          {word.split('').map((char, cIdx) => (
            <span key={cIdx} className="inline-block overflow-hidden">
              <motion.span
                variants={itemVariants}
                className="inline-block origin-center transform-gpu"
              >
                {char}
              </motion.span>
            </span>
          ))}
        </span>
      ))}
      {variant === 'typewriter' && (
        <motion.span
          animate={{ opacity: [1, 0, 1] }}
          transition={{ repeat: Infinity, duration: 0.8, ease: 'easeInOut' }}
          className="inline-block w-[2px] h-[1em] bg-[#C9A227] ml-0.5 self-center"
        />
      )}
    </motion.span>
  );
}

