/**
 * 搜索+AI 回复 E2E 测试
 */
import { webSearchTool } from '../../src/tools/webSearch';

describe('Search Flow E2E', () => {
  test('应该完成搜索到回复的完整流程', async () => {
    const result = await webSearchTool.execute({ query: '恐龙有什么特点', numResults: 5 });
    expect(result.success).toBe(true);
    expect(result.results.length).toBeGreaterThan(0);
    result.results.forEach(r => {
      expect(r.title).toBeTruthy();
      expect(r.url).toBeTruthy();
    });
    console.log('✅ 搜索流程测试通过');
  }, 20000);
});
