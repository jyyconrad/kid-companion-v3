# KidCompanion v3.5 升级计划

**创建时间**: 2026-02-23 14:35  
**目标版本**: v3.5  
**优先级**: 高

---

## 📊 当前状态分析 (v3.4)

### ✅ 已完成功能

| 模块 | 功能 | 状态 |
|------|------|------|
| **核心流程** | API 配置 → 模型选择 → 角色引导 | ✅ |
| **三文件配置** | system.md/user.md/identity.md | ✅ |
| **引导优化** | 2-3 轮完成，只需名字 | ✅ |
| **错误处理** | 3 次重试机制 | ✅ |

### ❌ 待完成功能 (P2)

| 模块 | 功能 | 优先级 | 预计时间 |
|------|------|--------|----------|
| **聊天体验** | Stream 流式输出 | 高 | 90min |
| **消息渲染** | Markdown 支持 | 高 | 60min |
| **对话上下文** | 历史消息带入 | 高 | 30min |
| **语音功能** | 自动语音播放 | 中 | 60min |

### 💡 可优化点

| 模块 | 优化点 | 优先级 | 预计时间 |
|------|--------|--------|----------|
| **引导流程** | 支持语音输入 | 中 | 60min |
| **模型选择** | 智能推荐模型 | 低 | 30min |
| **性能优化** | 减少 APK 体积 | 低 | 60min |
| **用户体验** | 添加加载动画 | 低 | 30min |
| **配置管理** | 支持导出/导入配置 | 低 | 60min |

---

## 🎯 v3.5 核心功能

### P0 - 聊天体验增强（必须完成）

#### 1. Stream 流式输出

**目标**: AI 回复时显示打字机效果，提升交互真实感

**实现方案**:
```typescript
// aiService.ts
async sendMessageStream(
  text: string,
  options: any,
  onChunk: (chunk: string) => void
): Promise<string> {
  const response = await fetch(`${apiUrl}/chat/completions`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({
      model, messages, stream: true
    }),
  });

  const reader = response.body.getReader();
  let fullText = '';
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const chunk = parseChunk(value);
    fullText += chunk;
    onChunk(chunk); // 实时回调
  }
  
  return fullText;
}

// ChatScreen.tsx
const handleSend = async () => {
  // 创建空消息
  const aiMessageId = addAiMessage('');
  
  // 流式接收
  await aiService.sendMessageStream(userText, options, (chunk) => {
    updateAiMessage(aiMessageId, chunk);
  });
};
```

**验收标准**:
- [ ] AI 回复逐字显示
- [ ] 支持取消/中断
- [ ] 不影响其他功能

---

#### 2. Markdown 渲染支持

**目标**: 支持 AI 输出的 Markdown 格式（加粗、列表、表情等）

**实现方案**:

**安装依赖**:
```bash
npm install react-native-markdown-display
```

**修改 MessageBubble**:
```typescript
import Markdown from 'react-native-markdown-display';

export const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
  return (
    <View style={[styles.bubble, message.type === 'user' ? styles.userBubble : styles.aiBubble]}>
      <Markdown
        style={{
          body: { color: message.type === 'user' ? 'white' : '#333' },
          strong: { fontWeight: 'bold' },
          paragraph: { margin: 0 },
        }}
      >
        {message.content}
      </Markdown>
    </View>
  );
};
```

**验收标准**:
- [ ] 支持**加粗**渲染
- [ ] 支持列表渲染
- [ ] 支持表情符号
- [ ] 字体大小适中

---

#### 3. 对话历史带入

**目标**: 每次对话带入最近 10 条消息，保持上下文连贯

**实现方案**:
```typescript
// aiService.ts
async sendMessage(text: string, options: any) {
  // 获取历史消息
  const historyMessages = await AsyncStorage.getItem('@chat_history');
  const recentMessages = JSON.parse(historyMessages || []).slice(-10);

  // 构建完整消息列表
  const messages = [
    { role: 'system', content: systemPrompt },
    ...recentMessages,
    { role: 'user', content: text }
  ];

  // 调用 API
  const response = await callAI(messages, ...);
  
  // 保存新消息
  await saveMessage({ role: 'user', content: text });
  await saveMessage({ role: 'assistant', content: response });
  
  return response;
}
```

**验收标准**:
- [ ] 带入最近 10 条消息
- [ ] 支持上下文引用
- [ ] 历史消息自动清理

---

