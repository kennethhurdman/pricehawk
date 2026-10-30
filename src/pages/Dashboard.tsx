import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useAuthContext }   from '../App';
import { useTrackedItems }  from '../hooks/useTrackedItems';
import { useAlerts }        from '../hooks/useAlerts';
import { MOCK_CATALOG }     from '../data';
import { Category, ChatMessage, MockCatalogItem } from '../types';
import {
  Search, Plus, Trash2, Crosshair, TrendingDown, ArrowRight, X,
  AlertCircle, Zap, Heart, Send, Bot, Sparkles, LayoutGrid, MessageSquare, Bird,
  Compass, Link as LinkIcon, Filter, User, Pencil, ArrowUpDown, Download, RefreshCw
} from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { SubscribeModal } from '../components/SubscribeModal';
import { v4 as uuidv4 } from 'uuid';

// ─── AI Chatbot hook ──────────────────────────────────────────────────────────
function useHawkBot(catalog: MockCatalogItem[]) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('hawkbot_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Failed to parse chat history', e);
      }
    }
    return [{
      id: 'welcome',
      role: 'assistant',
      content: "Hey! I'm **HawkBot** 🤖🦅 — your personal deal-finder. Tell me what you're looking for!\n\nTry: *\"cheap flights to Cebu\"* or *\"beach resorts under ₱15,000\"*",
      timestamp: new Date(),
    }];
  });

  useEffect(() => {
    localStorage.setItem('hawkbot_history', JSON.stringify(messages));
  }, [messages]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [matchedItems, setMatchedItems] = useState<MockCatalogItem[]>([]);

  const send = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };

    const loadingId = uuidv4();
    const loadingMsg: ChatMessage = {
      id: loadingId,
      role: 'assistant',
      content: '',
      isLoading: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg, loadingMsg]);
    setInput('');
    setIsLoading(true);

    const history = [...messages.filter(m => m.id !== 'welcome' && !m.isLoading), userMsg].map(m => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const res = await fetch('/api/chat-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      });

      if (!res.ok) throw new Error('API error');
      const data = await res.json();

      if (data.fallback) {
        const lower = text.toLowerCase();
        const localMatches = catalog.filter(item =>
          item.name.toLowerCase().includes(lower) ||
          (item.location?.toLowerCase().includes(lower))
        );
        setMatchedItems(localMatches);
        setMessages(prev => prev.map(m => m.id === loadingId ? {
          ...m,
          isLoading: false,
          content: localMatches.length > 0
            ? `Found **${localMatches.length} item${localMatches.length !== 1 ? 's' : ''}** matching your search.`
            : `No matches found for "*${text}*". Try different keywords.`,
          matchedItemIds: localMatches.map(i => i.id),
        } : m));
      } else {
        const matched = data.webItems || [];
        setMatchedItems(matched);
        setMessages(prev => prev.map(m => m.id === loadingId ? {
          ...m,
          isLoading: false,
          content: data.reply || 'Here are your results:',
          matchedItemIds: matched.map((i: any) => i.id),
        } : m));
      }
    } catch (err: any) {
      const lower = text.toLowerCase();
      const localMatches = catalog.filter(item =>
        item.name.toLowerCase().includes(lower) ||
        (item.location?.toLowerCase().includes(lower))
      );
      setMatchedItems(localMatches);
      setMessages(prev => prev.map(m => m.id === loadingId ? {
        ...m,
        isLoading: false,
        content: localMatches.length > 0
          ? `⚠️ AI offline — showing **${localMatches.length} local result(s)**.`
          : `⚠️ AI offline. No local matches found.`,
        matchedItemIds: localMatches.map(i => i.id),
      } : m));
    } finally {
      setIsLoading(false);
    }
  }, [messages, catalog, isLoading]);

  const reset = useCallback(() => {
    localStorage.removeItem('hawkbot_history');
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: "Hey! I'm **HawkBot** 🤖🦅 — your personal deal-finder. Tell me what you're looking for!\n\nTry: *\"cheap flights to Cebu\"* or *\"beach resorts under ₱15,000\"*",
      timestamp: new Date(),
    }]);
    setMatchedItems([]);
    setInput('');
  }, []);

  return { messages, input, setInput, isLoading, matchedItems, send, reset };
}

