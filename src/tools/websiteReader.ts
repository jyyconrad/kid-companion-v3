/**
 * Website Reader Tool
 * 
 * 读取网页内容，提取可读文本
 * 使用免费的网页内容提取服务
 */

import { tool } from 'ai';
import { z } from 'zod';

export interface WebPageContent {
  title: string;
  content: string;
  url: string;
  excerpt?: string;
  wordCount: number;
}

/**
 * Website Reader 工具定义
 * 使用 r.jina.ai 服务（免费，无需 API Key）
 * 
 * 原理：
 * - r.jina.ai 是一个免费的网页内容提取服务
 * - 访问 https://r.jina.ai/https://example.com
 * - 返回提取后的纯文本内容
 */
export const websiteReaderTool = tool({
  description: '读取网页内容，提取可读文本（使用 r.jina.ai 免费服务）',
  parameters: z.object({
    url: z.string().describe('要读取的网页 URL'),
    maxLength: z.number().optional().describe('最大返回字符数 (默认 2000)'),
  }),
  execute: async ({ url, maxLength = 2000 }: { url: string; maxLength?: number }) => {
    try {
      // 验证 URL
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        throw new Error('无效的 URL 格式');
      }
      
      // 使用 r.jina.ai 服务读取网页内容
      // 文档：https://jina.ai/reader
      const readerUrl = `https://r.jina.ai/${url}`;
      
      const response = await fetch(readerUrl, {
        headers: {
          'Accept': 'application/json',
          'X-With-Generated-Alt': 'true', // 包含图片 alt 文本
        },
      });

      if (!response.ok) {
        throw new Error(`网页读取失败：${response.status}`);
      }

      const data = await response.json();
      
      // 提取内容
      const title = data.data?.title || '无标题';
      const content = data.data?.content || '';
      const excerpt = data.data?.description || '';
      
      // 限制长度
      const limitedContent = content.length > maxLength 
        ? content.slice(0, maxLength) + '...' 
        : content;

      return {
        success: true,
        url,
        title,
        content: limitedContent,
        excerpt,
        wordCount: content.length,
        fullContent: content, // 完整内容（用于 AI 分析）
        source: 'r.jina.ai',
      };
    } catch (error: any) {
      console.error('Website Reader 失败:', error);
      return {
        success: false,
        url,
        error: error.message,
        source: 'r.jina.ai',
      };
    }
  },
}) as any;

/**
 * 批量读取网页（最多 3 个）
 */
export const batchReadWebsitesTool = tool({
  description: '批量读取多个网页内容（最多 3 个）',
  parameters: z.object({
    urls: z.array(z.string()).describe('要读取的网页 URL 列表'),
    maxLengthPerSite: z.number().optional().describe('每个网站最大返回字符数 (默认 1000)'),
  }),
  execute: async ({ urls, maxLengthPerSite = 1000 }: { urls: string[]; maxLengthPerSite?: number }) => {
    try {
      // 限制最多 3 个 URL
      const limitedUrls = urls.slice(0, 3);
      
      // 并发读取（使用 any 类型绕过）
      const results: any[] = await Promise.all(
        limitedUrls.map(url => (websiteReaderTool as any).execute({ url, maxLength: maxLengthPerSite }))
      );
      
      const successfulResults = results.filter(r => r && r.success);
      const failedResults = results.filter(r => r && !r.success);
      
      return {
        success: true,
        total: urls.length,
        successful: successfulResults.length,
        failed: failedResults.length,
        results: successfulResults,
        errors: failedResults.map(r => ({ url: r.url, error: r.error })),
      };
    } catch (error: any) {
      console.error('批量读取失败:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },
}) as any;

/**
 * 搜索并读取（组合工具）
 * 先搜索，然后读取前 N 个结果
 */
export const searchAndReadTool = tool({
  description: '搜索网络并读取前几个网页内容',
  parameters: z.object({
    query: z.string().describe('搜索关键词'),
    readCount: z.number().optional().describe('读取前 N 个结果 (默认 2)'),
  }),
  execute: async ({ query, readCount = 2 }: { query: string; readCount?: number }) => {
    try {
      // 这里需要导入 webSearchTool
      // 为避免循环依赖，让 AI 分别调用 search 和 read
      return {
        success: false,
        error: '请分别调用 webSearchTool 和 websiteReaderTool',
        suggestion: '先用 webSearchTool 搜索，再用 websiteReaderTool 读取感兴趣的 URL',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  },
}) as any;
