/**
 * Signup.tsx
 * ----------
 * Two-step registration flow:
 *   Step 1 — Email + password form → calls supabase.auth.signUp
 *   Step 2 — Category selection → stored in public.profiles
 *
 * Also supports Google OAuth one-click sign-in.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Logo }        from '../components/Logo';
import { supabase }    from '../lib/supabase';
import { Plane, Hotel, Smartphone, ArrowRight, Chrome, Loader2, AlertCircle, CheckCircle2, X } from 'lucide-react';
import type { Category } from '../lib/database.types';
import { cn } from '../lib/utils';

export const Signup = () => {
  const [step,               setStep]               = useState<1 | 2>(1);
  const [email,              setEmail]              = useState('');
  const [password,           setPassword]           = useState('');
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [loading,            setLoading]            = useState(false);
  const [error,              setError]              = useState<string | null>(null);
  const [toastMsg,           setToastMsg]           = useState<{title: string, desc: string, type: 'error' | 'success'} | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Parse Supabase OAuth errors from URL hash or query string
    const hash = window.location.hash;
    let params: URLSearchParams;
    
    // Hash router puts the hash inside the hash...
    if (hash.includes('error=')) {
      const errorStr = hash.split('?')[1] || hash.replace(/^#\/?/, '');
      params = new URLSearchParams(errorStr);
    } else {
      params = new URLSearchParams(window.location.search);
    }

    const errDesc = params.get('error_description');
    if (errDesc) {
      const decoded = decodeURIComponent(errDesc.replace(/\+/g, ' '));
      setToastMsg({
        title: 'Authentication Failed',
        desc: decoded,
        type: 'error'
      });
      // Clean up URL
      window.history.replaceState(null, '', window.location.pathname + '#/signup');
    }
  }, []);

  // ── Step 1: create account in Supabase Auth ─────────────────────────────
  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({ email, password });

    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setToastMsg({ title: 'Success!', desc: 'Account created. Please select your categories.', type: 'success' });
      setStep(2);
    }
  };

  // ── Google OAuth ──────────────────────────────────────────────────────────
  const handleGoogleSignin = async () => {
    setLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { 
        redirectTo: window.location.origin,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent select_account',
        }
      },
    });
  };

  // ── Step 2: save preferences then go to dashboard ────────────────────────
  const handleFinish = async () => {
    if (selectedCategories.length === 0) return;
    setLoading(true);

    // Get the just-signed-in user
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      await supabase.from('profiles').upsert({
        id:                  user.id,
        email:               user.email!,
        tier:                'FREE',
        email_tokens:        5,
        selected_categories: selectedCategories,
        premium_active_until: null,
      });
    }

    setLoading(false);
    navigate('/dashboard');
  };

  const toggleCategory = (cat: Category) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  // ── Already have account ─────────────────────────────────────────────────
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      navigate('/dashboard');
    }
  };

  const [isSignIn, setIsSignIn] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center mb-6">
          <Logo size="lg" />
        </div>
        <h2 className="mt-6 text-center text-2xl font-display font-bold leading-9 tracking-tight text-slate-900">
          {step === 1
            ? (isSignIn ? 'Welcome back' : 'Create your free account')
            : 'What do you want to track?'}
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          {step === 1
            ? (isSignIn ? 'Sign in to your PriceHawk account.' : 'Start tracking deals in seconds.')
            : 'Select at least one category to set up your dashboard.'}
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-120">
        <div className="bg-white px-6 py-12 shadow sm:rounded-xl sm:px-12 border border-slate-100">

          {step === 1 ? (
            <>
              {/* Google OAuth button */}
              <button
                type="button"
                onClick={handleGoogleSignin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors mb-6 disabled:opacity-60"
              >
                <Chrome size={18} className="text-brand-accent" />
                Continue with Google
              </button>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-4 text-slate-400">or continue with email</span>
                </div>
              </div>

              <form className="space-y-5" onSubmit={isSignIn ? handleSignIn : handleEmailSignup}>
                <div>
                  <label className="block text-sm font-medium leading-6 text-slate-900">Email address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="mt-2 block w-full rounded-lg border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-slate-900 sm:text-sm"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium leading-6 text-slate-900">Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="mt-2 block w-full rounded-lg border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-slate-900 sm:text-sm"
                    placeholder="Min 6 characters"
                  />
                </div>

                {error && (
                  <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-dark px-3 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 transition-colors disabled:opacity-60"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                  {isSignIn ? 'Sign In' : 'Continue'}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-500">
                {isSignIn ? "Don't have an account? " : 'Already have an account? '}
                <button
                  onClick={() => { setIsSignIn(s => !s); setError(null); }}
                  className="font-semibold text-brand-accent hover:text-brand-accent-hover"
                >
                  {isSignIn ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                {([
                  { key: 'FLIGHT',    icon: Plane,       label: 'Flights',       sub: 'Domestic & International' },
                  { key: 'HOTEL',     icon: Hotel,       label: 'Accommodations', sub: 'Hotels & Resorts'        },
                  { key: 'ECOMMERCE', icon: Smartphone,  label: 'E-Commerce',    sub: 'Gadgets & Gear'           },
                ] as const).map(({ key, icon: Icon, label, sub }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleCategory(key)}
                    className={cn(
                      'relative flex cursor-pointer rounded-xl border p-4 focus:outline-none transition-all text-left',
                      selectedCategories.includes(key)
                        ? 'border-brand-accent bg-brand-accent/5 ring-1 ring-brand-accent'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    )}
                  >
                    <span className="flex flex-1 items-center gap-4">
                      <div className={cn('p-2 rounded-lg', selectedCategories.includes(key) ? 'bg-brand-accent/20 text-brand-accent' : 'bg-slate-100 text-slate-500')}>
                        <Icon size={24} />
                      </div>
                      <span className="flex flex-col">
                        <span className="block text-sm font-semibold text-slate-900">{label}</span>
                        <span className="block text-xs text-slate-500">{sub}</span>
                      </span>
                    </span>
                  </button>
                ))}
              </div>

              <div className="mt-8 flex items-center justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="text-sm font-medium text-slate-500 hover:text-slate-900"
                >
                  Back
                </button>
                <button
                  onClick={handleFinish}
                  disabled={selectedCategories.length === 0 || loading}
                  className="flex items-center gap-2 rounded-lg bg-brand-accent px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                  Start Tracking <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          By continuing, you agree to our{' '}
          <Link to="/" className="underline hover:text-slate-600">Terms</Link>{' '}
          and{' '}
          <Link to="/" className="underline hover:text-slate-600">Privacy Policy</Link>.
        </p>
      </div>

      {/* ── Toast Notification ── */}
      {toastMsg && (
        <div className="fixed bottom-4 right-4 z-9999 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className={cn(
            "rounded-xl shadow-lg border p-4 flex gap-3 min-w-75 max-w-sm",
            toastMsg.type === 'error' ? "bg-red-50 border-red-100" : "bg-green-50 border-green-100"
          )}>
            {toastMsg.type === 'error' ? (
              <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
            ) : (
              <CheckCircle2 className="text-green-500 shrink-0 mt-0.5" size={20} />
            )}
            <div className="flex-1">
              <h3 className={cn("text-sm font-bold", toastMsg.type === 'error' ? "text-red-900" : "text-green-900")}>
                {toastMsg.title}
              </h3>
              <p className={cn("text-xs mt-1 leading-relaxed", toastMsg.type === 'error' ? "text-red-700" : "text-green-700")}>
                {toastMsg.desc}
              </p>
            </div>
            <button onClick={() => setToastMsg(null)} className={cn("shrink-0 p-1 rounded-lg transition-colors self-start", toastMsg.type === 'error' ? "hover:bg-red-100 text-red-500" : "hover:bg-green-100 text-green-500")}>
              <X size={16} />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
