/**
 * useAlerts.ts
 * ------------
 * Custom React hook that manages the `alerts` table in Supabase.
 *
 * Replaces the old `emails` array that lived in the React Context.
 * Alerts are the deal-alert notifications sent to the user's inbox.
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase }       from '../lib/supabase';
import type { AlertRow }  from '../lib/database.types';

export function useAlerts(userId: string | null) {
  const [alerts,                 setAlerts]                 = useState<AlertRow[]>([]);
  const [latestTriggeredAlertId, setLatestTriggeredAlertId] = useState<string | null>(null);

  const fetchAlerts = useCallback(async () => {
    if (!userId) { setAlerts([]); return; }
    const { data } = await supabase
      .from('alerts')
      .select('*')
      .eq('user_id', userId)
      .order('sent_at', { ascending: false });
    setAlerts(data ?? []);
  }, [userId]);

  useEffect(() => { fetchAlerts(); }, [fetchAlerts]);

  // ── Insert a new alert ────────────────────────────────────────────────────
  const addAlert = async (alert: Omit<AlertRow, 'id'>) => {
    const { data, error } = await supabase
      .from('alerts')
      .insert(alert)
      .select()
      .single();
    if (!error && data) {
      setAlerts(prev => [data, ...prev]);
      setLatestTriggeredAlertId(data.id);
    }
  };

  // ── Mark one alert as read ────────────────────────────────────────────────
  const markRead = async (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
    await supabase.from('alerts').update({ read: true }).eq('id', id);
  };

  // ── Mark all alerts as read ───────────────────────────────────────────────
  const markAllAsRead = async () => {
    if (!userId) return;
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
    await supabase.from('alerts').update({ read: true }).eq('user_id', userId);
  };

  // ── Delete one alert ──────────────────────────────────────────────────────
  const deleteAlert = async (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
    await supabase.from('alerts').delete().eq('id', id);
  };

  const unreadCount = alerts.filter(a => !a.read).length;

  return {
    alerts,
    latestTriggeredAlertId,
    setLatestTriggeredAlertId,
    addAlert,
    markRead,
    markAllAsRead,
    deleteAlert,
    unreadCount,
  };
}
