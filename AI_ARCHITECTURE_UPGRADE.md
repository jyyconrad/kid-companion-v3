# KidCompanion AI 架构升级方案

**时间**: 2026-02-23  
**语言**: TypeScript/React Native  
**目标**: 基于 TS 的 AI Agent 架构

---

## 📊 当前状态

### 当前实现

```typescript
// 没有使用任何 AI 框架，直接调用 API
class AIService {
  async sendMessage(text: string) {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ messages })
    });
    return await response.text();
  }
}
```

**依赖检查** (`package.json`):
```json
{
  "dependencies": {
    "expo": "~51.0.8",
    "react-native": "0.74.5",
    "zustand": "^4.4.1",
    "@react-native-async-storage/async-storage": "1.23.1",
    // ❌ 没有 AI 框架依赖
  }
}
```

**结论**: 当前是**裸调用 API**，没有使用任何 AI 框架

---

## 🎯 TypeScript AI 框架对比

### 主流 TS AI 框架 (2025-2026)

| 框架 | 语言 | Agent | Tools | Memory | React Native | 成熟度 |
|------|------|-------|-------|--------|--------------|--------|
| **LangChain.js** | TS | ✅ | ✅ | ✅ | ⚠️ 复杂 | ⭐⭐⭐⭐⭐ |
| **Vercel AI SDK** | TS | ⚠️ 轻量 | ✅ | ❌ | ✅ 优秀 | ⭐⭐⭐⭐⭐ |
| **Mastra** | TS | ✅ | ✅ | ✅ | ⚠️ 较新 | ⭐⭐⭐⭐ |
| **AgentKit (Coinbase)** | TS | ✅ | ✅ | ❌ | ⚠️ 区块链 | ⭐⭐⭐ |
| **Braintrust** | TS | ✅ | ✅ | ✅ | ✅ | ⭐⭐⭐⭐ |

---

## 🏆 推荐方案

### 方案 A: Vercel AI SDK (推荐 ⭐⭐⭐⭐⭐)

**优势**:
- ✅ 专为 React/React Native 设计
- ✅ 流式输出内置支持
- ✅ 轻量级，适合移动端
- ✅ 优秀的 TypeScript 支持
- ✅ Vercel 维护，活跃度高

**安装**:
```bash
npm install ai @ai-sdk/provider
```

**核心用法**:
```typescript
import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

// 配置模型（支持硅基流动）
const openai = createOpenAI({
  baseURL: 'https://api.siliconflow.cn/v1',
  apiKey: apiKey,
});

// 流式调用
const result = streamText({
  model: openai('deepseek-ai/DeepSeek-V3.2'),
  messages: [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: text }
  ],
  tools: {
    getConfig: tool({
      description: '获取配置信息',
      parameters: z.object({
        field: z.string()
      }),
      execute: async ({ field }) => {
        return await aiGetConfig({ field });
      }
    }),
    updateConfig: tool({
      description: '更新配置',
      parameters: z.object({
        field: z.string(),
        value: z.any()
      }),
      execute: async ({ field, value }) => {
        return await aiUpdateConfig('data', field, value);
      }
    })
  }
});

// 处理流式响应
for await (const chunk of result.textStream) {
  onChunk?.(chunk);
}
```

**集成到 ChatScreen**:
```typescript
import { useChat } from 'ai';

export const ChatScreen: React.FC = () => {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat', // 可以指向自己的后端
    body: {
      apiKey: config.apiKey,
      apiUrl: config.apiUrl,
    },
    onFinish: (message) => {
      // 自动播放语音
      if (autoPlayEnabled) {
        Speech.speak(message.content);
      }
    }
  });

  return (
    <FlatList
      data={messages}
      renderItem={({ item }) => (
        <MessageBubble role={item.role} content={item.content} />
      )}
    />
  );
};
```

---

### 方案 B: LangChain.js (功能最全 ⭐⭐⭐⭐)

**优势**:
- ✅ 最成熟的 AI 框架
- ✅ 丰富的 Tool 生态
- ✅ Memory、Chain、Agent 完整支持
- ✅ 支持多种模型

**劣势**:
- ⚠️ 体积较大
- ⚠️ React Native 兼容性需要测试
- ⚠️ 学习曲线陡峭

**安装**:
```bash
npm install langchain @langchain/core @langchain/community
```

