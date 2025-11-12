@echo off
echo ========================================
echo    AI旅行规划器 - Docker镜像构建脚本
echo ========================================
echo.

REM 检查Docker是否安装
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 错误: 未找到Docker，请先安装Docker Desktop
    echo 请参考 DOCKER_BUILD_GUIDE.md 文件安装Docker
    pause
    exit /b 1
)

echo ✅ Docker已安装
echo.

REM 检查Node.js是否安装（用于前端构建）
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 错误: 未找到Node.js，请先安装Node.js
    echo 请参考 NODEJS_INSTALL_GUIDE.md 文件安装Node.js
    pause
    exit /b 1
)

echo ✅ Node.js已安装
echo.

REM 创建生产环境配置文件
if not exist .env (
    echo 📝 创建环境配置文件...
    copy backend\.env.example .env >nul
    echo ✅ 已创建 .env 文件，请根据需要修改配置
)

echo 🏗️  开始构建Docker镜像...
echo.

REM 构建前端（需要Node.js环境）
echo 📦 构建前端应用...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo ❌ 前端依赖安装失败
    pause
    exit /b 1
)

call npm run build
if %errorlevel% neq 0 (
    echo ❌ 前端构建失败
    pause
    exit /b 1
)
cd ..

echo ✅ 前端构建完成
echo.

REM 构建Docker镜像
echo 🐳 构建Docker镜像...
docker build -t ai-travel-planner:latest .

if %errorlevel% neq 0 (
    echo ❌ Docker镜像构建失败
    pause
    exit /b 1
)

echo ✅ Docker镜像构建成功！
echo.

REM 显示构建结果
echo 📊 构建结果：
docker images ai-travel-planner:latest

echo.
echo 🚀 运行以下命令启动容器：
echo docker run -d -p 5000:5000 --name travel-planner ai-travel-planner:latest
echo.
echo 🌐 访问地址：http://localhost:5000
echo.

REM 可选：使用docker-compose启动
echo 📋 或者使用docker-compose启动所有服务：
echo docker-compose up -d
echo.

pause