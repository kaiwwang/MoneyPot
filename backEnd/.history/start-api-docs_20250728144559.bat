@echo off
chcp 65001 >nul
echo 🚀 股票管理API文档启动脚本
echo ================================

REM 检查Node.js是否安装
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 错误: 未找到Node.js，请先安装Node.js
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)

REM 检查npm是否安装
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 错误: 未找到npm，请先安装npm
    pause
    exit /b 1
)

echo ✅ Node.js版本: 
node --version
echo ✅ npm版本: 
npm --version

REM 检查package.json是否存在
if not exist "package.json" (
    echo ❌ 错误: 未找到package.json文件
    pause
    exit /b 1
)

REM 检查CSV数据文件是否存在
if not exist "uploaded_files\top5_companies_filtered.csv" (
    echo ❌ 错误: 未找到股票数据文件
    echo 请确保 uploaded_files\top5_companies_filtered.csv 文件存在
    pause
    exit /b 1
)

echo 📦 安装依赖包...
npm install

if %errorlevel% neq 0 (
    echo ❌ 依赖安装失败
    pause
    exit /b 1
)

echo ✅ 依赖安装完成

echo 🌐 启动API服务器...
echo ================================
echo 📖 API文档地址: http://localhost:3000/api-doc/
echo 🔗 健康检查: http://localhost:3000/hello
echo 📊 测试脚本: node test-stock-api.js
echo ================================
echo 按 Ctrl+C 停止服务器
echo.

REM 启动服务器
npm start 