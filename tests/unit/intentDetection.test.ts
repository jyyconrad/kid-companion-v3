/**
 * intentDetection 单元测试
 */
import { detectIntent } from '../../src/utils/intentDetection';

describe('Intent Detection', () => {
  test('应该识别聊天意图', () => {
    expect(detectIntent('你好')).toBe('chat');
  });
  test('应该识别故事意图', () => {
    expect(detectIntent('听故事')).toBe('story');
  });
  test('应该识别科普意图', () => {
    expect(detectIntent('为什么')).toBe('science');
  });
  test('应该识别搜索意图', () => {
    expect(detectIntent('搜索一下')).toBe('search');
  });
  test('应该识别配置意图', () => {
    expect(detectIntent('设置 API')).toBe('config');
  });
  test('应该处理模糊意图', () => {
    expect(detectIntent('随便聊聊')).toBe('chat');
  });
});
