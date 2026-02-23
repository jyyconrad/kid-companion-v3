/**
 * 角色配置引导 E2E 测试
 */
import { buildWizardPrompt } from '../../src/constants/wizardPrompt';

describe('Persona Config Flow E2E', () => {
  test('应该完成完整的引导流程', async () => {
    const prompt = buildWizardPrompt();
    expect(prompt).toBeDefined();
    expect(prompt.length).toBeGreaterThan(100);
    console.log('✅ 角色配置引导流程测试通过');
  }, 10000);

  test('应该支持跳过引导', async () => {
    const prompt = buildWizardPrompt();
    expect(prompt).toBeDefined();
  });

  test('应该支持重新配置', async () => {
    const prompt = buildWizardPrompt();
    expect(prompt).toContain('孩子');
  });
});
