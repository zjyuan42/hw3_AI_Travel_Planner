@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

:: ========================================
:: AI旅行规划器 - Windows一键Docker运行脚本
:: ========================================

:: 颜色定义
set "RED=[91m"
set "GREEN=[92m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "CYAN=[96m"
set "NC=[0m"

:: 日志函数
set "LOG_PREFIX=%CYAN%[INFO]%NC%"
set "SUCCESS_PREFIX=%GREEN%[SUCCESS]%NC%"
set "WARNING_PREFIX=%YELLOW%[WARNING]%NC%"
set "ERROR_PREFIX=%RED%[ERROR]%NC%"

:: 显示横幅
call :show_banner

:: 检查Docker是否安装
call :check_docker
if !ERRORLEVEL! neq 0 (
    echo %ERROR_PREFIX% Docker环境检查失败
    pause
    exit /b 1
)

:: 创建项目目录结构
call :create_directories

:: 下载配置文件
call :download_configs

:: 配置环境变量
call :setup_environment
if !ERRORLEVEL! neq 0 (
    pause
    exit /b 1
)

:: 拉取Docker镜像
call :pull_docker_image
if !ERRORLEVEL! neq 0 (
    echo %ERROR_PREFIX% Docker镜像拉取失败
    pause
    exit /b 1
)

:: 运行Docker容器
call :run_container

:: 等待服务启动
call :wait_for_service

:: 健康检查
call :health_check

:: 显示部署信息
call :show_deployment_info

echo %SUCCESS_PREFIX% AI旅行规划器部署完成！
pause
exit /b 0

:: ========================================
:: 函数定义
:: ========================================

:show_banner
echo %CYAN%
echo ============================================
echo     🚀 AI旅行规划器 - Windows一键部署脚本
echo ============================================
echo %NC%
goto :eof

:check_docker
echo %LOG_PREFIX% 检查Docker环境...
docker --version >nul 2>&1
if !ERRORLEVEL! neq 0 (
    echo %ERROR_PREFIX% Docker未安装，请先安装Docker Desktop
    echo.
    echo 安装指南：
    echo   1. 访问 https://docker.com 下载Docker Desktop
    echo   2. 安装后重启计算机
    echo   3. 确保Docker Desktop正在运行
    exit /b 1
)

docker info >nul 2>&1
if !ERRORLEVEL! neq 0 (
    echo %ERROR_PREFIX% Docker守护进程未运行，请启动Docker Desktop
    exit /b 1
)

echo %SUCCESS_PREFIX% Docker环境检查通过
goto :eof

:create_directories
echo %LOG_PREFIX% 创建项目目录结构...
if not exist "ai-travel-planner" mkdir ai-travel-planner
cd ai-travel-planner
if not exist "config" mkdir config
if not exist "logs" mkdir logs
if not exist "uploads" mkdir uploads
if not exist "backup" mkdir backup
echo %SUCCESS_PREFIX% 目录创建完成
goto :eof

:download_configs
echo %LOG_PREFIX% 下载配置文件...
if not exist ".env.production" (
    if exist ".env.production.example" (
        copy ".env.production.example" ".env.production" >nul
    ) else (
        echo %WARNING_PREFIX% 未找到环境配置文件模板，将创建空配置文件
        (
            echo # AI旅行规划器 - 生产环境配置
            echo # 请配置以下必需的API密钥：
            echo.
            echo # Supabase数据库配置
            echo SUPABASE_URL=your_supabase_project_url
            echo SUPABASE_ANON_KEY=your_supabase_anon_key
            echo.
            echo # 科大讯飞语音识别配置
            echo IFLYTEK_APP_ID=your_iflytek_app_id
            echo IFLYTEK_API_KEY=your_iflytek_api_key
            echo IFLYTEK_API_SECRET=your_iflytek_api_secret
            echo.
            echo # 高德地图配置
            echo AMAP_API_KEY=your_amap_api_key
            echo.
            echo # 阿里云百炼AI配置
            echo ALIBABA_BAILIAN_APP_KEY=your_bailian_app_key
            echo ALIBABA_BAILIAN_ACCESS_KEY_ID=your_access_key_id
            echo ALIBABA_BAILIAN_ACCESS_KEY_SECRET=your_access_key_secret
            echo.
            echo # JWT安全配置（请修改为随机字符串）
            echo JWT_SECRET=change_this_to_a_secure_random_string
            echo.
            echo # 应用配置
            echo NODE_ENV=production
            echo PORT=5000
            echo FRONTEND_URL=http://localhost
        ) > .env.production
    )
)
echo %SUCCESS_PREFIX% 配置文件准备完成
goto :eof

:setup_environment
echo %LOG_PREFIX% 配置环境变量...
if not exist ".env.production" (
    echo %ERROR_PREFIX% 环境配置文件 .env.production 不存在
    exit /b 1
)

:: 检查必要的环境变量是否已配置
set "missing_vars="
for %%v in (SUPABASE_URL SUPABASE_ANON_KEY IFLYTEK_APP_ID AMAP_API_KEY) do (
    findstr /r /c:"^%%v=your_" .env.production >nul && set "missing_vars=!missing_vars! %%v"
)

if not "!missing_vars!"=="" (
    echo %WARNING_PREFIX% 以下必需的API密钥未配置:!missing_vars!
    echo.
    echo 请编辑 .env.production 文件配置这些密钥：
    echo   1. 用记事本或其他文本编辑器打开 .env.production
    echo   2. 配置所有标记为 your_* 的API密钥
    echo   3. 保存文件后重新运行此脚本
    echo.
    set /p "edit_now=是否现在用记事本打开配置文件? (y/n): "
    if /i "!edit_now!"=="y" (
        notepad .env.production
        echo 请重新运行此脚本继续部署
        pause
        exit /b 0
    ) else (
        echo %ERROR_PREFIX% 必须配置API密钥才能继续
        exit /b 1
    )
)

echo %SUCCESS_PREFIX% 环境变量配置检查通过
goto :eof

:pull_docker_image
echo %LOG_PREFIX% 拉取Docker镜像...
set "image_name=registry.cn-hangzhou.aliyuncs.com/ai-travel-planner/ai-travel-planner:latest"
set "fallback_image=ai-travel-planner/ai-travel-planner:latest"

:: 尝试从阿里云拉取
docker pull !image_name! >nul 2>&1
if !ERRORLEVEL! equ 0 (
    echo %SUCCESS_PREFIX% 从阿里云镜像仓库拉取成功
    set "IMAGE=!image_name!"
    goto :eof
)

echo %WARNING_PREFIX% 阿里云镜像拉取失败，尝试Docker Hub...
docker pull !fallback_image! >nul 2>&1
if !ERRORLEVEL! equ 0 (
    echo %SUCCESS_PREFIX% 从Docker Hub拉取成功
    set "IMAGE=!fallback_image!"
    goto :eof
)

echo %ERROR_PREFIX% 无法拉取Docker镜像，请检查网络连接或手动构建镜像
echo 手动构建命令: docker build -t ai-travel-planner:latest .
exit /b 1

:run_container
echo %LOG_PREFIX% 启动AI旅行规划器容器...

:: 停止已存在的容器
docker ps -a | findstr "ai-travel-planner" >nul
if !ERRORLEVEL! equ 0 (
    echo %LOG_PREFIX% 停止已存在的容器...
    docker stop ai-travel-planner >nul 2>&1
    docker rm ai-travel-planner >nul 2>&1
)

:: 运行新容器
docker run -d ^
    --name ai-travel-planner ^
    -p 80:5000 ^
    -v "%CD%\.env.production:/app/.env.production" ^
    -v "%CD%\logs:/app/logs" ^
    -v "%CD%\uploads:/app/uploads" ^
    --restart unless-stopped ^
    !IMAGE!

echo %SUCCESS_PREFIX% 容器启动成功
goto :eof

:wait_for_service
echo %LOG_PREFIX% 等待服务启动...
set "max_attempts=30"
set "attempt=1"

:wait_loop
curl -f http://localhost/health >nul 2>&1
if !ERRORLEVEL! equ 0 (
    echo %SUCCESS_PREFIX% 服务启动完成
    goto :eof
)

echo %LOG_PREFIX% 等待服务响应... (!attempt!/!max_attempts!)
if !attempt! geq !max_attempts! (
    echo %ERROR_PREFIX% 服务启动超时，请检查日志: docker logs ai-travel-planner
    exit /b 1
)

timeout /t 5 /nobreak >nul
set /a attempt+=1
goto wait_loop

:health_check
echo %LOG_PREFIX% 执行健康检查...
curl -f http://localhost/health >nul 2>&1
if !ERRORLEVEL! equ 0 (
    echo %SUCCESS_PREFIX% 健康检查通过
    goto :eof
)

echo %ERROR_PREFIX% 健康检查失败
echo 请查看日志: docker logs ai-travel-planner
exit /b 1

:show_deployment_info
echo.
echo %GREEN%
echo 🎉 AI旅行规划器部署完成！
echo ============================================
echo %NC%

echo 📊 服务信息：
echo    - 前端应用: %CYAN%http://localhost%NC%
echo    - 健康检查: %CYAN%http://localhost/health%NC%
echo    - API文档: %CYAN%http://localhost/api/docs%NC%
echo.

echo 🔧 管理命令：
echo    - 查看日志: %CYAN%docker logs ai-travel-planner%NC%
echo    - 实时日志: %CYAN%docker logs -f ai-travel-planner%NC%
echo    - 停止服务: %CYAN%docker stop ai-travel-planner%NC%
echo    - 重启服务: %CYAN%docker restart ai-travel-planner%NC%
echo    - 删除服务: %CYAN%docker rm ai-travel-planner%NC%
echo.

echo 📝 下一步：
echo    1. 打开浏览器访问 %CYAN%http://localhost%NC%
echo    2. 注册新用户账户
echo    3. 开始使用语音识别和AI行程规划
echo.

echo ⚠️  重要提醒：
echo    - 请确保防火墙允许80端口访问
echo    - 生产环境建议配置HTTPS和域名
echo    - 定期备份重要数据
echo.
goto :eof

:: ========================================
:: 命令行参数处理
:: ========================================

:usage
echo 使用方法: %~n0 [command]
echo.
echo 命令:
echo  deploy      执行完整部署流程（默认）
echo  config      仅配置环境变量
echo  start       启动服务
echo  stop        停止服务
echo  restart     重启服务
echo  logs        查看日志
echo  status      查看服务状态
echo  health      健康检查
echo  update      更新到最新版本
echo  backup      备份数据
echo  restore     恢复数据
echo.
goto :eof

:main_deploy
goto :eof