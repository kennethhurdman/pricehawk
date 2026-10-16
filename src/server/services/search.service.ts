export class SearchService {
  /**
   * Search DuckDuckGo Instant Answer API for structured results.
   */
  async searchDuckDuckGo(query: string): Promise<string | null> {
    try {
      const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
      const response = await fetch(url, {
        signal: AbortSignal.timeout(8000),
      });
      if (!response.ok) return null;
      const data: any = await response.json();

      const parts: string[] = [];
      if (data.AbstractText) parts.push(`Summary: ${data.AbstractText}`);
      if (data.Answer) parts.push(`Answer: ${data.Answer}`);
      if (data.RelatedTopics?.length) {
        parts.push('Related results:');
        data.RelatedTopics.slice(0, 10).forEach((t: any) => {
          if (t.Text) parts.push(`- ${t.Text} | URL: ${t.FirstURL || ''}`);
        });
      }
      return parts.length > 0 ? parts.join('\n') : null;
    } catch (err: any) {
      console.warn('[SearchService] DDG Fetch error:', err?.message);
      return null;
    }
  }

  /**
   * Use Jina Reader as a free web scraper for raw HTML search results
   */
  async searchJina(query: string): Promise<string | null> {
    try {
      const ddgUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
      const jinaUrl = `https://r.jina.ai/${ddgUrl}`;
      const response = await fetch(jinaUrl, {
        headers: {
          'Accept': 'text/plain, text/markdown',
          'X-Return-Format': 'text',
          'User-Agent': 'PriceHawk/2.0',
        },
        signal: AbortSignal.timeout(20000),
      });
      if (!response.ok) {
        return null;
      }
      const text = await response.text();
      return text.slice(0, 6000);
    } catch (err: any) {
      console.warn('[SearchService] Jina Error:', err?.message);
      return null;
    }
  }

  /**
   * Main entry point for the AI to call when searching the web.
   * Tries Jina first for raw data, then DuckDuckGo Instant as a fallback.
   */
  async performWebSearch(query: string): Promise<string | null> {
    // We add some context to the query to force Philippines results
    const enhancedQuery = `${query} Philippines price 2024 site:booking.com OR site:agoda.com OR site:lazada.com.ph OR site:shopee.ph OR site:cebupacificair.com OR site:airasia.com`;
    
    console.log(`[SearchService] Executing real search: "${query}"`);
    
    let result = await this.searchJina(enhancedQuery);
    if (result && result.length > 200) {
      console.log(`[SearchService] Jina returned ${result.length} chars`);
      return result;
    }

    // Fallback
    console.log(`[SearchService] Jina failed or empty, falling back to DDG Instant`);
    result = await this.searchDuckDuckGo(query);
    if (result) {
      console.log(`[SearchService] DDG returned ${result.length} chars`);
      return result;
    }

    return null;
  }
}
