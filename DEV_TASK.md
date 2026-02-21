# KidCompanion v3.2 重构任务

**项目路径**: `/root/.openclaw/workspace/projects/kid-companion-v3`
**开发计划**: `REFACTOR_PLAN.md`

---

## 🎯 任务目标

1. **删除首页，AI聊天作为主入口**
2. **创建"我的"页面（配置中心）**
3. **首次使用初始化引导**
4.的所有功能使用真实API，移除模拟数据**

---

## 📋 详细任务清单

### 阶段1：导航结构调整
- [ ] 删除首页相关代码
- [ ] 更新导航为2个Tab（聊天、我的）
- [ ] AI聊天作为应用首页

### 阶段2：创建"我的"页面
- [ ] 创建 `MyProfile.tsx`
- [ ] 创建 `ApiConfigScreen.tsx`（API配置）
- [ ] 创建 `ModelSelectScreen.tsx`（模型选择）
- [ ] 创建 `FeatureConfigScreen.tsx`（功能配置）
- [ ] 创建 `PersonaEditScreen.tsx`（AI人设编辑）

### 阶段3：数据持久化
- [ ] 创建 `types/config.ts`
- [ ] 创建 `store/useAppConfig.ts`（Zustand）
- [ ] 创建 `hooks/useInitialization.ts`

### 阶段4：首次使用引导
- [ ] 创建 `WelcomeGuide.tsx`（引导容器）
- [ ] 创建 `GuideStep1.tsx`（欢迎）
- [ ] 创建 `GuideStep2.tsx`（API配置）
- [ ] 创建 `GuideStep3.tsx`（AI人设）
- [ ] 创建 `GuideComplete.tsx`（完成）

### 阶段：真实API集成
- [ ] 创建 `services/aiService.ts`
- [ ] 创建 `services/storyService.ts`
- [ ] 创建 `services/scienceService.ts`
- [ ] 创建 `services/searchService.ts`
- [ ] 修改 `ChatScreen.tsx` 使用真实API

---

## 📁 项目结构

```
src/
├── types/
│   └── config.ts
├── store/
│   └── useAppConfig.ts
├── screens/
│   ├── MyProfile.tsx
│   ├── ApiConfigScreen.tsx
│   ├── ModelSelectScreen.tsx
│   ├── FeatureConfigScreen.tsx
│   ├── PersonaEditScreen.tsx
│   ├── WelcomeGuide.tsx
│   ├── GuideStep1.tsx
│   ├── GuideStep2.tsx
│   ├── GuideStep3.tsx
│   └── GuideComplete.tsx
├── services/
│   ├── aiService.ts
│   ├── storyService.ts
│   ├── scienceService.ts
│   └── searchService.ts
└── hooks/
    └── useInitialization.ts
```

---

## 📝 参考

- PRD: `/root/.openclaw/workspace/PRD.md`
- 开发计划: `REFACTOR_PLAN.md`
