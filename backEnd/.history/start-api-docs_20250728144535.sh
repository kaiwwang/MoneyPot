#!/bin/bash

echo "🚀 股票管理API文档启动脚本"
echo "================================"

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到Node.js，请先安装Node.js"
    echo "下载地址: https://nodejs.org/"
    exit 1
fi

# 检查npm是否安装
if ! command -v npm &> /dev/null; then
    echo "❌ 错误: 未找到npm，请先安装npm"
    exit 1
fi

echo "✅ Node.js版本: $(node --version)"
echo "✅ npm版本: $(npm --version)"

# 检查package.json是否存在
if [ ! -f "package.json" ]; then
    echo "❌ 错误: 未找到package.json文件"
    exit 1
fi

# 检查CSV数据文件是否存在
if [ ! -f "uploaded_files/top5_companies_filtered.csv" ]; then
    echo "❌ 错误: 未找到股票数据文件"
    echo "请确保 uploaded_files/top5_companies_filtered.csv 文件存在"
    exit 1
fi

echo "📦 安装依赖包..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ 依赖安装失败"
    exit 1
fi

echo "✅ 依赖安装完成"

# 检查端口是否被占用
PORT=3000
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  警告: 端口 $PORT 已被占用"
    echo "请关闭占用端口的程序，或修改 config.js 中的 URL_PORT 值"
    read -p "是否继续启动? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "🌐 启动API服务器..."
echo "================================"
echo "📖 API文档地址: http://localhost:$PORT/api-doc/"
echo "🔗 健康检查: http://localhost:$PORT/hello"
echo "📊 测试脚本: node test-stock-api.js"
echo "================================"
echo "按 Ctrl+C 停止服务器"
echo ""

# 启动服务器
npm start 