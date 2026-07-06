import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Bell, CheckCircle, AlertCircle, Package, Heart, Gift, Clock } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'offer' | 'refund' | 'return' | 'coupon' | 'announcement';
  read: boolean;
  date: Date;
  icon?: React.ReactNode;
}

interface NotificationCenterProps {
  notifications: Notification[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onMarkAllRead?: () => void;
}

export default function NotificationCenter({
  notifications,
  unreadCount,
  onMarkAsRead,
  onDelete,
  onMarkAllRead
}: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <Package className="w-4 h-4 text-blue-400" />;
      case 'offer':
        return <Gift className="w-4 h-4 text-amber-400" />;
      case 'refund':
        return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case 'return':
        return <AlertCircle className="w-4 h-4 text-yellow-400" />;
      case 'coupon':
        return <Heart className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-3 hover:bg-neutral-900 rounded-xl transition-colors"
      >
        <Bell className="w-5 h-5 text-neutral-400 hover:text-[#C9A227]" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="notification-panel"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-full right-0 mt-2 w-96 bg-neutral-950 border border-neutral-900 rounded-2xl shadow-2xl z-50 max-h-[500px] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-neutral-950 to-black border-b border-neutral-900 p-4 flex items-center justify-between">
              <h3 className="font-sans font-bold text-white">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && onMarkAllRead && (
                  <button
                    onClick={() => {
                      onMarkAllRead();
                      setIsOpen(false);
                    }}
                    className="text-xs text-[#C9A227] hover:text-amber-400 font-mono tracking-wider uppercase"
                  >
                    Mark All Read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-neutral-900 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-neutral-400" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="text-center py-8 px-4">
                  <Bell className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
                  <p className="text-sm text-neutral-400">No notifications yet</p>
                </div>
              ) : (
                <div className="space-y-2 p-2">
                  {notifications.map((notif) => (
                    <motion.div
                      key={notif.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        notif.read
                          ? 'bg-neutral-950 border-neutral-900'
                          : 'bg-[#C9A227]/10 border-[#C9A227]/30 hover:border-[#C9A227]/50'
                      }`}
                      onClick={() => !notif.read && onMarkAsRead(notif.id)}
                    >
                      <div className="flex items-start gap-2">
                        <div className="mt-1">{getNotificationIcon(notif.type)}</div>
                        <div className="flex-1">
                          <p className={`font-sans text-sm font-semibold ${notif.read ? 'text-neutral-400' : 'text-white'}`}>
                            {notif.title}
                          </p>
                          <p className="text-xs text-neutral-500 mt-1">{notif.message}</p>
                          <p className="text-[10px] text-neutral-600 mt-1">
                            {notif.date.toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(notif.id);
                          }}
                          className="p-1 hover:bg-red-900/20 rounded transition-colors flex-shrink-0"
                        >
                          <X className="w-3 h-3 text-neutral-400" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
