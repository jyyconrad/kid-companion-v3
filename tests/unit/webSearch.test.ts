/**
 * webSearchTool 单元测试
 */

import { webSearchTool } from '../../src/tools/webSearch';

describe('webSearchTool', () => {
  test('应该成功搜索恐龙', async () => {
    const result = await webSearchTool.execute({ query: '恐龙', numResults: 3 });
    
    expect(result.success).toBe(true);
    expect(result.results.length).toBeGreaterThan(0);
  }, 15000);
});