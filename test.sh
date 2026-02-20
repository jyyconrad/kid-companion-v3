#!/bin/bash

echo "🚀 启动 KidCompanion v3.1 开发服务器..."
cd /root/.openclaw/workspace/projects/kid-companion-v3

# 检查依赖是否完整
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    npm install
fi

# 运行 TypeScript 类型检查
echo "🔍 检查 TypeScript 类型..."
npx tsc --noEmit

# 检查是否有错误
if [ $? -ne 0 ]; then
    echo "❌ TypeScript 类型检查失败"
    exit 1
fi

echo "✅ 类型检查通过"

# 启动开发服务器（后台运行）
echo "🌟 启动开发服务器..."
npm run start -- --no-dev --clear > expo.log 2>&1 &
EXPO_PID=$!

# 等待服务器启动
echo "⏳ 等待服务器启动..."
sleep 30

# 检查服务器是否正常运行
if pgrep -x "expo" > /dev/null; then
    echo "✅ 开发服务器启动成功"
    echo "📱 可以通过以下方式访问："
    echo "   - iOS Simulator: npm run ios"
    echo "   - Android: npm run android"
    echo "   - Web: npm run web"
else
    echo "❌ 开发服务器启动失败"
    cat expo.log
    exit 1
fi

# 保存 PID 到文件
echo $EXPO_PID > expo.pid
echo "📄 服务器 PID 已保存到 expo.pid"
