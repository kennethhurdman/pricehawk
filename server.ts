import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import * as dotenv from 'dotenv';
import { AIService } from './src/server/services/ai.service.js';
import { SearchService } from './src/server/services/search.service.js';
import { CronService } from './src/server/services/cron.service.js';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;
  app.use(express.json());

  console.log('─────────────────────────────────────────');
  console.log('[App] Starting PriceHawk Backend...');
  console.log(`[AI] Gemini API Key: ${process.env.GEMINI_API_KEY ? '✅ Set' : '❌ Missing'}`);
  console.log('─────────────────────────────────────────');

  const searchService = new SearchService();
  
  let aiService: AIService | null = null;
  if (process.env.GEMINI_API_KEY) {
    aiService = new AIService(process.env.GEMINI_API_KEY);
  }

  // Start the automated price tracker background worker
  const cronService = new CronService();
  cronService.start();

  app.post('/api/generate-email', async (req, res) => {
    try {
      if (!aiService) return res.status(200).json({ fallback: true, message: 'AI provider is not configured.' });
      const { item, oldPrice, newPrice } = req.body;
      const data = await aiService.generateEmail(item, oldPrice, newPrice);
      res.json({ ...data, aiProvider: 'gemini' });
    } catch (error) {
      console.error('Error in /api/generate-email:', error);
      res.status(500).json({ error: 'Internal server error during generation' });
    }
  });

  app.post('/api/chat-search', async (req, res) => {
    try {
      const { messages } = req.body;
      if (!messages || messages.length === 0) {
        return res.status(400).json({ error: 'messages array is required' });
      }

      if (!aiService) {
        return res.json({ fallback: true });
      }

      const result = await aiService.handleChatSearch(messages, (q) => searchService.performWebSearch(q));
      res.json({ reply: result.reply, webItems: result.webItems, aiProvider: 'gemini' });
    } catch (error: any) {
      console.error('Error in /api/chat-search:', error);
      res.status(500).json({ aiError: true, error: error?.message || 'Server error' });
    }
  });

  app.post('/api/scrape-item', async (req, res) => {
    try {
      if (!aiService) return res.status(500).json({ error: 'AI provider not configured' });
      const { url } = req.body;
      if (!url) return res.status(400).json({ error: 'url is required' });

      console.log(`[Scrape] Fetching ${url} via Jina...`);
      const response = await fetch(`https://r.jina.ai/${url}`, {
        headers: { 'Accept': 'text/plain', 'User-Agent': 'PriceHawk/2.0' },
        signal: AbortSignal.timeout(15000)
      });
      const text = await response.text();
      
      const item = await aiService.scrapeItem(url, text);
      res.json({ item });
    } catch (error: any) {
      console.error('Error in /api/scrape-item:', error);
      res.status(500).json({ error: error?.message || 'Scrape failed' });
    }
  });

  app.post('/api/discover-deals', async (req, res) => {
    try {
      if (!aiService) return res.status(500).json({ error: 'AI provider not configured' });
      const { categories } = req.body;
      if (!categories || !Array.isArray(categories)) return res.status(400).json({ error: 'categories array required' });

      console.log(`[Discover] Fetching deals for ${categories.join(', ')}...`);
      const deals = await aiService.discoverDeals(categories, (q) => searchService.performWebSearch(q));
      res.json({ deals });
    } catch (error: any) {
      console.error('Error in /api/discover-deals:', error);
      res.status(500).json({ error: error?.message || 'Discovery failed' });
    }
  });

  app.post('/api/send-alert', async (req, res) => {
    try {
      const { to, subject, htmlBody } = req.body;
      const RESEND_API_KEY = process.env.RESEND_API_KEY;

      if (!RESEND_API_KEY) {
        console.log(`[Email Mock] Simulated sending email to ${to}: ${subject}`);
        return res.json({ success: true, mocked: true });
      }

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          // Note: In production with Resend, you must verify this domain
          from: 'PriceHawk Alerts <onboarding@resend.dev>', 
          to: [to],
          subject: subject,
          html: htmlBody
        })
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`Resend API error: ${err}`);
      }

      res.json({ success: true });
    } catch (error: any) {
      console.error('Error in /api/send-alert:', error);
      res.status(500).json({ error: 'Failed to send email' });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }

  app.listen(PORT, '0.0.0.0', () => console.log(`Server running on http://localhost:${PORT}`));
}

startServer();
