import { useAppConfig } from '../store/useAppConfig';

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  source: string;
}

export class SearchService {
  private config = useAppConfig.getState();

  async search(
    query: string,
    limit: number = 5
  ): Promise<SearchResult[]> {
    const categories = this.config.features.chat.searchCategories;

    if (categories.length === 0) {
      // 默认使用Brave Search
      return this.searchBrave(query, limit);
    }

    const results: SearchResult[] = [];
    const resultsPerSource = Math.ceil(limit / categories.length);

    for (const category of categories) {
      try {
        let sourceResults: SearchResult[] = [];

        switch (category) {
          case 'duckduckgo':
            sourceResults = await this.searchDuckDuckGo(query, resultsPerSource);
            break;
          case 'brave':
            sourceResults = await this.searchBrave(query, resultsPerSource);
            break;
          case 'tavily':
            sourceResults = await this.searchTavily(query, resultsPerSource);
            break;
          case 'perplexity':
            sourceResults = await this.searchPerplexity(query, resultsPerSource);
            break;
          default:
            break;
        }

        results.push(...sourceResults);
      } catch (error) {
        console.error(`Search ${category} failed:`, error);
      }
    }

    return results.slice(0, limit);
  }

  private async searchBrave(
    query: string,
    limit: number
  ): Promise<SearchResult[]> {
    // 使用Brave Search API
    // 注意：实际使用时需要API Key
    try {
      const response = await fetch(
        `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(
          query
        )}&count=${limit}`,
        {
          headers: {
            'Accept': 'application/json',
            'X-Subscription-Token': 'YOUR_BRAVE_API_KEY', // 需要配置
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Brave Search API Error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.web.results.map((r: any) => ({
        title: r.title,
        url: r.url,
        snippet: r.description,
        source: 'Brave',
      }));
    } catch (error) {
      console.error('Brave Search Error:', error);
      return [];
    }
  }

  private async searchDuckDuckGo(
    query: string,
    limit: number
  ): Promise<SearchResult[]> {
    // DuckDuckGo没有官方API，这里使用HTML解析
    // 注意：生产环境建议使用专门的搜索API
    try {
      const response = await fetch(
        `https://duckduckgo.com/html/?q=${encodeURIComponent(query)}`
      );

      if (!response.ok) {
        throw new Error(`DuckDuckGo Error: ${response.statusText}`);
      }

      const html = await response.text();
      // 简单的HTML解析（实际项目应使用专门的HTML解析库）
      const results: SearchResult[] = [];
      const regex = /class="result__a".*?href="(.*?)".*?>(.*?)<.*?class="result__snippet".*?>(.*?)<.*?class="result__snippet".*?>(.*?)</g;

      let match;
      while ((match = regex.exec(html)) && results.length < limit) {
        results.push({
          title: match[2],
          url: match[1],
          snippet: match[4] || match[3],
          source: 'DuckDuckGo',
        });
      }

      return results;
    } catch (error) {
      console.error('DuckDuckGo Search Error:', error);
      return [];
    }
  }

  private async searchTavily(
    query: string,
    limit: number
  ): Promise<SearchResult[]> {
    // Tavily Search API
    // 注意：需要API Key
    try {
      const response = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: 'YOUR_TAVILY_API_KEY', // 需要配置
          query,
          max_results: limit,
          search_depth: 'basic',
        }),
      });

      if (!response.ok) {
        throw new Error(`Tavily API Error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.results.map((r: any) => ({
        title: r.title,
        url: r.url,
        snippet: r.content,
        source: 'Tavily',
      }));
    } catch (error) {
      console.error('Tavily Search Error:', error);
      return [];
    }
  }

  private async searchPerplexity(
    query: string,
    limit: number
  ): Promise<SearchResult[]> {
    // Perplexity API（AI搜索）
    // 注意：需要API Key
    try {
      const { apiUrl, apiKey } = this.config;

      const response = await fetch(`${apiUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-small-128k-online',
          messages: [
            {
              role: 'system',
              content: '你是一个搜索助手，请提供简洁的搜索结果。',
            },
            {
              role: 'user',
              content: `搜索：${query}`,
            },
          ],
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        throw new Error(`Perplexity API Error: ${response.statusText}`);
      }

      const data = await response.json();
      return [
        {
          title: query,
          url: '',
          snippet: data.choices[0].message.content,
          source: 'Perplexity',
        },
      ];
    } catch (error) {
      console.error('Perplexity Search Error:', error);
      return [];
    }
  }
}

export const searchService = new SearchService();
