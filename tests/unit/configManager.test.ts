/**
 * configManager 单元测试
 */
import { loadConfig, saveConfig } from '../../src/utils/configManager';
import AsyncStorage from '@react-native-async-storage/async-storage';

describe('Config Manager', () => {
  beforeEach(async () => { await AsyncStorage.clear(); });

  test('应该保存和加载配置', async () => {
    const config = { apiEndpoint: 'https://api.siliconflow.cn/v1', childName: '小明' };
    await saveConfig(config);
    const loaded = await loadConfig();
    expect(loaded.childName).toBe('小明');
  });

  test('应该处理空配置', async () => {
    const config = await loadConfig();
    expect(config).toBeDefined();
  });

  test('应该支持部分更新', async () => {
    await saveConfig({ childName: '小明' });
    await saveConfig({ childName: '小红' });
    const config = await loadConfig();
    expect(config.childName).toBe('小红');
  });

  test('应该获取指定字段', async () => {
    await saveConfig({ childName: '小明', childAge: 5 });
    const config = await loadConfig();
    expect(config.childAge).toBe(5);
  });

  test('应该验证配置有效性', async () => {
    await saveConfig({ apiEndpoint: '', apiKey: '' });
    const config = await loadConfig();
    expect(config.apiEndpoint).toBeFalsy();
  });
});
