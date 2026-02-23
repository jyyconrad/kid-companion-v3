# KidCompanion v3.6 配置管理架构

**更新时间**: 2026-02-23 16:00  
**版本**: v3.6

---

## 🎯 核心设计理念

### 之前的问题 ❌

```typescript
// 代码解析 Markdown 文件
const userMd = await AsyncStorage.getItem('@kid_companion_user');
const childNameMatch = userMd?.match(/名字 [::]\s*(.+)/);
const childName = childNameMatch ? childNameMatch[1].trim() : '小朋友';
```

**问题**:
- 正则表达式脆弱，格式变化就失效
- 代码需要理解 Markdown 结构
- AI 无法主动更新配置
- 维护困难

---

### 现在的方案 ✅

```
用户说"我叫小明"
    ↓
aiParseAndUpdate() 解析
    ↓
更新结构化数据 (JSON)
    ↓
AI 同时更新 Markdown 文件
    ↓
代码读取 JSON 数据
```

**优势**:
- ✅ 代码不解析 Markdown（更可靠）
- ✅ AI 可以主动管理配置
- ✅ 结构化数据方便读取
- ✅ Markdown 保持人类可读

---

## 📊 数据存储架构

### 双层存储

```
┌─────────────────────────────────────┐
│  结构化数据 (JSON)                   │
│  @kid_companion_config_data         │
│  - childName: "小明"                 │
│  - childAge: 6                      │
│  - aiName: "小伴童"                  │
│  ...                                │
└─────────────────────────────────────┘
              ↓ 同步
┌─────────────────────────────────────┐
│  Markdown 文件 (人类可读)             │
│  @kid_companion_system              │
│  @kid_companion_user                │
│  @kid_companion_identity            │
└─────────────────────────────────────┘
```

---

## 🛠️ 工具模块

### 1. configManager.ts

**统一配置读写接口**

```typescript
// 读取结构化数据
const config = await getConfigData();
console.log(config.childName); // "小明"

// 更新数据
await updateConfigData({ childAge: 7 });

// 读取 Markdown 文件
const userMd = await getConfigFile('user');

// 更新 Markdown 文件
await updateConfigFile('user', '新内容');

// 快捷方法
const childName = await getChildName();
const aiName = await getAiName();

// 检查配置完整性
const complete = await isConfigComplete();
```

**导出函数**:
| 函数 | 说明 |
|------|------|
| `getConfigData()` | 读取结构化 JSON |
| `updateConfigData()` | 更新结构化 JSON |
| `getConfigFile()` | 读取 Markdown 文件 |
| `updateConfigFile()` | 更新 Markdown 文件 |
| `getChildName()` | 获取孩子名字 |
| `getAiName()` | 获取 AI 名字 |
| `isConfigComplete()` | 检查配置完整性 |
| `clearConfig()` | 清除所有配置 |

---

### 2. aiFileTools.ts

**AI 可调用的文件操作工具**

```typescript
// AI 获取配置
const config = await aiGetConfig();
const userMd = await aiGetConfig({ file: 'user' });
const childName = await aiGetConfig({ field: 'childName' });

// AI 更新配置
await aiUpdateConfig('data', 'childName', '小明');
await aiUpdateConfig('file', 'user', '新内容');

// AI 检查配置
const status = await aiCheckConfig();
// { complete: true, childName: '小明', aiName: '小伴童' }

// AI 解析用户指令并更新
const result = await aiParseAndUpdate('我叫小明');
// { success: true, message: '...', updated: 'childName' }
```

**导出函数**:
| 函数 | 说明 |
|------|------|
| `aiGetConfig()` | AI 获取配置信息 |
| `aiUpdateConfig()` | AI 更新配置 |
| `aiCheckConfig()` | AI 检查配置状态 |
| `aiParseAndUpdate()` | AI 解析指令并更新 |

---

## 🧠 AI 自动更新配置

### 用户指令解析

**aiParseAndUpdate() 支持的指令**:

| 用户说 | 解析结果 | 更新字段 |
|--------|---------|---------|
| "我叫小明" | nameMatch | childName |
| "我今年 8 岁" | ageMatch | childAge |
| "我喜欢画画、唱歌" | interestMatch | interests |
| "我的爱好是踢球" | interestMatch | interests |

**实现逻辑**:
```typescript
// 检测名字更新
const nameMatch = userInput.match(/(我叫 | 名字是 | 改名)[:：]?\s*([^\s,.!?]+)/);
if (nameMatch) {
  await updateConfigData({ childName: nameMatch[2] });
}

// 检测年龄更新
const ageMatch = userInput.match(/(我今年 | 年龄)[:：]?(\d+) 岁/);
if (ageMatch) {
  await updateConfigData({ childAge: parseInt(ageMatch[2]) });
}

// 检测兴趣更新
const interestMatch = userInput.match(/(喜欢 | 爱好)[:：]?(.+)/);
if (interestMatch) {
  const interests = interestMatch[2].split(/[, ,]/);
  await updateConfigData({ interests });
}
```

