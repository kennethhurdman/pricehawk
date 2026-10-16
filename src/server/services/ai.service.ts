import { GoogleGenAI, Content, GenerateContentResponse } from '@google/genai';

export interface WebItem {
  id: string;
  category: 'FLIGHT' | 'HOTEL' | 'ECOMMERCE';
  name: string;
  price: number;
  currency: string;
  location?: string;
  imageUrl?: string;
  sourceUrl?: string;
}

export interface ChatResponse {
  reply: string;
  webItems: WebItem[];
}

export class AIService {
  private ai: GoogleGenAI;
  private model = 'gemini-flash-lite-latest';

  constructor(apiKey: string) {
    const savedCreds = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    const savedProject = process.env.GCLOUD_PROJECT;
    delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
    delete process.env.GCLOUD_PROJECT;

    this.ai = new GoogleGenAI({ apiKey });

    if (savedCreds) process.env.GOOGLE_APPLICATION_CREDENTIALS = savedCreds;
    if (savedProject) process.env.GCLOUD_PROJECT = savedProject;
  }

  async generateEmail(item: any, oldPrice: number, newPrice: number) {
    const prompt = `Write an exciting, high-converting deal alert email for PriceHawk.

Product Name: ${item.title}
Category: ${item.category}
Old Price: ${item.currency} ${Math.round(oldPrice).toLocaleString()}
New Price: ${item.currency} ${Math.round(newPrice).toLocaleString()}
Link: ${item.targetUrl}

The email should be in HTML format with:
1. An engaging subject line.
2. An HTML body with inline CSS using PriceHawk branding (slate and orange/amber).

Return only this JSON, no markdown:
{"subject": "string", "htmlBody": "string"}`;

    const response = await this.ai.models.generateContent({
      model: this.model,
      contents: prompt,
      config: { responseMimeType: 'application/json', temperature: 0.4 },
    });

    const text = response.text || '{}';
    return JSON.parse(text);
  }

  async scrapeItem(url: string, pageText: string): Promise<WebItem> {
    const prompt = `You are an expert e-commerce data extractor. Extract the PRIMARY product being sold on this specific webpage.
URL: ${url}

Webpage text:
${pageText.slice(0, 12000)}

CRITICAL RULES:
1. Extract the MAIN product that the page is dedicated to. IGNORE "Related Products", "Recommended for you", "Customers also bought", or "Store Categories" grids. The main product's title and price are usually near the top of the text.
2. "price" MUST be a valid number (e.g., 5000). DO NOT return NaN, null, or a string.
3. Strip out commas or currency symbols before saving the price as a number.
4. If no exact price is found, estimate a reasonable price based on the product.
5. Make sure the name is the specific, full product name of the main item.

Respond with JSON:
{
  "id": "unique-id",
  "category": "ECOMMERCE",
  "name": "Full primary product name",
  "price": 0,
  "currency": "PHP",
  "imageUrl": "image url or unsplash placeholder",
  "sourceUrl": "${url}"
}`;

    const res = await this.generateContentWithRetry({
      model: this.model,
      contents: prompt,
      config: { responseMimeType: 'application/json', temperature: 0.1 }
    });
    
    const item = JSON.parse(res.text || '{}') as WebItem;
    // Fallback if price is still NaN
    if (!item.price || isNaN(item.price)) {
        item.price = 999;
    }
    return item;
  }

  async discoverDeals(categories: string[], searchToolFn: (q: string) => Promise<string | null>): Promise<WebItem[]> {
    const query = `Specific individual product item flight hotel deals sale ${categories.join(' ')} Philippines 2025`;
    const searchResult = await searchToolFn(query);
    
    const prompt = `Extract exactly 6 SPECIFIC INDIVIDUAL product/flight/hotel deals from this search result. They must match these categories: ${categories.join(', ')}.
Search Result:
${searchResult || ''}

CRITICAL RULES - READ CAREFULLY:
1. ONLY extract specific, individual items (e.g., "Apple iPhone 15 Pro 128GB", "Flight: Manila to Cebu (Cebu Pacific) May 14").
2. DO NOT extract broad category pages or store homepages (e.g., "Lazada Best Deals", "Shopee Electronics Sale", "Agoda Home"). IF you cannot find 6 specific items in the text, you MUST make up realistic mock specific items to reach exactly 6 items.
3. "price" MUST be a valid, raw number (e.g. 15000, NOT "15,000" or "NaN" or null). If missing, make up a realistic estimate.
4. "sourceUrl" MUST be a direct link to the specific product/flight/hotel. If missing or a generic store page, construct a realistic product URL or use a placeholder link.
5. If image URL is missing, use: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=100&q=80"
6. If source URL is a DuckDuckGo link (uddg=), decode and extract the real URL.

Schema: { "webItems": [ { id, category, name, price, currency, location, imageUrl, sourceUrl } ] }`;

    const res = await this.generateContentWithRetry({
      model: this.model,
      contents: prompt,
      config: { responseMimeType: 'application/json', temperature: 0.3 }
    });
    
    const parsed = JSON.parse(res.text || '{}');
    const items = parsed.webItems || [];
    
    // Ensure no NaNs slip through
    return items.map((i: any) => ({
        ...i,
        price: typeof i.price === 'number' && !isNaN(i.price) ? i.price : 1499
    }));
  }

