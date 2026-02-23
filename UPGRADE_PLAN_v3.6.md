# KidCompanion v3.6 升级计划

**创建时间**: 2026-02-23 15:20  
**目标版本**: v3.6  
**优先级**: 高  
**开发**: CC (Claude Code)

---

## 📋 需求分析

### 需求 1: 引导完成后跳转主页面 ⚠️ 待修复

**当前状态**: 
- WizardScreen 生成三文件后显示完成提示
- 使用 `navigation.reset({ routes: [{ name: 'MainApp' }] })` 跳转
- 但 `MainApp` 路由可能未正确定义

**期望行为**:
```
生成三文件
    ↓
显示完成提示（3 秒）
    ↓
跳转到主页面（HomeScreen 或 ChatScreen）
    ↓
主页面上主动触发 AI 欢迎消息
```

---

### 需求 2: 提示词加载初始信息 + 主动欢迎 ⭐ 核心功能

**当前状态**:
- 三文件配置加载到 system prompt
- 但没有动态信息（日期、时间等）
- 进入页面后没有主动欢迎

**期望行为**:
```
用户进入 ChatScreen
    ↓
加载三文件配置
    ↓
注入动态信息（日期、时间、天气等）
    ↓
主动触发 AI 生成欢迎消息
    ↓
显示："我是 xx，很高兴认识你（又见面了）！
       今天你要聊什么、听什么故事、看哪些科普资料呢？"
```

**系统提示词增强**:
```markdown
# system.md - 系统配置

## 当前上下文
- **日期**: {{currentDate}}
- **时间**: {{currentTime}}
- **时段**: {{timeOfDay}} (早上/下午/晚上)
- **孩子名字**: {{childName}}

## 核心规则
1. **对话格式**: 始终使用 Markdown 格式输出
2. **语言风格**: 简单易懂，适合{{age}}岁儿童
3. **互动方式**: 每次只问一个问题，耐心等待回答
4. **安全约束**: 不问隐私信息（地址、学校、电话等）

## 欢迎行为
当用户首次进入聊天时，主动发送欢迎消息：
- 如果是第一次： "我是{{aiName}}，很高兴认识你，{{childName}}！👋"
- 如果是再次访问："{{childName}}，又见面啦！今天想做什么呢？"
- 根据时段问候："早上好/下午好/晚上好"
- 提供选项："今天你要聊什么、听什么故事、看哪些科普资料呢？"
```

---

### 需求 3: Skills 系统 ⭐ 核心功能

**需求描述**:
聊天界面具备故事、科普等能力，作为 Skills 动态加载。
当小朋友说"听故事"时，AI 自动选择加载讲故事 Skill，系统加载后开始讲故事。

**架构设计**:
```
ChatScreen
    ↓
检测用户意图（听故事/学科普/聊天）
    ↓
加载对应 Skill
    ↓
Skill 接管对话
    ↓
完成后返回聊天模式
```

**Skill 定义**:
```typescript
interface Skill {
  id: string;
  name: string;
  description: string;
  keywords: string[]; // 触发关键词
  systemPrompt: string; // Skill 专属提示词
  onActivate: () => void;
  onDeactivate: () => void;
}

// 故事 Skill
const storySkill: Skill = {
  id: 'story',
  name: '讲故事',
  description: '为孩子创作和讲述故事',
  keywords: ['听故事', '讲故事', '故事', '童话'],
  systemPrompt: `你现在是故事大王，正在给孩子讲故事。
要求：
1. 语言生动有趣
2. 有教育意义
3. 使用 Markdown 格式
4. 讲完后问孩子感受`,
  onActivate: () => {
    // 切换到故事模式 UI
  },
  onDeactivate: () => {
    // 返回聊天模式 UI
  },
};

// 科普 Skill
const scienceSkill: Skill = {
  id: 'science',
  name: '科普知识',
  description: '解答科学问题',
  keywords: ['为什么', '科普', '知识', '科学'],
  systemPrompt: `你现在是科学老师，正在解答孩子的科学问题。
要求：
1. 用简单易懂的语言
2. 使用比喻和例子
3. 激发好奇心`,
  onActivate: () => {},
  onDeactivate: () => {},
};
```

