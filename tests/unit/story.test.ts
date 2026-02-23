/**
 * storySkill 单元测试
 */
import { storySkill } from '../../src/skills/storySkill';

describe('Story Skill', () => {
  test('应该进入故事模式', async () => {
    const result = await storySkill.execute({ action: 'enter' });
    expect(result.success).toBe(true);
    expect(result.mode).toBe('story');
  });

  test('应该请求故事', async () => {
    const result = await storySkill.execute({ action: 'request', query: '讲个童话故事' });
    expect(result.success).toBe(true);
    expect(result.story).toBeDefined();
  });

  test('应该退出故事模式', async () => {
    const result = await storySkill.execute({ action: 'exit' });
    expect(result.success).toBe(true);
    expect(result.mode).toBe('chat');
  });

  test('应该支持故事分类', async () => {
    const result = await storySkill.execute({ action: 'request', category: '童话' });
    expect(result.success).toBe(true);
  });

  test('应该处理故事播放', async () => {
    const result = await storySkill.execute({ action: 'play', storyId: 'test-123' });
    expect(result.success).toBe(true);
  });
});
