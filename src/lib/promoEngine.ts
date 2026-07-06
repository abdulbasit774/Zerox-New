/**
 * Promo Engine
 * Handles coupons, gift cards, and discount calculations
 */

export interface Coupon {
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed' | 'free_shipping' | 'free_item';
  value: number;
  maxDiscount?: number;
  minPurchase?: number;
  maxUses?: number;
  currentUses?: number;
  expiryDate?: string;
  active: boolean;
  vipOnly?: boolean;
  applicableCategories?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface GiftCard {
  code: string;
  balance: number;
  originalBalance: number;
  expiryDate?: string;
  active: boolean;
  transactions: GiftCardTransaction[];
  createdAt: string;
  updatedAt: string;
}

export interface GiftCardTransaction {
  transactionId: string;
  orderId: string;
  amount: number;
  timestamp: string;
  description: string;
}

/**
 * Validate coupon code
 */
export async function validateCoupon(
  couponCode: string,
  subtotal: number,
  userTier?: string
): Promise<{ valid: boolean; coupon?: Coupon; error?: string }> {
  const code = couponCode.toUpperCase().trim();

  // Validate format
  if (!code || code.length < 3) {
    return { valid: false, error: 'Invalid coupon code format' };
  }

  // Mock database lookup
  const mockCoupons: Record<string, Coupon> = {
    ZEROX20: {
      code: 'ZEROX20',
      description: '20% off total order',
      discountType: 'percentage',
      value: 20,
      maxDiscount: undefined,
      minPurchase: 50,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    GIFT50: {
      code: 'GIFT50',
      description: '$50 fixed discount',
      discountType: 'fixed',
      value: 50,
      minPurchase: 100,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    FREESHIP: {
      code: 'FREESHIP',
      description: 'Free shipping on all orders',
      discountType: 'free_shipping',
      value: 0,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    VIP100: {
      code: 'VIP100',
      description: '$100 VIP discount',
      discountType: 'fixed',
      value: 100,
      vipOnly: true,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  };

  const coupon = mockCoupons[code];

  if (!coupon) {
    return { valid: false, error: 'Coupon code not found' };
  }

  if (!coupon.active) {
    return { valid: false, error: 'Coupon is no longer active' };
  }

  if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
    return { valid: false, error: 'Coupon has expired' };
  }

  if (coupon.maxUses && coupon.currentUses && coupon.currentUses >= coupon.maxUses) {
    return { valid: false, error: 'Coupon usage limit reached' };
  }

  if (coupon.minPurchase && subtotal < coupon.minPurchase) {
    return { valid: false, error: `Minimum purchase of $${coupon.minPurchase} required` };
  }

  if (coupon.vipOnly && userTier !== 'Apex Founder' && userTier !== 'Elite') {
    return { valid: false, error: 'This coupon is for VIP members only' };
  }

  return { valid: true, coupon };
}

/**
 * Calculate discount amount
 */
export function calculateDiscount(
  coupon: Coupon,
  subtotal: number
): { discountAmount: number; isFreeShipping: boolean } {
  let discountAmount = 0;
  let isFreeShipping = false;

  switch (coupon.discountType) {
    case 'percentage':
      discountAmount = (subtotal * coupon.value) / 100;
      if (coupon.maxDiscount) {
        discountAmount = Math.min(discountAmount, coupon.maxDiscount);
      }
      break;
    case 'fixed':
      discountAmount = coupon.value;
      break;
    case 'free_shipping':
      isFreeShipping = true;
      break;
    case 'free_item':
      // Implement free item logic based on lowest priced item
      discountAmount = coupon.value;
      break;
  }

  return { discountAmount, isFreeShipping };
}

/**
 * Validate gift card
 */
export async function validateGiftCard(
  giftCardCode: string
): Promise<{ valid: boolean; giftCard?: GiftCard; error?: string }> {
  const code = giftCardCode.toUpperCase().trim();

  if (!code || code.length < 8) {
    return { valid: false, error: 'Invalid gift card code format' };
  }

  // Mock database lookup
  const mockGiftCards: Record<string, GiftCard> = {
    GIFT25ABC123: {
      code: 'GIFT25ABC123',
      balance: 25,
      originalBalance: 25,
      active: true,
      transactions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    GIFT100XYZ789: {
      code: 'GIFT100XYZ789',
      balance: 75.50,
      originalBalance: 100,
      active: true,
      transactions: [
        {
          transactionId: 'txn_001',
          orderId: 'ZRX-001',
          amount: 24.50,
          timestamp: new Date().toISOString(),
          description: 'Purchase at ZEROX Store',
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  };

  const giftCard = mockGiftCards[code];

  if (!giftCard) {
    return { valid: false, error: 'Gift card not found' };
  }

  if (!giftCard.active) {
    return { valid: false, error: 'Gift card is inactive' };
  }

  if (giftCard.expiryDate && new Date(giftCard.expiryDate) < new Date()) {
    return { valid: false, error: 'Gift card has expired' };
  }

  if (giftCard.balance <= 0) {
    return { valid: false, error: 'Gift card has no remaining balance' };
  }

  return { valid: true, giftCard };
}

/**
 * Redeem gift card
 */
export function redeemGiftCard(
  giftCard: GiftCard,
  amount: number
): { success: boolean; newBalance: number; error?: string } {
  if (amount > giftCard.balance) {
    return {
      success: false,
      newBalance: giftCard.balance,
      error: `Insufficient gift card balance. Available: $${giftCard.balance.toFixed(2)}, Requested: $${amount.toFixed(2)}`,
    };
  }

  const newBalance = giftCard.balance - amount;

  return { success: true, newBalance };
}

/**
 * Calculate tax based on location
 */
export function calculateTax(
  subtotal: number,
  state?: string,
  country?: string
): { taxAmount: number; taxRate: number; taxType: string } {
  let taxRate = 0;
  let taxType = 'Sales Tax';

  // US tax calculation
  if (country === 'United States') {
    const usStateTaxRates: Record<string, number> = {
      'CA': 0.0725,
      'NY': 0.08,
      'TX': 0.0625,
      'FL': 0.07,
      'PA': 0.06,
      'IL': 0.0625,
      'OH': 0.0575,
      'GA': 0.07,
      'NC': 0.07,
      'MI': 0.06,
    };

    taxRate = usStateTaxRates[state || 'NY'] || 0.08;
  }
  // EU VAT
  else if (country === 'Germany' || country === 'France' || country === 'Netherlands') {
    taxRate = 0.19; // Standard VAT
    taxType = 'VAT';
  }
  // UK VAT
  else if (country === 'United Kingdom') {
    taxRate = 0.20;
    taxType = 'VAT';
  }
  // Default
  else {
    taxRate = 0.08;
  }

  const taxAmount = subtotal * taxRate;

  return { taxAmount, taxRate, taxType };
}

/**
 * Calculate shipping cost
 */
export function calculateShipping(
  method: 'standard' | 'express' | 'priority',
  weight?: number,
  destination?: string
): number {
  let baseCost = 0;

  switch (method) {
    case 'standard':
      baseCost = 0; // Free
      break;
    case 'express':
      baseCost = 15; // 2-3 business days
      break;
    case 'priority':
      baseCost = 35; // Next day delivery
      break;
  }

  // International shipping surcharge
  if (destination && destination !== 'United States') {
    baseCost *= 2;
  }

  return baseCost;
}

/**
 * Generate gift card code
 */
export function generateGiftCardCode(): string {
  const prefix = 'GIFT';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `${prefix}${timestamp}${random}`;
}

/**
 * Generate coupon code
 */
export function generateCouponCode(prefix = 'ZRX'): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = prefix;
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Format promo display
 */
export function formatPromoDisplay(coupon: Coupon): string {
  switch (coupon.discountType) {
    case 'percentage':
      return `${coupon.value}% OFF`;
    case 'fixed':
      return `$${coupon.value.toFixed(2)} OFF`;
    case 'free_shipping':
      return 'FREE SHIPPING';
    case 'free_item':
      return `FREE ITEM (Up to $${coupon.value.toFixed(2)})`;
    default:
      return 'DISCOUNT APPLIED';
  }
}
