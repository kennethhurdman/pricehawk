/**
 * SubscribeModal.tsx
 * ------------------
 * Mock upgrade checkout modal.
 * No longer reads from the old store — the parent component passes an
 * optional `onSubscribe` callback to handle the tier upgrade.
 */

import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { cn } from '../lib/utils';

interface SubscribeModalProps {
  isOpen:       boolean;
  onClose:      () => void;
  onSubscribe?: () => void; // Optional: called after mock payment succeeds
}

export const SubscribeModal = ({ isOpen, onClose, onSubscribe }: SubscribeModalProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess,    setIsSuccess]    = useState(false);

  if (!isOpen) return null;

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate network delay
    setTimeout(() => {
      onSubscribe?.();          // notify parent (e.g. to update Supabase tier)
      setIsProcessing(false);
      setIsSuccess(true);
    }, 1800);
  };

  const handleClose = () => {
    setIsSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-100">
          <h2 className="font-display font-semibold text-lg text-slate-900">Upgrade to PriceHawk Pro</h2>
          <button onClick={handleClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 animate-in slide-in-from-bottom-4 fade-in duration-500">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="font-display text-2xl font-bold text-slate-900 mb-2">Welcome to Pro 🦅</h3>
            <p className="text-slate-600 mb-8">
              Your subscription is active. You now have unlimited tracking and alerts.
            </p>
            <button
              onClick={handleClose}
              className="w-full bg-slate-900 text-white font-medium py-3 rounded-xl hover:bg-slate-800 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          <div className="p-6">
            {/* Plan Summary */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-brand-accent/10 rounded-full -mr-10 -mt-10 blur-xl" />
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-slate-900">PriceHawk Pro</h3>
                  <div className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                    <Zap size={14} className="text-brand-accent" /> Unlock all limits
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-xl text-slate-900">₱199</div>
                  <div className="text-xs text-slate-500">/month</div>
                </div>
              </div>
            </div>

            {/* Mock Checkout Form */}
            <form onSubmit={handleSubscribe} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">Card details</label>
                <div className="border border-slate-300 rounded-lg overflow-hidden focus-within:border-slate-500 focus-within:ring-1 focus-within:ring-slate-500 transition-all">
                  <input
                    type="text" required placeholder="Card number"
                    className="w-full p-3 outline-none text-sm border-b border-slate-200"
                    defaultValue="4242 4242 4242 4242"
                  />
                  <div className="flex">
                    <input
                      type="text" required placeholder="MM / YY"
                      className="w-1/2 p-3 outline-none text-sm border-r border-slate-200"
                      defaultValue="12/25"
                    />
                    <input
                      type="text" required placeholder="CVC"
                      className="w-1/2 p-3 outline-none text-sm"
                      defaultValue="123"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">Name on card</label>
                <input
                  type="text" required placeholder="Juan Dela Cruz"
                  className="w-full p-3 border border-slate-300 rounded-lg outline-none text-sm focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-all"
                  defaultValue="Juan Dela Cruz"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className={cn(
                    'w-full flex items-center justify-center gap-2 font-medium py-3 rounded-xl transition-all',
                    isProcessing
                      ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                      : 'bg-brand-accent text-white hover:bg-brand-accent-hover shadow-lg shadow-brand-accent/25'
                  )}
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-slate-400 border-t-slate-600 rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={18} /> Subscribe for ₱199/mo
                    </>
                  )}
                </button>
                <p className="text-center text-xs text-slate-500 mt-4">
                  This is a mock checkout flow. No real charges apply.
                </p>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
