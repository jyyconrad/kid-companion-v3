import { AIService } from './aiService';
import { useAppConfig } from '../store/useAppConfig';

export interface ScienceAnswer {
  id: string;
  question: string;
  answer: string;
  sources?: string[];
  timestamp: number;
}

export class ScienceService {
  private config = useAppConfig.getState();

  async askQuestion(
    question: string,
    onChunk?: (chunk: string) => void
  ): Promise<ScienceAnswer> {
    const { apiUrl, apiKey, models, persona } = this.config;

    if (!apiKey) {
      throw new Error('API Key未配置');
    }

    // 如果启用了网络检索，先获取相关信息
    let context = '';
    if (this.config.features.science.useSearch) {
      context = await this.searchContext(question);
    }

    // 构建提示词
    const prompt = this.buildPrompt(question, context, persona);

    // 调用AI API
    const answer = await this.callAI(prompt, models.science);

    return {
      id: Date.now().toString(),
      question,
      answer,
      timestamp: Date.now(),
    };
  }

  private buildPrompt(
    question: string,
    context: string,
    persona: any
  ): string {
    const { aiName, childAge } = persona;

    let prompt = `我是${childAge}岁的孩子，有一个科学问题想请教：${question}\n\n`;

    if (context) {
      prompt += `参考信息：\n${context}\n\n`;
    }

    prompt += `请用简单易懂的语言回答这个问题。

要求：
1. 语言生动有趣，适合儿童理解
2. 避免复杂的专业术语，必要时用比喻解释
3. 回答要准确，但要通俗易懂
4. 鼓励孩子的好奇心
5. 如果有相关的安全提示，请包含在回答中

请用中文回答。`;

    return prompt;
  }

  private async callAI(prompt: string, model: string): Promise<string> {
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
              content: '你是一个科普教育专家，擅长用通俗易懂的语言为儿童解释科学知识。',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 800,
        }),
      });

      if (!response.ok) {
        throw new Error(`API请求失败: ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Science Service Error:', error);
      throw error;
    }
  }

  private async searchContext(question: string): Promise<string> {
    const searchResults = await searchService.search(question, 3);
    return searchResults
      .map((r, i) => `${i + 1}. ${r.title}\n${r.snippet}`)
      .join('\n\n');
  }
}

export const scienceService = new ScienceService();

// 导入searchService（避免循环依赖）
import { searchService } from './searchService';
