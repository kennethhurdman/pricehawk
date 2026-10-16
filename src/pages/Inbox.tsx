/**
 * Inbox.tsx
 * ---------
 * Alerts inbox — reads from Supabase `alerts` table via useAlerts hook.
 * The old MockEmail type is replaced by AlertRow from database.types.
 */

import { useState } from 'react';
import { useAuthContext }  from '../App';
import { useAlerts }       from '../hooks/useAlerts';
import { Mail, MailOpen, AlertCircle, TrendingDown, Inbox as InboxIcon, Search } from 'lucide-react';
import { formatDate, cn }  from '../lib/utils';
import type { AlertRow }   from '../lib/database.types';

export const Inbox = () => {
  const { user }                        = useAuthContext();
  const { alerts, markRead }            = useAlerts(user?.id ?? null);
  const [selectedAlert, setSelectedAlert] = useState<AlertRow | null>(null);
  const [searchQuery, setSearchQuery]   = useState('');

  const filteredAlerts = alerts.filter(a =>
    a.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (alert: AlertRow) => {
    setSelectedAlert(alert);
    if (!alert.read) markRead(alert.id);
  };

  return (
    <div className="h-full flex flex-col md:flex-row bg-white">
      {/* Email List Pane */}
      <div className={cn(
        'w-full md:w-80 lg:w-96 border-r border-slate-200 flex flex-col h-full shrink-0',
        selectedAlert ? 'hidden md:flex' : 'flex'
      )}>
        <div className="p-4 border-b border-slate-200">
          <h1 className="text-xl font-display font-bold text-slate-900 mb-4 flex items-center gap-2">
            <InboxIcon size={20} className="text-brand-accent" /> Alerts Inbox
          </h1>
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
                    'p-4 cursor-pointer hover:bg-slate-50 transition-colors flex gap-3',
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
                  {!alert.read && <div className="w-2 h-2 rounded-full bg-brand-accent mt-1.5 shrink-0" />}
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
                <div className="text-sm text-slate-500">{formatDate(selectedAlert.sent_at)}</div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-10">
              <div
                className="bg-white rounded-xl shadow-sm p-8 max-w-3xl mx-auto border border-slate-100 prose prose-slate"
                dangerouslySetInnerHTML={{ __html: selectedAlert.html_body }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
