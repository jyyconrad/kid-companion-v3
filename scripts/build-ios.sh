#!/bin/bash
# iOS 本地构建脚本

set -e

echo "🚀 开始 iOS 本地构建..."

# 检查是否安装了 Xcode
if ! command -v xcodebuild &> /dev/null; then
    echo "❌ 错误：Xcode 未安装"
    exit 1
fi

# 检查是否安装了 CocoaPods
if ! command -v pod &> /dev/null; then
    echo "❌ 错误：CocoaPods 未安装"
    echo "请运行：sudo gem install cocoapods"
    exit 1
fi

# 进入项目目录
cd "$(dirname "$0")/.."

# 安装依赖
echo "📦 安装依赖..."
npm install

# 安装 iOS Pods
echo "📱 安装 iOS Pods..."
cd ios
pod install
cd ..

# 构建 iOS 应用
echo "🔨 构建 iOS 应用..."
npx expo run:ios --configuration Release

echo "✅ iOS 构建完成！"
echo "📍 构建产物位置：ios/build/"
