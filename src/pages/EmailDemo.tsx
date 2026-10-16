/**
 * EmailDemo.tsx
 * -------------
 * Standalone email preview page — no auth or store required.
 * Shows a welcome/demo email since it is a public route.
 */

import { formatDate } from '../lib/utils';
import { Mail, ArrowLeft, MoreVertical, Reply, Forward, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const DEMO_EMAIL = {
  subject: 'Welcome to PriceHawk! 🦅',
  sentAt:  new Date().toISOString(),
  htmlBody: `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #0f172a; margin-top: 0;">Welcome to PriceHawk</h2>
      <p style="color: #475569; font-size: 16px;">This is your live email demo viewer.</p>
      <p style="color: #475569; font-size: 16px;">When you click "Simulate price check" on your dashboard and a target is hit, the actual HTML email alert generated will appear in your Inbox.</p>
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center;">
        PriceHawk Inc. • This is a demo template
      </div>
    </div>
  `,
};

export const EmailDemo = () => {
  return (
    <div className="min-h-screen bg-[#f2f6fc] flex flex-col font-sans text-slate-800">
      {/* Mock Browser/Email Client Header */}
      <header className="bg-white border-b border-slate-200 p-3 flex items-center justify-between shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-2">
            <Mail className="text-blue-500" size={24} />
            <span className="font-medium text-lg text-slate-700 tracking-tight">MockMail</span>
          </div>
        </div>
        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">U</div>
      </header>

      {/* Toolbar */}
      <div className="bg-white border-b border-slate-200 px-4 py-2 flex items-center gap-4 text-slate-500">
        <button className="p-2 hover:bg-slate-100 rounded text-slate-700"><Reply   size={18} /></button>
        <button className="p-2 hover:bg-slate-100 rounded text-slate-700"><Forward size={18} /></button>
        <div className="h-4 w-px bg-slate-300 mx-2" />
        <button className="p-2 hover:bg-slate-100 rounded"><MoreVertical size={18} /></button>
      </div>

      {/* Email Content */}
      <main className="flex-1 overflow-auto p-4 md:p-8 flex justify-center">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 w-full max-w-4xl overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="p-6 md:p-8 border-b border-slate-100">
            <div className="flex justify-between items-start mb-6">
              <h1 className="text-2xl md:text-3xl font-normal text-slate-900">{DEMO_EMAIL.subject}</h1>
              <button className="text-slate-400 hover:text-yellow-400 transition-colors"><Star size={24} /></button>
            </div>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold text-xl shadow-sm">P</div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">PriceHawk Alerts</span>
                    <span className="text-xs text-slate-500">&lt;alerts@pricehawk.demo&gt;</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    to me <span className="text-slate-300 mx-1">•</span> {formatDate(DEMO_EMAIL.sentAt)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8 flex-1 bg-white">
            <div
              className="email-body-renderer max-w-2xl"
              dangerouslySetInnerHTML={{ __html: DEMO_EMAIL.htmlBody }}
            />
          </div>
        </div>
      </main>
    </div>
  );
};
