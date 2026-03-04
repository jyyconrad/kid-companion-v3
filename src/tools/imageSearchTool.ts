import { tool } from 'ai';
import { z } from 'zod';
import { imageSearchService } from '../services/ImageSearchService';

/**
 * 图片搜索工具
 * 用于 AI 自主调用搜索相关图片
 */
export const imageSearchTool = tool({
  description: '搜索与关键词相关的图片，用于故事、科普等内容展示。返回图片列表包含 URL、缩略图、标题等信息。',
  parameters: z.object({
    query: z.string().describe('搜索关键词，如"小兔子"、"恐龙"、"太阳系"'),
    count: z.number().optional().describe('返回图片数量，默认 3 张'),
    context: z.string().optional().describe('搜索上下文：story=故事配图，science=科普配图，general=通用'),
  }),
  execute: async ({ query, count = 3, context = 'general' }: { 
    query: string; 
    count?: number; 
    context?: string
  }) => {
    try {
      // 根据上下文优化搜索词
      let searchQuery = query;
      if (context === 'story') {
        searchQuery = `${query} cartoon illustration kids`;
      } else if (context === 'science') {
        searchQuery = `${query} diagram educational`;
      }
      
      const images = await imageSearchService.search(searchQuery, { count });
      
      return {
        success: true,
        images,
        query: searchQuery,
        message: images.length > 0 
          ? `找到 ${images.length} 张相关图片` 
          : '未找到相关图片',
      };
    } catch (error) {
      console.error('Image search tool error:', error);
      return {
        success: false,
        images: [],
        query,
        message: '图片搜索失败，请稍后重试',
      };
    }
  },
}) as any;

export default imageSearchTool;
