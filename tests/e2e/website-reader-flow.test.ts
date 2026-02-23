/**
 * 网站深度阅读 E2E 测试
 */
import { webSearchTool } from '../../src/tools/webSearch';
import { websiteReaderTool } from '../../src/tools/websiteReader';

describe('Website Reader Flow E2E', () => {
  test('应该完成搜索 + 深度阅读的完整流程', async () => {
    const searchResult = await webSearchTool.execute({ query: '恐龙灭绝原因', numResults: 3 });
    expect(searchResult.success).toBe(true);
    const firstUrl = searchResult.results[0].url;
    expect(firstUrl).toBeTruthy();
    const readResult = await websiteReaderTool.execute({ url: firstUrl, maxLength: 2000 });
    expect(readResult.success).toBe(true);
    expect(readResult.content.length).toBeGreaterThan(100);
    console.log('✅ 深度阅读流程测试通过');
  }, 20000);
});
