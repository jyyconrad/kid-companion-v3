# KidCompanion v3.2 重构开发计划

**版本**: v3.2.0
**创建日期**: 2026-02-20
**开发模式**: SubAgent + Claude Code

---

## 📋 已完成的功能（v3.1）

1. ✅ React版本冲突修复（统一为19.1.0）
2. ✅ Logo生成并替换（使用FLUX.1-schnell生成）
3. ✅ OTA自动更新功能集成
4. ✅ 修复版APK已下载：http://14.103.212.209/apk/kid-companion-v3-fixed-react.apk

---

## 🎯 v3.2 开发目标

### 核心改进

1. **删除首页，AI聊天作为主入口**
   - 移除当前首页的卡片布局
   - 应用启动直接进入AI聊天界面

2. **创建"我的"页面（配置中心）**
   - API配置：大模型供应商URL、Key
   - 模型选择：聊天、故事、科普各用的模型
   - 网络检索配置：聊天、科普是否启用检索
   - 检索分类配置：选择检索源
   - 语音配置：聊天是否启用语音转换

3. **首次使用初始化引导**
   - 检测是否已配置API
   - 检测是否已完成AI人设初始化
   - 引导流程：API配置 → AI人设初始化
   - 后续可在"我的"页面二级菜单修改

4. **移除所有模拟数据，使用真实数据**
   - 聊天功能：调用真实AI API
   - 故事生成：调用真实AI API
   - 科普问答：调用真实AI API + 网络检索
   - 所有功能基于API响应，无硬编码数据

---

## 🏗️ 开发阶段

### 阶段1：架构重构（2-3小时）

#### 1.1 导航结构调整

**当前结构**：
```
底部导航：💬 聊天 | 🏠 首页 | ⚙️ 设置
```

**目标结构**：
```
底部导航：💬 聊天（主入口） | ⚙️ 我的
```

**任务**：
- [ ] 删除首页相关代码
- [ ] 更新导航配置（只保留2个Tab）
- [ ] AI聊天作为首页启动

#### 1.2 创建"我的"页面

**页面结构**：
```
我的页面
├─ 个人信息（可选）
│   └─ 头像、昵称、AI角色名称
├─ 配置中心
│   ├─ API配置
│   │   ├─ 模型供应商URL
│   │   └─ API Key
│   ├─ 模型设置
│   │   ├─ 聊天模型选择
│   │   ├─ 故事模型选择
│   │   └─ 科普模型选择
│   ├─ 功能配置
│   │   ├─ 网络检索
│   │   │   ├─ 聊天检索（开关）
│   │   │   ├─ 科普检索（开关）
│   │   │   └─ 检索分类（多选）
│   │   └─ 语音设置
│   │       └─ 聊天语音转换（开关）
├─ AI人设
│   └─ 编辑AI角色（二级页面）
└─ 其他
    ├─ 聊天历史
    ├─ 清除数据
    └─ 关于
```

**任务**：
- [ ] 创建 `MyProfile.tsx` 页面
- [ ] 实现配置项列表UI
- [ ] 每个配置项跳转到对应设置页面

#### 1.3 创建配置页面

**API配置页面** (`ApiConfigScreen.tsx`):
- [ ] 输入框：模型供应商URL
- [ ] 输入框：API Key（密码类型）
- [ ] 测试连接按钮
- [ ] 保存按钮

**模型选择页面** (`ModelSelectScreen.tsx`):
- [ ] 聊天模型下拉选择
- [ ] 故事模型下拉选择
- [ ] 科普模型下拉选择
- [ ] 保存按钮

**功能配置页面** (`FeatureConfigScreen.tsx`):
- [ ] 网络检索开关（聊天、科普）
- [ ] 检索分类多选（DuckDuckGo等）
- [ ] 语音转换开关
- [ ] 保存按钮

**AI人设编辑页面** (`PersonaEditScreen.tsx`):
- [ ] AI名字编辑
- [ ] 聊天方式选择
- [ ] 兴趣爱好多选
- [ ] 年龄适配设置
- [ ] 保存并重新生成ROLE.md

### 阶段2：数据持久化（1-2小时）

#### 2.1 配置数据结构

```typescript
interface AppConfig {
  // API配置
  apiUrl: string;
  apiKey: string;

  // 模型配置
  models: {
    chat: string;
    story: string;
    science: string;
  };

  // 功能配置
  features: {
    chat: {
      useSearch: boolean;
      enableVoice: boolean;
      searchCategories: string[];
    };
    science: {
      useSearch: boolean;
      searchCategories: string[];
    };
  };

  // AI人设
  persona: {
    aiName: string;
    chatStyle: string;
    interests: string[];
    childAge: number;
    isInitialized: boolean;
  };
}
```

**任务**：
- [ ] 创建 `types/config.ts` 定义配置类型
- [ ] 创建 `store/useAppConfig.ts` (Zustand)
- [ ] 实现持久化到AsyncStorage

#### 2.2 初始化状态管理

**任务**：
- [ ] 创建 `useInitialization` Hook
- [ ] 检测API是否已配置
- [ ] 检测AI人设是否已初始化
- [ ] 返回初始化状态和引导页路由

### 阶段3：首次使用引导（1-2小时）

#### 3.1 引导页面流程

