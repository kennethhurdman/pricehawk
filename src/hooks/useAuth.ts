/**
 * useAuth.ts
 * ----------
 * Custom React hook that owns ALL authentication state.
 *
 * What it does:
 *  1. Listens to Supabase's auth state changes (login, logout, token refresh).
 *  2. After any sign-in, upserts a row into `public.profiles` so the user record always exists.
 *  3. Exposes signUp, signIn, signInWithGoogle, and signOut helpers.
 *
 * Usage anywhere in the app:
 *   const { user, profile, loading, signIn, signOut } = useAuth();
 */

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Session }  from '@supabase/supabase-js';
import type { ProfileRow }     from '../lib/database.types';

export interface AuthState {
  user:     User    | null;
  session:  Session | null;
  profile:  ProfileRow | null;
  loading:  boolean;
  signUp:   (email: string, password: string, categories: string[]) => Promise<{ error: Error | null }>;
  signIn:   (email: string, password: string)                       => Promise<{ error: Error | null }>;
  signInWithGoogle: ()                                              => Promise<{ error: Error | null }>;
  signOut:  ()                                                      => Promise<void>;
}

export function useAuth(): AuthState {
  const [user,    setUser]    = useState<User    | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [loading, setLoading] = useState(true);

  // ── Fetch the profile row from public.profiles ──────────────────────────
  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    setProfile(data ?? null);
  };

  // ── Bootstrap: restore existing session on page load ─────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      setLoading(false);
    });

    // Subscribe to future auth events (login / logout / token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // ── signUp: create account + profile row ────────────────────────────────
  const signUp = async (email: string, password: string, categories: string[]) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error || !data.user) return { error: error as Error };

    // Upsert profile with the user's initial preferences
    await supabase.from('profiles').upsert({
      id:                  data.user.id,
      email:               data.user.email!,
      tier:                'FREE',
      email_tokens:        5,
      selected_categories: categories as any,
      premium_active_until: null,
    });

    await fetchProfile(data.user.id);
    return { error: null };
  };

  // ── signIn: email + password ─────────────────────────────────────────────
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  // ── signInWithGoogle: OAuth popup flow ───────────────────────────────────
  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options:  { redirectTo: window.location.origin + '/#/dashboard' },
    });
    return { error: error as Error | null };
  };

  // ── signOut ───────────────────────────────────────────────────────────────
  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  return { user, session, profile, loading, signUp, signIn, signInWithGoogle, signOut };
}
