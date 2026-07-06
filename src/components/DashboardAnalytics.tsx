import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, Package, ShoppingCart, Heart, Award, Zap, Target, Star } from 'lucide-react';

interface AnalyticsData {
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
  wishlistCount: number;
  rewardPoints: number;
  totalSpent: number;
  membershipLevel: string;
}

interface DashboardAnalyticsProps {
  data: AnalyticsData;
  compact?: boolean;
}

function AnimatedCounter({ value, duration = 2 }: { value: number; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = value / (duration * 60);
    const interval = setInterval(() => {
      start += increment;
      if (start >= value) {
        setDisplayValue(value);
        clearInterval(interval);
      } else {
        setDisplayValue(Math.floor(start));
      }
    }, 1000 / 60);

    return () => clearInterval(interval);
  }, [value, duration]);

  return <span>{displayValue}</span>;
}

export default function DashboardAnalytics({ data, compact = false }: DashboardAnalyticsProps) {
  const analytics = [
    {
      icon: Package,
      label: 'Total Orders',
      value: data.totalOrders,
      color: 'blue',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
      textColor: 'text-blue-400'
    },
    {
      icon: Target,
      label: 'Completed',
      value: data.completedOrders,
      color: 'emerald',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/30',
      textColor: 'text-emerald-400'
    },
    {
      icon: Zap,
      label: 'Pending',
      value: data.pendingOrders,
      color: 'amber',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30',
      textColor: 'text-amber-400'
    },
    {
      icon: Heart,
      label: 'Wishlist Items',
      value: data.wishlistCount,
      color: 'red',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30',
      textColor: 'text-red-400'
    },
    {
      icon: Award,
      label: 'Reward Points',
      value: data.rewardPoints,
      color: 'amber',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30',
      textColor: 'text-amber-400',
      isCurrency: false
    },
    {
      icon: TrendingUp,
      label: 'Total Spent',
      value: data.totalSpent,
      color: 'cyan',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/30',
      textColor: 'text-cyan-400',
      isCurrency: true
    }
  ];

  if (compact) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {analytics.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`${stat.bgColor} border ${stat.borderColor} rounded-lg p-3 text-center`}
            >
              <Icon className={`w-4 h-4 ${stat.textColor} mx-auto mb-2`} />
              <p className="font-mono text-[10px] text-neutral-500 tracking-wider uppercase mb-1">
                {stat.label}
              </p>
              <p className={`font-sans text-lg font-black ${stat.textColor}`}>
                {stat.isCurrency ? '$' : ''}
                <AnimatedCounter value={Math.floor(stat.value)} />
              </p>
            </motion.div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-white">Your Dashboard</h2>
        <div className="flex items-center gap-2 px-4 py-2 bg-[#C9A227]/10 border border-[#C9A227]/30 rounded-xl">
          <Star className="w-4 h-4 text-[#C9A227]" />
          <span className="font-mono text-xs text-[#C9A227] font-bold tracking-wider uppercase">
            {data.membershipLevel} Member
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {analytics.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ y: -4 }}
              className={`${stat.bgColor} border ${stat.borderColor} rounded-xl p-6 hover:border-opacity-100 transition-all cursor-pointer group`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.bgColor} border ${stat.borderColor} group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
                <TrendingUp className="w-4 h-4 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              <p className="font-mono text-xs text-neutral-500 tracking-wider uppercase mb-2">
                {stat.label}
              </p>
              <p className={`font-sans text-4xl font-black ${stat.textColor} mb-1`}>
                {stat.isCurrency ? '$' : ''}
                <AnimatedCounter value={Math.floor(stat.value)} duration={2.5} />
              </p>

              {stat.label === 'Total Orders' && (
                <p className="text-xs text-neutral-400 mt-2">
                  {data.completedOrders} completed
                </p>
              )}
              {stat.label === 'Completed' && (
                <p className="text-xs text-neutral-400 mt-2">
                  {Math.round((data.completedOrders / Math.max(1, data.totalOrders)) * 100)}% success rate
                </p>
              )}
              {stat.label === 'Total Spent' && (
                <p className="text-xs text-neutral-400 mt-2">
                  Avg ${Math.round(data.totalSpent / Math.max(1, data.totalOrders))} per order
                </p>
              )}
              {stat.label === 'Reward Points' && (
                <p className="text-xs text-neutral-400 mt-2">
                  Redeem for discounts
                </p>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-r from-neutral-950/60 to-neutral-950/20 border border-neutral-900 rounded-xl p-6"
      >
        <h3 className="font-sans font-bold text-white mb-4">Account Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="font-mono text-xs text-neutral-500 tracking-wider uppercase mb-2">Lifetime Value</p>
            <p className="font-sans text-2xl font-black text-[#C9A227]">
              ${data.totalSpent.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="font-mono text-xs text-neutral-500 tracking-wider uppercase mb-2">Orders This Year</p>
            <p className="font-sans text-2xl font-black text-cyan-400">
              <AnimatedCounter value={data.totalOrders} duration={2} />
            </p>
          </div>
          <div>
            <p className="font-mono text-xs text-neutral-500 tracking-wider uppercase mb-2">Status</p>
            <p className="font-sans text-xl font-black text-emerald-400">
              {data.membershipLevel}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