**引导页面结构**：
```
引导流程（3步）

步骤1：欢迎页
├─ 标题：欢迎使用 KidCompanion
├─ 说明：让我们先配置一下
└─ 按钮：开始配置

步骤2：API配置
├─ 输入：模型供应商URL
├─ 输入：API Key
├─ 测试连接按钮
└─ 下一步按钮

步骤3：AI人设初始化
├─ 输入：AI名字
├─ 选择：聊天方式
├─ 选择：兴趣爱好
├─ 输入：孩子年龄
└─ 完成按钮

完成页：
├─ 标题：配置完成！
├─ 说明：开始和AI聊天吧
└─ 按钮：开始聊天
```

**任务**：
- [ ] 创建 `WelcomeGuide.tsx`（引导容器）
- [ ] 创建 `GuideStep1.tsx`（欢迎）
- [ ] 创建 `GuideStep2.tsx`（API配置）
- [ ] 创建 `GuideStep3.tsx`（AI人设）
- [ ] 创建 `GuideComplete.tsx`（完成）

#### 3.2 引导逻辑集成

**任务**：
- [ ] 在App.tsx集成初始化检查
- [ ] 首次启动显示引导流程
- [ ] 非首次启动直接进入聊天
- [ ] 完成引导后保存配置

### 阶段4：真实API集成（2-3小时）

#### 4.1 AI服务层重构

**任务**：
- [ ] 创建 `services/aiService.ts`
- [ ] 实现统一的API调用函数
- [ ] 支持流式响应
- [ ] 错误处理和重试逻辑

#### 4.2 聊天功能（真实API）

**任务**：
- [ ] 修改 `ChatScreen.tsx`，移除模拟数据
- [ ] 集成AI服务，发送真实请求
- [ ] 实现网络检索（如果配置启用）
- [ ] 保存聊天历史到本地

#### 4.3 故事生成（真实API）

**任务**：
- [ ] 创建 `StoryService.ts`
- [ ] 实现Story Skill触发逻辑
- [ ] 调用AI生成故事内容
- [ ] 保存故事到本地

#### 4.4 科普问答（真实API + 检索）

**任务**：
- [ ] 创建 `ScienceService.ts`
- [ ] 实现网络检索功能（DuckDuckGo）
- [ ] 调用AI回答科学问题
- [ ] 检索结果作为AI上下文

#### 4.5 网络检索服务

**任务**：
- [ ] 创建 `services/searchService.ts`
- [ ] 实现DuckDuckGo搜索
- [ ] 实现搜索结果解析
- [ ] 支持多检索源（可扩展）

### 阶段5：测试与优化（1-2小时）

#### 5.1 功能测试

**测试清单**：
- [ ] 首次启动显示引导流程
- [ ] API配置测试连接成功
- [ ] AI人设初始化完成
- [ ] 聊天功能发送消息并收到回复
- [ ] 故事生成触发成功
- [ ] 科普问答返回真实答案
- [ ] 网络检索结果正确
- [ ] "我的"页面所有配置项可编辑
- [ ] 配置保存后下次启动生效

#### 5.2 UI/UX优化

**任务**：
- [ ] 引导流程动画优化
- [ ] 配置页面输入验证
- [ ] 加载状态提示
- [ ] 错误提示优化
- [ ] 语音输入测试

---

## 📦 交付物

### 代码文件

```
src/
├── types/
│   └── config.ts           # 配置类型定义
├── store/
│   └── useAppConfig.ts    # Zustand配置Store
├── screens/
│   ├── MyProfile.tsx       # 我的页面
│   ├── ApiConfigScreen.tsx # API配置页面
│   ├── ModelSelectScreen.tsx # 模型选择页面
│   ├── FeatureConfigScreen.tsx # 功能配置页面
│   ├── PersonaEditScreen.tsx # AI人设编辑页面
│   ├── WelcomeGuide.tsx   # 引导容器
│   ├── GuideStep1.tsx      # 引导步骤1：欢迎
│   ├── GuideStep2.tsx      # 引导步骤2：API配置
│   ├── GuideStep3.tsx      # 引导步骤3：AI人设
│   └── GuideComplete.tsx   # 引导完成
├── services/
│   ├── aiService.ts        # AI服务层
│   ├── storyService.ts     # 故事服务
│   ├── scienceService.ts    # 科普服务
│   └── searchService.ts    # 网络检索服务
├── navigation/
│   └── AppNavigator.tsx    # 更新导航（2个Tab）
├── hooks/
│   └── useInitialization.ts # 初始化Hook
└── components/
    └── OTAUpdate.tsx        # OTA更新（已有）
```

### 文档

- [ ] `REFACTOR_REPORT.md` - 重构完成报告
- [ ] `UPDATE_GUIDE.md` - v3.2更新说明
- [ ] `API_CONFIG_GUIDE.md` - API配置指南

---

## 🚀 开发步骤（Claude Code）

### Step 1: 初始化
```bash
cd /root/.openclaw/workspace/projects/kid-companion-v3
```

### Step 2: 创建任务文档
- 已完成：`REFACTOR_PLAN.md`

### Step 3: 开始重构
- 按阶段顺序执行
- 每个阶段完成后提交代码

### Step 4: 测试
- 首次启动流程测试
- 所有功能端到端测试

### Step 5: 构建
- 构建支持OTA的APK
- 发布OTA更新

---

## ⏱️ 预估时间

- 阶段1：架构重构（2-3小时）
- 阶段2：数据持久化（1-2小时）
- 阶段3：首次使用引导（1-2小时）
- 阶段4：真实API集成（2-3小时）
- 阶段5：测试与优化（1-2小时）

**总计**: 7-12小时

---

**文档结束**