**意图识别**:
```typescript
// 简单关键词匹配
const detectIntent = (text: string): string => {
  if (storySkill.keywords.some(k => text.includes(k))) {
    return 'story';
  }
  if (scienceSkill.keywords.some(k => text.includes(k))) {
    return 'science';
  }
  return 'chat';
};

// 或使用 AI 分类
const detectIntent = async (text: string): Promise<string> => {
  const prompt = `分析用户意图，返回：chat/story/science
用户输入：${text}`;
  const response = await aiService.sendMessage(prompt);
  return response.trim();
};
```

---

## 🎯 升级清单

### P0 - 核心功能

| 编号 | 功能 | 说明 | 预计时间 |
|------|------|------|----------|
| P0-1 | 修复引导跳转 | WizardScreen 完成后正确跳转主页 | 30min |
| P0-2 | 动态信息注入 | 日期、时间等上下文注入提示词 | 60min |
| P0-3 | 主动欢迎消息 | 进入页面触发 AI 欢迎 | 60min |
| P0-4 | Skills 架构 | Skills 系统基础架构 | 90min |
| P0-5 | 故事 Skill | 讲故事技能实现 | 60min |
| P0-6 | 科普 Skill | 科普知识技能实现 | 60min |
| P0-7 | 意图识别 | 检测用户意图切换 Skill | 60min |

### P1 - 体验优化

| 编号 | 功能 | 说明 | 预计时间 |
|------|------|------|----------|
| P1-1 | Skill 切换 UI | 显示当前 Skill 状态 | 30min |
| P1-2 | 欢迎消息定制 | 首次/再次访问不同欢迎 | 30min |
| P1-3 | 时段问候 | 早上/下午/晚上不同问候 | 30min |

---

## 🔧 技术实现方案

### P0-1: 修复引导跳转

**文件**: `WizardScreen.tsx`, `AppNavigator.tsx`

**修改**:
```typescript
// WizardScreen.tsx - completeWizard 函数
const completeWizard = async (info: CollectedInfo) => {
  try {
    // 生成三文件
    await generateConfigFiles(info);
    
    // 显示完成消息
    addAiMessage(`🎉 配置已完成！...`);
    
    // 3 秒后跳转到主页（不是 MainApp，是 Home 或 Chat）
    setTimeout(() => {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Chat' }], // 或 'Home'
      });
    }, 3000);
  } catch (error) {
    // ...
  }
};
```

---

### P0-2: 动态信息注入

**文件**: `aiService.ts`

**修改**:
```typescript
// 添加动态上下文生成
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
  
  return `## 当前上下文
- **日期**: ${date}
- **时间**: ${time}
- **时段**: ${timeOfDay}
- **星期**: ${now.toLocaleDateString('zh-CN', { weekday: 'long' })}
`;
}

// 修改 buildSystemPromptFromFiles
private async buildSystemPromptFromFiles(...) {
  const systemMd = await AsyncStorage.getItem('@kid_companion_system');
  const userMd = await AsyncStorage.getItem('@kid_companion_user');
  const identityMd = await AsyncStorage.getItem('@kid_companion_identity');
  
  // 添加动态上下文
  const dynamicContext = await this.buildDynamicContext();
  
  return `${systemMd}

${dynamicContext}

${userMd}

${identityMd}

请始终使用 Markdown 格式回复。`;
}
```

---

### P0-3: 主动欢迎消息

**文件**: `ChatScreen.tsx`

**修改**:
```typescript
// 添加首次加载欢迎
const [hasWelcomed, setHasWelcomed] = useState(false);

useEffect(() => {
  if (isConfigLoaded && !hasWelcomed && messages.length === 0) {
    // 首次进入，触发欢迎消息
    triggerWelcomeMessage();
    setHasWelcomed(true);
  }
}, [isConfigLoaded, hasWelcomed, messages.length]);

const triggerWelcomeMessage = async () => {
  try {
    // 检查是否是首次访问
    const lastVisit = await AsyncStorage.getItem('@last_visit');
    const isFirstVisit = !lastVisit;
    
    // 构建欢迎提示词
    const welcomePrompt = `你是${config.persona.aiName}，正在和${config.persona.childName || '小朋友'}打招呼。
