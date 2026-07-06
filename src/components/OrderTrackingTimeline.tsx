import React from 'react';
import { motion } from 'motion/react';
import { Clock, Check, Truck, MapPin, Package, AlertCircle, RotateCcw } from 'lucide-react';

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'PACKED' | 'SHIPPED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED' | 'RETURNED' | 'REFUNDED';

interface TimelineStep {
  status: OrderStatus;
  label: string;
  icon: React.ReactNode;
  timestamp?: Date;
  color: string;
}

interface OrderTrackingTimelineProps {
  currentStatus: OrderStatus;
  trackingNumber?: string;
  estimatedDelivery?: Date;
  timeline?: TimelineStep[];
}

export default function OrderTrackingTimeline({
  currentStatus,
  trackingNumber,
  estimatedDelivery,
  timeline
}: OrderTrackingTimelineProps) {
  const defaultTimeline: TimelineStep[] = [
    { status: 'PENDING', label: 'Order Placed', icon: <Clock className="w-4 h-4" />, color: 'amber' },
    { status: 'CONFIRMED', label: 'Confirmed', icon: <Check className="w-4 h-4" />, color: 'blue' },
    { status: 'PROCESSING', label: 'Processing', icon: <Package className="w-4 h-4" />, color: 'blue' },
    { status: 'PACKED', label: 'Packed', icon: <Package className="w-4 h-4" />, color: 'cyan' },
    { status: 'SHIPPED', label: 'Shipped', icon: <Truck className="w-4 h-4" />, color: 'cyan' },
    { status: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: <MapPin className="w-4 h-4" />, color: 'cyan' },
    { status: 'DELIVERED', label: 'Delivered', icon: <Check className="w-4 h-4" />, color: 'emerald' },
    { status: 'CANCELLED', label: 'Cancelled', icon: <AlertCircle className="w-4 h-4" />, color: 'red' },
    { status: 'RETURNED', label: 'Returned', icon: <RotateCcw className="w-4 h-4" />, color: 'yellow' },
    { status: 'REFUNDED', label: 'Refunded', icon: <Check className="w-4 h-4" />, color: 'emerald' }
  ];

  const steps = timeline || defaultTimeline;
  const statusIndex = steps.findIndex(s => s.status === currentStatus);
  const isException = currentStatus === 'CANCELLED' || currentStatus === 'RETURNED' || currentStatus === 'REFUNDED';

  const getColorClasses = (color: string, isCompleted: boolean) => {
    if (isCompleted) {
      switch (color) {
        case 'amber':
          return 'bg-amber-500 text-black';
        case 'blue':
          return 'bg-blue-500 text-white';
        case 'cyan':
          return 'bg-cyan-500 text-black';
        case 'emerald':
          return 'bg-emerald-500 text-black';
        case 'red':
          return 'bg-red-500 text-white';
        case 'yellow':
          return 'bg-yellow-500 text-black';
        default:
          return 'bg-neutral-600 text-white';
      }
    }
    return 'bg-neutral-800 text-neutral-500';
  };

  const getLineColor = (color: string, isCompleted: boolean) => {
    if (!isCompleted) return 'bg-neutral-800';
    switch (color) {
      case 'amber':
        return 'bg-amber-500';
      case 'blue':
        return 'bg-blue-500';
      case 'cyan':
        return 'bg-cyan-500';
      case 'emerald':
        return 'bg-emerald-500';
      case 'red':
        return 'bg-red-500';
      case 'yellow':
        return 'bg-yellow-500';
      default:
        return 'bg-neutral-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Summary */}
      <div className="bg-neutral-950/50 border border-neutral-900 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="font-mono text-xs text-neutral-500 tracking-wider uppercase mb-1">Current Status</p>
            <p className="font-sans text-lg font-bold text-white capitalize">
              {steps.find(s => s.status === currentStatus)?.label || currentStatus}
            </p>
          </div>
          <div className="text-right">
            {estimatedDelivery && (
              <>
                <p className="font-mono text-xs text-neutral-500 tracking-wider uppercase mb-1">Estimated Delivery</p>
                <p className="font-sans text-lg font-bold text-[#C9A227]">
                  {estimatedDelivery.toLocaleDateString()}
                </p>
              </>
            )}
          </div>
        </div>
        {trackingNumber && (
          <div className="pt-3 border-t border-neutral-900">
            <p className="font-mono text-xs text-neutral-500 tracking-wider uppercase mb-1">Tracking Number</p>
            <p className="font-mono text-sm text-neutral-300 font-semibold">{trackingNumber}</p>
          </div>
        )}
      </div>

      {/* Timeline */}
      <div>
        <p className="font-mono text-xs text-neutral-500 tracking-wider uppercase mb-4">Timeline Progress</p>
        <div className="space-y-0">
          {steps.map((step, idx) => {
            const isCompleted = idx <= statusIndex && !isException;
            const isCurrent = step.status === currentStatus;
            const color = step.color;

            return (
              <motion.div
                key={step.status}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex gap-4"
              >
                {/* Line & Icon */}
                <div className="flex flex-col items-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: idx * 0.05 + 0.1 }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${getColorClasses(color, isCompleted)} ${
                      isCurrent ? 'ring-4 ring-offset-2 ring-offset-black ring-current' : ''
                    }`}
                  >
                    {step.icon}
                  </motion.div>
                  {idx < steps.length - 1 && (
                    <div className={`w-1 h-12 mt-2 transition-all ${getLineColor(steps[idx + 1].color, idx < statusIndex || (idx === statusIndex && !isException))}`} />
                  )}
                </div>

                {/* Content */}
                <div className="pt-2 pb-4">
                  <p className={`font-sans font-semibold text-sm transition-colors ${isCompleted ? 'text-white' : 'text-neutral-500'}`}>
                    {step.label}
                  </p>
                  {step.timestamp && (
                    <p className="text-xs text-neutral-500 mt-1">
                      {step.timestamp.toLocaleDateString()} at {step.timestamp.toLocaleTimeString()}
                    </p>
                  )}
                  {isCurrent && isException === false && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs text-[#C9A227] mt-2 font-semibold"
                    >
                      ✓ Current Status
                    </motion.p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Status Message */}
      {isException && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4"
        >
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-sans font-semibold text-yellow-400 mb-1">Order Status Updated</p>
              <p className="text-sm text-neutral-300">
                {currentStatus === 'CANCELLED' && 'This order has been cancelled. Contact support if you need assistance.'}
                {currentStatus === 'RETURNED' && 'Your return is in progress. We\'ll process your refund once we receive your items.'}
                {currentStatus === 'REFUNDED' && 'Your refund has been processed. Check your payment method for the updated balance.'}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
