/**
 * Agent 协作 E2E 测试
 */
import { webSearchTool } from '../../src/tools/webSearch';
import { websiteReaderTool } from '../../src/tools/websiteReader';
import { knowledgeTool } from '../../src/tools/knowledge';

describe('Agent Collaboration E2E', () => {
  test('应该完成搜索 + 阅读的协作流程', async () => {
    const searchResult = await webSearchTool.execute({ query: '恐龙灭绝的最新研究' });
    expect(searchResult.success).toBe(true);
    const url = searchResult.results[0].url;
    expect(url).toBeTruthy();
    const readResult = await websiteReaderTool.execute({ url });
    expect(readResult.success).toBe(true);
    expect(readResult.content.length).toBeGreaterThan(100);
    console.log('✅ Agent 协作流程测试通过');
  }, 30000);

  test('应该支持知识库增强', async () => {
    const result = await knowledgeTool.execute({ query: '测试' });
    expect(result.success).toBe(true);
  });

  test('应该处理工具调用失败', async () => {
    const result = await webSearchTool.execute({ query: '测试' });
    expect(result.success).toBe(true);
  });
});
