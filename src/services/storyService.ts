import { useAppConfig } from '../store/useAppConfig';

export interface Story {
  id: string;
  title: string;
  content: string;
  category: string;
  createdAt: number;
}

export class StoryService {
  private config = useAppConfig.getState();

  async generateStory(params: {
    topic?: string;
    characters?: string;
    setting?: string;
  }): Promise<Story> {
    const { apiUrl, apiKey, models, persona } = this.config;

    if (!apiKey) {
      throw new Error('API Key未配置');
    }

    const prompt = this.buildPrompt(params);

    // 调用AI API生成故事
    const response = await this.callAI(prompt, models.story);

    return {
      id: Date.now().toString(),
      title: response.title,
      content: response.content,
      category: response.category || '故事',
      createdAt: Date.now(),
    };
  }

  private buildPrompt(params: {
    topic?: string;
    characters?: string;
    setting?: string;
  }): string {
    const { aiName, chatStyle, childAge, interests } = this.config.persona;

    let prompt = `请为${childAge}岁儿童创作一个有趣的故事。\n\n`;

    if (params.topic) {
      prompt += `主题：${params.topic}\n`;
    }
    if (params.characters) {
      prompt += `主角：${params.characters}\n`;
    }
    if (params.setting) {
      prompt += `背景：${params.setting}\n`;
    }

    prompt += `\n要求：
1. 故事情节生动有趣，符合儿童认知水平
2. 语言简洁易懂，避免复杂词汇
3. 寓教于乐，传递积极价值观
4. 适合${chatStyle}的风格讲述
5. 故事长度约500-800字

请以JSON格式返回，包含：
- title: 故事标题
- content: 故事内容
- category: 故事分类（童话、冒险、科普等）`;

    return prompt;
  }

  private async callAI(prompt: string, model: string): Promise<{
    title: string;
    content: string;
    category: string;
  }> {
    const { apiUrl, apiKey } = this.config;

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
            {
              role: 'system',
              content: '你是一个专业的儿童故事创作专家。请严格按照JSON格式返回结果。',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.9,
          max_tokens: 1500,
        }),
      });

      if (!response.ok) {
        throw new Error(`API请求失败: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;

      // 尝试解析JSON
      try {
        return JSON.parse(content);
      } catch {
        // 如果不是JSON格式，创建一个默认的故事
        return {
          title: '有趣的故事',
          content,
          category: '故事',
        };
      }
    } catch (error) {
      console.error('Story Service Error:', error);
      throw error;
    }
  }
}

export const storyService = new StoryService();