  // Helper to retry on 503 errors
  private async generateContentWithRetry(params: any, retries = 3): Promise<GenerateContentResponse> {
    for (let i = 0; i < retries; i++) {
      try {
        return await this.ai.models.generateContent(params);
      } catch (err: any) {
        if (err.status === 503 && i < retries - 1) {
          const waitTime = (i + 1) * 8000; // Wait 8s, 16s to bypass free tier rate limits
          console.warn(`[AI] 503 API Rate Limit Hit. Retrying in ${waitTime/1000} seconds...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        } else {
          throw err;
        }
      }
    }
    throw new Error("Max retries reached");
  }

  async handleChatSearch(
    history: Array<{ role: 'user' | 'assistant'; content: string }>,
    searchToolFn: (query: string) => Promise<string | null>
  ): Promise<ChatResponse> {
    
    const tools = [{
      functionDeclarations: [{
        name: 'search_web',
        description: 'Search the web for real-time live pricing, flights, hotels, or products in the Philippines.',
        parameters: {
          type: 'OBJECT' as any,
          properties: {
            query: {
              type: 'STRING' as any,
              description: 'The search query to look up (e.g., "cheap flights from Manila to Cebu 2024")'
            }
          },
          required: ['query']
        }
      }]
    }];

    const systemInstruction = `You are HawkBot, a friendly AI shopping assistant for PriceHawk (a Philippines deal app).
You can search the live web for deals using the search_web tool when needed.

When you have the information, ALWAYS respond with valid JSON matching this schema exactly (no markdown):
{
  "reply": "<friendly, helpful response (1-3 sentences)>",
  "webItems": [
    {
      "id": "unique-id-123",
      "category": "ECOMMERCE", // or FLIGHT, HOTEL
      "name": "Specific Full Product Name",
      "price": 3500, // Number only (estimate if necessary)
      "currency": "PHP", // Default to PHP
      "location": "Manila, Philippines", // Optional
      "imageUrl": "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=100&q=80", // CRITICAL: Always provide an image URL. If none found, use this exact unsplash placeholder URL.
      "sourceUrl": "https://shopee.ph/..." // CRITICAL: Always provide a direct link to the SPECIFIC item, not a generic search page
    }
  ]
}

CRITICAL RULES:
1. ONLY return specific, individual items (e.g., "Sony WH-1000XM5 Headphones", NOT "Shopee Electronics Sale" or "Lazada Deals").
2. The "sourceUrl" MUST be a direct link to the actual product page. DO NOT return generic search pages (e.g. "?keyword=mouse") or store homepages.
3. NEVER return an empty webItems array. Even if the search results are messy, extract the top 3 specific deals and fill in the missing gaps (like image URLs) with placeholders.
4. Ensure price is a raw number (e.g. 5000, not "5,000" or "PHP 5000").
5. Make sure to actually populate webItems with at least 3 items.
6. If a sourceUrl looks like a DuckDuckGo link (e.g. "https://duckduckgo.com/l/?uddg=https%3A%2F%2F..."), you MUST extract and decode the real URL from the "uddg" parameter! Do not output DuckDuckGo redirect links.`;

    const contents: Content[] = history.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    let response = await this.generateContentWithRetry({
      model: this.model,
      contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.2,
        tools
      }
    });

    if (response.functionCalls && response.functionCalls.length > 0) {
      const call = response.functionCalls[0];
      const args = call.args as { query: string };
      console.log(`[AI Tool] Model decided to search_web("${args.query}")`);

      const searchResult = await searchToolFn(args.query);
      const toolResponseString = searchResult || "No results found. Rely on your training data.";

      const ragPrompt = `[System: The AI searched the web for "${args.query}" and found the following results. Use them to answer the user.]\n\nSearch Results:\n${toolResponseString}`;
      
      contents.push({
        role: 'user',
        parts: [{ text: ragPrompt }]
      });

      response = await this.generateContentWithRetry({
        model: this.model,
        contents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.2,
          responseMimeType: 'application/json' 
        }
      });
    }

    let jsonStr = (response.text || '{}')
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    return JSON.parse(jsonStr) as ChatResponse;
  }
}
