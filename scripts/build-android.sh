#!/bin/bash
# Android 本地构建脚本

set -e

echo "🚀 开始 Android 本地构建..."

# 检查是否安装了 Java
if ! command -v java &> /dev/null; then
    echo "❌ 错误：Java 未安装"
    exit 1
fi

# 检查是否设置了 ANDROID_HOME
if [ -z "$ANDROID_HOME" ]; then
    echo "⚠️  警告：ANDROID_HOME 未设置"
    echo "请设置 Android SDK 路径"
fi

# 进入项目目录
cd "$(dirname "$0")/.."

# 安装依赖
echo "📦 安装依赖..."
npm install

# 构建 Android 应用
echo "🤖 构建 Android 应用..."
npx expo run:android --variant release

echo "✅ Android 构建完成！"
echo "📍 构建产物位置：android/app/build/outputs/apk/"
