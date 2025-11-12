#!/bin/bash

# ========================================
# AI旅行规划器 - 一键Docker运行脚本
# ========================================

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 日志函数
log() {
    echo -e "${CYAN}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 显示横幅
show_banner() {
    echo -e "${CYAN}"
    echo "==========================================="
    echo "    🚀 AI旅行规划器 - 一键部署脚本"
    echo "==========================================="
    echo -e "${NC}"
}

# 检查Docker是否安装
check_docker() {
    log "检查Docker环境..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker未安装，请先安装Docker"
        echo ""
        echo "安装指南："
        echo "  Ubuntu/Debian: sudo apt-get install docker.io docker-compose"
        echo "  CentOS/RHEL: sudo yum install docker docker-compose"
        echo "  macOS: 安装Docker Desktop https://docker.com"
        echo "  Windows: 安装Docker Desktop https://docker.com"
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        log_error "Docker守护进程未运行，请启动Docker服务"
        echo ""
        echo "启动命令："
        echo "  Linux: sudo systemctl start docker"
        echo "  macOS: 打开Docker Desktop应用"
        echo "  Windows: 打开Docker Desktop应用"
        exit 1
    fi
    
    log_success "Docker环境检查通过"
}

# 创建项目目录结构
create_directories() {
    log "创建项目目录结构..."
    
    mkdir -p ai-travel-planner/{config,logs,uploads,backup}
    cd ai-travel-planner
    
    log_success "目录创建完成"
}

# 下载配置文件
download_configs() {
    log "下载配置文件..."
    
    # 下载环境配置文件
    if [ ! -f .env.production ]; then
        if [ -f .env.production.example ]; then
            cp .env.production.example .env.production
        else
            log_warning "未找到环境配置文件模板，将创建空配置文件"
            cat > .env.production << EOF
# AI旅行规划器 - 生产环境配置
# 请配置以下必需的API密钥：

# Supabase数据库配置
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# 科大讯飞语音识别配置
IFLYTEK_APP_ID=your_iflytek_app_id
IFLYTEK_API_KEY=your_iflytek_api_key
IFLYTEK_API_SECRET=your_iflytek_api_secret

# 高德地图配置
AMAP_API_KEY=your_amap_api_key

# 阿里云百炼AI配置
ALIBABA_BAILIAN_APP_KEY=your_bailian_app_key
ALIBABA_BAILIAN_ACCESS_KEY_ID=your_access_key_id
ALIBABA_BAILIAN_ACCESS_KEY_SECRET=your_access_key_secret

# JWT安全配置（请修改为随机字符串）
JWT_SECRET=change_this_to_a_secure_random_string

# 应用配置
NODE_ENV=production
PORT=5000
FRONTEND_URL=http://localhost
EOF
        fi
    fi
    
    log_success "配置文件准备完成"
}

# 拉取Docker镜像
pull_docker_image() {
    log "拉取Docker镜像..."
    
    local image_name="registry.cn-hangzhou.aliyuncs.com/ai-travel-planner/ai-travel-planner:latest"
    local fallback_image="ai-travel-planner/ai-travel-planner:latest"
    
    # 尝试从阿里云拉取
    if docker pull $image_name; then
        log_success "从阿里云镜像仓库拉取成功"
        IMAGE=$image_name
    else
        log_warning "阿里云镜像拉取失败，尝试Docker Hub..."
        if docker pull $fallback_image; then
            log_success "从Docker Hub拉取成功"
            IMAGE=$fallback_image
        else
            log_error "无法拉取Docker镜像，请检查网络连接或手动构建镜像"
            log "手动构建命令: docker build -t ai-travel-planner:latest ."
            exit 1
        fi
    fi
}

# 配置环境变量
setup_environment() {
    log "配置环境变量..."
    
    if [ ! -f .env.production ]; then
        log_error "环境配置文件 .env.production 不存在"
        exit 1
    fi
    
    # 检查必要的环境变量是否已配置
    required_vars=("SUPABASE_URL" "SUPABASE_ANON_KEY" "IFLYTEK_APP_ID" "AMAP_API_KEY")
    missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if ! grep -q "^$var=" .env.production || grep -q "^$var=your_" .env.production; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -gt 0 ]; then
        log_warning "以下必需的API密钥未配置: ${missing_vars[*]}"
        echo ""
        echo "请编辑 .env.production 文件配置这些密钥:"
        echo "  nano .env.production 或 vim .env.production"
        echo ""
        echo "配置完成后重新运行此脚本"
        echo ""
        read -p "是否现在打开编辑器配置? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            ${EDITOR:-nano} .env.production
            log "请重新运行此脚本继续部署"
            exit 0
        else
            log_error "必须配置API密钥才能继续"
            exit 1
        fi
    fi
    
    log_success "环境变量配置检查通过"
}

