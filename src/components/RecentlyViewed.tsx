import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Clock, X, Eye, ShoppingCart } from 'lucide-react';

export interface ViewedProduct {
  id: string;
  name: string;
  price: number;
  image?: string;
  viewedAt: Date;
  category?: string;
}

interface RecentlyViewedProps {
  products?: ViewedProduct[];
  maxItems?: number;
  onClearHistory?: () => void;
  onAddToCart?: (productId: string) => void;
  onRemoveItem?: (productId: string) => void;
  compact?: boolean;
}

export default function RecentlyViewed({
  products = [],
  maxItems = 5,
  onClearHistory,
  onAddToCart,
  onRemoveItem,
  compact = false
}: RecentlyViewedProps) {
  const displayProducts = products.slice(0, maxItems);

  if (displayProducts.length === 0) {
    return null;
  }

  if (compact) {
    // Horizontal scrolling carousel for homepage
    return (
      <section className="py-8 px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="font-mono text-xs text-neutral-500 tracking-wider uppercase mb-2">YOUR BROWSING</p>
            <h2 className="font-sans text-2xl font-black text-white">Recently Viewed</h2>
          </div>
          {products.length > 0 && (
            <button
              onClick={onClearHistory}
              className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-white rounded-lg font-mono text-xs font-semibold tracking-wider uppercase cursor-pointer transition-colors"
            >
              Clear History
            </button>
          )}
        </div>

        <div className="overflow-x-auto pb-2 -mx-8 px-8">
          <div className="flex gap-4 w-max">
            {displayProducts.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ y: -5 }}
                className="w-56 bg-gradient-to-br from-neutral-950/60 to-neutral-950/20 border border-neutral-900 rounded-xl overflow-hidden hover:border-[#C9A227]/50 transition-all group"
              >
                {/* Image Placeholder */}
                <div className="w-full h-48 bg-neutral-900 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#C9A227]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Eye className="w-8 h-8 text-neutral-600" />
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  <div>
                    <p className="font-sans font-bold text-white text-sm mb-1 line-clamp-2">
                      {product.name}
                    </p>
                    {product.category && (
                      <p className="text-xs text-neutral-500">{product.category}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="font-sans font-black text-[#C9A227]">${product.price.toFixed(2)}</p>
                    <p className="text-[10px] text-neutral-600">
                      {Math.round((Date.now() - new Date(product.viewedAt).getTime()) / (1000 * 60))} min ago
                    </p>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-neutral-900">
                    <button
                      onClick={() => onAddToCart?.(product.id)}
                      className="flex-1 py-2 bg-[#C9A227] hover:bg-amber-500 text-black rounded-lg font-mono text-xs font-bold uppercase cursor-pointer transition-colors flex items-center justify-center gap-1"
                    >
                      <ShoppingCart className="w-3 h-3" />
                      Add
                    </button>
                    <button
                      onClick={() => onRemoveItem?.(product.id)}
                      className="p-2 hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <X className="w-3 h-3 text-red-400" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Full list view for dashboard
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-[#C9A227]" />
          <h3 className="font-sans font-bold text-white">Recently Viewed</h3>
        </div>
        {products.length > 0 && (
          <button
            onClick={onClearHistory}
            className="text-xs text-neutral-500 hover:text-red-400 font-mono uppercase tracking-wider"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
        {displayProducts.map((product) => {
          const minutesAgo = Math.round((Date.now() - new Date(product.viewedAt).getTime()) / (1000 * 60));
          let timeText = '';
          if (minutesAgo < 60) {
            timeText = `${minutesAgo}m ago`;
          } else if (minutesAgo < 1440) {
            timeText = `${Math.floor(minutesAgo / 60)}h ago`;
          } else {
            timeText = `${Math.floor(minutesAgo / 1440)}d ago`;
          }

          return (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4 }}
              className="bg-neutral-950/50 border border-neutral-900 rounded-xl overflow-hidden hover:border-[#C9A227]/50 transition-all group cursor-pointer"
            >
              {/* Image */}
              <div className="w-full aspect-square bg-neutral-900 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#C9A227]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <Eye className="w-6 h-6 text-neutral-600 group-hover:text-[#C9A227] transition-colors" />
              </div>

              {/* Content */}
              <div className="p-3 space-y-2">
                <div>
                  <p className="font-sans font-semibold text-white text-xs line-clamp-2">
                    {product.name}
                  </p>
                  <p className="text-[10px] text-neutral-600 mt-1">{timeText}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-neutral-900">
                  <p className="font-sans font-bold text-[#C9A227] text-sm">
                    ${product.price.toFixed(2)}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveItem?.(product.id);
                    }}
                    className="p-1 hover:bg-red-900/20 rounded transition-colors"
                  >
                    <X className="w-3 h-3 text-neutral-400" />
                  </button>
                </div>

                <button
                  onClick={() => onAddToCart?.(product.id)}
                  className="w-full py-1.5 bg-neutral-900 hover:bg-[#C9A227] text-white hover:text-black rounded-lg font-mono text-[10px] font-bold uppercase cursor-pointer transition-colors"
                >
                  Add to Cart
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