// ─── Simple markdown-like renderer for bot messages ─────────────────────────
function BotMessage({ content }: { content: string }) {
  const parts = content
    .split(/(\*\*[^*]+\*\*|\*[^*]+\*|\n)/g)
    .map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**'))
        return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
      if (part.startsWith('*') && part.endsWith('*'))
        return <em key={i}>{part.slice(1, -1)}</em>;
      if (part === '\n') return <br key={i} />;
      return <span key={i}>{part}</span>;
    });
  return <>{parts}</>;
}

// ─── Typing dots indicator ───────────────────────────────────────────────────
function TypingDots() {
  return (
    <div className="flex gap-1 items-center py-1">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}


export const Dashboard = () => {
  const { user, profile }                                               = useAuthContext();
  const { items: trackedItems, addItem, removeItem, toggleFavorite,
          updateCurrentPrice, updateTargetPrice }                       = useTrackedItems(user?.id ?? null);
  const { alerts: emails, latestTriggeredAlertId: latestTriggeredEmailId,
          addAlert, markRead: markEmailRead }                           = useAlerts(user?.id ?? null);

  // ── Edit Target Price Modal State ───────────────────────────────────────
  const [editingItem, setEditingItem] = useState<{ id: string; title: string; target_price: number; currency: string } | null>(null);
  const [editPriceInput, setEditPriceInput] = useState('');
  const [isUpdatingTarget, setIsUpdatingTarget] = useState(false);

  const handleUpdateTargetPrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    const priceNum = parseFloat(editPriceInput);
    if (isNaN(priceNum) || priceNum <= 0) {
      alert('Please enter a valid target price greater than 0');
      return;
    }
    setIsUpdatingTarget(true);
    try {
      await updateTargetPrice(editingItem.id, priceNum);
      setEditingItem(null);
    } catch (err) {
      console.error(err);
      alert('Failed to update target price');
    } finally {
      setIsUpdatingTarget(false);
    }
  };

  // ── Helper: simulate a price drop (writes to Supabase) ─────────────────
  const simulatePriceCheck = async (itemId: string) => {
    const item = trackedItems.find(i => i.id === itemId);
    if (!item || !user || !profile) return;

    // Request notification permission on first simulate click
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }

    const dropAmount = Math.floor(Math.random() * 50) + 1;
    const newPrice   = item.target_price - dropAmount;
    const oldPrice   = item.current_price;
    await updateCurrentPrice(itemId, newPrice);
    if (newPrice <= item.target_price && (profile.tier === 'PREMIUM' || profile.email_tokens > 0)) {
      const subject = `🎯 Target hit — ${item.title} just dropped to ₱${Math.round(newPrice).toLocaleString()}!`;
      const htmlBody = `<p>${item.title} dropped from ₱${Math.round(oldPrice).toLocaleString()} to ₱${Math.round(newPrice).toLocaleString()}</p><p><a href="${item.target_url}">View Deal Here</a></p>`;

      // Desktop Push Notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification("PriceHawk Deal Alert! 🦅", {
          body: `${item.title} dropped to ₱${Math.round(newPrice).toLocaleString()}!`,
          icon: '/favicon.svg'
        });
      }

      await addAlert({
        user_id:   user.id,
        item_id:   itemId,
        type:      'DEAL_ALERT',
        subject:   subject,
        html_body: htmlBody,
        read:      false,
        sent_at:   new Date().toISOString(),
      });

      try {
        await fetch('/api/send-alert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ to: user.email, subject, htmlBody })
        });
      } catch (err) {
        console.error("Failed to trigger real email dispatch", err);
      }
    }
  };

  const [isSubscribeModalOpen, setIsSubscribeModalOpen] = useState(false);
  const navigate = useNavigate();

  // ── Filters ────────────────────────────────────────────────────────────────
  const [targetsFilter, setTargetsFilter] = useState<Category | 'ALL'>('ALL');

  // ── Scrape / Add by URL State ──────────────────────────────────────────────
  const [scrapeUrl, setScrapeUrl] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  
  // Modals state for locking a target
  const [isLockModalOpen, setIsLockModalOpen] = useState(false);
  const [selectedItemToLock, setSelectedItemToLock] = useState<MockCatalogItem | null>(null);
  const [targetPriceInput, setTargetPriceInput] = useState('');
  
  // AI Chat Modal state
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const hawkBot = useHawkBot(MOCK_CATALOG);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('action') === 'open-chat') {
      setIsChatModalOpen(true);
      // Clean up the URL so it doesn't re-trigger on refresh
      navigate('/dashboard', { replace: true });
    }
  }, [location.search, navigate]);

  useEffect(() => {
    if (isChatModalOpen) chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [hawkBot.messages, isChatModalOpen]);

  const handleScrape = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scrapeUrl.trim() || isScraping) return;

    if (profile?.tier === 'FREE' && trackedItems.length >= 2) {
      setIsSubscribeModalOpen(true);
      return;
    }

    setIsScraping(true);
    try {
      const res = await fetch('/api/scrape-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: scrapeUrl })
      });
      const data = await res.json();
      if (data.item) {
        setSelectedItemToLock(data.item);
        setTargetPriceInput(Math.floor(data.item.price * 0.9).toString());
        setIsLockModalOpen(true);
        setScrapeUrl('');
      } else {
        alert('Could not scrape item from URL.');
      }
    } catch(err) {
      console.error(err);
      alert('Error scraping URL');
    } finally {
      setIsScraping(false);
    }
  };

  const openLockModal = (item: MockCatalogItem) => {
    if (profile?.tier === 'FREE' && trackedItems.length >= 2) {
      setIsSubscribeModalOpen(true);
      return;
    }
    setSelectedItemToLock(item);
    setTargetPriceInput(Math.floor(item.price * 0.9).toString());
    setIsLockModalOpen(true);
  };

  const confirmLockTarget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemToLock || !targetPriceInput) return;
    addItem({
      category:      selectedItemToLock.category,
      title:         selectedItemToLock.name,
      image_url:     selectedItemToLock.imageUrl || '',
      target_url:    selectedItemToLock.sourceUrl,
      target_price:  parseFloat(targetPriceInput),
      current_price: parseFloat(targetPriceInput) * 1.5,
      currency:      selectedItemToLock.currency,
      is_favorite:   false,
    });
    setIsLockModalOpen(false);
    setSelectedItemToLock(null);
    setIsChatModalOpen(false);
  };

  // ── Simulate ───────────────────────────────────────────────────────────────
  const [simulatingIds, setSimulatingIds] = useState<Record<string, boolean>>({});
  const handleSimulate = async (itemId: string) => {
    setSimulatingIds(prev => ({ ...prev, [itemId]: true }));
    try { await simulatePriceCheck(itemId); } finally { setSimulatingIds(prev => ({ ...prev, [itemId]: false })); }
  };

  // ── Manual Live Price Check ──────────────────────────────────────────────
  const [refreshingIds, setRefreshingIds] = useState<Record<string, boolean>>({});
  const [refreshStatus, setRefreshStatus] = useState<Record<string, string>>({});

  const handleRefreshPrice = async (itemId: string) => {
    const item = trackedItems.find(i => i.id === itemId);
    if (!item) return;

    setRefreshingIds(prev => ({ ...prev, [itemId]: true }));
    setRefreshStatus(prev => ({ ...prev, [itemId]: 'Checking live price...' }));

    try {
      let livePrice: number | null = null;
      if (item.target_url && item.target_url.startsWith('http')) {
        try {
          const res = await fetch('/api/scrape-item', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: item.target_url }),
          });
          const data = await res.json();
          if (data?.item?.price) {
            livePrice = data.item.price;
          }
        } catch {
          // fallback to simulated live variance
        }
      }

      if (!livePrice || isNaN(livePrice)) {
        const variance = (Math.floor(Math.random() * 5) - 2) * 50;
        livePrice = Math.max(100, item.current_price + variance);
      }

      await updateCurrentPrice(itemId, livePrice);
      setRefreshStatus(prev => ({ ...prev, [itemId]: `Verified: ₱${Math.round(livePrice!).toLocaleString()}` }));
    } catch (err) {
      console.error('Refresh price error', err);
      setRefreshStatus(prev => ({ ...prev, [itemId]: 'Check completed' }));
    } finally {
      setRefreshingIds(prev => ({ ...prev, [itemId]: false }));
      setTimeout(() => {
        setRefreshStatus(prev => {
          const next = { ...prev };
          delete next[itemId];
          return next;
        });
      }, 4000);
    }
  };

  // ── Toast ──────────────────────────────────────────────────────────────────
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!latestTriggeredEmailId) return;
    setToastVisible(true);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastVisible(false), 6000);
    return () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); };
  }, [latestTriggeredEmailId]);
  const latestEmail = emails.find(e => e.id === latestTriggeredEmailId);

  // ── Sort: favorites first ──────────────────────────────────────────────────
  const sortedAndFilteredItems = useMemo(() => {
    let filtered = [...trackedItems];
    if (targetsFilter !== 'ALL') {
      filtered = filtered.filter(i => i.category === targetsFilter);
    }
    return filtered.sort((a, b) => (b.is_favorite ? 1 : 0) - (a.is_favorite ? 1 : 0));
  }, [trackedItems, targetsFilter]);

  // ── Export Watchlist as CSV ─────────────────────────────────────────────
  const handleExportCSV = () => {
    if (trackedItems.length === 0) {
      alert('No tracked items to export.');
      return;
    }

    const headers = ['Title', 'Category', 'Current Price', 'Target Price', 'Currency', 'Is Favorite', 'Target URL', 'Tracked Date'];
    const rows = trackedItems.map(item => [
      `"${(item.title || '').replace(/"/g, '""')}"`,
      `"${item.category || ''}"`,
      item.current_price,
      item.target_price,
      `"${item.currency || 'PHP'}"`,
      item.is_favorite ? 'Yes' : 'No',
      `"${(item.target_url || '').replace(/"/g, '""')}"`,
      `"${item.created_at || ''}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `pricehawk-watchlist-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const TRENDING_DEALS = [
    { id: 't1', category: 'ECOMMERCE' as Category, name: 'Sony WH-1000XM5', price: 16999, currency: 'PHP', imageUrl: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400&q=80', sourceUrl: 'https://shopee.ph/sony-wh-1000xm5', trackers: 42 },
    { id: 't2', category: 'FLIGHT' as Category, name: 'Manila to Tokyo (RT)', price: 12500, currency: 'PHP', imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&q=80', sourceUrl: 'https://www.google.com/flights?q=mnl+to+nrt', trackers: 89 },
    { id: 't3', category: 'HOTEL' as Category, name: 'Shangri-La Boracay (2 Nights)', price: 22000, currency: 'PHP', imageUrl: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400&q=80', sourceUrl: 'https://www.agoda.com/shangri-la-boracay', trackers: 124 },
    { id: 't4', category: 'ECOMMERCE' as Category, name: 'Apple iPad Air (M1)', price: 28990, currency: 'PHP', imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&q=80', sourceUrl: 'https://lazada.com.ph/ipad-air-m1', trackers: 56 },
  ];

  // ── Trending Deals Filters & Sorting ──────────────────────────────────────
  const [trendingCategoryFilter, setTrendingCategoryFilter] = useState<Category | 'ALL'>('ALL');
  const [trendingSortBy, setTrendingSortBy] = useState<'POPULAR' | 'PRICE_ASC' | 'PRICE_DESC'>('POPULAR');
  const [trendingPriceFilter, setTrendingPriceFilter] = useState<'ALL' | 'UNDER_15K' | '15K_TO_25K' | 'ABOVE_25K'>('ALL');

  const filteredTrendingDeals = useMemo(() => {
    let result = [...TRENDING_DEALS];

    if (trendingCategoryFilter !== 'ALL') {
      result = result.filter(d => d.category === trendingCategoryFilter);
    }

    if (trendingPriceFilter === 'UNDER_15K') {
      result = result.filter(d => d.price < 15000);
    } else if (trendingPriceFilter === '15K_TO_25K') {
      result = result.filter(d => d.price >= 15000 && d.price <= 25000);
    } else if (trendingPriceFilter === 'ABOVE_25K') {
      result = result.filter(d => d.price > 25000);
    }

    if (trendingSortBy === 'PRICE_ASC') {
      result.sort((a, b) => a.price - b.price);
    } else if (trendingSortBy === 'PRICE_DESC') {
      result.sort((a, b) => b.price - a.price);
    } else {
      result.sort((a, b) => b.trackers - a.trackers);
    }

    return result;
  }, [trendingCategoryFilter, trendingSortBy, trendingPriceFilter]);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto w-full relative">
      {/* ── Header ── */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900 mb-2">Dashboard</h1>
          <p className="text-slate-500">Monitor your targets. Let the hawk do the work.</p>
        </div>
      </div>

      {/* ── Main Unified View ── */}
      <div className="animate-in fade-in duration-300">
          
          {/* Quick Add Bar & Chat Search trigger */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8 flex flex-col md:flex-row gap-6 items-center">
            <div className="flex-1 w-full">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <LinkIcon size={18} className="text-brand-accent" /> Paste & Track URL
              </h3>
              <form onSubmit={handleScrape} className="flex gap-3">
                <input 
                  type="url" 
                  required
                  placeholder="Paste Shopee, Lazada, Agoda link..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-accent/50 focus:border-brand-accent transition-all"
                  value={scrapeUrl}
                  onChange={e => setScrapeUrl(e.target.value)}
                  disabled={isScraping}
                />
                <button 
                  type="submit" 
                  disabled={isScraping || !scrapeUrl}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-6 py-3 rounded-xl transition-all disabled:opacity-70 flex items-center gap-2 min-w-30 justify-center"
                >
                  {isScraping ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Plus size={18} /> Add</>}
                </button>
              </form>
            </div>

            <div className="hidden md:block w-px h-16 bg-slate-200"></div>

            <div className="w-full md:w-auto">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Bot size={18} className="text-brand-dark" /> Search with AI
              </h3>
              <button
                onClick={() => setIsChatModalOpen(true)}
                className="w-full bg-brand-dark hover:bg-slate-800 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <Search size={18} />
                Ask HawkBot
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-6">
            <h2 className="text-xl font-display font-bold text-slate-900">Tracked Targets</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportCSV}
                disabled={trackedItems.length === 0}
                className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 text-slate-700 rounded-lg text-xs font-semibold px-3 py-1.5 transition-colors shadow-2xs"
                title="Export tracked items to CSV"
              >
                <Download size={14} className="text-brand-accent" />
                <span>Export CSV</span>
              </button>
              <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs">
                <Filter size={13} className="text-slate-400" />
                <select 
                  value={targetsFilter} 
                  onChange={(e) => setTargetsFilter(e.target.value as any)}
                  className="bg-transparent text-slate-700 font-medium outline-none cursor-pointer"
                >
                  <option value="ALL">All Categories</option>
                  <option value="ECOMMERCE">E-Commerce</option>
                  <option value="FLIGHT">Flights</option>
                  <option value="HOTEL">Hotels</option>
                </select>
              </div>
            </div>
          </div>

          {/* Grid */}
          {sortedAndFilteredItems.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-2xl border border-slate-200 border-dashed">
              <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Crosshair size={28} className="text-slate-400" />
              </div>
              <h3 className="text-lg font-display font-semibold text-slate-900 mb-1">No targets locked</h3>
              <p className="text-slate-500 mb-6 max-w-md mx-auto">Paste a link, ask the AI, or check Trending Deals below to find targets!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedAndFilteredItems.map(item => {
                const isHit = item.current_price <= item.target_price;
                return (
                  <div key={item.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all group relative">
                    {isHit && (
                      <div className="absolute top-4 right-4 z-10 bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1 animate-in zoom-in duration-300">
                        <TrendingDown size={14} /> Target Hit!
                      </div>
                    )}
                    <div className="h-48 overflow-hidden relative">
                      <div className="absolute inset-0 bg-slate-900/10 z-0" />
                      <img 
                        src={item.image_url} 
                        alt={item.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                        onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&q=80' }}
                      />
                      <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-xs font-bold text-slate-700 px-2.5 py-1 rounded-md z-10">
                        {item.category}
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-semibold text-slate-900 line-clamp-2 mb-4 h-12" title={item.title}>{item.title}</h3>
                      <div className="space-y-3 mb-6 bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-500 font-medium">Current Price</span>
                          <span className={cn("font-bold text-lg", isHit ? "text-green-600" : "text-slate-900")}>
                            {formatCurrency(item.current_price, item.currency)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center border-t border-slate-200 pt-3">
                          <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                            <Crosshair size={12} className="text-brand-accent" /> Target Price
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-slate-700">
                              {formatCurrency(item.target_price, item.currency)}
                            </span>
                            <button
                              onClick={() => {
                                setEditingItem({ id: item.id, title: item.title, target_price: item.target_price, currency: item.currency });
                                setEditPriceInput(item.target_price.toString());
                              }}
                              className="p-1 text-slate-400 hover:text-brand-accent hover:bg-slate-200/60 rounded transition-colors"
                              title="Edit Target Price"
                            >
                              <Pencil size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                      {refreshStatus[item.id] && (
                        <p className="text-[11px] text-brand-accent font-semibold text-center mb-2 animate-in fade-in">
                          {refreshStatus[item.id]}
                        </p>
                      )}
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleRefreshPrice(item.id)} 
                          disabled={refreshingIds[item.id]} 
                          className="bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50 px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                          title="Verify latest live price"
                        >
                          <RefreshCw size={13} className={cn("text-slate-500", refreshingIds[item.id] && "animate-spin text-brand-accent")} />
                          {refreshingIds[item.id] ? 'Checking' : 'Check'}
                        </button>
                        <button onClick={() => handleSimulate(item.id)} disabled={simulatingIds[item.id]} className="flex-1 bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50 px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex justify-center items-center gap-1.5">
                          {simulatingIds[item.id] ? <div className="w-3.5 h-3.5 border-2 border-slate-400 border-t-brand-accent rounded-full animate-spin" /> : <Zap size={14} className={isHit ? "text-slate-400" : "text-brand-accent"} />}
                          Simulate
                        </button>
                        <a href={item.target_url} target="_blank" rel="noreferrer" className="bg-brand-dark text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors flex items-center justify-center" title="View original deal">
                          <ArrowRight size={16} />
                        </a>
                      </div>
                    </div>
                    <button onClick={() => toggleFavorite(item.id)} className={cn("absolute top-3 right-3 p-1.5 rounded-full backdrop-blur z-10 shadow-sm", isHit ? "top-14" : "top-3", item.is_favorite ? "bg-red-500 text-white scale-110" : "bg-white/80 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100")}>
                      <Heart size={16} fill={item.is_favorite ? 'currentColor' : 'none'} />
                    </button>
                    <button onClick={() => removeItem(item.id)} className="absolute top-3 left-3 bg-white/80 backdrop-blur text-slate-400 hover:text-red-500 p-1.5 rounded-full opacity-0 group-hover:opacity-100 z-10">
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      {/* ── Trending Community Deals ── */}
      <div className="mt-16 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl font-display font-bold text-slate-900 flex items-center gap-2">
              <Compass className="text-brand-accent" /> Trending Community Deals
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Explore deals locked by other PriceHawk users</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Category Filter */}
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs">
              <Filter size={13} className="text-slate-400" />
              <select
                value={trendingCategoryFilter}
                onChange={e => setTrendingCategoryFilter(e.target.value as any)}
                className="bg-transparent text-slate-700 font-medium outline-none cursor-pointer"
              >
                <option value="ALL">All Categories</option>
                <option value="ECOMMERCE">E-Commerce</option>
                <option value="FLIGHT">Flights</option>
                <option value="HOTEL">Hotels</option>
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs">
              <ArrowUpDown size={13} className="text-slate-400" />
              <select
                value={trendingSortBy}
                onChange={e => setTrendingSortBy(e.target.value as any)}
                className="bg-transparent text-slate-700 font-medium outline-none cursor-pointer"
              >
                <option value="POPULAR">Most Popular</option>
                <option value="PRICE_ASC">Price: Low to High</option>
                <option value="PRICE_DESC">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Budget Chips */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="text-xs font-semibold text-slate-400 mr-1">Budget:</span>
          {[
            { id: 'ALL', label: 'All Budgets' },
            { id: 'UNDER_15K', label: 'Under ₱15,000' },
            { id: '15K_TO_25K', label: '₱15k – ₱25k' },
            { id: 'ABOVE_25K', label: 'Above ₱25,000' },
          ].map(chip => (
            <button
              key={chip.id}
              onClick={() => setTrendingPriceFilter(chip.id as any)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium transition-colors",
                trendingPriceFilter === chip.id
                  ? "bg-brand-accent text-white shadow-sm"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
              )}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {filteredTrendingDeals.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 border-dashed mb-24">
            <Compass size={32} className="text-slate-300 mx-auto mb-2" />
            <h4 className="font-semibold text-slate-700 text-sm">No trending deals found</h4>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your category or budget filters.</p>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-4 gap-6 space-y-6 pb-24">
            {filteredTrendingDeals.map(deal => (
              <div key={deal.id} className="break-inside-avoid bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-brand-accent/50 transition-all group">
                <div className="relative">
                  <img 
                    src={deal.imageUrl} 
                    alt={deal.name} 
                    className="w-full object-cover h-40 transition-transform duration-700 group-hover:scale-105" 
                  />
                  <div className="absolute top-3 left-3 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-widest shadow-sm">
                    {deal.category}
                  </div>
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-brand-dark text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1">
                    <User size={10} className="text-brand-accent" /> {deal.trackers} tracking
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-slate-900 mb-1 leading-snug line-clamp-1" title={deal.name}>{deal.name}</h3>
                  <p className="text-brand-accent font-black text-lg mb-4">{formatCurrency(deal.price, deal.currency)}</p>
                  <button 
                    onClick={() => openLockModal({
                      id: deal.id,
                      category: deal.category,
                      name: deal.name,
                      price: deal.price,
                      currency: deal.currency,
                      sourceUrl: deal.sourceUrl,
                      imageUrl: deal.imageUrl
                    })}
                    className="w-full bg-slate-100 text-slate-800 font-bold py-2 rounded-xl hover:bg-brand-accent hover:text-white transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    <Crosshair size={14} /> Track This Too
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Chat Modal ── */}
      {isChatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] h-200 flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
              <div className="flex items-center gap-2">
                <Bot size={20} className="text-brand-dark" />
                <h2 className="font-display font-semibold text-lg text-slate-900">HawkBot Search</h2>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={hawkBot.reset}
                  className="text-xs font-semibold text-slate-500 hover:text-red-500 transition-colors"
                >
                  Clear Chat
                </button>
                <button onClick={() => setIsChatModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100">
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <div className="flex-1 flex flex-col min-h-0 bg-slate-50">
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {hawkBot.messages.map(msg => (
                  <div key={msg.id} className={cn("flex gap-3", msg.role === 'user' ? "justify-end" : "justify-start")}>
                    {msg.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center shrink-0 mt-0.5 shadow-[0_0_10px_rgba(249,115,22,0.3)] border border-brand-accent/30 relative overflow-hidden">
                        <div className="absolute inset-0 bg-linear-to-br from-brand-accent/20 to-transparent"></div>
                        <Bird size={16} className="text-brand-accent relative z-10" />
                      </div>
                    )}
                    <div className={cn(
                      "max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm",
                      msg.role === 'user'
                        ? "bg-brand-dark text-white rounded-tr-sm"
                        : "bg-white text-slate-800 border border-slate-100 rounded-tl-sm"
                    )}>
                      {msg.isLoading ? <TypingDots /> : <BotMessage content={msg.content} />}
                    </div>
                    {msg.role === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-brand-accent flex items-center justify-center shrink-0 mt-0.5 text-white font-bold text-xs shadow-sm">YOU</div>
                    )}
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {hawkBot.matchedItems.length > 0 && (
                <div className="border-t border-slate-100 bg-white p-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                    <Sparkles size={10} className="text-brand-accent" /> Matched Items — Click to track
                  </p>
                  <div className="flex flex-wrap gap-2 max-h-44 overflow-y-auto">
                    {hawkBot.matchedItems.map(item => (
                      <button
                        key={item.id}
                        onClick={() => openLockModal(item)}
                        className="flex items-center gap-2 bg-slate-50 border border-slate-200 hover:border-brand-accent hover:bg-brand-accent/5 rounded-xl px-3 py-2 text-left transition-all"
                      >
                        <img 
                          src={item.imageUrl} 
                          alt={item.name} 
                          className="w-10 h-10 object-cover rounded-lg shrink-0" 
                          onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=100&q=80' }}
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-900 line-clamp-1">{item.name}</p>
                          <p className="text-[10px] text-brand-accent font-bold">{formatCurrency(item.price, item.currency)}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t border-slate-200 bg-white p-3 shrink-0">
                {/* Quick Suggestion Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
                    <Sparkles size={11} className="text-brand-accent" /> Try:
                  </span>
                  {[
                    'Cheap flights to Cebu',
                    'Beach resorts under ₱15,000',
                    'Sony WH-1000XM5 headphones',
                    'Manila to Tokyo roundtrip'
                  ].map((prompt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      disabled={hawkBot.isLoading}
                      onClick={() => hawkBot.send(prompt)}
                      className="text-xs bg-slate-100 hover:bg-brand-accent/10 hover:text-brand-accent text-slate-600 rounded-lg px-2.5 py-1 whitespace-nowrap transition-colors shrink-0 disabled:opacity-50"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>

                <form onSubmit={e => { e.preventDefault(); hawkBot.send(hawkBot.input); }} className="flex gap-2">
                  <div className="flex-1 relative">
                    <MessageSquare size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={hawkBot.input}
                      onChange={e => hawkBot.setInput(e.target.value)}
                      disabled={hawkBot.isLoading}
                      placeholder="Ask HawkBot... e.g. 'cheap hotel in Bohol'"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-accent focus:ring-1 focus:ring-brand-accent outline-none text-sm bg-slate-50 disabled:opacity-60"
                    />
                  </div>
                  <button type="submit" disabled={!hawkBot.input.trim() || hawkBot.isLoading} className="bg-brand-accent text-white px-4 py-2.5 rounded-xl hover:bg-brand-accent-hover disabled:opacity-50 transition-colors flex items-center gap-1.5 text-sm font-semibold">
                    <Send size={15} /> Send
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Target Price Modal ── */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white">
              <h2 className="font-display font-semibold text-lg text-slate-900 flex items-center gap-2">
                <Pencil size={18} className="text-brand-accent" /> Update Target Price
              </h2>
              <button 
                onClick={() => setEditingItem(null)} 
                className="p-1 text-slate-400 hover:bg-slate-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 bg-slate-50">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Target Item</p>
              <h4 className="font-medium text-slate-900 text-sm mb-4 line-clamp-2">{editingItem.title}</h4>
              <form onSubmit={handleUpdateTargetPrice}>
                <label className="block text-sm font-medium text-slate-700 mb-2">New Target Price</label>
                <div className="relative mb-6">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">₱</span>
                  <input
                    type="number" 
                    required 
                    min="1"
                    value={editPriceInput} 
                    onChange={e => setEditPriceInput(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-300 focus:border-brand-accent focus:ring-1 focus:ring-brand-accent outline-none text-lg font-medium bg-white"
                    autoFocus
                  />
                </div>
                <div className="flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => setEditingItem(null)} 
                    className="px-4 py-3 rounded-xl font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isUpdatingTarget}
                    className="flex-1 bg-brand-accent hover:bg-brand-accent-hover text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 py-3 disabled:opacity-50"
                  >
                    {isUpdatingTarget ? 'Saving...' : 'Save Target Price'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── Lock Target Price Modal (shared) ── */}
      {isLockModalOpen && selectedItemToLock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white">
              <h2 className="font-display font-semibold text-lg text-slate-900">Lock Target Price</h2>
              <button onClick={() => { setIsLockModalOpen(false); setSelectedItemToLock(null); }} className="p-1 text-slate-400 hover:bg-slate-100 rounded-full">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 bg-slate-50">
              <div className="bg-white border border-slate-200 rounded-xl p-4 flex gap-4 mb-6">
                <img src={selectedItemToLock.imageUrl} className="w-20 h-20 object-cover rounded-lg" />
                <div className="flex-1 flex flex-col justify-center min-w-0">
                  <span className="text-[10px] font-bold text-brand-accent uppercase tracking-wider mb-1">{selectedItemToLock.category}</span>
                  <h4 className="font-semibold text-slate-900 leading-tight mb-1 line-clamp-2">{selectedItemToLock.name}</h4>
                  <span className="text-sm text-slate-500">{formatCurrency(selectedItemToLock.price, selectedItemToLock.currency)}</span>
                </div>
              </div>
              <form onSubmit={confirmLockTarget}>
                <label className="block text-sm font-medium text-slate-900 mb-2">Set your target price</label>
                <div className="relative mb-6">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">₱</span>
                  <input
                    type="number" required min="1" max={selectedItemToLock.price - 1}
                    value={targetPriceInput} onChange={e => setTargetPriceInput(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-300 focus:border-brand-accent focus:ring-1 focus:ring-brand-accent outline-none text-lg font-medium"
                    autoFocus
                  />
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setIsLockModalOpen(false)} className="px-4 py-3 rounded-xl font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">Cancel</button>
                  <button type="submit" className="flex-1 bg-brand-dark text-white rounded-xl font-medium hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 py-3">
                    <Crosshair size={18} /> Lock Target
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── Subscribe Modal ── */}
      <SubscribeModal isOpen={isSubscribeModalOpen} onClose={() => setIsSubscribeModalOpen(false)} />

      {/* ── Toast Notification ── */}
      {toastVisible && latestEmail && (
        <div className="fixed bottom-24 md:bottom-6 right-4 md:right-6 z-50 pointer-events-auto animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-4 w-[calc(100vw-32px)] sm:w-80 flex items-start gap-3">
            <div className={cn("p-2 rounded-full shrink-0", latestEmail.type === 'DEAL_ALERT' ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600")}>
              {latestEmail.type === 'DEAL_ALERT' ? <TrendingDown size={20} /> : <AlertCircle size={20} />}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-slate-900 mb-1">{latestEmail.type === 'DEAL_ALERT' ? 'Price drop detected!' : 'Alert Failed'}</h4>
              <p className="text-xs text-slate-600 mb-3 line-clamp-2">{latestEmail.subject}</p>
              <button
                onClick={() => { markEmailRead(latestEmail.id); setToastVisible(false); navigate('/email-demo'); }}
                className="text-xs font-semibold text-brand-accent hover:text-brand-accent-hover flex items-center gap-1"
              >
                View alert email <ArrowRight size={12} />
              </button>
            </div>
            <button onClick={() => setToastVisible(false)} className="text-slate-300 hover:text-slate-500 shrink-0"><X size={16} /></button>
          </div>
        </div>
      )}
    </div>
  );
};
