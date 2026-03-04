/**
 * OpenAI Client - React Native 兼容的 OpenAI API 客户端
 * 
 * 功能：
 * 1. 流式输出 (SSE)
 * 2. Vision API (图片输入)
 * 3. Function Calling (工具调用)
 * 4. 完全兼容 React Native
 */

export interface OpenAIConfig {
  apiKey: string;
  baseURL?: string;
  model?: string;
}

export interface Message {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | ContentPart[];
  name?: string;
  tool_call_id?: string;
}

export interface ContentPart {
  type: 'text' | 'image_url';
  text?: string;
  image_url?: {
    url: string;
    detail?: 'low' | 'high' | 'auto';
  };
}

export interface Tool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: any;
  };
}

export interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

export interface StreamCallbacks {
  onChunk?: (chunk: string) => void;
  onToolCall?: (toolCall: ToolCall) => void;
  onComplete?: (fullText: string, toolCalls: ToolCall[]) => void;
  onError?: (error: Error) => void;
}

export interface ChatCompletionOptions {
  messages: Message[];
  tools?: Tool[];
  temperature?: number;
  maxTokens?: number;
}

/**
 * OpenAI 客户端类
 */
export class OpenAIClient {
  private config: OpenAIConfig;

  constructor(config: OpenAIConfig) {
    this.config = {
      baseURL: 'https://api.openai.com/v1',
      model: 'gpt-4o-mini',
      ...config,
    };
  }

  /**
   * 流式聊天补全
   */
  async streamChat(
    options: ChatCompletionOptions,
    callbacks: StreamCallbacks
  ): Promise<{ text: string; toolCalls: ToolCall[] }> {
    const { messages, tools, temperature = 0.7, maxTokens = 4096 } = options;

    const body: any = {
      model: this.config.model,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream: true,
    };

    if (tools && tools.length > 0) {
      body.tools = tools;
    }

    try {
      const response = await fetch(`${this.config.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `OpenAI API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`
        );
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let fullText = '';
      const toolCalls: ToolCall[] = [];
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data:')) continue;

          const data = trimmed.slice(5).trim();
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta;

            if (delta?.content) {
              fullText += delta.content;
              callbacks.onChunk?.(delta.content);
            }

            if (delta?.tool_calls) {
              for (const tc of delta.tool_calls) {
                const existingIndex = toolCalls.findIndex(t => t.id === tc.id);
                
                if (existingIndex >= 0) {
                  // 追加到现有的 tool call
                  toolCalls[existingIndex].function.arguments += tc.function?.arguments || '';
                } else {
                  // 新的 tool call
                  toolCalls.push({
                    id: tc.id,
                    type: 'function',
                    function: {
                      name: tc.function?.name || '',
                      arguments: tc.function?.arguments || '',
                    },
                  });
                }
                callbacks.onToolCall?.(toolCalls[toolCalls.length - 1]);
              }
            }
          } catch (e) {
            // 忽略解析错误
          }
        }
      }

      callbacks.onComplete?.(fullText, toolCalls);
      return { text: fullText, toolCalls };

    } catch (error: any) {
      callbacks.onError?.(error);
      throw error;
    }
  }

  /**
   * 非流式聊天补全
   */
  async chat(options: ChatCompletionOptions): Promise<{ text: string; toolCalls: ToolCall[] }> {
    const { messages, tools, temperature = 0.7, maxTokens = 4096 } = options;

    const body: any = {
      model: this.config.model,
      messages,
      temperature,
      max_tokens: maxTokens,
    };

    if (tools && tools.length > 0) {
      body.tools = tools;
    }

    try {
      const response = await fetch(`${this.config.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `OpenAI API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`
        );
      }

      const data = await response.json();
      const message = data.choices?.[0]?.message;
      
      return {
        text: message?.content || '',
        toolCalls: message?.tool_calls || [],
      };

    } catch (error: any) {
      throw error;
    }
  }

  /**
   * 创建文本消息
   */
  static textMessage(role: 'system' | 'user' | 'assistant', text: string): Message {
    return { role, content: text };
  }

  /**
   * 创建图片消息（Vision API）
   */
  static imageMessage(text: string, imageUrl: string): Message {
    return {
      role: 'user',
      content: [
        { type: 'text', text },
        {
          type: 'image_url',
          image_url: { url: imageUrl, detail: 'auto' },
        },
      ],
    };
  }

  /**
   * 创建多图消息
   */
  static multiImageMessage(text: string, imageUrls: string[]): Message {
    return {
      role: 'user',
      content: [
        { type: 'text', text },
        ...imageUrls.map(url => ({
          type: 'image_url' as const,
          image_url: { url, detail: 'auto' as const },
        })),
      ],
    };
  }

  /**
   * 创建工具定义
   */
  static createTool(
    name: string,
    description: string,
    parameters: any
  ): Tool {
    return {
      type: 'function',
      function: { name, description, parameters },
    };
  }
}

/**
 * SSE 解析器（用于手动解析 SSE 流）
 */
export class SSEParser {
  private buffer = '';

  parse(chunk: string): Array<{ event?: string; data?: string }> {
    this.buffer += chunk;
    const results: Array<{ event?: string; data?: string }> = [];
    
    const lines = this.buffer.split('\n');
    this.buffer = lines.pop() || '';

    let currentEvent: { event?: string; data?: string } = {};

    for (const line of lines) {
      if (line.startsWith('event:')) {
        currentEvent.event = line.slice(6).trim();
      } else if (line.startsWith('data:')) {
        currentEvent.data = line.slice(5).trim();
      } else if (line === '' && Object.keys(currentEvent).length > 0) {
        results.push(currentEvent);
        currentEvent = {};
      }
    }

    return results;
  }
}