### P1 - 语音功能增强（建议完成）

#### 4. 自动语音播放

**目标**: AI 回复时自动播放语音（文字 + 语音同步）

**实现方案**:
```typescript
// ChatScreen.tsx
const handleAiResponse = async (text: string) => {
  // 显示文字
  addAiMessage(text);
  
  // 自动播放语音
  if (autoPlayEnabled) {
    await Speech.speak(text, {
      language: 'zh-CN',
      pitch: 1.0,
      rate: 0.9,
    });
  }
};

// 添加语音开关
const [autoPlayEnabled, setAutoPlayEnabled] = useState(true);

<ToggleSwitch
  value={autoPlayEnabled}
  onValueChange={setAutoPlayEnabled}
  label="自动语音播放"
/>
```

**验收标准**:
- [ ] AI 回复自动播放语音
- [ ] 支持开关控制
- [ ] 支持音量调节

---

### P2 - 用户体验优化（可选完成）

#### 5. 引导流程语音输入

**目标**: 引导界面支持语音输入，方便小朋友使用

**实现方案**:
```typescript
// WizardScreen.tsx
<VoiceInput
  onSpeechRecognized={(text) => {
    setInputText(text);
    handleSend();
  }}
/>
```

---

#### 6. 智能模型推荐

**目标**: 根据场景推荐合适的模型

**实现方案**:
```typescript
const recommendedModels = {
  chat: 'deepseek-ai/DeepSeek-V3.2',      // 聊天
  story: 'Qwen/Qwen2.5-72B-Instruct',     // 故事
  science: 'deepseek-ai/DeepSeek-V3.2',   // 科普
};

// ModelSelectScreen 显示推荐标签
{model === recommendedModels[scene] && (
  <Badge>推荐</Badge>
)}
```

---

#### 7. APK 体积优化

**目标**: 减少 APK 体积，加快下载速度

**优化方案**:
```bash
# 使用 .easignore 排除不必要文件
echo "node_modules/" >> .easignore
echo "*.log" >> .easignore
echo "*.md" >> .easignore
echo ".git/" >> .easignore
```

---

## 📋 开发计划

### 阶段 1: 核心体验（v3.5.0）

**优先级**: 高  
**预计时间**: 3 小时

| 任务 | 说明 | 时间 |
|------|------|------|
| Stream 流式输出 | 打字机效果 | 90min |
| Markdown 渲染 | 支持格式渲染 | 60min |
| 对话历史带入 | 上下文连贯 | 30min |

**验收标准**:
- AI 回复逐字显示
- Markdown 格式正确渲染
- 对话能引用上下文

---

### 阶段 2: 语音增强（v3.5.1）

**优先级**: 中  
**预计时间**: 2 小时

| 任务 | 说明 | 时间 |
|------|------|------|
| 自动语音播放 | 文字 + 语音同步 | 60min |
| 引导语音输入 | 方便小朋友 | 60min |

**验收标准**:
- AI 回复自动播放语音
- 引导界面支持语音输入

---

### 阶段 3: 体验优化（v3.5.2）

**优先级**: 低  
**预计时间**: 2 小时

| 任务 | 说明 | 时间 |
|------|------|------|
| 智能模型推荐 | 场景推荐 | 30min |
| APK 体积优化 | 减少体积 | 60min |
| 加载动画 | 提升体验 | 30min |

**验收标准**:
- 模型选择有推荐标签
- APK 体积减少 20%
- 加载时有动画提示

---

## 📦 交付物

### v3.5.0 (核心体验)
- [ ] Stream 流式输出
- [ ] Markdown 渲染
- [ ] 对话历史带入
- [ ] CHANGELOG_v3.5.0.md
- [ ] APK 文件

### v3.5.1 (语音增强)
- [ ] 自动语音播放
- [ ] 引导语音输入
- [ ] CHANGELOG_v3.5.1.md
- [ ] APK 文件

### v3.5.2 (体验优化)
- [ ] 智能模型推荐
- [ ] APK 体积优化
- [ ] 加载动画
- [ ] CHANGELOG_v3.5.2.md
- [ ] APK 文件

---

## 🚀 开始执行

**立即开始 v3.5.0 开发**：
1. 安装 Markdown 渲染库
2. 实现 Stream 流式输出
3. 添加对话历史支持
4. 测试并构建 v3.5.0

**预计完成时间**: 3 小时

---

**确认计划后开始执行！** 🛠️
