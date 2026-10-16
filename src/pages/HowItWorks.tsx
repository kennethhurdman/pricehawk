import { ShieldCheck, Zap, Bell, ArrowRight, Crosshair, Search, MailOpen, TrendingDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../App';

export const HowItWorks = () => {
  const { user } = useAuthContext();

  return (
    <div className="bg-white flex flex-col min-h-full">
      {/* Hero Section */}
      <div className="relative isolate overflow-hidden bg-slate-900 py-20 sm:py-28">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
          <div className="relative left-[calc(50%-11rem)] aspect-1155/678 w-144.5 -translate-x-1/2 rotate-30 bg-linear-to-tr from-brand-accent to-brand-dark opacity-20 sm:left-[calc(50%-30rem)] sm:w-288.75"></div>
        </div>
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-display font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            How PriceHawk Works
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-300 max-w-2xl mx-auto">
            We've built a precision tracking engine that monitors your favorite flights, hotels, and products. Here is exactly how we help you save.
          </p>
        </div>
      </div>

      {/* Steps Section */}
      <div className="py-24 sm:py-32 overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          
          {/* Step 1 */}
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24 mb-24">
            <div className="flex-1 order-2 lg:order-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-900 font-bold text-xl">1</div>
                <h2 className="text-3xl font-display font-bold text-slate-900">Spot the deal</h2>
              </div>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                Browse live web deals via the Discovery Hub, ask our AI assistant HawkBot in plain
                English, or paste any Shopee, Lazada, Agoda, or Cebu Pacific URL directly —
                the scraper extracts the name, image, and price automatically.
              </p>
              <ul className="space-y-3 text-slate-700">
                <li className="flex items-center gap-3"><ShieldCheck className="text-brand-accent w-5 h-5" /> HawkBot AI chat search</li>
                <li className="flex items-center gap-3"><ShieldCheck className="text-brand-accent w-5 h-5" /> Paste &amp; Track any URL</li>
                <li className="flex items-center gap-3"><ShieldCheck className="text-brand-accent w-5 h-5" /> Discovery Hub live deals</li>
              </ul>
            </div>
            <div className="flex-1 order-1 lg:order-2 w-full">
              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 md:p-8 relative shadow-lg">
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-brand-accent/20 rounded-full blur-2xl"></div>
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex items-center gap-4">
                  <Search className="text-slate-400 w-6 h-6" />
                  <div className="h-4 bg-slate-100 rounded w-1/2"></div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="h-32 bg-white rounded-xl shadow-sm border border-slate-100"></div>
                  <div className="h-32 bg-white rounded-xl shadow-sm border border-slate-100"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24 mb-24">
            <div className="flex-1 w-full">
              <div className="bg-slate-900 rounded-3xl p-6 md:p-8 relative shadow-xl">
                <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-brand-accent/30 rounded-full blur-3xl"></div>
                <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                  <div className="flex justify-between items-center mb-6">
                    <div className="h-4 bg-slate-700 rounded w-1/3"></div>
                    <Crosshair className="text-brand-accent w-6 h-6" />
                  </div>
                  <div className="text-4xl font-display font-bold text-white mb-2">₱ 15,000</div>
                  <div className="h-2 bg-slate-700 rounded w-2/3"></div>
                  <div className="mt-6">
                    <div className="w-full h-10 bg-brand-accent rounded-lg flex items-center justify-center">
                      <span className="w-16 h-2 bg-white/30 rounded"></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-900 font-bold text-xl">2</div>
                <h2 className="text-3xl font-display font-bold text-slate-900">Lock your target</h2>
              </div>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                Tell us the maximum price you are willing to pay. We lock onto that exact threshold. Once your target is set, PriceHawk watches the item continuously so you don't have to.
              </p>
              <ul className="space-y-3 text-slate-700">
                <li className="flex items-center gap-3"><Zap className="text-brand-accent w-5 h-5" /> Precision targeting</li>
                <li className="flex items-center gap-3"><Zap className="text-brand-accent w-5 h-5" /> Targets saved to your account</li>
                <li className="flex items-center gap-3"><Zap className="text-brand-accent w-5 h-5" /> Unlimited tracks for Pro users</li>
              </ul>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
            <div className="flex-1 order-2 lg:order-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-900 font-bold text-xl">3</div>
                <h2 className="text-3xl font-display font-bold text-slate-900">Swoop in and save</h2>
              </div>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                The absolute second the price drops to or below your target, our system fires a high-priority alert directly to your inbox. You get the exact link to grab the deal before it's gone.
              </p>
              <ul className="space-y-3 text-slate-700">
                <li className="flex items-center gap-3"><Bell className="text-brand-accent w-5 h-5" /> AI-written deal alert emails</li>
                <li className="flex items-center gap-3"><Bell className="text-brand-accent w-5 h-5" /> Persistent alert inbox</li>
                <li className="flex items-center gap-3"><Bell className="text-brand-accent w-5 h-5" /> Direct product link in every alert</li>
              </ul>
            </div>
            <div className="flex-1 order-1 lg:order-2 w-full">
              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 md:p-8 relative shadow-lg">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-green-500/10 rounded-full blur-3xl"></div>
                <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 relative z-10">
                  <div className="flex items-center gap-3 mb-4 border-b border-slate-100 pb-4">
                    <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                      <TrendingDown className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">Target Locked! Price Dropped</div>
                      <div className="text-xs text-slate-500">PriceHawk Alerts</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-3 bg-slate-100 rounded w-full"></div>
                    <div className="h-3 bg-slate-100 rounded w-5/6"></div>
                    <div className="h-3 bg-slate-100 rounded w-4/6"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-slate-900 py-20 mt-auto">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-display font-bold tracking-tight text-white sm:text-4xl mb-6">
            Ready to let the hawk watch your deals?
          </h2>
          <Link
            to={user ? "/dashboard" : "/signup"}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-accent px-6 py-3.5 text-base font-semibold text-white shadow-sm hover:bg-brand-accent-hover transition-colors"
          >
            {user ? "Go to Dashboard" : "Start Tracking Free"}
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
};
