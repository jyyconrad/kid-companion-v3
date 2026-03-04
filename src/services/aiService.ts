/**
 * AI Service - 基于 OpenAI Client
 * 
 * 功能：
 * 1. 流式输出（打字机效果）- 通过 SSE
 * 2. Tool 调用（AI 可以自主调用工具）- 通过 Function Calling
 * 3. 对话历史管理
 * 4. 配置管理集成
 * 5. Vision API - 图片输入支持
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppConfig } from '../store/useAppConfig';
import { aiGetConfig, aiUpdateConfig, aiParseAndUpdate } from '../utils/aiFileTools';
import { webSearchTool, kidsSearchTool } from '../tools/webSearch';
import { knowledgeTool, addKnowledgeTool } from '../tools/knowledge';
import { websiteReaderTool, batchReadWebsitesTool } from '../tools/websiteReader';
import { imageSearchTool } from '../tools/imageSearchTool';
import { 
  OpenAIClient, 
  Message as OpenAIMessage, 
  Tool, 
  ToolCall,
  StreamCallbacks as OpenAIStreamCallbacks 
} from '../lib/openai-client';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  images?: Array<{
    url: string;
    thumbnail: string;
    title: string;
    source: string;
    width?: number;
    height?: number;
  }>;
}

export interface StreamCallbacks {
  onChunk?: (chunk: string) => void;
  onComplete?: (fullText: string) => void;
  onError?: (error: Error) => void;
  onToolCall?: (toolName: string, args: any) => void;
}

interface SendMessageOptions {
  context?: {
    isWizard?: boolean;
    systemPrompt?: string;
  };
  skipConfigUpdate?: boolean;
}

/**
 * 将工具定义转换为 OpenAI 格式
 */
function convertToolDefinition(tool: any): Tool {
  return {
    type: 'function',
    function: {
      name: tool.function.name,
      description: tool.function.description,
      parameters: tool.function.parameters,
    },
  };
}

export class AIService {
  private client: OpenAIClient | null = null;

  /**
   * 获取或创建 OpenAI 客户端
   */
  private getClient(): OpenAIClient {
    if (!this.client) {
      const config = useAppConfig.getState();
      const { apiUrl, apiKey, models } = config;

      if (!apiKey) {
        throw new Error('API Key 未配置');
      }

      this.client = new OpenAIClient({
        apiKey: apiKey,
        baseURL: apiUrl || 'https://api.openai.com/v1',
        model: models.chat || 'gpt-4o-mini',
      });
    }
    return this.client;
  }

  /**
   * 重置客户端（用于配置变更时重新创建）
   */
  resetClient(): void {
    this.client = null;
  }

