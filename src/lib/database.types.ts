/**
 * database.types.ts
 * -----------------
 * Hand-crafted TypeScript types that mirror your Supabase Postgres schema.
 *
 * After you run the SQL migration script (in the guide), generate the real
 * version automatically with:
 *   npx supabase gen types typescript --project-id <your-project-id> > src/lib/database.types.ts
 */

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type Category = 'FLIGHT' | 'HOTEL' | 'ECOMMERCE';
export type Tier     = 'FREE'   | 'PREMIUM';

// ─── Row types ───────────────────────────────────────────────────────────────

export interface ProfileRow {
  id:                   string;   // UUID — matches auth.users.id
  email:                string;
  tier:                 Tier;
  email_tokens:         number;   // decremented on each FREE-tier alert
  selected_categories:  Category[];
  premium_active_until: string | null; // ISO timestamp or null
  created_at:           string;
}

export interface TrackedItemRow {
  id:            string;   // UUID
  user_id:       string;   // FK → profiles.id
  category:      Category;
  title:         string;
  image_url:     string;
  target_url:    string;   // The actual product link
  target_price:  number;
  current_price: number;
  currency:      string;
  is_favorite:   boolean;
  created_at:    string;
}

export interface AlertRow {
  id:          string;   // UUID
  user_id:     string;   // FK → profiles.id
  item_id:     string;   // FK → tracked_items.id
  type:        'DEAL_ALERT' | 'SYSTEM_OUT_OF_TOKENS';
  subject:     string;
  html_body:   string;
  read:        boolean;
  sent_at:     string;   // ISO timestamp
}

// ─── Supabase Database shape ──────────────────────────────────────────────────
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row:    ProfileRow;
        Insert: Omit<ProfileRow, 'created_at'>;
        Update: Partial<Omit<ProfileRow, 'id' | 'created_at'>>;
      };
      tracked_items: {
        Row:    TrackedItemRow;
        Insert: Omit<TrackedItemRow, 'id' | 'created_at'>;
        Update: Partial<Omit<TrackedItemRow, 'id' | 'user_id' | 'created_at'>>;
      };
      alerts: {
        Row:    AlertRow;
        Insert: Omit<AlertRow, 'id'>;
        Update: Partial<Pick<AlertRow, 'read'>>;
      };
    };
  };
}
