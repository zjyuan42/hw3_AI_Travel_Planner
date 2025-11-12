@echo off
chcp 65001 >nul
echo ============================================
echo    🚀 AI旅行规划器 - 本地构建方案
echo ============================================
echo.

echo [INFO] 检查Docker环境...
docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker未安装，请先安装Docker Desktop
    echo.
    echo 安装步骤：
    echo 1. 访问 https://docker.com 下载Docker Desktop
    echo 2. 安装后重启计算机
    echo 3. 确保Docker Desktop正在运行
    pause
    exit /b 1
)

echo [SUCCESS] Docker环境检查通过
echo.

echo [INFO] 使用本地开发模式启动...
echo [INFO] 这不需要Docker构建，直接运行Node.js服务
echo.

echo [INFO] 检查Node.js环境...
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js未安装，请先安装Node.js 18+
    echo.
    echo 安装步骤：
    echo 1. 访问 https://nodejs.org 下载Node.js 18+
    echo 2. 安装后重启命令行
    pause
    exit /b 1
)

echo [SUCCESS] Node.js环境检查通过
echo.

echo [INFO] 安装后端依赖...
cd backend
if not exist "node_modules" (
    echo [INFO] 正在安装后端依赖包...
    npm install
    if errorlevel 1 (
        echo [ERROR] 后端依赖安装失败
        pause
        exit /b 1
    )
)
echo [SUCCESS] 后端依赖安装完成
echo.

echo [INFO] 安装前端依赖...
cd ..\frontend
if not exist "node_modules" (
    echo [INFO] 正在安装前端依赖包...
    npm install
    if errorlevel 1 (
        echo [ERROR] 前端依赖安装失败
        pause
        exit /b 1
    )
)
echo [SUCCESS] 前端依赖安装完成
echo.

echo [INFO] 创建环境配置文件...
cd ..\backend
if not exist ".env" (
    copy ".env.example" ".env" >nul 2>&1
    echo [INFO] 已创建环境配置文件 .env
    echo [INFO] 请编辑此文件配置API密钥
)

echo.
echo [INFO] 启动开发服务器...
echo [INFO] 后端服务将运行在 http://localhost:5000
echo [INFO] 前端服务将运行在 http://localhost:3000
echo.
echo [WARNING] 请确保配置了正确的API密钥在 backend\.env 文件中
echo.

echo [INFO] 启动后端服务器...
start cmd /k "cd backend && npm run dev"

echo [INFO] 等待后端服务启动...
timeout /t 5 /nobreak >nul

echo [INFO] 启动前端开发服务器...
start cmd /k "cd frontend && npm run dev"

echo ============================================
echo            🎉 开发环境启动完成！
echo ============================================
echo.
echo 📊 服务信息：
echo   前端应用: http://localhost:3000
echo   后端API: http://localhost:5000
echo   健康检查: http://localhost:5000/health
echo.
echo ⚠️  重要提醒：
echo   1. 请编辑 backend\.env 文件配置API密钥
echo   2. 两个命令行窗口将保持打开状态
echo   3. 代码修改会自动重新加载
echo.
echo 📝 下一步：
echo   打开浏览器访问 http://localhost:3000
echo.
echo 🔧 停止服务：
echo   关闭两个命令行窗口即可停止服务
echo.
pause