**核心用法**:
```typescript
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { tool } from '@langchain/core/tools';
import { createReactAgent } from '@langchain/langgraph/prebuilt';

// 配置模型
const llm = new ChatOpenAI({
  modelName: 'deepseek-ai/DeepSeek-V3.2',
  openAIApiKey: apiKey,
  configuration: {
    baseURL: 'https://api.siliconflow.cn/v1',
  },
});

// 定义工具
const getConfigTool = tool(
  async ({ field }) => {
    return await aiGetConfig({ field });
  },
  {
    name: 'getConfig',
    description: '获取配置信息',
    schema: z.object({
      field: z.string().describe('配置字段名'),
    }),
  }
);

const updateConfigTool = tool(
  async ({ field, value }) => {
    return await aiUpdateConfig('data', field, value);
  },
  {
    name: 'updateConfig',
    description: '更新配置信息',
    schema: z.object({
      field: z.string(),
      value: z.any(),
    }),
  }
);

// 创建 Agent
const agent = createReactAgent({
  llm,
  tools: [getConfigTool, updateConfigTool],
  systemPrompt: systemPrompt,
});

// 执行
const result = await agent.invoke({
  messages: [new HumanMessage(text)]
});

const response = result.messages[result.messages.length - 1].content;
```

---

### 方案 C: Mastra (新兴框架 ⭐⭐⭐⭐)

**优势**:
- ✅ 专为 TypeScript 设计
- ✅ Agent、Tools、Memory 完整支持
- ✅ 支持工作流 (Workflows)
- ✅ 现代化 API

**安装**:
```bash
npm install mastra
```

**核心用法**:
```typescript
import { Mastra, Agent, Tool } from 'mastra';

// 创建 Mastra 实例
const mastra = new Mastra({
  agents: [
    new Agent({
      name: 'chatAgent',
      model: {
        provider: 'openai',
        name: 'deepseek-ai/DeepSeek-V3.2',
        apiKey: apiKey,
        baseURL: 'https://api.siliconflow.cn/v1',
      },
      instructions: [
        '你是孩子的 AI 好朋友',
        '使用简单易懂的语言',
      ],
      tools: [
        new Tool({
          id: 'getConfig',
          description: '获取配置信息',
          execute: async ({ field }) => {
            return await aiGetConfig({ field });
          },
        }),
        new Tool({
          id: 'updateConfig',
          description: '更新配置',
          execute: async ({ field, value }) => {
            return await aiUpdateConfig('data', field, value);
          },
        }),
      ],
    }),
  ],
});

// 使用
const agent = mastra.getAgent('chatAgent');
const response = await agent.generate(text);
```

---

## 📋 架构升级方案

### 当前架构 vs 升级后

```
【当前架构】
React Native App
    ↓
AIService (裸调用 API)
    ↓
LLM API

【升级后架构 - 使用 Vercel AI SDK】
React Native App
    ↓
ChatScreen (useChat Hook)
    ↓
Vercel AI SDK (streamText + Tools)
    ├── Tool: getConfig
    ├── Tool: updateConfig
    ├── Tool: webSearch (待实现)
    └── Tool: knowledge (待实现)
    ↓
LLM API (硅基流动)
```

---

## 🚀 实施步骤

### Phase 1: 引入 Vercel AI SDK (v3.7.0)

**1. 安装依赖**
```bash
cd /root/.openclaw/workspace-coding/projects/kid-companion-v3
npm install ai @ai-sdk/provider zod
```

**2. 重构 AIService**
```typescript
// src/services/aiService.ts
import { streamText, tool } from 'ai';
import { z } from 'zod';

export class AIService {
  async sendMessage(
    text: string,
    options?: any,
    onChunk?: (chunk: string) => void
  ) {
    const config = useAppConfig.getState();
    
    // 定义工具
    const tools = {
      getConfig: tool({
        description: '获取配置信息',
        parameters: z.object({
          field: z.string().optional(),
        }),
        execute: async ({ field }) => {
          return await aiGetConfig({ field: field as any });
        },
      }),
      updateConfig: tool({
        description: '更新配置信息',
        parameters: z.object({
          field: z.string(),
          value: z.any(),
        }),
        execute: async ({ field, value }) => {
          return await aiUpdateConfig('data', field, value);
        },
      }),
    };

    // 流式调用
    const result = streamText({
      model: createOpenAI({
        baseURL: config.apiUrl,
        apiKey: config.apiKey,
      })(config.models.chat),
      messages: [
        { role: 'system', content: systemPrompt },
        ...historyMessages,
        { role: 'user', content: text }
      ],
      tools,
    });

    // 处理流式响应
    let fullResponse = '';
    for await (const chunk of result.textStream) {
      fullResponse += chunk;
      onChunk?.(chunk);
    }

    return fullResponse;
  }
}
```

