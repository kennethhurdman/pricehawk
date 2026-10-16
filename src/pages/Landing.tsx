/**
 * Landing.tsx — Updated homepage
 * --------------------------------
 * Colors / layout / structure are UNCHANGED.
 * Content updated to reflect real implemented features:
 *   • HawkBot AI search chat
 *   • Paste & Track URL scraper
 *   • Discovery Hub
 *   • Supabase auth (email + Google)
 *   • Persistent deal alerts / inbox
 */

import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../App';
import {
  ShieldCheck, Zap, Bell, Check, ArrowRight,
  Bot, Link as LinkIcon, Compass, Mail
} from 'lucide-react';
import { useState } from 'react';
import { SubscribeModal } from '../components/SubscribeModal';

export const Landing = () => {
  const [isSubscribeModalOpen, setIsSubscribeModalOpen] = useState(false);
  const { user } = useAuthContext();
  const navigate = useNavigate();

  const handleUpgradeClick = () => {
    if (!user) {
      navigate('/signup');
    } else {
      setIsSubscribeModalOpen(true);
    }
  };

  return (
    <div className="bg-white">
      {/* ── Hero ── */}
      <div className="relative isolate overflow-hidden bg-slate-900 pb-16 pt-14 sm:pb-20">
        <div
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
          aria-hidden="true"
        >
          <div className="relative left-[calc(50%-11rem)] aspect-1155/678 w-144.5 -translate-x-1/2 rotate-30 bg-linear-to-tr from-brand-accent to-brand-dark opacity-20 sm:left-[calc(50%-30rem)] sm:w-288.75" />
        </div>

        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56 text-center">
            <div className="mb-6 flex justify-center">
              <span className="inline-flex items-center gap-2 rounded-full bg-brand-accent/10 border border-brand-accent/30 px-4 py-1.5 text-sm font-semibold text-brand-accent">
                <Bot size={14} /> Powered by Gemini AI · Live Web Search
              </span>
            </div>
            <h1 className="text-4xl font-display font-bold tracking-tight text-white sm:text-6xl">
              Never miss a price drop again. PriceHawk is always watching.
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-300">
              Paste any product link, ask our AI to find deals, or let the Discovery Hub surface
              live bargains for you — automatically. Set your target price and we alert you the
              second it drops.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
              <Link
                to={user ? "/dashboard" : "/signup"}
                className="w-full sm:w-auto rounded-lg bg-brand-accent px-5 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-accent-hover focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-brand-accent transition-colors"
              >
                {user ? "Go to Dashboard" : "Start tracking free"}
              </Link>
              <Link
                to="/how-it-works"
                className="w-full sm:w-auto text-sm font-semibold leading-6 text-white flex items-center justify-center gap-1 hover:text-slate-300 transition-colors py-2"
              >
                See how it works <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Social Proof Stat Strip ── */}
      <div className="bg-brand-accent/5 border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 gap-y-8 text-center sm:grid-cols-3 sm:gap-x-8">
            <div className="mx-auto flex max-w-xs flex-col gap-y-2">
              <dt className="text-base leading-7 text-slate-600">Saved by users</dt>
              <dd className="order-first text-3xl font-display font-semibold tracking-tight text-slate-900 sm:text-4xl">₱2.4M+</dd>
            </div>
            <div className="mx-auto flex max-w-xs flex-col gap-y-2">
              <dt className="text-base leading-7 text-slate-600">Deals tracked</dt>
              <dd className="order-first text-3xl font-display font-semibold tracking-tight text-slate-900 sm:text-4xl">12,000+</dd>
            </div>
            <div className="mx-auto flex max-w-xs flex-col gap-y-2">
              <dt className="text-base leading-7 text-slate-600">Average rating</dt>
              <dd className="order-first text-3xl font-display font-semibold tracking-tight text-slate-900 sm:text-4xl">4.9★</dd>
            </div>
          </div>
        </div>
      </div>

      {/* ── New Feature Highlights ── */}
      <div className="py-20 bg-white border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-14">
            <h2 className="text-base font-semibold leading-7 text-brand-accent uppercase tracking-wider">
              What's inside
            </h2>
            <p className="mt-2 text-3xl font-display font-bold tracking-tight text-slate-900 sm:text-4xl">
              Three ways to catch every deal
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200">
              <div className="w-12 h-12 bg-brand-dark rounded-xl flex items-center justify-center mb-5">
                <LinkIcon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-display font-bold text-slate-900 mb-2">Paste & Track</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Copy any product URL from Shopee, Lazada, Agoda, or Cebu Pacific and paste it
                directly into the dashboard. Our AI scrapes the page, extracts the name, image,
                and price, then locks it to your target in seconds.
              </p>
            </div>

            <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800 relative overflow-hidden">
              <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-brand-accent/20 rounded-full blur-2xl pointer-events-none" />
              <div className="w-12 h-12 bg-brand-accent rounded-xl flex items-center justify-center mb-5 relative z-10">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-display font-bold text-white mb-2 relative z-10">HawkBot AI Search</h3>
              <p className="text-slate-300 text-sm leading-relaxed relative z-10">
                Just describe what you want in plain English. HawkBot searches the live web,
                picks out specific matching products with real prices and links, and lets you
                track them with one click. Chat history is saved between sessions.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200">
              <div className="w-12 h-12 bg-brand-accent rounded-xl flex items-center justify-center mb-5">
                <Compass className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-display font-bold text-slate-900 mb-2">Discovery Hub</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Tell us your categories — Flights, Hotels, or E-Commerce — and the Discovery Hub
                automatically surfaces live deals from the web that match your preferences. Filter
                by category, refresh anytime, and track any deal with one click.
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* ── How it Works ── */}
      <div id="how-it-works" className="py-24 sm:py-32 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-base font-semibold leading-7 text-brand-accent uppercase tracking-wider">
              The Process
            </h2>
            <p className="mt-2 text-3xl font-display font-bold tracking-tight text-slate-900 sm:text-4xl">
              Sharp vision, simple setup
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-5xl sm:mt-20">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-4 lg:gap-y-16">
              <div className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-slate-900">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-dark">
                    <ShieldCheck className="h-6 w-6 text-white" />
                  </div>
                  1. Sign up free
                </dt>
                <dd className="mt-2 text-base leading-7 text-slate-600">
                  Create an account with email or one-click Google sign-in. Choose your deal categories.
                </dd>
              </div>
              <div className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-slate-900">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-dark">
                    <LinkIcon className="h-6 w-6 text-white" />
                  </div>
                  2. Find the item
                </dt>
                <dd className="mt-2 text-base leading-7 text-slate-600">
                  Paste a URL, chat with HawkBot, or browse Discovery Hub — three ways to find your deal.
                </dd>
              </div>
              <div className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-slate-900">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-dark">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  3. Lock target
                </dt>
                <dd className="mt-2 text-base leading-7 text-slate-600">
                  Enter the maximum price you're willing to pay. PriceHawk locks on.
                </dd>
              </div>
              <div className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-slate-900">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-accent">
                    <Bell className="h-6 w-6 text-white" />
                  </div>
                  4. Swoop in
                </dt>
                <dd className="mt-2 text-base leading-7 text-slate-600">
                  The moment the price drops, you receive an AI-crafted deal alert. Grab it before it's gone.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* ── Pricing ── */}
      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-display font-bold tracking-tight text-slate-900 sm:text-4xl">
              Pricing that makes sense
            </h2>
            <p className="mt-6 text-lg leading-8 text-slate-600">
              Less than the price of one missed deal.
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 items-center gap-y-6 sm:mt-20 sm:gap-y-0 lg:max-w-4xl lg:grid-cols-2">

            {/* Free Tier */}
            <div className="rounded-3xl rounded-t-3xl bg-white/60 p-8 ring-1 ring-slate-900/10 sm:mx-8 sm:rounded-b-none sm:p-10 lg:mx-0 lg:rounded-bl-3xl lg:rounded-tr-none">
              <h3 className="text-base font-semibold leading-7 text-brand-accent">Starter</h3>
              <p className="mt-4 flex items-baseline gap-x-2">
                <span className="text-5xl font-display font-bold tracking-tight text-slate-900">Free</span>
              </p>
              <p className="mt-6 text-base leading-7 text-slate-600">Perfect to test the waters and catch a quick deal.</p>
              <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-slate-600 sm:mt-10">
                <li className="flex gap-x-3"><Check className="h-6 w-5 flex-none text-brand-accent" /> Track up to 2 items</li>
                <li className="flex gap-x-3"><Check className="h-6 w-5 flex-none text-brand-accent" /> 5 email alert tokens</li>
                <li className="flex gap-x-3"><Check className="h-6 w-5 flex-none text-brand-accent" /> HawkBot AI search</li>
                <li className="flex gap-x-3"><Check className="h-6 w-5 flex-none text-brand-accent" /> Discovery Hub access</li>
                <li className="flex gap-x-3"><Check className="h-6 w-5 flex-none text-brand-accent" /> Paste & Track any URL</li>
              </ul>
              <Link
                to={user ? "/dashboard" : "/signup"}
                className="mt-8 block rounded-lg px-3 py-2.5 text-center text-sm font-semibold leading-6 text-brand-accent ring-1 ring-inset ring-brand-accent/30 hover:bg-brand-accent/10 transition-colors"
              >
                {user ? "Go to Dashboard" : "Get started for free"}
              </Link>
            </div>

            {/* Pro Tier */}
            <div className="relative rounded-3xl bg-slate-900 p-8 shadow-2xl ring-1 ring-slate-900 sm:p-10">
              <div className="absolute -top-4 right-8 bg-brand-accent text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
                Most Popular
              </div>
              <h3 className="text-base font-semibold leading-7 text-brand-accent">PriceHawk Pro</h3>
              <p className="mt-4 flex items-baseline gap-x-2">
                <span className="text-5xl font-display font-bold tracking-tight text-white">₱199</span>
                <span className="text-base text-slate-400">/month</span>
              </p>
              <p className="mt-6 text-base leading-7 text-slate-300">Unlock full power. Watch everything. Never miss out.</p>
              <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-slate-300 sm:mt-10">
                <li className="flex gap-x-3"><Check className="h-6 w-5 flex-none text-brand-accent" /> Unlimited tracked items</li>
                <li className="flex gap-x-3"><Check className="h-6 w-5 flex-none text-brand-accent" /> Unlimited email alerts</li>
                <li className="flex gap-x-3"><Check className="h-6 w-5 flex-none text-brand-accent" /> Priority hawk-eye checks</li>
                <li className="flex gap-x-3"><Check className="h-6 w-5 flex-none text-brand-accent" /> AI email personalization</li>
                <li className="flex gap-x-3"><Check className="h-6 w-5 flex-none text-brand-accent" /> Cancel anytime</li>
              </ul>
              <button
                onClick={handleUpgradeClick}
                className="w-full mt-8 block rounded-lg bg-brand-accent px-3 py-2.5 text-center text-sm font-semibold leading-6 text-white shadow-sm hover:bg-brand-accent-hover transition-colors"
              >
                Upgrade to Pro
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="bg-slate-50 border-t border-slate-200 py-12 text-center">
        <p className="text-sm text-slate-500 mb-4">© 2026 PriceHawk. All rights reserved.</p>
        <div className="flex justify-center gap-6">
          <Link to="/email-demo" target="_blank" className="text-xs text-brand-accent hover:underline flex items-center gap-1">
            <Mail size={12} /> Preview email alert demo <ArrowRight size={12} />
          </Link>
          <Link to="/how-it-works" className="text-xs text-slate-500 hover:underline">
            How it works
          </Link>
        </div>
      </footer>

      <SubscribeModal
        isOpen={isSubscribeModalOpen}
        onClose={() => setIsSubscribeModalOpen(false)}
      />
    </div>
  );
};
