# KidCompanion v3.1 - OTA 自动更新功能

## 🚀 功能说明

KidCompanion 现已支持 **OTA (Over-The-Air) 自动更新**，用户可以在应用内直接更新，无需重新下载APK文件。

---

## ✅ 已实现功能

### 1. 自动检查更新
- 每5分钟自动检查一次新版本
- 检测到更新后自动下载并应用
- 下载完成后自动重启应用

### 2. 手动检查更新
- 提供了 `useManualUpdate` Hook
- 可以在设置界面添加"检查更新"按钮

### 3. 用户友好提示
- 自动更新：静默下载，无打扰
- 手动更新：提示用户选择

---

## 📁 新增文件

### 组件文件
- `src/components/OTAUpdate.tsx` - OTA更新组件

### 修改文件
- `App.tsx` - 集成OTAUpdate组件
- `app.json` - 配置updates URL
- `eas.json` - 配置preview使用developmentClient

---

## 🔄 更新流程

### 开发者发布更新
```bash
# 1. 提交代码更改
git add .
git commit -m "feat: 新功能"

# 2. 发布OTA更新（只需~30秒）
cd /root/.openclaw/workspace/projects/kid-companion-v3
npx eas update --branch production --message "新功能更新"

# 3. 用户会自动收到更新！
```

### 用户端体验
1. 应用每5分钟自动检查更新
2. 发现新版本后自动下载（后台）
3. 下载完成后自动重启应用
4. 重启后应用已是最新版本

---

## 🎯 使用场景

### 场景1：Bug修复
```bash
# 修复Bug后，只需发布OTA更新
npx eas update --branch production --message "修复闪退问题"

# 几十秒内，所有用户自动获得修复
```

### 场景2：UI优化
```bash
# 更新Logo或样式
npx eas update --branch production --message "更新应用Logo"

# 用户自动获得新Logo
```

### 场景3：功能更新
```bash
# 添加新功能
npx eas update --branch production --message "添加新功能"

# 用户自动获得新功能
```

---

## ⚠️ 重要说明

### OTA更新的限制

✅ **OTA可以更新**：
- JavaScript/TypeScript代码
- 静态资源（图片、字体等）
- 配置文件（app.json部分）

❌ **OTA不能更新**：
- AndroidManifest.xml
- iOS Info.plist
- 原生依赖（添加新的React Native库）
- 应用图标（需要重新构建APK）

### 何时需要重新构建APK？

如果需要：
- 添加新的原生依赖
- 更改应用权限
- 更改应用图标或启动屏
- 更改包名或版本号

则需要重新构建APK：
```bash
npx eas build --platform android --profile production
```

---

## 📊 优势对比

| 方式 | 更新时间 | 用户操作 | 适用场景 |
|------|---------|---------|---------|
| **OTA更新** | ~30秒 | 自动 | Bug修复、UI调整、功能更新 |
| **重新构建APK** | ~30分钟 | 需重新安装 | 原生依赖更新、权限变更 |

---

## 🔧 配置说明

### app.json 配置
```json
{
  "expo": {
    "updates": {
      "url": "https://u.expo.dev/6a820012-a4e6-46de-b580-fd84d252f379"
    }
  }
}
```

### eas.json 配置
```json
{
  "build": {
    "preview": {
      "developmentClient": true  // 必须启用
    }
  }
}
```

---

## 🚦 更新策略

### 生产环境（推荐）
```bash
# 发布到production分支
npx eas update --branch production --message "修复问题"
```

### 预览环境
```bash
# 发布到preview分支（测试用）
npx eas update --branch preview --message "测试更新"
```

### 指定运行时版本
```bash
# 只更新特定版本的运行时
npx eas update --runtime-version 1.0.0 --message "仅更新1.0.0版本"
```

---

## 📱 用户端示例代码

### 在设置页面添加"检查更新"按钮
```tsx
import { useManualUpdate } from '../components/OTAUpdate';

function SettingsScreen() {
  const { isChecking, isUpdateAvailable, check, apply } = useManualUpdate();

  const handleCheckUpdate = async () => {
    const available = await check();
    if (available) {
      Alert.alert(
        '发现新版本',
        '应用有新版本可用，是否立即更新？',
        [
          { text: '取消' },
          { text: '更新', onPress: apply }
        ]
      );
    } else {
      Alert.alert('已是最新版本', '当前应用已是最新版本');
    }
  };

  return (
    <Button
      title={isChecking ? '检查中...' : '检查更新'}
      onPress={handleCheckUpdate}
      disabled={isChecking}
    />
  );
}
```

---

## 🎉 总结

OTA更新功能已集成到KidCompanion v3.1，可以：
- ✅ 快速发布更新（~30秒）
- ✅ 用户无需下载APK
- ✅ 自动应用更新
- ✅ 支持手动检查

从现在开始，大部分更新都可以通过OTA完成，无需重新构建APK！
