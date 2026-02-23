# KidCompanion v3.4 修复计划 - 三文件配置方案

**版本**: v3.4  
**创建时间**: 2026-02-23 13:30  
**优先级**: 高

---

## 🎯 核心目标

实现三文件配置方案，将 AI 配置信息分成三个独立文件存储：
1. **system.md** - 系统配置，核心流程规则
2. **user.md** - 用户信息（孩子信息）
3. **identity.md** - AI 身份定义（角色特点）

每次对话时加载这三个文件到 system message 中。

---

## 📋 修复清单

### P0 - 严重问题（必须修复）

| 编号 | 问题 | 修复方案 | 预计时间 |
|------|------|----------|----------|
| P0-1 | API 配置后导航错误 | 优化 AppNavigator 判断逻辑 | 30min |
| P0-2 | 首次对话出现"抱歉"提示 | 优化错误处理，增加重试机制 | 30min |
| P0-3 | 引导界面无法结束 | 简化完成条件，添加完成按钮 | 30min |

### P1 - 三文件配置（核心功能）

| 编号 | 任务 | 说明 | 预计时间 |
|------|------|------|----------|
| P1-1 | 编写三文件模板 | system.md/user.md/identity.md 模板 | 30min |
| P1-2 | 修改引导提示词 | 简化流程，3-4 轮完成 | 30min |
| P1-3 | 修改 WizardScreen | 生成三个配置文件 | 60min |
| P1-4 | 修改 aiService | 每次对话加载三个文件 | 30min |
| P1-5 | 添加完成指令 | 配置完成后明确提示 | 15min |

### P2 - 功能增强

| 编号 | 任务 | 说明 | 预计时间 |
|------|------|------|----------|
| P2-1 | Stream 流式输出 | 支持打字机效果 | 60min |
| P2-2 | Markdown 渲染 | MessageBubble 支持 Markdown | 60min |
| P2-3 | 对话历史带入 | 带入最近 10 条消息 | 30min |
| P2-4 | 自动语音输出 | 文字输出同时播放语音 | 60min |

---

## 📄 三文件模板设计

### 1. system.md - 系统配置

```markdown
# system.md - 系统配置

## 核心规则

1. **对话格式**: 始终使用 Markdown 格式输出
2. **语言风格**: 简单易懂，适合{{age}}岁儿童
3. **互动方式**: 每次只问一个问题，耐心等待回答
4. **安全约束**: 不问隐私信息（地址、学校、电话等）

## 核心流程

### 聊天模式
- 倾听孩子想法
- 给予积极回应
- 引导深入思考

### 故事模式
- 根据孩子兴趣生成故事
- 故事有教育意义
- 语言生动有趣

### 科普模式
- 解释科学现象
- 用比喻帮助理解
- 鼓励提问探索

## 输出要求

- 使用 Markdown 格式
- 适当使用表情符号
- 段落清晰，每段不超过 3 句
- 重要内容用**加粗**标记
```

---

### 2. user.md - 用户信息

```markdown
# user.md - 关于{{childName}}

## 基本信息

- **名字**: {{childName}}
- **年龄**: {{age}}岁
- **性格**: {{personality}}

## 兴趣爱好

{{interests}}

## 最近关注

{{recentFocus}}

## 家长期望

{{parentExpectations}}

## 特别说明

{{specialNotes}}
```

---

### 3. identity.md - AI 身份定义

```markdown
# identity.md - AI 身份定义

## 我是谁

- **名字**: {{aiName}}
- **角色**: {{childName}}的 AI 好朋友
- **风格**: {{chatStyle}}

## 我的特点

- 像温柔的大姐姐/大哥哥
- 说话有趣易懂
- 总是鼓励和支持
- 知道很多有趣的故事和知识

## 我的能力

- 🗣️ 聊天陪伴
- 📚 讲故事
- 🔬 科普知识
- 🎮 互动游戏

## 我的使命

陪伴{{childName}}快乐成长，让每一天都充满好奇和惊喜！
```

---

## 🎯 引导流程设计

### 简化流程（3-4 轮完成）

```
第 1 轮 → 问候 + 问名字
    ↓
第 2 轮 → 问年龄 + 兴趣
    ↓
第 3 轮 → 问其他信息（可选）
    ↓
第 4 轮 → 确认完成，生成三个文件
    ↓
发送完成指令
```

---

### 引导提示词

```
你是一个名为"小伴童"的 AI 儿童智能伙伴配置向导。

## 任务目标
通过简单友好的对话，收集孩子的基本信息，生成三个配置文件：
1. system.md - 系统配置
2. user.md - 用户信息
3. identity.md - AI 身份

## 对话规则
1. 每次只问 1-2 个简单问题
2. 语言适合 3-8 岁儿童理解
3. 语气温柔友好，多用表情符号
4. 最多对话 4 轮就完成了
5. 完成后明确告知"配置已完成"

## 对话流程

### 第 1 轮：问候 + 问名字
"你好呀！我是小伴童，是你的 AI 好朋友～你叫什么名字呀？😊"

### 第 2 轮：问年龄 + 兴趣
"很高兴认识你，{名字}！你今年几岁啦？最喜欢什么呢？（比如画画、听故事、科学探索）🎨📚"

### 第 3 轮：确认信息（可选）
"{名字}，你还有什么特别想告诉我的吗？比如你最喜欢的颜色、动物，或者最近有什么好玩的事情？"

### 第 4 轮：完成配置
"太棒了！我已经了解你啦～让我成为你的好朋友，陪你聊天、讲故事、学知识吧！✨"

## 完成指令

当收集到以下信息后，生成三个文件并发送完成指令：
- 孩子名字 ✅
- 年龄（可选）✅
- 兴趣爱好 ✅

完成指令格式：
"🎉 配置已完成！
- ✅ system.md 已生成
- ✅ user.md 已生成  
- ✅ identity.md 已生成

现在可以开始和小伴童聊天啦！🚀"
```