# 运行Docker容器
run_container() {
    log "启动AI旅行规划器容器..."
    
    # 停止已存在的容器
    if docker ps -a | grep -q ai-travel-planner; then
        log "停止已存在的容器..."
        docker stop ai-travel-planner > /dev/null 2>&1 || true
        docker rm ai-travel-planner > /dev/null 2>&1 || true
    fi
    
    # 运行新容器
    docker run -d \
        --name ai-travel-planner \
        -p 80:5000 \
        -v $(pwd)/.env.production:/app/.env.production \
        -v $(pwd)/logs:/app/logs \
        -v $(pwd)/uploads:/app/uploads \
        --restart unless-stopped \
        $IMAGE
    
    log_success "容器启动成功"
}

# 等待服务启动
wait_for_service() {
    log "等待服务启动..."
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f http://localhost/health > /dev/null 2>&1; then
            log_success "服务启动完成"
            return 0
        fi
        
        log "等待服务响应... ($attempt/$max_attempts)"
        sleep 5
        ((attempt++))
    done
    
    log_error "服务启动超时，请检查日志: docker logs ai-travel-planner"
    return 1
}

# 显示部署信息
show_deployment_info() {
    echo ""
    echo -e "${GREEN}"
    echo "🎉 AI旅行规划器部署完成！"
    echo "==========================================="
    echo -e "${NC}"
    
    echo "📊 服务信息："
    echo "   - 前端应用: ${CYAN}http://localhost${NC}"
    echo "   - 健康检查: ${CYAN}http://localhost/health${NC}"
    echo "   - API文档: ${CYAN}http://localhost/api/docs${NC}"
    echo ""
    
    echo "🔧 管理命令："
    echo "   - 查看日志: ${CYAN}docker logs ai-travel-planner${NC}"
    echo "   - 实时日志: ${CYAN}docker logs -f ai-travel-planner${NC}"
    echo "   - 停止服务: ${CYAN}docker stop ai-travel-planner${NC}"
    echo "   - 重启服务: ${CYAN}docker restart ai-travel-planner${NC}"
    echo "   - 删除服务: ${CYAN}docker rm ai-travel-planner${NC}"
    echo ""
    
    echo "📝 下一步："
    echo "   1. 打开浏览器访问 ${CYAN}http://localhost${NC}"
    echo "   2. 注册新用户账户"
    echo "   3. 开始使用语音识别和AI行程规划"
    echo ""
    
    echo "⚠️  重要提醒："
    echo "   - 请确保服务器防火墙开放80端口"
    echo "   - 生产环境建议配置HTTPS和域名"
    echo "   - 定期备份重要数据"
    echo ""
}

# 健康检查
health_check() {
    log "执行健康检查..."
    
    if curl -f http://localhost/health > /dev/null 2>&1; then
        log_success "健康检查通过"
        return 0
    else
        log_error "健康检查失败"
        log "请查看日志: docker logs ai-travel-planner"
        return 1
    fi
}

# 主部署函数
main() {
    show_banner
    
    # 执行部署步骤
    check_docker
    create_directories
    download_configs
    setup_environment
    pull_docker_image
    run_container
    wait_for_service
    health_check
    show_deployment_info
    
    log_success "AI旅行规划器部署完成！"
}

# 显示使用说明
usage() {
    echo "使用方法: $0 [command]"
    echo ""
    echo "命令:"
    echo "  deploy      执行完整部署流程（默认）"
    echo "  config      仅配置环境变量"
    echo "  start       启动服务"
    echo "  stop        停止服务"
    echo "  restart     重启服务"
    echo "  logs        查看日志"
    echo "  status      查看服务状态"
    echo "  health      健康检查"
    echo "  update      更新到最新版本"
    echo "  backup      备份数据"
    echo "  restore     恢复数据"
    echo ""
}

# 命令行参数处理
case "${1:-deploy}" in
    deploy)
        main
        ;;
    config)
        create_directories
        download_configs
        setup_environment
        ;;
    start)
        docker start ai-travel-planner
        ;;
    stop)
        docker stop ai-travel-planner
        ;;
    restart)
        docker restart ai-travel-planner
        ;;
    logs)
        docker logs -f ai-travel-planner
        ;;
    status)
        docker ps -f name=ai-travel-planner
        ;;
    health)
        health_check
        ;;
    update)
        pull_docker_image
        docker restart ai-travel-planner
        ;;
    backup)
        tar -czf backup-$(date +%Y%m%d).tar.gz .env.production logs/ uploads/
        log_success "备份完成: backup-$(date +%Y%m%d).tar.gz"
        ;;
    restore)
        if [ -z "$2" ]; then
            log_error "请指定备份文件: $0 restore backup-file.tar.gz"
            exit 1
        fi
        tar -xzf "$2"
        log_success "恢复完成，请重启服务: $0 restart"
        ;;
    *)
        usage
        exit 1
        ;;
esac