  /**
   * 发送消息（流式输出）
   * 
   * @param text 用户输入
   * @param options 选项
   * @param callbacks 回调函数
   */
  async sendMessage(
    text: string,
    options?: SendMessageOptions,
    callbacks?: StreamCallbacks
  ): Promise<string> {
    const config = useAppConfig.getState();
    const { language } = config;

    try {
      // 加载系统提示词（三文件配置）
      let systemPrompt = '';
      if (options?.context?.isWizard) {
        systemPrompt = options?.context?.systemPrompt ||
          '你是一个友好的 AI 伙伴配置向导，负责收集关于孩子的信息。';
      } else {
        systemPrompt = await this.buildSystemPromptFromFiles(undefined, language);
      }

      // 准备消息：带入历史消息
      const historyMessages = await this.getRecentHistory(10);
      const messages: OpenAIMessage[] = [
        { role: 'system', content: systemPrompt },
        ...historyMessages.map(m => ({ 
          role: m.role as 'user' | 'assistant', 
          content: m.content 
        })),
        { role: 'user', content: text }
      ];

      // 定义工具（转换为 OpenAI 格式）
      const tools: Tool[] = [
        convertToolDefinition({
          function: {
            name: 'getConfig',
            description: '获取配置信息（孩子名字、年龄、兴趣等）',
            parameters: {
              type: 'object',
              properties: {
                field: { 
                  type: 'string', 
                  description: '配置字段名，如 childName, childAge, aiName 等' 
                },
              },
            },
          },
        }),
        convertToolDefinition({
          function: {
            name: 'updateConfig',
            description: '更新配置信息（如孩子说"我改名叫小明了"）',
            parameters: {
              type: 'object',
              properties: {
                field: { type: 'string', description: '配置字段名' },
                value: { type: 'any', description: '新的值' },
              },
              required: ['field', 'value'],
            },
          },
        }),
        convertToolDefinition(webSearchTool),
        convertToolDefinition(kidsSearchTool),
        convertToolDefinition(imageSearchTool),
        convertToolDefinition(knowledgeTool),
        convertToolDefinition(addKnowledgeTool),
        convertToolDefinition(websiteReaderTool),
        convertToolDefinition(batchReadWebsitesTool),
      ];

      const client = this.getClient();

      // 流式调用 AI
      const result = await client.streamChat(
        {
          messages,
          tools,
          temperature: 0.7,
        },
        {
          onChunk: (chunk) => {
            callbacks?.onChunk?.(chunk);
          },
          onToolCall: async (toolCall: ToolCall) => {
            const functionName = toolCall.function.name;
            let args: any = {};
            
            try {
              args = JSON.parse(toolCall.function.arguments);
            } catch (e) {
              // 如果解析失败，保持原始字符串
              args = { raw: toolCall.function.arguments };
            }

            callbacks?.onToolCall?.(functionName, args);

            // 执行工具调用
            let toolResult = '';
            try {
              switch (functionName) {
                case 'getConfig':
                  toolResult = JSON.stringify(await aiGetConfig(args));
                  break;
                case 'updateConfig':
                  toolResult = JSON.stringify(await aiUpdateConfig('data', args.field, args.value));
                  break;
                case 'webSearch':
                  toolResult = JSON.stringify(await webSearchTool.function.execute(args));
                  break;
                case 'kidsSearch':
                  toolResult = JSON.stringify(await kidsSearchTool.function.execute(args));
                  break;
                case 'imageSearch':
                  toolResult = JSON.stringify(await imageSearchTool.function.execute(args));
                  break;
                case 'knowledge':
                  toolResult = JSON.stringify(await knowledgeTool.function.execute(args));
                  break;
                case 'addKnowledge':
                  toolResult = JSON.stringify(await addKnowledgeTool.function.execute(args));
                  break;
                case 'websiteReader':
                  toolResult = JSON.stringify(await websiteReaderTool.function.execute(args));
                  break;
                case 'batchReadWebsites':
                  toolResult = JSON.stringify(await batchReadWebsitesTool.function.execute(args));
                  break;
                default:
                  toolResult = JSON.stringify({ error: `Unknown tool: ${functionName}` });
              }
            } catch (toolError: any) {
              toolResult = JSON.stringify({ error: toolError.message });
            }

            // 将工具结果添加到消息中继续对话
            const toolMessage: OpenAIMessage = {
              role: 'tool',
              content: toolResult,
              tool_call_id: toolCall.id,
              name: functionName,
            };

            // 继续对话并获取最终响应
            const continueResult = await client.streamChat(
              {
                messages: [...messages, toolMessage],
                tools,
                temperature: 0.7,
              },
              {
                onChunk: (chunk) => {
                  callbacks?.onChunk?.(chunk);
                },
              }
            );

            return continueResult;
          },
          onComplete: () => {
            // 保存消息到历史
            this.saveMessageToHistory({ role: 'user', content: text });
          },
          onError: (error) => {
            callbacks?.onError?.(error);
          },
        }
      );

      // 保存助手回复到历史
      await this.saveMessageToHistory({ role: 'assistant', content: result.text });

      // 检查用户输入是否需要更新配置（兼容旧逻辑）
      if (!options?.skipConfigUpdate) {
        const updateResult = await aiParseAndUpdate(text);
        if (updateResult.success && updateResult.updated) {
          console.log(`配置已自动更新：${updateResult.updated}`);
        }
      }

      callbacks?.onComplete?.(result.text);
      return result.text;

    } catch (error: any) {
      console.error('AI 调用失败:', error);
      callbacks?.onError?.(error);
      throw error;
    }
  }

  /**
   * 发送图片消息（Vision API）
   * 
   * @param imageUrl 图片 URL
   * @param text 附加的文本描述
   * @param callbacks 回调函数
   */
  async sendImageMessage(
    imageUrl: string,
    text: string = '描述这张图片',
    callbacks?: StreamCallbacks
  ): Promise<string> {
    const config = useAppConfig.getState();
    const { language } = config;

    try {
      // 加载系统提示词
      const systemPrompt = await this.buildSystemPromptFromFiles(undefined, language);

      // 准备消息：使用 Vision API 格式
      const historyMessages = await this.getRecentHistory(10);
      const messages: OpenAIMessage[] = [
        { role: 'system', content: systemPrompt },
        ...historyMessages.map(m => ({ 
          role: m.role as 'user' | 'assistant', 
          content: m.content 
        })),
        // 使用 OpenAIClient 的图片消息格式
        OpenAIClient.imageMessage(text, imageUrl),
      ];

      const client = this.getClient();

      // 流式调用 AI
      const result = await client.streamChat(
        {
          messages,
          temperature: 0.7,
        },
        {
          onChunk: (chunk) => {
            callbacks?.onChunk?.(chunk);
          },
          onComplete: () => {
            this.saveMessageToHistory({ role: 'user', content: `[图片]: ${text}` });
          },
          onError: (error) => {
            callbacks?.onError?.(error);
          },
        }
      );

      // 保存助手回复到历史
      await this.saveMessageToHistory({ role: 'assistant', content: result.text });

      callbacks?.onComplete?.(result.text);
      return result.text;

    } catch (error: any) {
      console.error('AI Vision 调用失败:', error);
      callbacks?.onError?.(error);
      throw error;
    }
  }

