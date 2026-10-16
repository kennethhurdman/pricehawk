import cron from 'node-cron';
import { createClient } from '@supabase/supabase-js';
import { AIService } from './ai.service.js';

export class CronService {
  private supabase;
  private aiService: AIService | null = null;
  private resendApiKey: string | undefined;

  constructor() {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.warn('[Cron] Warning: Supabase URL or Key is missing. Cron jobs will not run.');
      this.supabase = null;
    } else {
      this.supabase = createClient(supabaseUrl, supabaseKey);
    }

    if (process.env.GEMINI_API_KEY) {
      this.aiService = new AIService(process.env.GEMINI_API_KEY);
    }

    this.resendApiKey = process.env.RESEND_API_KEY;
  }

  public start() {
    if (!this.supabase || !this.aiService) {
      console.warn('[Cron] Cannot start cron service: Missing Supabase or AI Service.');
      return;
    }

    console.log('[Cron] Initializing Real-Time Price Tracking Cron Job (runs every 2 hours)...');
    
    // Run every 2 hours in production. For testing, we could make it every minute, 
    // but scraping every active target every minute will burn tokens.
    // E.g., '0 */2 * * *' = every 2 hours.
    cron.schedule('0 */2 * * *', async () => {
      console.log('[Cron] Running scheduled price check...');
      await this.runPriceCheck();
    });
  }

  public async runPriceCheck() {
    if (!this.supabase || !this.aiService) return;

    try {
      // 1. Fetch all active tracked items
      const { data: items, error } = await this.supabase
        .from('tracked_items')
        .select(`
          *,
          profiles (
            email,
            tier,
            email_tokens
          )
        `);

      if (error) throw error;
      if (!items || items.length === 0) {
        console.log('[Cron] No tracked items found to check.');
        return;
      }

      console.log(`[Cron] Found ${items.length} items to check. Processing...`);

      for (const item of items) {
        try {
          const profile = item.profiles;
          if (!profile) continue;

          // Check if user has quota (Premium, or Free with remaining tokens)
          if (profile.tier !== 'PREMIUM' && profile.email_tokens <= 0) {
            continue; // Skip this user, they ran out of free alerts
          }

          console.log(`[Cron] Scraping ${item.target_url}...`);
          
          // Scrape current price
          const response = await fetch(`https://r.jina.ai/${item.target_url}`, {
            headers: { 'Accept': 'text/plain', 'User-Agent': 'PriceHawk/2.0 Cron' },
            signal: AbortSignal.timeout(15000)
          });
          
          if (!response.ok) continue;
          const text = await response.text();
          
          const scrapedData = await this.aiService.scrapeItem(item.target_url, text);
          const newPrice = scrapedData.price;
          const oldPrice = item.current_price;

          console.log(`[Cron] Target: ${item.title} | Target Price: ${item.target_price} | Scraped Price: ${newPrice}`);

          // Update current price in DB
          await this.supabase
            .from('tracked_items')
            .update({ current_price: newPrice })
            .eq('id', item.id);

          // Did it hit the target price?
          if (newPrice <= item.target_price && newPrice < oldPrice) {
            console.log(`[Cron] 🎯 TARGET HIT for ${item.title}! Attempting to alert ${profile.email}`);

            // Deduct token if FREE
            if (profile.tier === 'FREE') {
              await this.supabase
                .from('profiles')
                .update({ email_tokens: profile.email_tokens - 1 })
                .eq('id', item.user_id);
            }

            // Generate beautiful email content
            const emailData = await this.aiService.generateEmail(
              { title: item.title, category: item.category, targetUrl: item.target_url, currency: item.currency },
              oldPrice,
              newPrice
            );

            const subject = emailData.subject || `🎯 Target hit — ${item.title} dropped!`;
            const htmlBody = emailData.htmlBody || `<p>${item.title} dropped to ${newPrice}</p>`;

            // Send the email
            if (this.resendApiKey) {
              const resendRes = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${this.resendApiKey}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  from: 'PriceHawk Alerts <onboarding@resend.dev>', 
                  to: [profile.email],
                  subject: subject,
                  html: htmlBody
                })
              });

              if (resendRes.ok) {
                 console.log(`[Cron] ✅ Real email sent successfully to ${profile.email}`);
              } else {
                 console.error(`[Cron] ❌ Resend error: ${await resendRes.text()}`);
              }
            } else {
              console.log(`[Cron] ⚠️ Resend API Key missing. Simulated sending to ${profile.email}`);
            }

            // Log alert in DB for UI notification
            await this.supabase.from('alerts').insert({
              user_id: item.user_id,
              item_id: item.id,
              type: 'DEAL_ALERT',
              subject,
              html_body: htmlBody,
              read: false,
              sent_at: new Date().toISOString()
            });
          }

        } catch (err) {
          console.error(`[Cron] Error processing item ${item.id}:`, err);
        }
      }

      console.log('[Cron] Scheduled price check completed.');
    } catch (err) {
      console.error('[Cron] Error running price check:', err);
    }
  }
}
