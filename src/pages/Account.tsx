/**
 * Account.tsx
 * -----------
 * User account & billing page.
 * Reads from AuthContext (Supabase session + profile) instead of the old mock store.
 * Tracked item count comes from useTrackedItems hook.
 * Alert count comes from useAlerts hook.
 */

import { useState } from 'react';
import { useAuthContext }   from '../App';
import { useTrackedItems }  from '../hooks/useTrackedItems';
import { useAlerts }        from '../hooks/useAlerts';
import { supabase }         from '../lib/supabase';
import { ShieldCheck, Zap, CreditCard, Mail, Crosshair } from 'lucide-react';
import { SubscribeModal }   from '../components/SubscribeModal';
import { formatDate }       from '../lib/utils';

export const Account = () => {
  const { user, profile }           = useAuthContext();
  const { items }                   = useTrackedItems(user?.id ?? null);
  const { alerts }                  = useAlerts(user?.id ?? null);
  const [isSubscribeModalOpen, setIsSubscribeModalOpen] = useState(false);
  const [showCancelConfirm,    setShowCancelConfirm]    = useState(false);

  if (!user || !profile) return null;

  const isPro           = profile.tier === 'PREMIUM';
  const totalAlerts     = alerts.length;
  const tokenPercentage = (profile.email_tokens / 5) * 100;

  // ── Update tier in Supabase profiles table ────────────────────────────────
  const handleSubscribe = async () => {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    await supabase.from('profiles').update({
      tier:                'PREMIUM',
      premium_active_until: nextMonth.toISOString(),
    }).eq('id', user.id);
    // Supabase real-time or next page load will reflect the change
  };

  const handleCancel = async () => {
    await supabase.from('profiles').update({
      tier:                'FREE',
      email_tokens:        5,
      premium_active_until: null,
    }).eq('id', user.id);
    setShowCancelConfirm(false);
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto w-full">
      <h1 className="text-3xl font-display font-bold text-slate-900 mb-2">Account &amp; Billing</h1>
      <p className="text-slate-500 mb-8">Manage your PriceHawk subscription and preferences.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Profile Card */}
        <div className="col-span-1 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-display font-bold text-xl mb-4">
            {(user.email ?? 'U').charAt(0).toUpperCase()}
          </div>
          <h3 className="font-semibold text-slate-900 truncate">{user.email}</h3>
          <p className="text-sm text-slate-500 mb-4">Member since {formatDate(profile.created_at).split(',')[0]}</p>

          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div className="flex items-center gap-3 text-sm text-slate-700">
              <Crosshair size={16} className="text-slate-400" />
              <span>{items.length} items tracked</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-700">
              <Mail size={16} className="text-slate-400" />
              <span>{totalAlerts} alerts received</span>
            </div>
          </div>
        </div>

        {/* Plan Card */}
        <div className="col-span-1 md:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm relative overflow-hidden">
          {isPro && (
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-accent/10 rounded-full -mr-16 -mt-16 blur-2xl pointer-events-none" />
          )}

          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Current Plan</h2>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-display font-bold text-slate-900">
                  {isPro ? 'PriceHawk Pro' : 'Free Starter'}
                </h3>
                {isPro && <ShieldCheck size={24} className="text-brand-accent" />}
              </div>
            </div>
            {isPro && (
              <span className="bg-brand-accent/10 text-brand-accent-hover text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                <Zap size={14} /> ACTIVE
              </span>
            )}
          </div>

          {!isPro ? (
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
              <div className="flex justify-between text-sm font-medium mb-2">
                <span className="text-slate-700">Email Tokens</span>
                <span className="text-slate-900">{profile.email_tokens} / 5</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2.5 mb-4 overflow-hidden">
                <div
                  className="bg-brand-dark h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${tokenPercentage}%` }}
                />
              </div>
              <p className="text-sm text-slate-500 mb-6">You use 1 token every time we send a deal alert.</p>

              <div className="bg-white border border-brand-accent/20 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-slate-900 flex items-center gap-1">
                    <Zap size={16} className="text-brand-accent" /> Unlock unlimited tracking
                  </h4>
                  <p className="text-sm text-slate-600">₱199/month. Cancel anytime.</p>
                </div>
                <button
                  onClick={() => setIsSubscribeModalOpen(true)}
                  className="w-full sm:w-auto bg-brand-accent text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-brand-accent-hover transition-colors shadow-md shadow-brand-accent/20"
                >
                  Upgrade to Pro
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-brand-dark text-white rounded-xl p-5 shadow-inner">
                <p className="text-sm text-slate-400 mb-1">Subscription cycle</p>
                <p className="font-medium">
                  Active until {profile.premium_active_until ? formatDate(profile.premium_active_until) : 'next month'}
                </p>
                <p className="text-sm text-slate-400 mt-4">You have unlimited tracking and alerts unlocked.</p>
              </div>

              <div className="border-t border-slate-100 pt-6">
                <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <CreditCard size={18} className="text-slate-400" /> Manage subscription
                </h4>

                {showCancelConfirm ? (
                  <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                    <h5 className="font-semibold text-red-800 mb-2">Are you sure you want to cancel?</h5>
                    <p className="text-sm text-red-600 mb-4">
                      You'll lose unlimited tracking immediately and drop back to the Free plan (max 2 items).
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={handleCancel}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 text-center"
                      >
                        Yes, cancel subscription
                      </button>
                      <button
                        onClick={() => setShowCancelConfirm(false)}
                        className="bg-white text-slate-700 border border-slate-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 text-center"
                      >
                        Keep Pro
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowCancelConfirm(true)}
                    className="text-sm font-medium text-red-600 hover:text-red-700 hover:underline"
                  >
                    Cancel subscription
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <SubscribeModal
        isOpen={isSubscribeModalOpen}
        onClose={() => setIsSubscribeModalOpen(false)}
        onSubscribe={handleSubscribe}
      />
    </div>
  );
};
