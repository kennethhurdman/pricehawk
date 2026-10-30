/**
 * Inbox.tsx
 * ---------
 * Alerts inbox — reads from Supabase `alerts` table via useAlerts hook.
 * The old MockEmail type is replaced by AlertRow from database.types.
 */

import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthContext }  from '../App';
import { useAlerts }       from '../hooks/useAlerts';
import { Mail, MailOpen, AlertCircle, TrendingDown, Inbox as InboxIcon, Search, CheckCheck, Trash2, ArrowRight } from 'lucide-react';
import { formatDate, cn }  from '../lib/utils';
import type { AlertRow }   from '../lib/database.types';

function formatAlertHtml(htmlBody: string, alert: AlertRow): string {
  if (!htmlBody) return '';
  if (htmlBody.includes('linear-gradient') || htmlBody.includes('PriceHawk</span>')) {
    return htmlBody;
  }

  const linkMatch = htmlBody.match(/href="([^"]+)"/);
  const dealUrl = linkMatch ? linkMatch[1] : '#';
  
  const textOnly = htmlBody.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const prices = textOnly.match(/₱[\d,]+/g) || [];
  const oldPrice = prices[0] || '₱0';
  const newPrice = prices[1] || prices[0] || '₱0';

  const titleMatch = alert.subject.replace(/^[🎯\s]+Target hit\s*—\s*/i, '').replace(/\s*just dropped.*$/i, '').trim();

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
      <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 24px 28px; text-align: center; border-bottom: 3px solid #f97316;">
        <div style="display: inline-flex; align-items: center; justify-content: center; gap: 8px;">
          <span style="font-size: 26px;">🦅</span>
          <span style="color: #ffffff; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">PriceHawk</span>
        </div>
        <div style="color: #f97316; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; margin-top: 6px;">
          Target Price Reached!
        </div>
      </div>

      <div style="padding: 28px;">
        <div style="display: inline-block; background: #fff7ed; color: #ea580c; border: 1px solid #ffedd5; font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 4px 10px; border-radius: 9999px; margin-bottom: 12px;">
          ${alert.type === 'DEAL_ALERT' ? 'PRICE DROP DETECTED' : 'SYSTEM ALERT'}
        </div>

        <h2 style="color: #0f172a; font-size: 20px; font-weight: 700; line-height: 1.4; margin: 0 0 20px 0;">
          ${titleMatch || alert.subject}
        </h2>

        ${prices.length >= 1 ? `
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 20px; margin-bottom: 24px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="width: 50%; vertical-align: middle;">
                  <div style="color: #64748b; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Previous Price</div>
                  <div style="color: #94a3b8; font-size: 18px; font-weight: 600; text-decoration: line-through;">
                    ${oldPrice}
                  </div>
                </td>
                <td style="width: 50%; vertical-align: middle; text-align: right;">
                  <div style="color: #16a34a; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">New Target Hit</div>
                  <div style="color: #16a34a; font-size: 28px; font-weight: 800; line-height: 1;">
                    ${newPrice}
                  </div>
                </td>
              </tr>
            </table>
          </div>
        ` : `
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-bottom: 20px; color: #334155; font-size: 14px; line-height: 1.6;">
            ${htmlBody}
          </div>
        `}

        <div style="text-align: center; margin-bottom: 20px;">
          <a href="${dealUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; width: 100%; box-sizing: border-box; background: #f97316; color: #ffffff; font-size: 15px; font-weight: 700; text-align: center; text-decoration: none; padding: 14px 24px; border-radius: 12px; box-shadow: 0 4px 14px rgba(249, 115, 22, 0.35);">
            View Deal &amp; Claim Offer &rarr;
          </a>
        </div>

        <p style="color: #64748b; font-size: 12px; line-height: 1.5; text-align: center; margin: 0;">
          Prices online change rapidly. We recommend securing this price immediately.
        </p>
      </div>

      <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 24px; text-align: center;">
        <p style="color: #94a3b8; font-size: 11px; margin: 0;">
          PriceHawk Automated Deal Protection • Real-time Monitoring
        </p>
      </div>
    </div>
  `;
}

export const Inbox = () => {
  const { user }                                               = useAuthContext();
  const { alerts, markRead, markAllAsRead, deleteAlert, unreadCount } = useAlerts(user?.id ?? null);
  const [selectedAlert, setSelectedAlert]                      = useState<AlertRow | null>(null);
  const [searchQuery, setSearchQuery]                          = useState('');
  const [statusFilter, setStatusFilter]                        = useState<'ALL' | 'UNREAD' | 'READ'>('ALL');
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const targetId = params.get('alertId');
    if (targetId && alerts.length > 0) {
      const found = alerts.find(a => a.id === targetId);
      if (found) {
        handleSelect(found);
      }
    } else if (!selectedAlert && alerts.length > 0 && typeof window !== 'undefined' && window.innerWidth >= 768) {
      handleSelect(alerts[0]);
    }
  }, [location.search, alerts]);

  const filteredAlerts = alerts.filter(a => {
    const matchesSearch = a.subject.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (statusFilter === 'UNREAD') return !a.read;
    if (statusFilter === 'READ') return a.read;
    return true;
  });

  const handleSelect = (alert: AlertRow) => {
    setSelectedAlert(alert);
    if (!alert.read) markRead(alert.id);
  };

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    await deleteAlert(id);
    if (selectedAlert?.id === id) {
      setSelectedAlert(null);
    }
  };

  return (
    <div className="h-full flex flex-col md:flex-row bg-white">
      {/* Email List Pane */}
      <div className={cn(
        'w-full md:w-80 lg:w-96 border-r border-slate-200 flex flex-col h-full shrink-0',
        selectedAlert ? 'hidden md:flex' : 'flex'
      )}>
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-display font-bold text-slate-900 flex items-center gap-2">
              <InboxIcon size={20} className="text-brand-accent" /> Alerts Inbox
            </h1>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead()}
                className="text-xs text-brand-accent hover:text-brand-accent-hover font-semibold flex items-center gap-1 transition-colors"
                title="Mark all alerts as read"
              >
                <CheckCheck size={14} /> Mark all read
              </button>
            )}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search alerts..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-100 border-transparent focus:bg-white focus:border-slate-300 focus:ring-2 focus:ring-brand-accent/20 outline-none text-sm transition-all"
            />
          </div>
          <div className="flex gap-1.5 mt-3 pt-3 border-t border-slate-100">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={cn("px-2.5 py-1 rounded-md text-xs font-medium transition-colors", statusFilter === 'ALL' ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}
            >
              All ({alerts.length})
            </button>
            <button
              onClick={() => setStatusFilter('UNREAD')}
              className={cn("px-2.5 py-1 rounded-md text-xs font-medium transition-colors", statusFilter === 'UNREAD' ? "bg-brand-accent text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setStatusFilter('READ')}
              className={cn("px-2.5 py-1 rounded-md text-xs font-medium transition-colors", statusFilter === 'READ' ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}
            >
              Read ({alerts.length - unreadCount})
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredAlerts.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <Mail className="mx-auto h-12 w-12 text-slate-300 mb-3" />
              <p className="text-sm font-medium">No alerts found</p>
              <p className="text-xs mt-1">Price drop alerts will appear here.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredAlerts.map(alert => (
                <div
                  key={alert.id}
                  onClick={() => handleSelect(alert)}
                  className={cn(
                    'p-4 cursor-pointer hover:bg-slate-50 transition-colors flex gap-3 group relative',
                    selectedAlert?.id === alert.id ? 'bg-brand-accent/5' : '',
                    !alert.read ? 'bg-white' : 'opacity-75'
                  )}
                >
                  <div className="mt-1 shrink-0">
                    {alert.type === 'DEAL_ALERT'
                      ? <TrendingDown size={18} className={!alert.read ? 'text-green-500' : 'text-slate-400'} />
                      : <AlertCircle  size={18} className={!alert.read ? 'text-red-500'   : 'text-slate-400'} />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className={cn('text-xs font-semibold truncate pr-2', !alert.read ? 'text-slate-900' : 'text-slate-600')}>
                        PriceHawk {alert.type === 'SYSTEM_OUT_OF_TOKENS' ? 'System' : 'Alerts'}
                      </span>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">
                        {formatDate(alert.sent_at).split(',')[0]}
                      </span>
                    </div>
                    <p className={cn('text-sm line-clamp-2', !alert.read ? 'text-slate-900 font-medium' : 'text-slate-500')}>
                      {alert.subject}
                    </p>
                  </div>
                  <div className="flex flex-col items-end justify-between shrink-0">
                    {!alert.read ? <div className="w-2 h-2 rounded-full bg-brand-accent mt-1.5" /> : <div className="w-2 h-2" />}
                    <button
                      onClick={(e) => handleDelete(alert.id, e)}
                      className="p-1 text-slate-400 hover:text-red-500 rounded transition-opacity"
                      title="Delete alert"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Email Reader Pane */}
      <div className={cn(
        'flex-1 flex flex-col bg-slate-50 h-full',
        !selectedAlert ? 'hidden md:flex items-center justify-center' : 'flex'
      )}>
        {!selectedAlert ? (
          <div className="text-center text-slate-400">
            <MailOpen className="mx-auto h-16 w-16 mb-4 opacity-50" />
            <p>Select an alert to read</p>
          </div>
        ) : (
          <>
            <div className="bg-white p-6 border-b border-slate-200">
              <div className="md:hidden mb-4">
                <button onClick={() => setSelectedAlert(null)} className="text-sm font-medium text-brand-accent hover:underline">
                  &larr; Back to inbox
                </button>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">{selectedAlert.subject}</h2>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-dark flex items-center justify-center text-white font-bold">P</div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">PriceHawk Alerts</p>
                    <p className="text-xs text-slate-500">alerts@pricehawk.demo</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-sm text-slate-500">{formatDate(selectedAlert.sent_at)}</div>
                  <button
                    onClick={() => handleDelete(selectedAlert.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete alert"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center bg-slate-100/70">
              <div className="w-full max-w-2xl py-4">
                <div
                  dangerouslySetInnerHTML={{ __html: formatAlertHtml(selectedAlert.html_body, selectedAlert) }}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
