/**
 * Skills 切换 E2E 测试
 */
import { storySkill } from '../../src/skills/storySkill';
import { detectIntent } from '../../src/utils/intentDetection';

describe('Skills Switching E2E', () => {
  test('应该完成故事 Skill 的完整流程', async () => {
    const intent = detectIntent('我想听故事');
    expect(intent).toBe('story');
    const enterResult = await storySkill.execute({ action: 'enter' });
    expect(enterResult.success).toBe(true);
    expect(enterResult.mode).toBe('story');
    const storyResult = await storySkill.execute({ action: 'request', query: '讲个童话故事' });
    expect(storyResult.success).toBe(true);
    expect(storyResult.story).toBeDefined();
    const exitResult = await storySkill.execute({ action: 'exit' });
    expect(exitResult.success).toBe(true);
    expect(exitResult.mode).toBe('chat');
    console.log('✅ Skills 切换流程测试通过');
  }, 15000);
});
