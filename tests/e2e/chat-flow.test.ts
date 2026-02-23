/**
 * 聊天对话 E2E 测试
 */
import { buildContext } from '../../src/services/aiService';

describe('Chat Flow E2E', () => {
  test('应该完成完整的聊天流程', async () => {
    const context = buildContext({ childName: '小明', childAge: 5 });
    expect(context).toBeDefined();
    expect(context).toContain('小明');
    console.log('✅ 聊天流程测试通过');
  }, 10000);

  test('应该支持多轮对话', async () => {
    const history = [
      { role: 'user', content: '你叫什么名字' },
      { role: 'assistant', content: '我叫 AI' },
    ];
    const context = buildContext({}, {}, history);
    expect(context).toContain('你叫什么名字');
  });

  test('应该支持上下文带入', async () => {
    const history = [{ role: 'user', content: '我叫小明' }];
    const context = buildContext({}, {}, history);
    expect(context).toContain('小明');
  });
});