**3. 更新 ChatScreen**
```typescript
// 使用 useChat Hook (可选)
import { useChat } from 'ai';

export const ChatScreen: React.FC = () => {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    body: { apiKey, apiUrl },
  });
  
  // ...
};
```

---

### Phase 2: 增强 Tools (v3.8.0)

**新增 Tools**:
- `webSearch`: 网络搜索
- `knowledge`: 知识库查询
- `speech`: 语音控制
- `calendar`: 日程管理

**示例 - webSearch Tool**:
```typescript
const webSearchTool = tool({
  description: '搜索网络信息',
  parameters: z.object({
    query: z.string().describe('搜索关键词'),
  }),
  execute: async ({ query }) => {
    const response = await fetch(
      `https://api.siliconflow.cn/v1/search?q=${encodeURIComponent(query)}`
    );
    return await response.json();
  },
});
```

---

### Phase 3: Agent 抽象 (v4.0.0)

**创建 Agent 类**:
```typescript
// src/agents/Agent.ts
export class Agent {
  constructor(
    public name: string,
    public tools: Tool[],
    public skills: Skill[],
    public instructions: string[]
  ) {}

  async execute(task: string, onChunk?: (chunk: string) => void) {
    // 检测 Skill
    const skill = detectSkill(task);
    
    // 调用 AI (带 Tools)
    const result = streamText({
      model: this.model,
      messages: [
        { role: 'system', content: this.systemPrompt },
        { role: 'user', content: task }
      ],
      tools: this.tools,
    });
    
    // 处理响应
    // ...
  }
}

// src/agents/chatAgent.ts
export const chatAgent = new Agent(
  '聊天伙伴',
  [getConfigTool, updateConfigTool, knowledgeTool],
  [chatSkill],
  [
    '你是孩子的 AI 好朋友',
    '使用简单易懂的语言',
    '保持对话有趣',
  ]
);

// src/agents/storyAgent.ts
export const storyAgent = new Agent(
  '故事大王',
  [getConfigTool, knowledgeTool],
  [storySkill],
  [
    '你是故事大王',
    '善于讲生动的童话故事',
    '使用丰富的表情符号',
  ]
);
```

---

## 📊 对比总结

| 维度 | 当前实现 | Vercel AI SDK | LangChain.js | Mastra |
|------|---------|--------------|--------------|--------|
| **安装体积** | 0 KB | ~50 KB | ~500 KB | ~200 KB |
| **React Native** | ✅ | ✅ | ⚠️ | ⚠️ |
| **流式支持** | ✅ 手动 | ✅ 内置 | ✅ | ✅ |
| **Tools 系统** | ❌ | ✅ | ✅ | ✅ |
| **Agent 抽象** | ❌ | ⚠️ 轻量 | ✅ | ✅ |
| **学习曲线** | - | 低 | 高 | 中 |
| **社区活跃度** | - | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

---

## ✅ 推荐决策

**推荐使用 Vercel AI SDK**，原因：

1. ✅ **专为 React 设计** - 完美适配 React Native
2. ✅ **轻量级** - 适合移动端
3. ✅ **流式内置** - 打字机效果简单实现
4. ✅ **Tools 支持** - 满足当前需求
5. ✅ **活跃维护** - Vercel 背书
6. ✅ **渐进式升级** - 可以从简单用法开始

---

## 📁 文件变更清单

### 需要修改的文件

| 文件 | 变更 | 说明 |
|------|------|------|
| `package.json` | 新增依赖 | `ai`, `@ai-sdk/provider`, `zod` |
| `src/services/aiService.ts` | 重构 | 使用 `streamText` + `tool` |
| `src/screens/ChatScreen.tsx` | 可选 | 使用 `useChat` Hook |
| `src/utils/aiFileTools.ts` | 适配 | 作为 Tool 的 execute 函数 |
| `src/agents/` | 新增 | Agent 抽象层 (v4.0) |

---

## 🎯 下一步

**建议立即执行**:
1. ✅ 安装 Vercel AI SDK
2. ✅ 重构 AIService 使用 `streamText`
3. ✅ 将现有工具注册为 `tool()`
4. ✅ 测试流式输出和工具调用

**后续规划**:
- v3.8: 添加 webSearch、knowledge 工具
- v4.0: 引入 Agent 抽象层
- v4.1: 多 Agent 协作

---

**需要我现在开始实施吗？** 🛠️
