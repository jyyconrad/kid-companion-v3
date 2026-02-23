/**
 * 故事讲解 E2E 测试
 */
import { storySkill } from '../../src/skills/storySkill';

describe('Story Flow E2E', () => {
  test('应该完成完整的故事流程', async () => {
    const userInput = '我想听故事';
    const enterResult = await storySkill.execute({ action: 'enter' });
    expect(enterResult.success).toBe(true);
    const storyResult = await storySkill.execute({ action: 'request', query: '讲个童话故事' });
    expect(storyResult.success).toBe(true);
    expect(storyResult.story.length).toBeGreaterThan(100);
    const exitResult = await storySkill.execute({ action: 'exit' });
    expect(exitResult.success).toBe(true);
    console.log('✅ 故事流程测试通过');
  }, 15000);

  test('应该支持故事分类', async () => {
    const result = await storySkill.execute({ action: 'request', category: '童话' });
    expect(result.success).toBe(true);
    expect(result.category).toBe('童话');
  });

  test('应该支持连续讲故事', async () => {
    await storySkill.execute({ action: 'request', query: '第一个故事' });
    const result = await storySkill.execute({ action: 'request', query: '再讲一个' });
    expect(result.success).toBe(true);
    expect(result.story).toBeDefined();
  });
});
