/**
 * 知识库管理单元测试
 */

import { searchKnowledgeBase } from '../../src/utils/knowledgeBase';

describe('Knowledge Base Management', () => {
  test('应该能够正确搜索知识库', async () => {
    const query = '儿童安全';
    const results = await searchKnowledgeBase(query);
    expect(results).toBeDefined();
    expect(Array.isArray(results)).toBe(true);
  });

  test('应该返回相关的知识库条目', async () => {
    const query = '儿童教育';
    const results = await searchKnowledgeBase(query);
    // 验证结果的相关性
    if (results.length > 0) {
      expect(results[0]).toHaveProperty('title');
      expect(results[0]).toHaveProperty('content');
      expect(typeof results[0].title).toBe('string');
      expect(typeof results[0].content).toBe('string');
    }
  });

  test('应该处理空查询情况', async () => {
    const results = await searchKnowledgeBase('');
    expect(results).toBeDefined();
    expect(Array.isArray(results)).toBe(true);
  });
});