import { useAppConfig } from '../store/useAppConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export class AIService {
  async sendMessage(
    text: string | Message[],
    options?: any,
    onChunk?: (chunk: string) => void
  ): Promise<string> {
    // 每次调用都获取最新配置
    const config = useAppConfig.getState();
    const { apiUrl, apiKey, models, language } = config;

    if (!apiKey) {
      throw new Error('API Key未配置');
    }

    // 确定系统提示词
    let systemPrompt = '';
    if (options?.context?.isWizard) {
      // 向导模式使用特定的系统提示词
      systemPrompt = options?.context?.systemPrompt ||
        '你是一个友好的AI伙伴配置向导，负责收集关于孩子的信息。';
    } else {
      // 常规模式使用默认系统提示词
      systemPrompt = this.buildSystemPrompt(config.persona, language);
    }

    // 准备消息
    let messages: Message[];
    if (typeof text === 'string') {
      // 简单文本输入
      messages = [{ id: '1', role: 'user', content: text, timestamp: Date.now() }];
    } else {
      // 消息数组
      messages = text;
    }

    // 调用AI API
    const response = await this.callAI(messages, systemPrompt, models.chat, apiUrl, apiKey);

    return response;
  }

  private async buildSystemPromptFromFiles(persona: any, language: string = 'zh-CN'): Promise<string> {
    try {
      // 加载三文件配置
      const systemMd = await AsyncStorage.getItem('@kid_companion_system');
      const userMd = await AsyncStorage.getItem('@kid_companion_user');
      const identityMd = await AsyncStorage.getItem('@kid_companion_identity');

      if (systemMd && userMd && identityMd) {
        // 使用三文件配置
        return `${systemMd}

${userMd}

${identityMd}

请始终使用 Markdown 格式回复。`;
      }
    } catch (error) {
      console.error('加载配置文件失败:', error);
    }

    // 降级到旧的系统提示词
    return this.buildSystemPrompt(persona, language);
  }

  private buildSystemPrompt(persona: any, language: string = 'zh-CN'): string {
    const { aiName, chatStyle, childAge, interests } = persona;

    // 根据语言生成相应的系统提示词
    if (language.startsWith('zh')) {
      return `你是一个名为"${aiName}"的AI儿童智能伙伴。

角色特点：
- 聊天风格：${chatStyle}
- 目标用户：${childAge}岁儿童
- 兴趣领域：${interests.join('、') || '各种有趣的话题'}

回答要求：
1. 语言生动有趣，符合儿童认知水平
2. 回答简洁明了，避免复杂专业术语
3. 多用比喻和例子帮助孩子理解
4. 鼓励孩子思考和提问
5. 保持友善、耐心的态度

请用中文回答。`;
    } else {
      // 英文版本
      return `You are an AI child companion named "${aiName}".

Role characteristics:
- Chat style: ${chatStyle}
- Target user: ${childAge}-year-old child
- Interest areas: ${interests.join(', ') || 'various interesting topics'}

Response requirements:
1. Use lively and interesting language appropriate for children's cognitive level
2. Keep answers concise and clear, avoiding complex jargon
3. Use metaphors and examples to help children understand
4. Encourage children to think and ask questions
5. Maintain a friendly and patient attitude

Please respond in ${language.startsWith('en') ? 'English' : 'the specified language'}.`;
    }
  }

  private async callAI(
    messages: Message[],
    systemPrompt: string,
    model: string,
    apiUrl: string,
    apiKey: string
  ): Promise<string> {
    try {
      const response = await fetch(`${apiUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          ],
          temperature: 0.8,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API请求失败: ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('AI Service Error:', error);
      throw error;
    }
  }
}

export const aiService = new AIService();
