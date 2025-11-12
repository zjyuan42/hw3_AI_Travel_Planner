@echo off
chcp 65001 >nul
echo ============================================
echo    🚀 AI旅行规划器 - 离线Docker构建方案
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

echo [INFO] 创建离线Docker构建环境...
if not exist "offline-build" mkdir offline-build
cd offline-build

echo [INFO] 复制项目文件...
xcopy /E /I ..\backend .\backend\ >nul
xcopy /E /I ..\frontend .\frontend\ >nul
copy ..\Dockerfile .\ >nul
copy ..\docker-compose.yml .\ >nul
copy ..\package.json .\ >nul

echo [INFO] 创建环境配置文件...
if not exist ".env" (
    (
        echo # AI旅行规划器环境配置
        echo # 请配置以下API密钥：
        echo.
        echo # Supabase配置（必需）
        echo SUPABASE_URL=your_supabase_project_url_here
        echo SUPABASE_ANON_KEY=your_supabase_anon_key_here
        echo.
        echo # 科大讯飞配置（必需）
        echo IFLYTEK_APP_ID=your_iflytek_app_id_here
        echo IFLYTEK_API_KEY=your_iflytek_api_key_here
        echo IFLYTEK_API_SECRET=your_iflytek_api_secret_here
        echo.
        echo # 高德地图配置（必需）
        echo AMAP_API_KEY=your_amap_api_key_here
        echo.
        echo # 阿里云百炼配置（可选）
        echo ALIBABA_BAILIAN_APP_KEY=your_bailian_app_key_here
        echo ALIBABA_BAILIAN_ACCESS_KEY_ID=your_access_key_id_here
        echo ALIBABA_BAILIAN_ACCESS_KEY_SECRET=your_access_key_secret_here
        echo.
        echo # 应用配置
        echo NODE_ENV=production
        echo PORT=5000
        echo JWT_SECRET=change_this_to_a_secure_random_string
    ) > .env
    echo [INFO] 已创建环境配置文件 .env
    echo [INFO] 请编辑此文件配置API密钥
)

echo.
echo [INFO] 停止已存在的容器...
docker stop ai-travel-planner >nul 2>&1
docker rm ai-travel-planner >nul 2>&1

echo [INFO] 构建Docker镜像（使用缓存，不拉取外部镜像）...
echo [INFO] 这可能需要几分钟，请耐心等待...
docker build --network=host --no-cache -t ai-travel-planner .

if errorlevel 1 (
    echo [ERROR] Docker镜像构建失败
    echo.
    echo 可能的原因：
    echo 1. 网络连接问题
    echo 2. Docker配置问题
    echo 3. 系统资源不足
    echo.
    echo 建议尝试：
    echo 1. 检查Docker Desktop是否运行
    echo 2. 重启Docker Desktop
    echo 3. 使用本地开发模式（运行 local-build.bat）
    pause
    exit /b 1
)

echo [SUCCESS] Docker镜像构建成功
echo.

echo [INFO] 启动AI旅行规划器容器...
docker run -d ^
    --name ai-travel-planner ^
    -p 80:5000 ^
    -v "%CD%\.env:/app/.env" ^
    --restart unless-stopped ^
    ai-travel-planner

if errorlevel 1 (
    echo [ERROR] 容器启动失败
    pause
    exit /b 1
)

echo [SUCCESS] 容器启动成功
echo.

echo [INFO] 等待服务启动...
echo [INFO] 正在检查服务状态...
timeout /t 15 /nobreak >nul

echo [INFO] 检查服务健康状态...
curl -f http://localhost/health >nul 2>&1
if errorlevel 1 (
    echo [WARNING] 健康检查失败，但服务可能仍在启动中
    echo [INFO] 请等待1-2分钟后访问 http://localhost
) else (
    echo [SUCCESS] 健康检查通过
)

echo ============================================
echo            🎉 离线部署完成！
echo ============================================
echo.
echo 📊 服务信息：
echo   前端应用: http://localhost
echo   健康检查: http://localhost/health
echo   后端API: http://localhost/api
echo.
echo 🔧 管理命令：
echo   查看日志: docker logs ai-travel-planner
echo   停止服务: docker stop ai-travel-planner
echo   重启服务: docker restart ai-travel-planner
echo.
echo ⚠️  重要提醒：
echo   1. 请编辑 offline-build\.env 文件配置API密钥
echo   2. 配置后重启服务: docker restart ai-travel-planner
echo   3. 首次访问请注册新用户
echo.
echo 📝 下一步：
echo   打开浏览器访问 http://localhost
echo.
echo 🔄 如果仍然无法访问：
echo   请运行 local-build.bat 使用本地开发模式
echo.
pause