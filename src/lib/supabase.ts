/**
 * supabase.ts
 * -----------
 * Single Supabase client instance for the entire app.
 * Both the React frontend and the Express backend import from here.
 *
 * On the CLIENT (browser):  uses the anon key — row-level security keeps data safe.
 * On the SERVER (Express):  same client, but we will verify JWT tokens before
 *                            touching sensitive data.
 *
 * Environment variables required in .env:
 *   VITE_SUPABASE_URL=https://xxxx.supabase.co
 *   VITE_SUPABASE_ANON_KEY=eyJ...
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL  as string;
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnon) {
  throw new Error(
    '[PriceHawk] Supabase env vars are missing.\n' +
    'Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.'
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnon, {
  auth: {
    // Keep the session in localStorage so users stay logged in on refresh
    persistSession: true,
    autoRefreshToken: true,
  },
});
