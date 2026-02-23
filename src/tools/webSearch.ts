/**
 * Web Search Tool
 * 
 * 提供网络搜索能力，让 AI 可以获取实时信息
 * 使用搜狗搜索（国内免费，无需 API Key）
 */

import { tool } from 'ai';
import { z } from 'zod';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { KnowledgeItem } from '../types/knowledge';

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

/**
 * Web Search 工具定义
 * 使用搜狗搜索（国内免费，无需 API Key）
 */
export const webSearchTool = tool({
  description: '搜索网络信息，获取实时知识和新闻（使用搜狗搜索）',
  parameters: z.object({
    query: z.string().describe('搜索关键词'),
    numResults: z.number().optional().describe('返回数量 (默认 5)'),
  }),
  execute: async ({ query, numResults = 5 }: { query: string; numResults?: number }) => {
    try {
      // 构建搜狗搜索 URL
      const url = `https://www.sogou.com/web?query=${encodeURIComponent(query)}`;
      
      // 随机延迟（1-3 秒）避免触发反爬
      const delay = Math.random() * 2000 + 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // 调用搜狗搜索
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        },
      });

      if (!response.ok) {
        throw new Error(`搜狗搜索返回 ${response.status}`);
      }

      const html = await response.text();
      
      // 检查是否返回验证码页面
      if (html.includes('captcha') || html.includes('验证码')) {
        throw new Error('触发验证码，请稍后重试');
      }
      
      // 解析 HTML 提取搜索结果
      const results = parseSogouHTML(html, numResults);
      
      if (results.length === 0) {
        throw new Error('未找到相关结果');
      }

      return {
        success: true,
        query,
        results,
        count: results.length,
        source: 'Sogou',
      };
    } catch (error: any) {
      console.error('搜狗搜索失败，降级到本地知识库:', error);
      
      // 降级到本地知识库
      return await fallbackToKnowledge(query);
    }
  },
}) as any;

/**
 * 解析搜狗搜索 HTML
 */
function parseSogouHTML(html: string, maxResults: number): SearchResult[] {
  const results: SearchResult[] = [];
  
  try {
    // 提取标题
    const titleRegex = /<h3[^>]*class="[^"]*"(?:[^>]*>)?([\s\S]*?)<\/h3>/gi;
    const titles = [...html.matchAll(titleRegex)]
      .map(m => stripHTML(m[1]))
      .filter(t => t.length > 0 && t.length < 200)
      .slice(0, maxResults);
    
    // 提取摘要
    const snippetRegex = /<div class="fz-mid space-txt[^>]*>([\s\S]*?)<\/div>/gi;
    const snippets = [...html.matchAll(snippetRegex)]
      .map(m => stripHTML(m[1]))
      .filter(s => s.length > 0 && s.length < 300)
      .slice(0, maxResults);
    
    // 提取 URL（搜狗使用/link?url=xxx 重定向）
    const urlRegex = /<a[^>]*href="\/link\?url=([^"]+)"/gi;
    const urls = [...html.matchAll(urlRegex)]
      .map(m => {
        try {
          return decodeURIComponent(m[1]);
        } catch {
          return '';
        }
      })
      .filter(u => u.startsWith('http'))
      .slice(0, maxResults);
    
    // 组合结果
    for (let i = 0; i < Math.max(titles.length, snippets.length); i++) {
      results.push({
        title: titles[i] || '无标题',
        url: urls[i] || '',
        snippet: snippets[i] || '',
      });
    }
    
    return results;
  } catch (error) {
    console.error('解析搜狗 HTML 失败:', error);
    return [];
  }
}

/**
 * 去除 HTML 标签
 */
function stripHTML(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * 降级到本地知识库
 */
async function fallbackToKnowledge(query: string) {
  try {
    const knowledgeJson = await AsyncStorage.getItem('@knowledge_base');
    const knowledge: KnowledgeItem[] = knowledgeJson ? JSON.parse(knowledgeJson) : [];
    
    const results = knowledge.filter(item => 
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.content.toLowerCase().includes(query.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    ).slice(0, 5);
    
    return {
      success: true,
      query,
      results: results.map(k => ({
        title: k.title,
        url: '',
        snippet: k.content.slice(0, 200),
      })),
      count: results.length,
      source: 'Local Knowledge (Fallback)',
    };
  } catch (error: any) {
    return {
      success: false,
      query,
      error: error.message,
      source: 'Fallback Failed',
    };
  }
}

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
    
    // 调用搜狗搜索
    const result: any = await (webSearchTool as any).execute({ query: searchQuery, numResults: 3 });
    
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
