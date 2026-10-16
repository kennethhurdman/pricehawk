/**
 * App.tsx
 * -------
 * Root component. Provides authentication context via a shared AuthContext
 * so every page can access `user`, `profile`, and `signOut`.
 *
 * Route protection now checks the Supabase session instead of the old mock store.
 */

import React, { createContext, useContext } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout }     from './components/Layout';
import { Landing }    from './pages/Landing';
import { Signup }     from './pages/Signup';
import { Dashboard }  from './pages/Dashboard';
import { Inbox }      from './pages/Inbox';
import { Account }    from './pages/Account';
import { EmailDemo }  from './pages/EmailDemo';
import { HowItWorks } from './pages/HowItWorks';
import { useAuth, AuthState } from './hooks/useAuth';

// ─── Auth Context (app-wide) ─────────────────────────────────────────────────
export const AuthContext = createContext<AuthState | undefined>(undefined);

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used inside <AuthProvider>');
  return ctx;
};

// ─── Route Guards ─────────────────────────────────────────────────────────────
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuthContext();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-slate-200 border-t-brand-accent rounded-full animate-spin" /></div>;
  if (!user)   return <Navigate to="/signup" replace />;
  return <>{children}</>;
};

const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuthContext();
  if (loading) return null;
  if (user)    return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

// ─── Routes ───────────────────────────────────────────────────────────────────
function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Public */}
        <Route index         element={<AuthRoute><Landing /></AuthRoute>} />
        <Route path="signup" element={<AuthRoute><Signup  /></AuthRoute>} />
        <Route path="how-it-works" element={<HowItWorks />} />

        {/* Protected */}
        <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="inbox"     element={<ProtectedRoute><Inbox     /></ProtectedRoute>} />
        <Route path="account"   element={<ProtectedRoute><Account   /></ProtectedRoute>} />
      </Route>

      {/* Standalone */}
      <Route path="/email-demo" element={<EmailDemo />} />
    </Routes>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
  const auth = useAuth();   // single instance, shared via context

  return (
    <AuthContext.Provider value={auth}>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </AuthContext.Provider>
  );
}
