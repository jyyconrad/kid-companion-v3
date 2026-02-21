# KidCompanion v3.2 重构任务

## 📍 项目位置
`/root/.openclaw/workspace/projects/kid-companion-v3`

## 🎯 核心任务

### 1. 删除首页，AI聊天作为主入口
- 移除当前首页的卡片布局
- 更新底部导航为2个Tab：�（聊天、我的）
- 应用启动直接进入AI聊天界面

### 2. 创建"我的"页面（配置中心）
- API配置：模型供应商URL、Key
- 模型选择：聊天、故事、科普各用的模型
- 网络检索配置：聊天、科普是否启用检索
- 检索分类配置：选择检索源
- 语音配置：聊天是否启用语音转换

### 3. 首次使用初始化引导
- 检测API是否已配置
- 检测AI人设是否已初始化
- 引导流程：API配置 → AI人设初始化
- 后续可在"我的"页面二级菜单修改

### 4. 移除模拟数据，使用真实API
- 聊天：调用真实AI API
- 故事：调用真实AI API
- 科普：调用真实AI API + 网络检索
- 所有功能基于API响应

## 📁 需要创建的文件

### 类型定义
- `src/types/config.ts` - 配置类型

### Store
- `src/store/useAppConfig.ts` - Zustand配置Store + AsyncStorage持久化

### 页面
- `src/screens/MyProfile.tsx` - 我的页面
- `src/screens/ApiConfigScreen.tsx` - API配置
- `src/screens/ModelSelectScreen.tsx` - 模型选择
- `src/screens/FeatureConfigScreen.tsx` - 功能配置
- `src/screens/PersonaEditScreen.tsx` - AI人设编辑
- `src/screens/WelcomeGuide.tsx` - 引导容器
- `src/screens/GuideStep1.tsx` - 欢迎
- `src/screens/GuideStep2.tsx` - API配置引导
- `src/screens/GuideStep3.tsx` - AI人设引导
- `src/screens/GuideComplete.tsx` - 引导完成

### 服务
- `src/services/aiService.ts` - AI服务层
- `src/services/storyService.ts` - 故事服务
- `src/services/scienceService.ts` - 科普服务
- `src/services/searchService.ts` - 网络检索服务

### Hooks
- `src/hooks/useInitialization.ts` - 初始化Hook

## 🔧 技术栈
- React Native + Expo
- TypeScript
- Zustand（状态管理）
- AsyncStorage（持久化）
- expo-router（导航）

## 📚 参考资料
- PRD: `/root/.openclaw/workspace/PRD.md`
- 开发计划: `REFACTOR_PLAN.md`