${isFirstVisit ? '这是第一次见面' : '这是再次见面'}。
请说一句友好的欢迎话，并询问今天想做什么（聊天、听故事、学科普）。
要求：简短、友好、有趣，使用表情符号。`;

    const response = await aiService.sendMessage(welcomePrompt);
    
    // 显示欢迎消息
    const welcomeMessage: AIMessage = {
      id: generateMessageId(),
      role: 'assistant',
      content: response,
      timestamp: Date.now(),
    };
    
    setMessages(prev => [...prev, welcomeMessage]);
    
    // 自动播放语音
    await Speech.speak(response);
    
    // 记录访问时间
    await AsyncStorage.setItem('@last_visit', Date.now().toString());
  } catch (error) {
    console.error('欢迎消息失败:', error);
  }
};
```

---

### P0-4: Skills 架构

**文件**: 新建 `src/skills/` 目录

**创建文件**:
```
src/skills/
├── index.ts          # Skills 管理器
├── types.ts          # Skill 类型定义
├── storySkill.ts     # 故事技能
├── scienceSkill.ts   # 科普技能
└── chatSkill.ts      # 聊天技能（默认）
```

**src/skills/types.ts**:
```typescript
export interface Skill {
  id: string;
  name: string;
  description: string;
  icon: string;
  keywords: string[];
  systemPrompt: string;
  onActivate?: () => void;
  onDeactivate?: () => void;
}

export interface SkillState {
  activeSkillId: string | null;
  availableSkills: Skill[];
}
```

**src/skills/index.ts**:
```typescript
import { Skill } from './types';
import { storySkill } from './storySkill';
import { scienceSkill } from './scienceSkill';
import { chatSkill } from './chatSkill';

export const skills: Skill[] = [chatSkill, storySkill, scienceSkill];

export const getSkillById = (id: string): Skill | undefined => {
  return skills.find(s => s.id === id);
};

export const detectSkill = (text: string): string => {
  // 简单关键词匹配
  for (const skill of skills) {
    if (skill.keywords.some(k => text.toLowerCase().includes(k.toLowerCase()))) {
      return skill.id;
    }
  }
  return 'chat'; // 默认聊天
};

export const activateSkill = (skill: Skill) => {
  skill.onActivate?.();
};

export const deactivateSkill = (skill: Skill) => {
  skill.onDeactivate?.();
};
```

---

### P0-5: 故事 Skill

**文件**: `src/skills/storySkill.ts`

```typescript
import { Skill } from './types';

export const storySkill: Skill = {
  id: 'story',
  name: '讲故事',
  description: '为孩子创作和讲述精彩故事',
  icon: 'book',
  keywords: ['听故事', '讲故事', '故事', '童话', '讲个故事'],
  systemPrompt: `你现在是故事大王，正在给孩子讲故事。

角色特点：
- 语言生动有趣
- 善于营造氛围
- 故事有教育意义

要求：
1. 使用 Markdown 格式
2. 适当使用表情符号
3. 故事长度 300-500 字
4. 讲完后问孩子的感受
5. 可以邀请孩子续编故事

开始讲故事吧！`,
  onActivate: () => {
    console.log('激活故事模式');
    // 可以切换到故事 UI 主题
  },
  onDeactivate: () => {
    console.log('退出故事模式');
  },
};
```

---

### P0-6: 科普 Skill

**文件**: `src/skills/scienceSkill.ts`

```typescript
import { Skill } from './types';

export const scienceSkill: Skill = {
  id: 'science',
  name: '科普知识',
  description: '解答科学问题，探索世界奥秘',
  icon: 'bulb',
  keywords: ['为什么', '科普', '知识', '科学', '怎么回事', '是什么'],
  systemPrompt: `你现在是科学老师，正在解答孩子的科学问题。

角色特点：
- 知识渊博
- 善于用比喻解释
- 激发好奇心

要求：
1. 使用 Markdown 格式
2. 语言简单易懂
3. 使用生活中的例子
4. 避免专业术语
5. 鼓励孩子提问

开始解答问题吧！`,
  onActivate: () => {
    console.log('激活科普模式');
  },
  onDeactivate: () => {
    console.log('退出科普模式');
  },
};
```

---

### P0-7: 意图识别

**文件**: `src/utils/intentDetection.ts`

