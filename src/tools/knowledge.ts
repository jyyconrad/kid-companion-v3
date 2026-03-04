/**
 * Knowledge Tool
 * 
 * 提供知识库查询能力，让 AI 可以检索本地知识
 * 使用 OpenAI Function Calling 格式
 */

import { z } from 'zod';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface KnowledgeItem {
  id: string;
  title: string;
  category: string;
  content: string;
  tags: string[];
  createdAt: number;
}

/**
 * Knowledge 工具定义 (OpenAI Tool Format)
 */
export const knowledgeToolDefinition = {
  type: 'function' as const,
  function: {
    name: 'knowledge',
    description: '查询本地知识库，获取预先存储的知识内容',
    parameters: z.object({
      query: z.string().describe('查询关键词'),
      category: z.string().optional().describe('知识分类'),
      limit: z.number().optional().describe('返回数量 (默认 5)'),
    }).strict(),
  },
};

/**
 * 执行知识库查询
 */
export async function executeKnowledge({ query, category, limit = 5 }: { 
  query: string; 
  category?: string; 
  limit?: number 
}) {
  try {
    // 从 AsyncStorage 读取知识库
    const knowledgeJson = await AsyncStorage.getItem('@knowledge_base');
    const knowledge: KnowledgeItem[] = knowledgeJson
      ? JSON.parse(knowledgeJson)
      : [];

    // 搜索匹配的知识
    const results = knowledge.filter(item => {
      const matchQuery = 
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.content.toLowerCase().includes(query.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()));
      
      const matchCategory = category ? item.category === category : true;
      
      return matchQuery && matchCategory;
    }).slice(0, limit);

    return {
      success: true,
      query,
      results,
      count: results.length,
    };
  } catch (error: any) {
    console.error('Knowledge 查询失败:', error);
    return {
      success: false,
      query,
      error: error.message,
    };
  }
}

/**
 * 添加知识工具定义 (OpenAI Tool Format)
 */
export const addKnowledgeToolDefinition = {
  type: 'function' as const,
  function: {
    name: 'addKnowledge',
    description: '添加新的知识到知识库',
    parameters: z.object({
      title: z.string().describe('知识标题'),
      content: z.string().describe('知识内容'),
      category: z.string().describe('知识分类'),
      tags: z.array(z.string()).describe('标签列表'),
    }).strict(),
  },
};

/**
 * 执行添加知识
 */
export async function executeAddKnowledge({ title, content, category, tags }: { 
  title: string; 
  content: string; 
  category: string; 
  tags: string[] 
}) {
  try {
    const knowledgeJson = await AsyncStorage.getItem('@knowledge_base');
    const knowledge: KnowledgeItem[] = knowledgeJson
      ? JSON.parse(knowledgeJson)
      : [];

    const newItem: KnowledgeItem = {
      id: Date.now().toString(),
      title,
      content,
      category,
      tags,
      createdAt: Date.now(),
    };

    knowledge.unshift(newItem);
    await AsyncStorage.setItem('@knowledge_base', JSON.stringify(knowledge));

    return {
      success: true,
      id: newItem.id,
      message: '知识已添加',
    };
  } catch (error: any) {
    console.error('添加知识失败:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * 获取分类工具定义 (OpenAI Tool Format)
 */
export const getCategoriesToolDefinition = {
  type: 'function' as const,
  function: {
    name: 'getCategories',
    description: '获取知识库中的所有分类',
    parameters: z.object({}).strict(),
  },
};

/**
 * 执行获取分类
 */
export async function executeGetCategories() {
  try {
    const knowledgeJson = await AsyncStorage.getItem('@knowledge_base');
    const knowledge: KnowledgeItem[] = knowledgeJson
      ? JSON.parse(knowledgeJson)
      : [];

    const categories = [...new Set(knowledge.map(item => item.category))];

    return {
      success: true,
      categories,
      count: categories.length,
    };
  } catch (error: any) {
    console.error('获取分类失败:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// 兼容旧接口
export const knowledgeTool = {
  definition: knowledgeToolDefinition,
  execute: executeKnowledge,
};

export const addKnowledgeTool = {
  definition: addKnowledgeToolDefinition,
  execute: executeAddKnowledge,
};
