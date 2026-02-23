#!/bin/bash
# KidCompanion v3 APK 构建脚本

set -e

echo "🚀 开始构建 KidCompanion v3 APK..."

# 进入项目目录
cd "$(dirname "$0")/.."

# 1. 安装依赖
echo "📦 检查依赖..."
if [ ! -d "node_modules" ]; then
    echo "安装 npm 依赖..."
    npm install
fi

# 2. 预构建检查
echo "🔍 预构建检查..."
if ! command -v java &> /dev/null; then
    echo "❌ 错误：Java 未安装"
    exit 1
fi

if [ -z "$ANDROID_HOME" ]; then
    echo "⚠️  警告：ANDROID_HOME 未设置，使用默认路径"
    export ANDROID_HOME=/root/.android/sdk
fi

# 3. 生成 Android 项目
echo "🤖 生成 Android 项目..."
npx expo prebuild --platform android --clean

# 4. 使用 Gradle 构建 APK
echo "🔨 构建 APK..."
cd android

# 清理之前的构建
./gradlew clean || gradle clean

# 构建 Release APK
./gradlew assembleRelease || gradle assembleRelease

# 5. 复制 APK 到输出目录
echo "📦 复制 APK..."
mkdir -p ../build/outputs/apk
cp -v app/build/outputs/apk/release/*.apk ../build/outputs/apk/ 2>/dev/null || true

echo ""
echo "✅ APK 构建完成！"
echo "📍 APK 位置：build/outputs/apk/"
echo ""

# 显示 APK 信息
if [ -f "../build/outputs/apk/release/app-release.apk" ]; then
    ls -lh ../build/outputs/apk/release/*.apk
    echo ""
    echo "🎉 可以直接安装此 APK 到 Android 设备"
fi
