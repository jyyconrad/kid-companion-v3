/**
 * Web Search Tool
 * 
 * 提供网络搜索能力，让 AI 可以获取实时信息
 */

import { tool } from 'ai';
import { z } from 'zod';

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

/**
 * Web Search 工具定义
 */
export const webSearchTool = tool({
  description: '搜索网络信息，获取实时知识和新闻',
  parameters: z.object({
    query: z.string().describe('搜索关键词'),
    numResults: z.number().optional().describe('返回结果数量 (默认 5)'),
  }),
  execute: async ({ query, numResults = 5 }) => {
    try {
      // 使用硅基流动的搜索 API（或其他搜索服务）
      const response = await fetch(
        `https://api.siliconflow.cn/v1/search?q=${encodeURIComponent(query)}&limit=${numResults}`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.SILICONFLOW_API_KEY}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('搜索失败');
      }

      const data = await response.json();
      
      // 格式化搜索结果
      const results: SearchResult[] = data.results?.map((item: any) => ({
        title: item.title,
        url: item.url,
        snippet: item.snippet || item.content,
      })) || [];

      return {
        success: true,
        query,
        results,
        count: results.length,
      };
    } catch (error: any) {
      console.error('Web Search 失败:', error);
      return {
        success: false,
        query,
        error: error.message,
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
  execute: async ({ question, category }) => {
    // 构建适合儿童的搜索词
    const searchQuery = `${category || '知识'} ${question} 儿童版`;
    
    // 调用普通搜索
    const result = await webSearchTool.execute({ query: searchQuery, numResults: 3 });
    
    // 过滤和简化内容
    if (result.success) {
      return {
        ...result,
        results: result.results.map(r => ({
          ...r,
          snippet: simplifyContentForKids(r.snippet),
        })),
      };
    }
    
    return result;
  },
});

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