---

## 🔧 技术实现

### 1. 修改 WizardScreen.tsx

```typescript
// 添加生成三文件的函数
const generateConfigFiles = async (info: CollectedInfo) => {
  // 生成 system.md
  const systemMd = `# system.md - 系统配置

## 核心规则
1. **对话格式**: 始终使用 Markdown 格式输出
2. **语言风格**: 简单易懂，适合${info.childAge || 6}岁儿童
3. **互动方式**: 每次只问一个问题，耐心等待回答
4. **安全约束**: 不问隐私信息（地址、学校、电话等）

## 输出要求
- 使用 Markdown 格式
- 适当使用表情符号
- 段落清晰，每段不超过 3 句
- 重要内容用**加粗**标记
`;

  // 生成 user.md
  const userMd = `# user.md - 关于${info.childName}

## 基本信息
- **名字**: ${info.childName}
- **年龄**: ${info.childAge || '未知'}岁
- **性格**: ${info.personality || '活泼可爱'}

## 兴趣爱好
${info.interests?.join('、') || '各种有趣的事物'}

## 最近关注
${info.recentFocus || '正在探索世界'}

## 家长期望
${info.parentExpectations || '快乐成长'}
`;

  // 生成 identity.md
  const identityMd = `# identity.md - AI 身份定义

## 我是谁
- **名字**: 小伴童
- **角色**: ${info.childName}的 AI 好朋友
- **风格**: 温柔姐姐

## 我的特点
- 像温柔的大姐姐
- 说话有趣易懂
- 总是鼓励和支持
- 知道很多有趣的故事和知识

## 我的能力
- 🗣️ 聊天陪伴
- 📚 讲故事
- 🔬 科普知识
- 🎮 互动游戏

## 我的使命
陪伴${info.childName}快乐成长，让每一天都充满好奇和惊喜！
`;

  // 保存到 AsyncStorage
  await AsyncStorage.setItem('@kid_companion_system', systemMd);
  await AsyncStorage.setItem('@kid_companion_user', userMd);
  await AsyncStorage.setItem('@kid_companion_identity', identityMd);
  
  // 同时保存到 wizardService
  await wizardService.saveConfig({
    systemMd,
    userMd,
    identityMd,
    isInitialized: true,
  });
};
```

---

### 2. 修改 aiService.ts

```typescript
// 添加加载三文件的函数
async loadConfigFiles(): Promise<{ system: string; user: string; identity: string }> {
  const systemMd = await AsyncStorage.getItem('@kid_companion_system') || '';
  const userMd = await AsyncStorage.getItem('@kid_companion_user') || '';
  const identityMd = await AsyncStorage.getItem('@kid_companion_identity') || '';
  
  return { system: systemMd, user: userMd, identity: identityMd };
}

// 修改 buildSystemPrompt
private async buildSystemPrompt(persona: any, language: string = 'zh-CN'): Promise<string> {
  // 尝试加载三文件配置
  const configFiles = await this.loadConfigFiles();
  
  if (configFiles.system && configFiles.user && configFiles.identity) {
    // 使用三文件配置
    return `${configFiles.system}

${configFiles.user}

${configFiles.identity}

请始终使用 Markdown 格式回复。`;
  }
  
  // 降级到旧的系统提示词
  return this.buildLegacySystemPrompt(persona, language);
}
```

---

### 3. 修改 WizardScreen 完成逻辑

```typescript
const completeWizard = async (info: CollectedInfo) => {
  try {
    setIsLoading(true);
    
    // 生成三个配置文件
    await generateConfigFiles(info);
    
    // 清除临时数据
    await wizardService.clearTemporaryData();
    
    setIsComplete(true);
    
    // 显示完成消息（添加到对话中）
    addAiMessage(`🎉 配置已完成！
- ✅ system.md 已生成
- ✅ user.md 已生成  
- ✅ identity.md 已生成

现在可以开始和小伴童聊天啦！🚀`);
    
    // 延迟后导航到主界面
    setTimeout(() => {
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainApp' as never }],
      });
    }, 3000);
    
  } catch (error) {
    console.error('完成向导失败:', error);
    Alert.alert('保存配置失败', '无法保存角色配置，请重试');
  } finally {
    setIsLoading(false);
  }
};
```

---

## ✅ 验收标准

### P0 问题修复
- [ ] API 配置后正确导航到 ModelSelectScreen
- [ ] 首次对话不出现"抱歉"提示
- [ ] 引导界面能正常结束

### P1 三文件配置
- [ ] 引导流程 3-4 轮完成
- [ ] 生成 system.md/user.md/identity.md 三个文件
- [ ] 完成后显示明确的完成指令
- [ ] 每次对话加载三个文件到 system message

### P2 功能增强
- [ ] Stream 流式输出（打字机效果）
- [ ] Markdown 渲染支持
- [ ] 对话历史带入（最近 10 条）
- [ ] 自动语音输出

---

## 📦 交付物

1. **源代码** - 修复后的完整代码
2. **APK 文件** - v3.4 版本
3. **三文件模板** - system.md/user.md/identity.md
4. **更新日志** - CHANGELOG_v3.4.md

---

**开始执行修复！** 🚀
