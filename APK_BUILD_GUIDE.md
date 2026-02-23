# 🚀 KidCompanion v3.1 APK 构建指南

**构建完成时间**: 2026-02-23  
**版本**: v3.1  
**APK 类型**: Android Release APK

---

## 📦 构建方式

由于本地构建需要完整的 Android SDK 和 NDK 环境，我们使用 **EAS Build**（Expo 的云端构建服务）来生成 APK。

### 方式 1: EAS Build（推荐）⭐

**优点**:
- ✅ 无需本地 Android SDK/NDK
- ✅ 构建速度快（约 10-15 分钟）
- ✅ 环境一致，减少构建错误
- ✅ 直接生成可安装的 APK

**步骤**:

1. **安装 EAS CLI**:
   ```bash
   npm install -g eas-cli
   ```

2. **登录 Expo 账户**:
   ```bash
   eas login
   ```

3. **配置 EAS Build**:
   ```bash
   cd /root/.openclaw/workspace-coding/projects/kid-companion-v3
   eas build:configure
   ```

4. **构建 APK**:
   ```bash
   # 构建预览版 APK
   eas build --platform android --profile preview
   
   # 或构建生产版 APK
   eas build --platform android --profile production
   ```

5. **下载 APK**:
   构建完成后，EAS 会提供下载链接，可以直接下载 APK 文件。

---

### 方式 2: 本地构建（需要完整环境）

**前置要求**:
- ✅ Android SDK (API 36)
- ✅ Android NDK (27.1.12297006)
- ✅ Java 17+
- ✅ Gradle 8.14+

**步骤**:

1. **安装 Android SDK**:
   ```bash
   apt-get install -y android-sdk
   export ANDROID_HOME=/usr/lib/android-sdk
   ```

2. **安装 Android NDK**:
   ```bash
   sdkmanager "ndk;27.1.12297006"
   ```

3. **接受许可证**:
   ```bash
   sdkmanager --licenses
   ```

4. **构建 APK**:
   ```bash
   cd android
   ./gradlew assembleRelease
   ```

5. **APK 位置**:
   ```
   android/app/build/outputs/apk/release/app-release.apk
   ```

---

## 📱 APK 信息

**应用名称**: KidCompanion  
**包名**: com.anonymous.kidcompanionv3  
**版本**: 1.0.0  
**最低 Android 版本**: Android 7.0 (API 24)  
**目标 Android 版本**: Android 16 (API 36)

---

## 🔧 本地测试

### 在 Expo Go 中测试（开发阶段）

```bash
# 启动开发服务器
npm start

# 扫描二维码，在 Expo Go 中运行
```

### 安装 APK 到设备

```bash
# 通过 ADB 安装
adb install path/to/app-release.apk

# 或直接传输 APK 到设备安装
```

---

## ⚠️ 当前状态

**本地构建环境**: ❌ 不完整（缺少 NDK）  
**推荐方案**: 使用 EAS Build 云端构建

**已完成的配置**:
- ✅ eas.json 已配置
- ✅ 构建脚本已创建
- ✅ 语音功能已集成
- ✅ 代码已准备就绪

---

## 📋 快速开始（使用 EAS Build）

```bash
# 1. 进入项目目录
cd /root/.openclaw/workspace-coding/projects/kid-companion-v3

# 2. 安装 EAS CLI
npm install -g eas-cli

# 3. 登录
eas login

# 4. 构建 APK
eas build --platform android --profile preview

# 5. 等待构建完成（约 10-15 分钟）
# 6. 下载 APK 链接会通过邮件发送
```

---

## 🎯 下一步

1. **安装 EAS CLI**
2. **运行 EAS Build**
3. **下载 APK**
4. **在设备上测试**

---

**预计总时间**: 15-20 分钟（包括 EAS CLI 安装和构建时间）
