import AsyncStorage from '@react-native-async-storage/async-storage';
import { CollectedInfo, CharacterConfig, STORAGE_KEYS } from '../constants/wizardPrompt';

class WizardService {
  // 分析 AI 回复，提取信息
  extractInfoFromResponse(response: string, currentInfo: CollectedInfo): Partial<CollectedInfo> {
    const extracted: Partial<CollectedInfo> = {};
    
    // 简单的信息提取逻辑
    // 实际项目中可以使用更复杂的 NLP 分析
    const lowerResponse = response.toLowerCase();

    // 提取年龄（数字）
    const ageMatch = lowerResponse.match(/(\d+)岁?/);
    if (ageMatch && !currentInfo.age) {
      extracted.age = parseInt(ageMatch[1]);
    }

    // 提取兴趣爱好（以逗号或顿号分隔）
    const interestsMatch = lowerResponse.match(/兴趣|爱好|喜欢.*?(?:是|有|包括)?\s*(.*?)[。？！,.!?]/);
    if (interestsMatch) {
      const interestsText = interestsMatch[1];
      const interestsArray = interestsText
        .split(/[,，、]/)
        .map(s => s.trim())
        .filter(s => s.length > 0);
      
      if (interestsArray.length > 0) {
        extracted.interests = Array.from(new Set([...currentInfo.interests, ...interestsArray]));
      }
    }

    // 提取性格特点
    const personalityKeywords = ['活泼', '安静', '外向', '内向', '开朗', '沉稳', '调皮', '认真', '好奇', '害羞'];
    for (const keyword of personalityKeywords) {
      if (lowerResponse.includes(keyword) && !currentInfo.personality) {
        extracted.personality = keyword;
        break;
      }
    }

    return extracted;
  }

  // 检查信息是否完整
  isInfoComplete(info: CollectedInfo): boolean {
    return !!(
      info.childName && 
      info.age > 0 && 
      info.age < 18 && 
      info.personality && 
      info.interests.length > 0 && 
      info.parentExpectations
    );
  }

  // 生成最终角色配置
  generateCharacterConfig(info: CollectedInfo): CharacterConfig {
    const config: CharacterConfig = {
      aiName: '小伴童',
      chatStyle: this.determineChatStyle(info),
      childAge: info.age,
      interests: info.interests,
      personality: info.personality,
      parentExpectations: info.parentExpectations,
      capabilities: info.desiredCapabilities.length > 0 
        ? info.desiredCapabilities 
        : this.getDefaultCapabilities(info.age),
      systemPrompt: this.buildSystemPrompt(info),
      isInitialized: true
    };

    return config;
  }

  // 确定聊天风格
  private determineChatStyle(info: CollectedInfo): string {
    if (info.age < 6) return 'very-friendly';
    if (info.age < 12) return 'friendly';
    return 'mature-friendly';
  }

  // 获取默认能力
  private getDefaultCapabilities(age: number): string[] {
    const baseCapabilities = ['回答问题', '讲故事', '学习助手'];
    if (age < 6) {
      return [...baseCapabilities, '儿歌', '小游戏'];
    }
    if (age < 12) {
      return [...baseCapabilities, '科普知识', '互动游戏'];
    }
    return [...baseCapabilities, '学科辅导', '成长建议'];
  }

  // 保存配置到本地存储
  async saveConfig(config: CharacterConfig): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CHARACTER_CONFIG, JSON.stringify(config));
    } catch (error) {
      console.error('保存角色配置失败:', error);
      throw error;
    }
  }

  // 保存收集到的信息
  async saveCollectedInfo(info: CollectedInfo): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.WIZARD_INFO, JSON.stringify(info));
    } catch (error) {
      console.error('保存收集的信息失败:', error);
      throw error;
    }
  }

  // 加载已保存的信息
  async loadCollectedInfo(): Promise<CollectedInfo | null> {
    try {
      const storedData = await AsyncStorage.getItem(STORAGE_KEYS.WIZARD_INFO);
      if (storedData) {
        return JSON.parse(storedData);
      }
      return null;
    } catch (error) {
      console.error('加载收集的信息失败:', error);
      return null;
    }
  }

  // 加载角色配置
  async loadCharacterConfig(): Promise<CharacterConfig | null> {
    try {
      const storedData = await AsyncStorage.getItem(STORAGE_KEYS.CHARACTER_CONFIG);
      if (storedData) {
        return JSON.parse(storedData);
      }
      return null;
    } catch (error) {
      console.error('加载角色配置失败:', error);
      return null;
    }
  }

  // 删除临时数据
  async clearTemporaryData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.WIZARD_INFO);
    } catch (error) {
      console.error('清除临时数据失败:', error);
    }
  }

  // 构建系统提示词
  buildSystemPrompt(info: CollectedInfo): string {
    const capabilities = info.desiredCapabilities.length > 0 
      ? info.desiredCapabilities 
      : this.getDefaultCapabilities(info.age);

    return `你是小伴童 AI 伙伴，专门为 ${info.childName}（${info.age} 岁）设计。

## 角色定位
- 名字：小伴童
- 性格：${info.personality}
- 语言风格：${this.determineChatStyle(info)}
- 互动方式：友好、耐心、富有爱心

## 孩子的特点
- 兴趣爱好：${info.interests.join('、')}
- 近期关注点：${info.recentFocus}
- 梦想愿望：${info.dreams}

## 核心能力
${capabilities.map(cap => `- ${cap}`).join('\n')}

## 家长期望
${info.parentExpectations}

## 特殊注意事项
${info.specialNotes}

## 安全原则
- 始终保持内容适合孩子年龄
- 避免敏感话题和不当内容
- 鼓励积极向上的行为和价值观
- 保护孩子的隐私安全

## 互动指南
- 使用简单易懂的语言
- 回答问题要耐心详细
- 讲述故事要生动有趣
- 遇到不确定的问题要诚实说明
- 始终保持友好和鼓励的态度

你是 ${info.childName} 值得信赖的伙伴和学习助手！`;
  }
}

export const wizardService = new WizardService();
