/**
 * Payment Integration Module
 * Handles all payment processing methods and validation
 */

export interface PaymentResult {
  success: boolean;
  paymentId: string;
  transactionId: string;
  amount: number;
  method: string;
  timestamp: string;
  details?: any;
}

export interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon?: string;
  requiresConfig?: boolean;
  isConfigured?: boolean;
}

// Available payment methods
export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'card',
    name: 'Credit/Debit Card',
    description: 'Visa, Mastercard, American Express',
    requiresConfig: false,
    isConfigured: true,
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Stripe SDK integration',
    requiresConfig: true,
    isConfigured: false, // PENDING CONFIGURATION - requires API key
  },
  {
    id: 'express',
    name: 'Apple Pay / Google Pay',
    description: 'One-tap secure payment',
    requiresConfig: true,
    isConfigured: false, // PENDING CONFIGURATION - requires merchant setup
  },
  {
    id: 'paypal',
    name: 'PayPal',
    description: 'PayPal account payment',
    requiresConfig: true,
    isConfigured: false, // PENDING CONFIGURATION - requires API credentials
  },
  {
    id: 'bank',
    name: 'Bank Transfer',
    description: 'Direct bank wire transfer',
    requiresConfig: false,
    isConfigured: true,
  },
  {
    id: 'cod',
    name: 'Cash on Delivery',
    description: 'Pay when you receive',
    requiresConfig: false,
    isConfigured: true,
  },
];

/**
 * Validate card number using Luhn algorithm
 */
export function validateCardNumber(cardNumber: string): boolean {
  const cleaned = cardNumber.replace(/\s+/g, '');
  if (!/^\d{13,19}$/.test(cleaned)) return false;

  let sum = 0;
  let isEven = false;

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

/**
 * Validate expiry date format MM/YY
 */
export function validateExpiryDate(expiry: string): boolean {
  const match = expiry.match(/^(\d{2})\/(\d{2})$/);
  if (!match) return false;

  const month = parseInt(match[1], 10);
  const year = parseInt(match[2], 10);

  if (month < 1 || month > 12) return false;

  const currentYear = new Date().getFullYear() % 100;
  const currentMonth = new Date().getMonth() + 1;

  if (year < currentYear) return false;
  if (year === currentYear && month < currentMonth) return false;

  return true;
}

/**
 * Validate CVV (3-4 digits)
 */
export function validateCVV(cvv: string): boolean {
  return /^\d{3,4}$/.test(cvv.trim());
}

/**
 * Validate ZIP code
 */
export function validateZIPCode(zip: string): boolean {
  // US ZIP code format (5 or 9 digits)
  return /^\d{5}(-\d{4})?$/.test(zip.trim());
}

/**
 * Process card payment
 */
export async function processCardPayment(
  cardNumber: string,
  expiry: string,
  cvv: string,
  amount: number,
  cardholderName: string,
  billingAddress: string,
  zipCode: string
): Promise<PaymentResult> {
  // Validate inputs
  if (!validateCardNumber(cardNumber)) {
    throw new Error('Invalid card number');
  }
  if (!validateExpiryDate(expiry)) {
    throw new Error('Invalid expiry date');
  }
  if (!validateCVV(cvv)) {
    throw new Error('Invalid CVV');
  }
  if (!validateZIPCode(zipCode)) {
    throw new Error('Invalid ZIP code');
  }
  if (!cardholderName.trim()) {
    throw new Error('Cardholder name is required');
  }

  // Simulate payment processing
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const success = Math.random() > 0.05; // 95% success rate
      if (success) {
        resolve({
          success: true,
          paymentId: `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          amount,
          method: 'card',
          timestamp: new Date().toISOString(),
          details: {
            cardLast4: cardNumber.slice(-4),
            cardBrand: detectCardBrand(cardNumber),
            cardholder: cardholderName,
          },
        });
      } else {
        reject(new Error('Card declined'));
      }
    }, 2000);
  });
}

/**
 * Detect card brand from card number
 */
function detectCardBrand(cardNumber: string): string {
  const cleaned = cardNumber.replace(/\s+/g, '');
  if (/^4[0-9]{12}(?:[0-9]{3})?$/.test(cleaned)) return 'Visa';
  if (/^5[1-5][0-9]{14}$/.test(cleaned)) return 'Mastercard';
  if (/^3[47][0-9]{13}$/.test(cleaned)) return 'American Express';
  if (/^6(?:011|5[0-9]{2})[0-9]{12}$/.test(cleaned)) return 'Discover';
  return 'Unknown';
}

/**
 * Process PayPal payment
 * PENDING CONFIGURATION - Requires PayPal API credentials
 */
export async function processPayPalPayment(amount: number): Promise<PaymentResult> {
  console.log('[Payment] PayPal payment processing - PENDING CONFIGURATION');
  // This would redirect to PayPal or use their SDK
  // For now, return a pending status
  throw new Error('PayPal integration requires API configuration');
}

/**
 * Process Apple Pay
 * PENDING CONFIGURATION - Requires Apple Pay merchant setup
 */
export async function processApplePayment(amount: number): Promise<PaymentResult> {
  console.log('[Payment] Apple Pay processing - PENDING CONFIGURATION');
  throw new Error('Apple Pay requires merchant setup');
}

/**
 * Process Google Pay
 * PENDING CONFIGURATION - Requires Google Pay API setup
 */
export async function processGooglePayment(amount: number): Promise<PaymentResult> {
  console.log('[Payment] Google Pay processing - PENDING CONFIGURATION');
  throw new Error('Google Pay requires API configuration');
}

/**
 * Process Stripe payment
 * PENDING CONFIGURATION - Requires Stripe API key
 */
export async function processStripePayment(amount: number, paymentMethodId: string): Promise<PaymentResult> {
  console.log('[Payment] Stripe payment processing - PENDING CONFIGURATION');
  // This would use Stripe.js and your backend
  throw new Error('Stripe integration requires API key configuration');
}

/**
 * Process Bank Transfer
 */
export async function processBankTransfer(amount: number, orderReference: string): Promise<PaymentResult> {
  return {
    success: true,
    paymentId: `bank_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    amount,
    method: 'bank',
    timestamp: new Date().toISOString(),
    details: {
      bankName: 'APEX TREASURY NYC',
      routingNumber: '021000021',
      accountNumber: '9834-0192-882',
      reference: orderReference,
      status: 'PENDING',
      note: 'Please upload payment receipt to dashboard for verification',
    },
  };
}

/**
 * Process Cash on Delivery
 */
export async function processCashOnDelivery(amount: number): Promise<PaymentResult> {
  return {
    success: true,
    paymentId: `cod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    amount,
    method: 'cod',
    timestamp: new Date().toISOString(),
    details: {
      status: 'PENDING',
      note: 'Payment will be collected at delivery',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
  };
}

/**
 * Retry failed payment
 */
export async function retryPayment(
  paymentId: string,
  method: string,
  amount: number
): Promise<PaymentResult> {
  console.log(`[Payment] Retrying payment ${paymentId} via ${method}`);
  // Implementation depends on the payment method
  throw new Error('Retry implementation pending');
}

/**
 * Cancel payment
 */
export async function cancelPayment(paymentId: string): Promise<boolean> {
  console.log(`[Payment] Cancelling payment ${paymentId}`);
  // Implementation would call backend to cancel
  return true;
}

/**
 * Format currency amount
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}
