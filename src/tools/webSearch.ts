/**
 * Web Search Tool
 * 
 * 提供网络搜索能力，让 AI 可以获取实时信息
 * 使用 DuckDuckGo Instant Answer API（免费，无需 API Key）
 */

import { tool } from 'ai';
import { z } from 'zod';

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

interface DuckDuckGoResponse {
  Heading?: string;
  Abstract?: string;
  AbstractURL?: string;
  RelatedTopics?: Array<{
    Text?: string;
    FirstURL?: string;
    Icon?: { URL?: string };
  }>;
}

/**
 * Web Search 工具定义
 * 使用 DuckDuckGo Instant Answer API
 */
export const webSearchTool = tool({
  description: '搜索网络信息，获取实时知识和新闻（使用 DuckDuckGo 免费 API）',
  parameters: z.object({
    query: z.string().describe('搜索关键词'),
  }),
  execute: async ({ query }: { query: string }) => {
    try {
      // 使用 DuckDuckGo Instant Answer API（免费，无需 API Key）
      const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_redirect=1&no_html=1&skip_disambig=1`;
      
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`DuckDuckGo API 返回 ${response.status}`);
      }

      const data: DuckDuckGoResponse = await response.json();
      
      const results: SearchResult[] = [];
      
      // 添加主答案
      if (data.Heading && (data.Abstract || data.AbstractURL)) {
        results.push({
          title: data.Heading,
          url: data.AbstractURL || '',
          snippet: data.Abstract || '',
        });
      }
      
      // 添加相关主题（最多 4 个）
      if (data.RelatedTopics) {
        const related = data.RelatedTopics.slice(0, 4).map(topic => ({
          title: topic.Text?.split(' - ')[0] || '相关信息',
          url: topic.FirstURL || '',
          snippet: topic.Text || '',
        }));
        results.push(...related);
      }

      return {
        success: true,
        query,
        results,
        count: results.length,
        source: 'DuckDuckGo',
      };
    } catch (error: any) {
      console.error('Web Search 失败:', error);
      return {
        success: false,
        query,
        error: error.message,
        source: 'DuckDuckGo',
      };
    }
  },
});

/**
 * 简化版搜索（适用于儿童）
 */
export const kidsSearchTool = tool({
  description: '为儿童搜索适合的知识内容',
  parameters: z.object({
    question: z.string().describe('孩子的问题'),
    category: z.enum(['animal', 'plant', 'space', 'science', 'history']).optional(),
  }),
  execute: async ({ question, category }: { question: string; category?: 'animal' | 'plant' | 'space' | 'science' | 'history' }) => {
    // 构建适合儿童的搜索词
    const searchQuery = `${category || '知识'} ${question} 儿童版`;
    
    // 调用普通搜索（使用 any 类型绕过）
    const result: any = await (webSearchTool as any).execute({ query: searchQuery });
    
    // 过滤和简化内容
    if (result && result.success) {
      return {
        ...result,
        results: (result.results || []).map((r: any) => ({
          ...r,
          snippet: simplifyContentForKids(r.snippet),
        })),
      };
    }
    
    return result;
  },
}) as any;

/**
 * 简化内容适合儿童阅读
 */
const simplifyContentForKids = (text: string): string => {
  // 移除复杂链接和格式
  let simplified = text
    .replace(/https?:\/\/\S+/g, '')  // 移除 URL
    .replace(/[#*_~]/g, '')  // 移除 Markdown 符号
    .split('\n')
    .slice(0, 3)  // 只保留前 3 行
    .join(' ');
  
  // 限制长度
  if (simplified.length > 200) {
    simplified = simplified.slice(0, 200) + '...';
  }
  
  return simplified;
};
