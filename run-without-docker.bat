@echo off
chcp 65001 >nul
echo ============================================
echo    🚀 AI旅行规划器 - 无Docker运行方案
echo ============================================
echo.

echo [INFO] 检查Node.js环境...
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js未安装，请先安装Node.js 18+
    echo.
    echo 安装步骤：
    echo 1. 访问 https://nodejs.org 下载Node.js 18+
    echo 2. 运行安装程序，选择"Add to PATH"选项
    echo 3. 安装后重启命令行窗口
    echo.
    echo 下载链接: https://nodejs.org/dist/v18.20.4/node-v18.20.4-x64.msi
    pause
    exit /b 1
)

for /f "tokens=1 delims=v" %%i in ('node --version') do set NODE_VERSION=%%i
echo [SUCCESS] Node.js版本: !NODE_VERSION!
echo.

echo [INFO] 检查npm环境...
npm --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] npm未正确安装，请重新安装Node.js
    pause
    exit /b 1
)

echo [SUCCESS] npm环境检查通过
echo.

echo [INFO] 安装后端依赖...
cd backend
if not exist "node_modules" (
    echo [INFO] 正在安装后端依赖包...
    npm install
    if errorlevel 1 (
        echo [ERROR] 后端依赖安装失败
        echo 请检查网络连接或使用淘宝镜像: npm config set registry https://registry.npmmirror.com
        pause
        exit /b 1
    )
) else (
    echo [INFO] 后端依赖已存在，跳过安装
)
echo [SUCCESS] 后端依赖就绪
echo.

echo [INFO] 安装前端依赖...
cd ..\frontend
if not exist "node_modules" (
    echo [INFO] 正在安装前端依赖包...
    npm install
    if errorlevel 1 (
        echo [ERROR] 前端依赖安装失败
        echo 请检查网络连接或使用淘宝镜像: npm config set registry https://registry.npmmirror.com
        pause
        exit /b 1
    )
) else (
    echo [INFO] 前端依赖已存在，跳过安装
)
echo [SUCCESS] 前端依赖就绪
echo.

echo [INFO] 创建环境配置文件...
cd ..\backend
if not exist ".env" (
    copy ".env.example" ".env" >nul 2>&1
    echo [INFO] 已创建环境配置文件 backend\.env
    echo [INFO] 请编辑此文件配置API密钥
) else (
    echo [INFO] 环境配置文件已存在: backend\.env
)

echo.
echo [INFO] 构建前端生产版本...
cd ..\frontend
echo [INFO] 正在构建前端...
npm run build
if errorlevel 1 (
    echo [WARNING] 前端构建失败，将使用开发模式运行
    set DEV_MODE=1
) else (
    echo [SUCCESS] 前端构建成功
    set DEV_MODE=0
)

echo.
echo ============================================
echo            🎉 环境准备完成！
echo ============================================
echo.

if !DEV_MODE!==1 (
    echo [INFO] 启动开发模式...
    echo [INFO] 将打开两个命令行窗口分别运行前后端
    echo.
    echo [INFO] 启动后端服务器 (端口 5000)...
    start cmd /k "cd backend && npm run dev"
    timeout /t 3 /nobreak >nul
    echo [INFO] 启动前端开发服务器 (端口 3000)...
    start cmd /k "cd frontend && npm run dev"
    echo.
    echo 📊 开发模式访问地址：
    echo   前端应用: http://localhost:3000
    echo   后端API: http://localhost:5000
) else (
    echo [INFO] 启动生产模式...
    echo [INFO] 后端服务运行在 http://localhost:5000
    echo [INFO] 前端静态文件由后端服务提供
    echo.
    start cmd /k "cd backend && npm start"
    echo.
    echo 📊 生产模式访问地址：
    echo   完整应用: http://localhost:5000
)

echo.
echo ⚠️  重要提醒：
echo   1. 请编辑 backend\.env 文件配置API密钥
echo   2. 必需配置的API密钥：
echo      - Supabase (数据库和认证)
echo      - 科大讯飞 (语音识别) 
echo      - 高德地图 (地图服务)
echo   3. 配置后需要重启服务
echo.
echo 📝 下一步：
echo   1. 配置 backend\.env 文件中的API密钥
echo   2. 访问上述地址使用应用
echo   3. 首次访问请注册新用户
echo.
echo 🔧 停止服务：
echo   关闭命令行窗口即可停止服务
echo.
echo 💡 如果遇到问题：
echo   1. 检查API密钥是否正确配置
echo   2. 确保端口5000和3000未被占用
echo   3. 查看命令行窗口中的错误信息
echo.
pause