/**
 * aiService 单元测试
 */
import { buildContext } from '../../src/services/aiService';

describe('AI Service', () => {
  test('应该构建正确的上下文', () => {
    const config = { childName: '小明', childAge: 5, aiName: '小智' };
    const context = buildContext(config);
    expect(context).toContain('小明');
    expect(context).toContain('5 岁');
  });

  test('应该包含动态信息', () => {
    const context = buildContext({}, { date: '2026-02-23', time: '晚上', weekday: '星期一' });
    expect(context).toContain('2026-02-23');
  });

  test('应该包含历史消息', () => {
    const history = [{ role: 'user', content: '你好' }];
    const context = buildContext({}, {}, history);
    expect(context).toContain('你好');
  });

  test('应该限制历史消息数量', () => {
    const history = Array(100).fill({ role: 'user', content: '消息' });
    const context = buildContext({}, {}, history);
    expect(context.split('\n').length).toBeLessThan(50);
  });
});
