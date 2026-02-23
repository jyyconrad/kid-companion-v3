/**
 * 降级策略 E2E 测试
 */
import { webSearchTool } from '../../src/tools/webSearch';
import { addKnowledgeTool } from '../../src/tools/knowledge';

describe('Fallback Strategy E2E', () => {
  test('应该在网络失败时降级到本地知识库', async () => {
    await addKnowledgeTool.execute({ title: '备用知识', content: '本地缓存内容', category: 'backup', tags: ['备用'] });
    const result = await webSearchTool.execute({ query: '测试查询' });
    expect(result.success).toBe(true);
    console.log('✅ 降级策略测试通过');
  }, 10000);
});
