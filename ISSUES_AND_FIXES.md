# KidCompanion v3.3 问题清单和修复建议

**创建时间**: 2026-02-23 11:20  
**优先级**: 高  
**任务**: 端到端初始化流程修复

---

## 🐛 问题清单

### 问题 1: API 配置没有正确应用到 WizardScreen ⚠️ 严重

**现象**:
- 用户在 ApiConfigScreen 配置 API URL 和 Key
- 点击"保存并继续"后进入 WizardScreen
- WizardScreen 中 AI 调用失败，提示"抱歉，我暂时无法回复"

**根本原因**:
1. `ApiConfigScreen` 中调用 `config.updateConfig()` 和 `config.saveConfig()`
2. 但 `useAppConfig` 是 Zustand store，`updateConfig` 只更新内存，可能没有同步到异步存储
3. `WizardScreen` 中的 `aiService.sendMessage()` 调用 `useAppConfig.getState()` 获取配置
4. 由于配置没有正确保存/同步，导致获取到的 `apiKey` 为空

**修复方案**:
```typescript
// ApiConfigScreen.tsx
const handleSave = () => {
  if (!apiUrl || !apiKey) {
    Alert.alert('提示', '请填写 API URL 和 Key');
    return;
  }

  // 1. 同步更新 store
  config.updateConfig({ apiUrl, apiKey });
  
  // 2. 异步保存到 AsyncStorage
  config.saveConfig().then(() => {
    // 3. 确保保存完成后再导航
    Alert.alert(
      '保存成功',
      'API 配置已保存，接下来让我们为孩子创建一个个性化的 AI 伙伴吧！',
      [
        {
          text: '下一步',
          onPress: () => {
            // 延迟一点确保 store 已更新
            setTimeout(() => {
              navigation.navigate('WizardScreen' as never);
            }, 100);
          }
        }
      ]
    );
  });
};
```

---

### 问题 2: 缺少模型选择界面 ⚠️ 严重

**现象**:
- API 配置完成后直接进入角色引导
- 用户无法选择每个场景使用的模型
- 之前已有的 ModelSelectScreen 没有被使用

**期望流程**:
```
ApiConfigScreen (配置 API)
    ↓
ModelSelectScreen (选择模型) ← 缺失！
    ↓
WizardScreen (角色引导)
    ↓
主界面
```

**修复方案**:

1. **修改 SetupStack**:
```typescript
const SetupStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ApiConfigScreen" component={ApiConfigScreen} />
      <Stack.Screen name="ModelSelectScreen" component={ModelSelectScreen} />
      <Stack.Screen name="WizardScreen" component={WizardScreen} />
    </Stack.Navigator>
  );
};
```

2. **修改 ApiConfigScreen 导航**:
```typescript
// 保存后导航到模型选择
navigation.navigate('ModelSelectScreen' as never);
```

3. **修改 ModelSelectScreen**:
- 添加 `/models` API 调用获取可用模型列表
- 让用户选择每个场景的模型（聊天、故事、科学）
- 保存后导航到 WizardScreen

---

### 问题 3: ModelSelectScreen 可能没有实现模型获取功能 ⚠️ 中等

**检查项**:
- 是否实现了调用 `/models` API 获取模型列表
- 是否允许用户为不同场景选择模型
- 是否正确保存模型配置

**修复方案**:
```typescript
// ModelSelectScreen.tsx
const [availableModels, setAvailableModels] = useState<string[]>([]);
const [selectedModels, setSelectedModels] = useState({
  chat: '',
  story: '',
  science: '',
});

// 获取模型列表
const fetchModels = async () => {
  try {
    const response = await fetch(`${apiUrl}/models`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });
    const data = await response.json();
    // 解析模型列表
    const models = data.data.map((m: any) => m.id);
    setAvailableModels(models);
  } catch (error) {
    console.error('获取模型列表失败:', error);
  }
};

// 保存模型配置
const handleSave = () => {
  config.updateConfig({ models: selectedModels });
  config.saveConfig();
  navigation.navigate('WizardScreen' as never);
};
```

---

### 问题 4: WizardScreen 完成后导航逻辑错误 ⚠️ 中等

**当前代码**:
```typescript
navigation.reset({
  index: 0,
  routes: [{ name: 'SetupStack' as never }],
});
```

