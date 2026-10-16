/**
 * useTrackedItems.ts
 * ------------------
 * Custom React hook that manages CRUD for `tracked_items` in Supabase.
 *
 * Why a separate hook?
 *   - Keeps Database logic OUT of UI components (single responsibility).
 *   - Can be extended with Supabase Realtime subscriptions when needed.
 *
 * What it does:
 *   - Fetches the user's tracked items on mount.
 *   - Provides add / remove / toggleFavorite helpers that hit Supabase directly.
 *   - The local `items` state is updated optimistically so the UI feels instant.
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase }           from '../lib/supabase';
import type { TrackedItemRow } from '../lib/database.types';

export function useTrackedItems(userId: string | null) {
  const [items,   setItems]   = useState<TrackedItemRow[]>([]);
  const [loading, setLoading] = useState(false);

  // ── Fetch all items for this user ─────────────────────────────────────────
  const fetchItems = useCallback(async () => {
    if (!userId) { setItems([]); return; }
    setLoading(true);
    const { data } = await supabase
      .from('tracked_items')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    setItems(data ?? []);
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  // ── Add a new tracked item ────────────────────────────────────────────────
  const addItem = async (item: Omit<TrackedItemRow, 'id' | 'user_id' | 'created_at'>) => {
    if (!userId) return;
    const { data, error } = await supabase
      .from('tracked_items')
      .insert({ ...item, user_id: userId })
      .select()
      .single();

    if (!error && data) {
      // Optimistic prepend
      setItems(prev => [data, ...prev]);
    }
  };

  // ── Remove an item ────────────────────────────────────────────────────────
  const removeItem = async (id: string) => {
    // Optimistic remove
    setItems(prev => prev.filter(i => i.id !== id));
    await supabase.from('tracked_items').delete().eq('id', id);
  };

  // ── Toggle favorite ────────────────────────────────────────────────────────
  const toggleFavorite = async (id: string) => {
    const target = items.find(i => i.id === id);
    if (!target) return;
    const next = !target.is_favorite;

    // Optimistic update
    setItems(prev => prev.map(i => i.id === id ? { ...i, is_favorite: next } : i));
    await supabase.from('tracked_items').update({ is_favorite: next }).eq('id', id);
  };

  // ── Update current_price (called by simulate price check) ────────────────
  const updateCurrentPrice = async (id: string, newPrice: number) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, current_price: newPrice } : i));
    await supabase.from('tracked_items').update({ current_price: newPrice }).eq('id', id);
  };

  return { items, loading, fetchItems, addItem, removeItem, toggleFavorite, updateCurrentPrice };
}
