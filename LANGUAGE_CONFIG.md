# 语言配置指南

## 概述
Kid Companion v3 支持多语言配置，默认语言为中文（zh-CN）。此功能允许用户自定义应用界面语言。

## 配置结构
应用配置新增了一个 `language` 字段：

```typescript
interface AppConfig {
  // ... 其他字段
  language: string;  // 例如: 'zh-CN', 'en-US'
  // ... 其他字段
}
```

## 支持的语言
- `zh-CN`: 简体中文（默认）
- `en-US`: 美式英语
- 其他标准语言代码

## 如何切换语言
使用以下方法可以切换应用语言：

```typescript
import { changeLanguage } from './src/services/languageSetup';

// 切换到英语
await changeLanguage('en-US');

// 切换回中文
await changeLanguage('zh-CN');
```

## 已支持语言化的组件
- 语音识别（语音转文字）：自动使用配置的语言
- 文本转语音（TTS）：故事播放功能
- 时间显示格式化：消息时间戳和日期显示
- AI 交互：AI 回复提示词语言

## 自动初始化
应用启动时会自动初始化语言配置，若无配置则默认设置为中文。

## 注意事项
- 更改语言后，部分 UI 组件可能需要重新渲染才能显示新语言
- 某些内容（如故事、知识卡片标题）的语言由 AI 决定，取决于系统提示词
- 用户交互内容仍需通过 AI 模型响应来实现语言控制