  /**
   * 发送多图消息（Vision API）
   * 
   * @param imageUrls 图片 URL 数组
   * @param text 附加的文本描述
   * @param callbacks 回调函数
   */
  async sendMultiImageMessage(
    imageUrls: string[],
    text: string = '比较这几张图片',
    callbacks?: StreamCallbacks
  ): Promise<string> {
    const config = useAppConfig.getState();
    const { language } = config;

    try {
      const systemPrompt = await this.buildSystemPromptFromFiles(undefined, language);

      const historyMessages = await this.getRecentHistory(10);
      const messages: OpenAIMessage[] = [
        { role: 'system', content: systemPrompt },
        ...historyMessages.map(m => ({ 
          role: m.role as 'user' | 'assistant', 
          content: m.content 
        })),
        // 使用 OpenAIClient 的多图消息格式
        OpenAIClient.multiImageMessage(text, imageUrls),
      ];

      const client = this.getClient();

      const result = await client.streamChat(
        {
          messages,
          temperature: 0.7,
        },
        {
          onChunk: (chunk) => {
            callbacks?.onChunk?.(chunk);
          },
          onComplete: () => {
            this.saveMessageToHistory({ role: 'user', content: `[多图]: ${text}` });
          },
          onError: (error) => {
            callbacks?.onError?.(error);
          },
        }
      );

      await this.saveMessageToHistory({ role: 'assistant', content: result.text });

      callbacks?.onComplete?.(result.text);
      return result.text;

    } catch (error: any) {
      console.error('AI Multi-Image 调用失败:', error);
      callbacks?.onError?.(error);
      throw error;
    }
  }

  /**
   * 构建系统提示词（从三文件配置）
   */
  private async buildSystemPromptFromFiles(
    _persona: any,
    language: string
  ): Promise<string> {
    try {
      const [systemMd, userMd, identityMd] = await Promise.all([
        AsyncStorage.getItem('@kid_companion_system'),
        AsyncStorage.getItem('@kid_companion_user'),
        AsyncStorage.getItem('@kid_companion_identity'),
      ]);

      // 获取结构化配置摘要
      const configDataJson = await AsyncStorage.getItem('@kid_companion_config_data');
      const configData = configDataJson ? JSON.parse(configDataJson) : null;
      
      const configSummary = configData
        ? `## 配置摘要
- **孩子名字**: ${configData.childName || '小朋友'}
- **孩子年龄**: ${configData.childAge || 6}岁
- **AI 名字**: ${configData.aiName || '小伴童'}
- **兴趣**: ${configData.interests?.join(', ') || '未设置'}
`
        : '';

      // 动态上下文
      const dynamicContext = this.buildDynamicContext();

      const systemMdContent = systemMd || `# system.md - 系统规则

## 核心规则
1. 使用简单易懂的语言与孩子交流
2. 保持友好、积极的语气
3. 使用表情符号增加趣味性
4. 回复简短（不超过 100 字）
5. 鼓励孩子提问和探索`;

      const userMdContent = userMd || `# user.md - 关于孩子

## 基本信息
- **名字**: 小朋友
- **年龄**: 6 岁`;

      const identityMdContent = identityMd || `# identity.md - AI 身份

## 基本信息
- **名字**: 小伴童
- **角色**: 孩子的 AI 好朋友`;

      return `${systemMdContent}

${configSummary}${dynamicContext}${userMdContent}

${identityMdContent}

## AI 工具：配置管理
你可以调用以下工具来管理配置：
- **getConfig()**: 获取配置信息（孩子名字、年龄、兴趣等）
- **updateConfig()**: 更新配置（如孩子说"我改名叫小明了"）

当用户提到修改名字、年龄、兴趣时，请调用 updateConfig 更新配置。

请始终使用 Markdown 格式回复。`;

    } catch (error) {
      console.error('构建系统提示词失败:', error);
      return '你是一个友好的 AI 伙伴，请用简单易懂的语言与孩子交流。';
    }
  }

  /**
   * 构建动态上下文（日期、时间、时段）
   */
  private buildDynamicContext(): string {
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

  /**
   * 获取最近的历史消息
   */
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

  /**
   * 保存消息到历史
   */
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
}

// 导出单例
export const aiService = new AIService();
