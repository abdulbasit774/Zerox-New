import React, { useState } from 'react';
import { Mail, Globe, MapPin, Send, Check } from 'lucide-react';
import { motion } from 'motion/react';
import Logo from './Logo';

export default function Footer() {
  const [emailInput, setEmailInput] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput) {
      setSubscribed(true);
      setEmailInput('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1],
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <motion.footer
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-10%' }}
      variants={containerVariants}
      className="bg-black border-t border-neutral-950 py-16 px-6 sm:px-12 select-none overflow-hidden"
    >
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Top Segment: Brand Lockup & Newsletter subscription */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 pb-12 border-b border-neutral-950">
          
          <motion.div variants={itemVariants} className="space-y-4 max-w-sm">
            <Logo variant="horizontal" className="scale-100" />
            <p className="text-neutral-500 font-mono text-[10px] leading-relaxed uppercase tracking-wider">
              ZEROX is a premium luxury footwear brand built for athletes, creators, dreamers, and people who challenge their limits every day.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="w-full lg:w-auto space-y-3.5">
            <span className="font-mono text-[9px] tracking-widest text-[#C9A227] uppercase block font-semibold">
              JOIN THE ZEROX DROPS LIST
            </span>
            <form onSubmit={handleSubscribe} className="flex gap-2 w-full max-w-md">
              <div className="relative flex-1">
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="ENTER DISPATCH EMAIL"
                  className="w-full bg-neutral-950 border border-neutral-900 focus:border-[#C9A227] rounded-xl pl-10 pr-4 py-3 font-mono text-xs text-white focus:outline-none placeholder-neutral-700 transition-all uppercase tracking-wider focus:ring-1 focus:ring-[#C9A227]"
                />
                <Mail className="w-4 h-4 text-neutral-600 absolute left-3.5 top-3.5" />
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                className="bg-[#C9A227] hover:bg-amber-400 text-black px-5 rounded-xl font-mono text-xs uppercase font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-amber-500/10"
              >
                {subscribed ? <Check className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                {subscribed ? 'VERIFIED' : 'COMMIT'}
              </motion.button>
            </form>
            <span className="font-mono text-[7px] text-neutral-600 tracking-wider block uppercase">
              REGISTER TO SECURE AUTOMATIC VIP REVENUE STATUS FOR IN-BOUND DROP ALERTS.
            </span>
          </motion.div>

        </div>

        {/* Middle Segment: Lists of hubs & links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          
          <motion.div variants={itemVariants} className="space-y-3">
            <h5 className="font-mono text-[10px] tracking-widest text-white uppercase font-extrabold">DISTRIBUTION HUBS</h5>
            <ul className="space-y-2 font-mono text-[9px] text-neutral-500 uppercase tracking-wider">
              {['NYC_CENTRAL_01', 'TOKYO_EAST_05', 'LONDON_ORBIT_02', 'DUBAI_GULF_09'].map((hub, i) => (
                <motion.li
                  key={hub}
                  whileHover={{ x: 3, color: '#C9A227' }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="flex items-center gap-1.5 cursor-pointer"
                >
                  <MapPin className="w-3 h-3 text-[#C9A227]" /> {hub}
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-3">
            <h5 className="font-mono text-[10px] tracking-widest text-white uppercase font-extrabold">COLLECTIONS</h5>
            <ul className="space-y-2 font-mono text-[9px] text-neutral-500 uppercase tracking-wider">
              {['LIMITED DROP', 'PERFORMANCE TECH', 'FUTURISTIC SNEAKERS', 'LUXURY CASUAL'].map((col, i) => (
                <motion.li
                  key={col}
                  whileHover={{ x: 3, color: '#FFFFFF' }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="list-none"
                >
                  <button className="bg-transparent border-0 text-left hover:text-white transition-colors cursor-pointer uppercase font-mono text-[9px] p-0">
                    {col}
                  </button>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-3">
            <h5 className="font-mono text-[10px] tracking-widest text-white uppercase font-extrabold">CREATIVE SECTOR</h5>
            <ul className="space-y-2 font-mono text-[9px] text-neutral-500 uppercase tracking-wider">
              {['ZEROX LABS', 'LEDGER VERIFY', 'ATHLETE SYNC', 'CO-CREATORS CLUB'].map((sec, i) => (
                <motion.li
                  key={sec}
                  whileHover={{ x: 3, color: '#FFFFFF' }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="list-none"
                >
                  <button className="bg-transparent border-0 text-left hover:text-white transition-colors cursor-pointer uppercase font-mono text-[9px] p-0">
                    {sec}
                  </button>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-3">
            <h5 className="font-mono text-[10px] tracking-widest text-white uppercase font-extrabold">METRICS & SECURE</h5>
            <ul className="space-y-2 font-mono text-[9px] text-neutral-500 uppercase tracking-wider">
              <motion.li
                whileHover={{ x: 3, color: '#C9A227' }}
                className="flex items-center gap-1.5 cursor-pointer"
              >
                <Globe className="w-3 h-3 text-[#C9A227]" /> LATENCY: 0.02MS
              </motion.li>
              <li>SYSTEM: STABLE_V2</li>
              <li>REGIONAL CODES: WORLDWIDE</li>
              <li>LEGAL LEDGER POLICY</li>
            </ul>
          </motion.div>

        </div>

        {/* Bottom Segment: copyright & trademark labels */}
        <motion.div
          variants={itemVariants}
          className="pt-8 border-t border-neutral-950 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left"
        >
          <span className="font-mono text-[8px] text-neutral-600 tracking-widest uppercase">
            © 2026 ZEROX FOOTWEAR SYSTEMS AG. ALL RIGHTS RESERVED WORLDWIDE.
          </span>
          <span className="font-mono text-[8px] text-neutral-500 tracking-[0.25em] uppercase">
            MOVE BEYOND LIMITS — CHANNELS ACTIVE
          </span>
        </motion.div>

      </div>
    </motion.footer>
  );
}
