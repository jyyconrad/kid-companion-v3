import { useAppConfig } from '../store/useAppConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export class AIService {
  async sendMessage(
    text: string | Message[],
    options?: any,
    onChunk?: (chunk: string) => void
  ): Promise<string> {
    const config = useAppConfig.getState();
    const { apiUrl, apiKey, models, language } = config;

    if (!apiKey) {
      throw new Error('API Key 未配置');
    }

    // 加载系统提示词（三文件配置）
    let systemPrompt = '';
    if (options?.context?.isWizard) {
      systemPrompt = options?.context?.systemPrompt ||
        '你是一个友好的 AI 伙伴配置向导，负责收集关于孩子的信息。';
    } else {
      systemPrompt = await this.buildSystemPromptFromFiles(config.persona, language);
    }

    // 准备消息：带入历史消息
    let messages: Message[];
    if (typeof text === 'string') {
      const historyMessages = await this.getRecentHistory(10);
      messages = [
        { id: 'system', role: 'system', content: systemPrompt, timestamp: Date.now() },
        ...historyMessages,
        { id: 'user', role: 'user', content: text, timestamp: Date.now() }
      ];
    } else {
      messages = text;
    }

    // 调用 AI API（支持流式）
    const response = await this.callAI(messages, systemPrompt, models.chat, apiUrl, apiKey, onChunk);

    // 保存消息到历史
    if (typeof text === 'string') {
      await this.saveMessageToHistory({ role: 'user', content: text });
      await this.saveMessageToHistory({ role: 'assistant', content: response });
    }

    return response;
  }

  // 获取最近的历史消息
  private async getRecentHistory(limit: number = 10): Promise<Message[]> {
    try {
      const historyJson = await AsyncStorage.getItem('@chat_message_history');
      const history: Message[] = JSON.parse(historyJson || '[]');
      return history.slice(-limit);
    } catch (error) {
      console.error('获取历史消息失败:', error);
      return [];
    }
  }

  // 保存消息到历史
  private async saveMessageToHistory(message: { role: string; content: string }) {
    try {
      const historyJson = await AsyncStorage.getItem('@chat_message_history');
      const history: Message[] = JSON.parse(historyJson || '[]');
      
      history.push({
        id: Date.now().toString(),
        role: message.role as 'user' | 'assistant',
        content: message.content,
        timestamp: Date.now()
      });

      // 只保留最近 50 条
      if (history.length > 50) {
        history.splice(0, history.length - 50);
      }

      await AsyncStorage.setItem('@chat_message_history', JSON.stringify(history));
    } catch (error) {
      console.error('保存历史消息失败:', error);
    }
  }

  // 构建动态上下文（日期、时间、时段）
  private async buildDynamicContext(): Promise<string> {
    const now = new Date();
    const date = now.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const time = now.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    });
    
    const hour = now.getHours();
    let timeOfDay = '晚上';
    if (hour >= 5 && hour < 12) timeOfDay = '早上';
    else if (hour >= 12 && hour < 18) timeOfDay = '下午';
    
    const weekday = now.toLocaleDateString('zh-CN', { weekday: 'long' });
    
    return `## 当前上下文
- **日期**: ${date}
- **时间**: ${time}
- **时段**: ${timeOfDay}
- **星期**: ${weekday}
`;
  }

  private async buildSystemPromptFromFiles(persona: any, language: string = 'zh-CN'): Promise<string> {
    try {
      const systemMd = await AsyncStorage.getItem('@kid_companion_system');
      const userMd = await AsyncStorage.getItem('@kid_companion_user');
      const identityMd = await AsyncStorage.getItem('@kid_companion_identity');

      if (systemMd && userMd && identityMd) {
        // 添加动态上下文
        const dynamicContext = await this.buildDynamicContext();
        return `${systemMd}\n\n${dynamicContext}\n${userMd}\n\n${identityMd}\n\n请始终使用 Markdown 格式回复。`;
      }
    } catch (error) {
      console.error('加载配置文件失败:', error);
    }

    return this.buildSystemPrompt(persona, language);
  }

  private buildSystemPrompt(persona: any, language: string = 'zh-CN'): string {
    const { aiName, chatStyle, childAge, interests } = persona;

    if (language.startsWith('zh')) {
      return `你是一个名为"${aiName}"的 AI 儿童智能伙伴。

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
    apiKey: string,
    onChunk?: (chunk: string) => void
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
          messages: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          temperature: 0.8,
          max_tokens: 1000,
          stream: !!onChunk, // 有回调时启用流式
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API 请求失败：${response.statusText} - ${errorText}`);
      }

      // 流式处理
      if (onChunk && response.body) {
        return await this.processStreamResponse(response.body, onChunk);
      }

      // 普通响应
      const data = await response.json();
      return data.choices?.[0]?.message?.content || '';
    } catch (error: any) {
      console.error('AI 调用失败:', error);
      throw error;
    }
  }

  // 处理流式响应
  private async processStreamResponse(
    body: ReadableStream<Uint8Array>,
    onChunk: (chunk: string) => void
  ): Promise<string> {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    let fullText = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content || '';
              if (content) {
                fullText += content;
                onChunk(content);
              }
            } catch (e) {
              // 跳过解析错误
            }
          }
        }
      }
    } catch (error) {
      console.error('流式处理失败:', error);
    }

    return fullText;
  }
}

export const aiService = new AIService();
