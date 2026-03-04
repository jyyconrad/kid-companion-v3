/**
 * Website Reader Tool
 * 
 * 读取网页内容，提取可读文本
 * 使用 OpenAI Function Calling 格式
 */

import { z } from 'zod';

export interface WebPageContent {
  title: string;
  content: string;
  url: string;
  excerpt?: string;
  wordCount: number;
}

/**
 * Website Reader 工具定义 (OpenAI Tool Format)
 * 使用 r.jina.ai 服务（免费，无需 API Key）
 */
export const websiteReaderToolDefinition = {
  type: 'function' as const,
  function: {
    name: 'websiteReader',
    description: '读取网页内容，提取可读文本（使用 r.jina.ai 免费服务）',
    parameters: z.object({
      url: z.string().describe('要读取的网页 URL'),
      maxLength: z.number().optional().describe('最大返回字符数 (默认 2000)'),
    }).strict(),
  },
};

/**
 * 执行网页读取
 */
export async function executeWebsiteReader({ url, maxLength = 2000 }: { url: string; maxLength?: number }) {
  try {
    // 验证 URL
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      throw new Error('无效的 URL 格式');
    }
    
    // 使用 r.jina.ai 服务读取网页内容
    const readerUrl = `https://r.jina.ai/${url}`;
    
    const response = await fetch(readerUrl, {
      headers: {
        'Accept': 'application/json',
        'X-With-Generated-Alt': 'true',
      },
    });

    if (!response.ok) {
      throw new Error(`网页读取失败：${response.status}`);
    }

    const data = await response.json();
    
    const title = data.data?.title || '无标题';
    const content = data.data?.content || '';
    const excerpt = data.data?.description || '';
    
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
      fullContent: content,
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
}

/**
 * 批量读取网页工具定义 (OpenAI Tool Format)
 */
export const batchReadWebsitesToolDefinition = {
  type: 'function' as const,
  function: {
    name: 'batchReadWebsites',
    description: '批量读取多个网页内容（最多 3 个）',
    parameters: z.object({
      urls: z.array(z.string()).describe('要读取的网页 URL 列表'),
      maxLengthPerSite: z.number().optional().describe('每个网站最大返回字符数 (默认 1000)'),
    }).strict(),
  },
};

/**
 * 执行批量网页读取
 */
export async function executeBatchReadWebsites({ urls, maxLengthPerSite = 1000 }: { 
  urls: string[]; 
  maxLengthPerSite?: number 
}) {
  try {
    const limitedUrls = urls.slice(0, 3);
    
    const results = await Promise.all(
      limitedUrls.map(url => executeWebsiteReader({ url, maxLength: maxLengthPerSite }))
    );
    
    const successfulResults = results.filter(r => r.success);
    const failedResults = results.filter(r => !r.success);
    
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
}

// 兼容旧接口
export const websiteReaderTool = {
  definition: websiteReaderToolDefinition,
  execute: executeWebsiteReader,
};

export const batchReadWebsitesTool = {
  definition: batchReadWebsitesToolDefinition,
  execute: executeBatchReadWebsites,
};
