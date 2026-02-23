/**
 * scienceSkill 单元测试
 */
import { scienceSkill } from '../../src/skills/scienceSkill';

describe('Science Skill', () => {
  test('应该进入科普模式', async () => {
    const result = await scienceSkill.execute({ action: 'enter' });
    expect(result.success).toBe(true);
    expect(result.mode).toBe('science');
  });

  test('应该回答科普问题', async () => {
    const result = await scienceSkill.execute({ action: 'ask', question: '为什么天空是蓝色的' });
    expect(result.success).toBe(true);
    expect(result.answer).toBeDefined();
  });

  test('应该支持搜索增强', async () => {
    const result = await scienceSkill.execute({ action: 'ask', question: '最新的太空探索', useSearch: true });
    expect(result.success).toBe(true);
  });

  test('应该使用儿童友好的语言', async () => {
    const result = await scienceSkill.execute({ action: 'ask', question: '黑洞是什么', childFriendly: true });
    expect(result.success).toBe(true);
  });
});