---

## 📝 系统提示词集成

### AI 知道可以使用工具

在 `buildSystemPromptFromFiles()` 中添加：

```markdown
## AI 工具：配置管理
你可以调用以下工具来管理配置：
- **aiGetConfig()**: 获取配置信息（孩子名字、年龄、兴趣等）
- **aiUpdateConfig()**: 更新配置（如孩子说"我改名叫小明了"）
- **aiCheckConfig()**: 检查配置状态

当用户提到修改名字、年龄、兴趣时，请调用 aiUpdateConfig 更新配置。
```

---

## 🔄 数据流

### WizardScreen 生成配置

```typescript
// 1. 生成 Markdown 内容
const userMd = `# user.md - 关于小明
## 基本信息
- **名字**: 小明
- **年龄**: 6 岁
`;

// 2. 保存 Markdown
await AsyncStorage.setItem('@kid_companion_user', userMd);

// 3. 保存结构化数据
const configData = {
  childName: '小明',
  childAge: 6,
  aiName: '小伴童',
  // ...
};
await AsyncStorage.setItem('@kid_companion_config_data', JSON.stringify(configData));
```

### ChatScreen 读取配置

```typescript
// ❌ 旧方式：解析 Markdown
const userMd = await AsyncStorage.getItem('@kid_companion_user');
const childNameMatch = userMd?.match(/名字 [::]\s*(.+)/);
const childName = childNameMatch[1];

// ✅ 新方式：读取 JSON
const configData = await AsyncStorage.getItem('@kid_companion_config_data');
const config = JSON.parse(configData);
const childName = config.childName; // "小明"
```

### 用户对话中更新

```typescript
// 用户说"我叫小红"
AIService.sendMessage("我叫小红")
    ↓
// 自动解析并更新
aiParseAndUpdate("我叫小红")
    ↓
// 更新结构化数据
updateConfigData({ childName: '小红' })
    ↓
// AI 同时更新 Markdown 文件
aiUpdateConfig('file', 'user', newUserMd)
    ↓
// 下次读取使用新名字
```

---

## 🎯 使用场景

### 场景 1: 首次配置

```
WizardScreen 收集信息
    ↓
generateConfigFiles(info)
    ↓
保存 Markdown + JSON
    ↓
ChatScreen 读取 JSON 显示欢迎
```

### 场景 2: 孩子改名字

```
孩子说"我叫小红了"
    ↓
aiParseAndUpdate() 解析
    ↓
更新 childName = "小红"
    ↓
AI 回复"好的，小红！我记住了"
    ↓
下次欢迎用新名字
```

### 场景 3: AI 主动询问

```
AI 问"你今年几岁啦？"
    ↓
孩子说"我今年 7 岁"
    ↓
aiParseAndUpdate() 解析
    ↓
更新 childAge = 7
    ↓
AI 记住年龄，调整对话风格
```

---

## ✅ 优势总结

| 方面 | 旧方案 | 新方案 |
|------|------|------|
| **代码复杂度** | 需要解析 Markdown | 直接读取 JSON |
| **可靠性** | 正则脆弱 | 结构化数据稳定 |
| **AI 能力** | 被动读取 | 主动管理 |
| **可维护性** | 格式变化需改代码 | 代码与格式解耦 |
| **扩展性** | 困难 | 容易添加新字段 |

---

## 📋 文件清单

```
src/utils/
├── configManager.ts    # 配置管理工具
└── aiFileTools.ts      # AI 文件操作工具

src/screens/
├── WizardScreen.tsx    # 生成配置（Markdown + JSON）
└── ChatScreen.tsx      # 读取配置（JSON）

src/services/
└── aiService.ts        # 集成 AI 工具调用
```

---

## 🚀 未来扩展

### 更多自动解析指令

```typescript
// 性格更新
"我比较内向" → personality: "内向"

// AI 风格更新
"想要一个幽默的 AI" → aiStyle: "幽默"

// 删除兴趣
"不喜欢画画了" → interests.remove('画画')
```

### MCP 工具集成

未来可以集成 MCP (Model Context Protocol) 工具，让 AI 直接调用：

```typescript
// MCP 工具定义
{
  name: "update_config",
  description: "更新配置信息",
  parameters: {
    field: "string",
    value: "any"
  }
}

// AI 调用
{
  tool: "update_config",
  args: { field: "childName", value: "小明" }
}
```

---

**架构设计完成！AI 现在可以主动管理配置文件了！** 🎉