```typescript
import { detectSkill } from '../skills';

export interface Intent {
  type: 'chat' | 'story' | 'science';
  confidence: number;
  originalText: string;
}

// 简单关键词匹配
export const detectIntent = (text: string): Intent => {
  const skillId = detectSkill(text);
  
  return {
    type: skillId as Intent['type'],
    confidence: 0.8, // 简单匹配默认置信度
    originalText: text,
  };
};

// AI 分类（更准确）
export const detectIntentAI = async (text: string): Promise<Intent> => {
  const prompt = `分析用户输入的意图，只返回一个词：chat/story/science
用户输入：${text}`;

  try {
    const response = await fetch('/api/intent', {
      method: 'POST',
      body: JSON.stringify({ text, prompt }),
    });
    const result = await response.json();
    
    return {
      type: result.intent as Intent['type'],
      confidence: result.confidence,
      originalText: text,
    };
  } catch (error) {
    // 降级到关键词匹配
    return detectIntent(text);
  }
};
```

---

### P1-1: Skill 切换 UI

**文件**: `ChatScreen.tsx`

```typescript
// 添加 Skill 状态
const [activeSkill, setActiveSkill] = useState<Skill | null>(null);

// 渲染 Skill 状态栏
{activeSkill && (
  <View style={styles.skillBar}>
    <Ionicons name={activeSkill.icon} size={20} color="#4A90E2" />
    <Text style={styles.skillText}>{activeSkill.name}模式</Text>
    <TouchableOpacity onPress={() => setActiveSkill(null)}>
      <Ionicons name="close" size={20} color="#999" />
    </TouchableOpacity>
  </View>
)}

// 监听意图切换
useEffect(() => {
  const lastMessage = messages[messages.length - 1];
  if (lastMessage?.type === 'user') {
    const intent = detectIntent(lastMessage.content);
    const skill = getSkillById(intent.type);
    if (skill && skill.id !== 'chat') {
      setActiveSkill(skill);
      skill.onActivate?.();
    } else {
      activeSkill?.onDeactivate?.();
      setActiveSkill(null);
    }
  }
}, [messages]);
```

---

## 📋 开发顺序

### 阶段 1: 基础修复 (v3.6.0)
1. P0-1: 修复引导跳转
2. P0-2: 动态信息注入
3. P0-3: 主动欢迎消息

### 阶段 2: Skills 系统 (v3.6.1)
4. P0-4: Skills 架构
5. P0-5: 故事 Skill
6. P0-6: 科普 Skill
7. P0-7: 意图识别

### 阶段 3: 体验优化 (v3.6.2)
8. P1-1: Skill 切换 UI
9. P1-2: 欢迎消息定制
10. P1-3: 时段问候

---

## 🧪 验收标准

### P0-1: 引导跳转
- [ ] 生成三文件后显示完成提示
- [ ] 3 秒后自动跳转到 ChatScreen
- [ ] 跳转后显示欢迎消息

### P0-2: 动态信息
- [ ] 提示词包含当前日期
- [ ] 提示词包含当前时间
- [ ] 提示词包含时段（早上/下午/晚上）

### P0-3: 主动欢迎
- [ ] 首次进入显示"很高兴认识你"
- [ ] 再次访问显示"又见面了"
- [ ] 根据时段问候
- [ ] 提供选项（聊天/故事/科普）

### P0-4~7: Skills 系统
- [ ] Skills 架构正确实现
- [ ] 故事 Skill 正常工作
- [ ] 科普 Skill 正常工作
- [ ] 意图识别准确

### P1-1: Skill UI
- [ ] 显示当前 Skill 状态
- [ ] 可以手动退出 Skill
- [ ] UI 切换流畅

---

## 📦 交付物

### v3.6.0
- [ ] 修复后的代码
- [ ] CHANGELOG_v3.6.0.md
- [ ] APK 文件

### v3.6.1
- [ ] Skills 系统代码
- [ ] CHANGELOG_v3.6.1.md
- [ ] APK 文件

### v3.6.2
- [ ] 体验优化代码
- [ ] CHANGELOG_v3.6.2.md
- [ ] APK 文件

---

## 🚀 开始开发

**CC 请按照以下顺序开发**:
1. 先完成 P0-1~P0-3（基础修复）
2. 测试 v3.6.0 确认正常
3. 继续 P0-4~P0-7（Skills 系统）
4. 测试 v3.6.1 确认正常
5. 最后 P1-1~P1-3（体验优化）

**每完成一个阶段请通知我进行测试！** 🛠️
