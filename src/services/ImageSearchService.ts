import { ImageResult } from '../components/MarkdownRenderer';

interface SearchOptions {
  count?: number;
  safeSearch?: boolean;
}

/**
 * 图片搜索服务
 * 使用 DuckDuckGo 图片搜索（免费，无需 API Key）
 */
class ImageSearchService {
  private readonly userAgent = 'KidCompanion/3.8 (React Native)';
  private readonly timeout = 10000;

  /**
   * 搜索图片
   */
  async search(query: string, options: SearchOptions = {}): Promise<ImageResult[]> {
    const { count = 3, safeSearch = true } = options;
    
    // 安全过滤查询词
    const safeQuery = this.sanitizeQuery(query);
    
    try {
      // 使用 DuckDuckGo 图片搜索 API
      const results = await this.searchDuckDuckGo(safeQuery, count);
      return results;
    } catch (error) {
      console.error('Image search failed:', error);
      return [];
    }
  }

  /**
   * DuckDuckGo 图片搜索
   */
  private async searchDuckDuckGo(query: string, count: number): Promise<ImageResult[]> {
    const url = `https://duckduckgo.com/i.js?q=${encodeURIComponent(query)}&o=json`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`DuckDuckGo API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.results || !Array.isArray(data.results)) {
        return [];
      }

      return data.results.slice(0, count).map((item: any) => ({
        url: item.image || item.url,
        thumbnail: item.thumbnail || item.image,
        title: item.title || query,
        source: item.source || 'DuckDuckGo',
        width: item.width,
        height: item.height,
      }));
    } catch (error) {
      console.error('DuckDuckGo search error:', error);
      return this.fallbackSearch(query, count);
    }
  }

  /**
   * 备用搜索方案（使用 Unsplash）
   */
  private async fallbackSearch(query: string, count: number): Promise<ImageResult[]> {
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${count}&client_id=demo`;
    
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      
      if (!data.results || !Array.isArray(data.results)) {
        return [];
      }

      return data.results.map((item: any) => ({
        url: item.urls?.regular || item.urls?.raw,
        thumbnail: item.urls?.thumb || item.urls?.small,
        title: item.description || item.alt_description || query,
        source: 'Unsplash',
        width: item.width,
        height: item.height,
      }));
    } catch (error) {
      console.error('Unsplash search error:', error);
      return [];
    }
  }

  /**
   * 儿童安全过滤
   */
  private sanitizeQuery(query: string): string {
    // 敏感词列表（可扩展）
    const blockedWords = [
      '暴力', '血腥', '恐怖', '成人', 'sex', 'violence', 'blood',
    ];
    
    let sanitized = query.toLowerCase();
    
    for (const word of blockedWords) {
      if (sanitized.includes(word.toLowerCase())) {
        return 'cartoon kids'; // 替换为安全的默认搜索
      }
    }
    
    return query;
  }
}

export const imageSearchService = new ImageSearchService();
export default imageSearchService;