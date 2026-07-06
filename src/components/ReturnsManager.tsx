import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, X, Check, Clock, AlertCircle, Truck, DollarSign } from 'lucide-react';

export type RequestStatus = 'PENDING' | 'APPROVED' | 'IN_TRANSIT' | 'RECEIVED' | 'PROCESSED' | 'DENIED';
export type RequestType = 'RETURN' | 'REFUND' | 'CANCEL';

export interface ReturnRequest {
  id: string;
  orderId: string;
  type: RequestType;
  reason: string;
  status: RequestStatus;
  images?: string[];
  amount?: number;
  createdAt: Date;
  updatedAt: Date;
}

interface ReturnsManagerProps {
  requests: ReturnRequest[];
  onSubmitRequest?: (type: RequestType, orderId: string, reason: string, images?: File[]) => void;
  onCancelRequest?: (requestId: string) => void;
}

const RETURN_REASONS = [
  'Item damaged on arrival',
  'Item does not match description',
  'Wrong item received',
  'Changed my mind',
  'Item defective',
  'Not as expected',
  'Other'
];

const REFUND_REASONS = [
  'Full refund requested',
  'Partial refund for damage',
  'Wrong price charged',
  'Other'
];

export default function ReturnsManager({
  requests = [],
  onSubmitRequest,
  onCancelRequest
}: ReturnsManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<RequestType>('RETURN');
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [reason, setReason] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files).slice(0, 5));
    }
  };

  const handleSubmit = async () => {
    if (!selectedOrderId || !reason) return;
    setLoading(true);
    try {
      onSubmitRequest?.(formType, selectedOrderId, reason, images);
      setShowForm(false);
      setReason('');
      setImages([]);
      setSelectedOrderId('');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: RequestStatus) => {
    switch (status) {
      case 'PENDING':
        return 'amber';
      case 'APPROVED':
        return 'blue';
      case 'IN_TRANSIT':
        return 'cyan';
      case 'RECEIVED':
        return 'cyan';
      case 'PROCESSED':
        return 'emerald';
      case 'DENIED':
        return 'red';
      default:
        return 'neutral';
    }
  };

  const getStatusIcon = (status: RequestStatus) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-4 h-4" />;
      case 'APPROVED':
        return <Check className="w-4 h-4" />;
      case 'IN_TRANSIT':
        return <Truck className="w-4 h-4" />;
      case 'RECEIVED':
        return <Check className="w-4 h-4" />;
      case 'PROCESSED':
        return <Check className="w-4 h-4" />;
      case 'DENIED':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Submit Request Button */}
      <div className="flex gap-3">
        <button
          onClick={() => {
            setFormType('RETURN');
            setShowForm(true);
          }}
          className="flex-1 px-4 py-3 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded-xl font-mono text-xs font-semibold tracking-wider uppercase cursor-pointer transition-colors"
        >
          Request Return
        </button>
        <button
          onClick={() => {
            setFormType('REFUND');
            setShowForm(true);
          }}
          className="flex-1 px-4 py-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-xl font-mono text-xs font-semibold tracking-wider uppercase cursor-pointer transition-colors"
        >
          Request Refund
        </button>
      </div>

      {/* Request Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-sans font-bold text-white">
                {formType === 'RETURN' ? 'Return Request' : 'Refund Request'}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="p-1 hover:bg-neutral-800 rounded transition-colors"
              >
                <X className="w-4 h-4 text-neutral-400" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Order Selection */}
              <div>
                <label className="block font-mono text-xs text-neutral-400 mb-2 tracking-wider uppercase">Select Order</label>
                <input
                  type="text"
                  placeholder="Order ID"
                  value={selectedOrderId}
                  onChange={(e) => setSelectedOrderId(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white placeholder-neutral-600 focus:border-[#C9A227] focus:outline-none"
                />
              </div>

              {/* Reason Selection */}
              <div>
                <label className="block font-mono text-xs text-neutral-400 mb-2 tracking-wider uppercase">Reason</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:border-[#C9A227] focus:outline-none"
                >
                  <option value="">Choose a reason</option>
                  {(formType === 'RETURN' ? RETURN_REASONS : REFUND_REASONS).map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              {/* Image Upload for Returns */}
              {formType === 'RETURN' && (
                <div>
                  <label className="block font-mono text-xs text-neutral-400 mb-2 tracking-wider uppercase">Upload Images</label>
                  <div className="border-2 border-dashed border-neutral-800 rounded-lg p-4 text-center hover:border-[#C9A227]/50 transition-colors cursor-pointer">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <Upload className="w-6 h-6 text-neutral-500 mx-auto mb-2" />
                      <p className="text-sm text-neutral-400">Click to upload images (up to 5)</p>
                      <p className="text-xs text-neutral-600 mt-1">JPG, PNG up to 5MB each</p>
                    </label>
                  </div>
                  {images.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {images.map((file, idx) => (
                        <div key={idx} className="flex items-center gap-2 px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg">
                          <span className="text-xs text-neutral-400">{file.name}</span>
                          <button
                            onClick={() => setImages(images.filter((_, i) => i !== idx))}
                            className="p-0.5 hover:bg-red-900/20 rounded"
                          >
                            <X className="w-3 h-3 text-red-400" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4 border-t border-neutral-800">
                <button
                  onClick={() => {
                    setShowForm(false);
                    setReason('');
                    setImages([]);
                  }}
                  className="flex-1 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-white rounded-lg font-mono text-xs font-semibold tracking-wider uppercase cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || !selectedOrderId || !reason}
                  className="flex-1 py-2 bg-[#C9A227] hover:bg-amber-500 text-black rounded-lg font-mono text-xs font-semibold tracking-wider uppercase cursor-pointer transition-colors disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Requests History */}
      {requests.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-sans font-bold text-white text-sm">Request History</h3>
          {requests.map((req) => {
            const color = getStatusColor(req.status);
            const colorMap = {
              amber: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
              blue: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
              cyan: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
              emerald: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
              red: 'bg-red-500/10 border-red-500/30 text-red-400',
              neutral: 'bg-neutral-900/50 border-neutral-800 text-neutral-400'
            };

            return (
              <motion.div
                key={req.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-neutral-950/50 border border-neutral-900 rounded-xl p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-sans font-semibold text-white text-sm">
                        {req.type} Request
                      </p>
                      <span className={`px-2 py-1 rounded-md font-mono text-[10px] font-bold border ${colorMap[color]}`}>
                        {req.status}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 mb-2">Order: #{req.orderId.substring(0, 8)}</p>
                    <p className="text-sm text-neutral-300 mb-2">{req.reason}</p>
                    {req.amount && (
                      <p className="text-sm font-semibold text-[#C9A227]">Amount: ${req.amount.toFixed(2)}</p>
                    )}
                    <p className="text-xs text-neutral-600 mt-2">
                      {new Date(req.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {req.status === 'PENDING' && (
                    <button
                      onClick={() => onCancelRequest?.(req.id)}
                      className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg font-mono text-xs font-semibold uppercase cursor-pointer transition-colors whitespace-nowrap"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {requests.length === 0 && !showForm && (
        <div className="text-center py-8 px-4 bg-neutral-950/50 border border-neutral-900 rounded-xl">
          <AlertCircle className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
          <p className="text-sm text-neutral-400">No return or refund requests yet</p>
        </div>
      )}
    </div>
  );
}
