import { useAppConfig } from '../store/useAppConfig';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export class AIService {
  async sendMessage(
    messages: Message[],
    onChunk?: (chunk: string) => void
  ): Promise<string> {
    // 每次调用都获取最新配置
    const config = useAppConfig.getState();
    const { apiUrl, apiKey, models, features, persona } = config;

    if (!apiKey) {
      throw new Error('API Key未配置');
    }

    // 构建系统提示词
    const systemPrompt = this.buildSystemPrompt(persona);

    // 调用AI API
    const response = await this.callAI(messages, systemPrompt, models.chat, apiUrl, apiKey);

    return response;
  }

  private buildSystemPrompt(persona: any): string {
    const { aiName, chatStyle, childAge, interests } = persona;

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
