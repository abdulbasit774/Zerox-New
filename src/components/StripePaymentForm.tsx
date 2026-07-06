import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, AlertCircle, CheckCircle, Loader } from 'lucide-react';

interface StripePaymentFormProps {
  amount: number;
  onSuccess: (paymentId: string, details: any) => void;
  onError: (error: string) => void;
  isProcessing?: boolean;
}

/**
 * Stripe Payment Form Component
 * 
 * PENDING CONFIGURATION:
 * This component requires the following setup:
 * 1. Stripe API Key (publishable key) set in environment variables
 * 2. @stripe/react-stripe-js and @stripe/stripe-js packages installed
 * 3. Server-side payment intent endpoint configured
 * 
 * Current Status: UI/UX complete, awaiting Stripe API key configuration
 * For production use, replace the form with actual Stripe Elements
 */
export default function StripePaymentForm({
  amount,
  onSuccess,
  onError,
  isProcessing = false,
}: StripePaymentFormProps) {
  const [cardHolderName, setCardHolderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(isProcessing);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s/g, '');
    const formatted = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    setExpiryDate(value);
  };

  const handleCVVChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCvv(e.target.value.replace(/\D/g, '').slice(0, 4));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessingPayment(true);
    setPaymentStatus('processing');
    setErrorMessage('');

    try {
      // Validation
      if (!cardHolderName.trim()) {
        throw new Error('Cardholder name is required');
      }
      if (cardNumber.replace(/\s/g, '').length !== 16) {
        throw new Error('Card number must be 16 digits');
      }
      if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
        throw new Error('Expiry date must be in MM/YY format');
      }
      if (cvv.length !== 3 && cvv.length !== 4) {
        throw new Error('CVV must be 3 or 4 digits');
      }

      // PENDING CONFIGURATION: Real Stripe payment processing
      // In production, this would call your backend to create a Payment Intent
      // const response = await fetch('/api/create-payment-intent', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     amount: Math.round(amount * 100), // Convert to cents
      //     cardholder: cardHolderName,
      //   }),
      // });

      // For now, simulate successful payment after 2 seconds
      await new Promise(resolve => setTimeout(resolve, 2000));

      setPaymentStatus('success');
      onSuccess(`stripe_${Date.now()}`, {
        cardholder: cardHolderName,
        last4: cardNumber.slice(-4),
        amount,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Payment processing failed';
      setErrorMessage(message);
      setPaymentStatus('error');
      onError(message);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 bg-neutral-950/50 border border-neutral-900 rounded-2xl p-8"
    >
      <div className="flex items-center gap-3 pb-4 border-b border-neutral-900">
        <Lock className="w-5 h-5 text-[#C9A227]" />
        <h3 className="font-sans font-black text-white">Secure Payment</h3>
        <span className="text-xs font-mono text-neutral-500 ml-auto">PENDING STRIPE CONFIG</span>
      </div>

      {/* Status Messages */}
      {paymentStatus === 'success' && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <div>
            <p className="font-sans font-semibold text-emerald-400 text-sm">Payment successful!</p>
            <p className="font-mono text-xs text-emerald-300 mt-1">Your order is being prepared</p>
          </div>
        </div>
      )}

      {paymentStatus === 'error' && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <div>
            <p className="font-sans font-semibold text-red-400 text-sm">Payment failed</p>
            <p className="font-mono text-xs text-red-300 mt-1">{errorMessage}</p>
          </div>
        </div>
      )}

      {paymentStatus === 'idle' && (
        <>
          {/* Cardholder Name */}
          <div>
            <label className="font-mono text-xs text-neutral-400 block mb-2 tracking-wider uppercase">
              Cardholder Name
            </label>
            <input
              type="text"
              value={cardHolderName}
              onChange={(e) => setCardHolderName(e.target.value)}
              placeholder="ABDUL BASIT"
              disabled={isProcessingPayment}
              className="w-full bg-neutral-900 border border-neutral-900 focus:border-[#C9A227] rounded-xl px-4 py-3 text-white focus:outline-none transition-colors disabled:opacity-50"
            />
          </div>

          {/* Card Number */}
          <div>
            <label className="font-mono text-xs text-neutral-400 block mb-2 tracking-wider uppercase">
              Card Number
            </label>
            <input
              type="text"
              value={cardNumber}
              onChange={handleCardNumberChange}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              disabled={isProcessingPayment}
              className="w-full bg-neutral-900 border border-neutral-900 focus:border-[#C9A227] rounded-xl px-4 py-3 text-white focus:outline-none transition-colors disabled:opacity-50 font-mono"
            />
            <p className="text-xs text-neutral-600 mt-2">
              {cardNumber.replace(/\s/g, '').length}/16 digits
            </p>
          </div>

          {/* Expiry and CVV */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-mono text-xs text-neutral-400 block mb-2 tracking-wider uppercase">
                Expiry Date
              </label>
              <input
                type="text"
                value={expiryDate}
                onChange={handleExpiryChange}
                placeholder="MM/YY"
                maxLength={5}
                disabled={isProcessingPayment}
                className="w-full bg-neutral-900 border border-neutral-900 focus:border-[#C9A227] rounded-xl px-4 py-3 text-white focus:outline-none transition-colors disabled:opacity-50 font-mono"
              />
            </div>
            <div>
              <label className="font-mono text-xs text-neutral-400 block mb-2 tracking-wider uppercase">
                CVV
              </label>
              <input
                type="text"
                value={cvv}
                onChange={handleCVVChange}
                placeholder="123"
                maxLength={4}
                disabled={isProcessingPayment}
                className="w-full bg-neutral-900 border border-neutral-900 focus:border-[#C9A227] rounded-xl px-4 py-3 text-white focus:outline-none transition-colors disabled:opacity-50 font-mono"
              />
            </div>
          </div>

          {/* Amount Summary */}
          <div className="bg-neutral-900/50 border border-neutral-900 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-neutral-400 uppercase tracking-wider">Total Amount</span>
              <span className="font-sans text-2xl font-black text-[#C9A227]">${amount.toFixed(2)}</span>
            </div>
          </div>

          {/* Security Notice */}
          <div className="text-center text-xs text-neutral-500 font-mono space-y-1">
            <p>🔒 256-bit SSL encryption</p>
            <p>This is a demonstration form. In production, Stripe Elements will handle card data securely.</p>
          </div>
        </>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isProcessingPayment || paymentStatus === 'success'}
        className={`w-full py-3 rounded-xl font-mono text-sm font-semibold tracking-wider uppercase transition-all flex items-center justify-center gap-2 ${
          paymentStatus === 'success'
            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
            : isProcessingPayment
              ? 'bg-neutral-900 text-neutral-400 border border-neutral-800'
              : 'bg-[#C9A227] hover:bg-amber-500 text-black border border-[#C9A227]'
        }`}
      >
        {isProcessingPayment && <Loader className="w-4 h-4 animate-spin" />}
        {paymentStatus === 'success' ? 'Payment Complete' : isProcessingPayment ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
      </button>

      {/* Disclaimer */}
      <p className="text-xs text-neutral-600 text-center font-mono">
        By completing this purchase, you agree to our Terms of Service and Privacy Policy
      </p>
    </motion.form>
  );
}
