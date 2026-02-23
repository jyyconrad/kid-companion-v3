/**
 * websiteReaderTool 单元测试
 */

import { websiteReaderTool } from '../../src/tools/websiteReader';

describe('websiteReaderTool', () => {
  test('应该成功读取示例网站', async () => {
    const result = await websiteReaderTool.execute({ 
      url: 'https://example.com',
      maxLength: 1000 
    });
    
    expect(result.success).toBe(true);
    expect(result.content.length).toBeGreaterThan(0);
  }, 10000);

  test('应该处理无效 URL', async () => {
    const result = await websiteReaderTool.execute({ url: 'invalid-url' });
    expect(result.success).toBe(false);
  }, 10000);

  test('应该限制内容长度', async () => {
    const result = await websiteReaderTool.execute({ 
      url: 'https://example.com',
      maxLength: 100 
    });
    expect(result.content.length).toBeLessThanOrEqual(100);
  }, 10000);
});