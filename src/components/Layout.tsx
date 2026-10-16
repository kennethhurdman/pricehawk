/**
 * Layout.tsx
 * ----------
 * App shell: sidebar (desktop) + mobile bottom nav.
 *
 * Updated: now reads auth from AuthContext (Supabase) instead of the old mock store.
 * Keeps the same visual structure, colors, and sidebar layout unchanged.
 */

import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../App';
import { Logo }           from './Logo';
import { LayoutDashboard, Inbox, User, LogOut, Zap } from 'lucide-react';
import { cn }             from '../lib/utils';
import { useState }       from 'react';
import { SubscribeModal } from './SubscribeModal';

export const Layout = () => {
  const { user, profile, signOut } = useAuthContext();
  const location  = useLocation();
  const navigate  = useNavigate();
  const [isSubscribeModalOpen, setIsSubscribeModalOpen] = useState(false);

  // Placeholder — alerts count will be wired in when useAlerts is integrated
  const unreadCount = 0;

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Inbox',     path: '/inbox',     icon: Inbox, badge: unreadCount },
    { name: 'Account',   path: '/account',   icon: User  },
  ];

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link to="/" className="shrink-0"><Logo size="sm" className="sm:hidden" /><Logo className="hidden sm:flex" /></Link>
            <div className="flex items-center gap-2 sm:gap-4">
              <Link to="/signup" className="text-sm font-medium text-slate-600 hover:text-slate-900 px-2 sm:px-3 py-2 whitespace-nowrap">Log in</Link>
              <Link to="/signup" className="text-sm font-medium bg-brand-dark text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap">
                <span className="hidden sm:inline">Start Tracking Free</span>
                <span className="sm:hidden">Start Free</span>
              </Link>
            </div>
          </div>
        </header>
        <main className="flex-1"><Outlet /></main>
      </div>
    );
  }

  const isPro   = profile?.tier === 'PREMIUM';
  const tokens  = profile?.email_tokens ?? 0;
  const display = user.email?.split('@')[0] ?? 'User';

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* ── Sidebar ── */}
      <aside className="w-64 border-r border-slate-200 bg-white shrink-0 hidden md:flex flex-col sticky top-0 h-screen">
        <div className="p-6">
          <Link to="/dashboard"><Logo /></Link>
        </div>

        <div className="px-4 pb-4">
          {!isPro && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Plan</span>
                <span className="text-xs font-semibold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">FREE</span>
              </div>
              <p className="text-sm font-medium text-slate-700 mb-3">{tokens} Email Tokens left</p>
              <button
                onClick={() => setIsSubscribeModalOpen(true)}
                className="w-full text-xs font-semibold bg-brand-accent/10 text-brand-accent-hover py-2 rounded-lg hover:bg-brand-accent/20 transition-colors flex items-center justify-center gap-1.5"
              >
                <Zap size={14} /> Upgrade to Pro
              </button>
            </div>
          )}
          {isPro && (
            <div className="bg-brand-dark rounded-xl p-4 mb-4 text-white">
              <div className="flex items-center gap-2 mb-1">
                <Zap size={16} className="text-brand-accent" />
                <span className="text-sm font-bold">PriceHawk Pro</span>
              </div>
              <p className="text-xs text-slate-400">Unlimited tracking active</p>
            </div>
          )}
        </div>

        <nav className="flex-1 px-4 mt-2 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center justify-between px-3 py-3 rounded-xl text-sm font-semibold transition-all duration-200',
                  isActive ? 'bg-slate-900 text-white shadow-md shadow-slate-200' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} className={isActive ? 'text-brand-accent' : 'text-slate-400'} />
                  {item.name}
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="bg-brand-accent text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mx-4 mb-4 bg-linear-to-br from-brand-accent/10 to-transparent border border-brand-accent/20 rounded-2xl relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 text-brand-accent/10 group-hover:scale-110 transition-transform duration-500">
            <Zap size={64} />
          </div>
          <h4 className="text-sm font-bold text-slate-900 mb-1 relative z-10">HawkBot AI</h4>
          <p className="text-xs text-slate-500 mb-3 relative z-10">Find deals instantly.</p>
          <Link to="/dashboard?action=open-chat" className="w-full bg-white border border-slate-200 text-slate-700 text-xs font-bold py-2 rounded-lg hover:border-brand-accent hover:text-brand-accent transition-colors flex items-center justify-center relative z-10 shadow-sm">
            Launch Assistant
          </Link>
        </div>

        <div className="p-4 border-t border-slate-100">
          <div className="px-3 py-2 flex items-center justify-between">
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-bold text-slate-900 truncate">{display}</span>
              <span className="text-[10px] text-slate-500 truncate">{user.email}</span>
            </div>
            <button onClick={handleLogout} className="text-slate-400 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-50" title="Log out">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        {/* Mobile Header */}
        <header className="md:hidden border-b border-slate-200 bg-white h-14 flex items-center justify-between px-4 shrink-0">
          <Link to="/dashboard"><Logo size="sm" /></Link>
          <div className="flex gap-3 items-center">
            {!isPro ? (
              <button
                onClick={() => setIsSubscribeModalOpen(true)}
                className="text-[10px] font-bold bg-brand-accent/10 text-brand-accent-hover px-2 py-1 rounded-md flex items-center gap-1"
              >
                <Zap size={12} /> PRO
              </button>
            ) : (
              <span className="text-[10px] font-bold bg-brand-dark text-brand-accent px-2 py-1 rounded-md flex items-center gap-1">
                <Zap size={12} /> PRO
              </span>
            )}
            <button onClick={handleLogout} className="p-2 text-slate-600">
              <LogOut size={20} />
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto pb-16 md:pb-0">
          <Outlet />
        </div>

        {/* Mobile Bottom Nav */}
        <nav className="md:hidden absolute bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 flex items-center justify-around px-2 z-40">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex flex-col items-center justify-center w-16 h-full relative transition-colors',
                  isActive ? 'text-brand-accent' : 'text-slate-500 hover:text-slate-900'
                )}
              >
                <div className="relative">
                  <Icon size={20} className={isActive ? 'text-brand-accent' : ''} />
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-brand-accent text-white text-[10px] font-bold min-w-4 h-4 flex items-center justify-center rounded-full px-1 border border-white">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-medium mt-1">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </main>

      <SubscribeModal
        isOpen={isSubscribeModalOpen}
        onClose={() => setIsSubscribeModalOpen(false)}
      />
    </div>
  );
};