**问题**: 这会重新进入 SetupStack，而不是主界面

**修复方案**:
```typescript
// 方法 1: 使用深度链接或事件
navigation.reset({
  index: 0,
  routes: [{ name: 'Main' as never }], // 假设有 Main 路由
});

// 方法 2: 触发配置检查更新
// 在 AppNavigator 中添加刷新机制
```

---

## 📋 修复任务清单

### 任务 1: 修复 API 配置保存和同步 ⭐ 最高优先级

**文件**: `src/screens/ApiConfigScreen.tsx`

**要求**:
- [ ] 确保 `config.saveConfig()` 完成后再导航
- [ ] 添加延迟或 Promise 链确保 store 已更新
- [ ] 测试：配置保存后，在 WizardScreen 中调用 `useAppConfig.getState()` 验证配置存在

---

### 任务 2: 添加模型选择界面 ⭐ 最高优先级

**文件**: 
- `src/navigation/AppNavigator.tsx`
- `src/screens/ModelSelectScreen.tsx`
- `src/screens/ApiConfigScreen.tsx`

**要求**:
- [ ] 在 SetupStack 中添加 ModelSelectScreen
- [ ] 修改 ApiConfigScreen 导航到 ModelSelectScreen
- [ ] 实现 ModelSelectScreen 的模型获取功能（调用 `/models` API）
- [ ] 实现模型选择 UI（聊天、故事、科学三个场景）
- [ ] 保存模型配置后导航到 WizardScreen

---

### 任务 3: 修复 WizardScreen 完成导航 ⭐ 中等优先级

**文件**: `src/screens/WizardScreen.tsx`

**要求**:
- [ ] 修复完成后的导航逻辑
- [ ] 确保导航到主界面而不是 SetupStack
- [ ] 测试：完成后能正常进入聊天界面

---

### 任务 4: 端到端测试 ⭐ 必须

**测试流程**:
1. [ ] 卸载旧版本
2. [ ] 安装新版本
3. [ ] 验证 API 配置界面显示
4. [ ] 填写 API URL 和 Key
5. [ ] 点击"保存并继续"
6. [ ] 验证进入模型选择界面
7. [ ] 获取模型列表（调用 `/models`）
8. [ ] 选择聊天、故事、科学模型
9. [ ] 保存模型配置
10. [ ] 验证进入角色引导界面
11. [ ] 输入孩子姓名，验证 AI 能正常回复
12. [ ] 完成角色引导
13. [ ] 验证进入主界面
14. [ ] 测试聊天功能

---

## 🔧 技术细节

### Zustand Store 同步问题

**问题**: `updateConfig` 是同步的，但 `saveConfig` 是异步的

**解决方案**:
```typescript
// 确保异步操作完成
await config.saveConfig();
// 或者使用 Promise 链
config.saveConfig().then(() => {
  // 导航
});
```

### 模型 API 调用

**端点**: `{apiUrl}/models`

**请求头**:
```
Authorization: Bearer {apiKey}
```

**响应格式** (硅基流动):
```json
{
  "data": [
    {"id": "deepseek-ai/DeepSeek-V3"},
    {"id": "Qwen/Qwen2.5-72B-Instruct"},
    ...
  ]
}
```

### 配置结构

```typescript
interface AppConfig {
  apiUrl: string;
  apiKey: string;
  models: {
    chat: string;
    story: string;
    science: string;
  };
  persona: {
    aiName: string;
    chatStyle: string;
    // ...
    isInitialized: boolean;
  };
}
```

---

## 📝 验收标准

### API 配置
- [ ] 能正确保存 API URL 和 Key
- [ ] 保存后配置能传递到后续界面
- [ ] 在 WizardScreen 中 AI 调用成功

### 模型选择
- [ ] 能获取可用模型列表
- [ ] 用户能为三个场景选择模型
- [ ] 模型配置能正确保存

### 角色引导
- [ ] AI 能正常回复消息
- [ ] 能收集孩子信息
- [ ] 能生成角色配置

### 导航流程
- [ ] API 配置 → 模型选择 → 角色引导 → 主界面
- [ ] 每一步都能正确导航
- [ ] 完成后能进入主界面

---

**请 Claude Code 按照以上清单逐项修复，并在每项完成后进行验证！**
