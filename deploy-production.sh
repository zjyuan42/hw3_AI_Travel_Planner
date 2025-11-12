#!/bin/bash

# ========================================
# AI旅行规划器 - 生产环境部署脚本
# ========================================

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
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

# 检查Docker是否安装
check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker未安装，请先安装Docker"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose未安装，请先安装Docker Compose"
        exit 1
    fi
    
    log_success "Docker和Docker Compose已安装"
}

# 检查环境配置
check_environment() {
    if [ ! -f .env.production ]; then
        log_warning "未找到生产环境配置文件 .env.production"
        log_info "正在从示例文件创建..."
        cp .env.production.example .env.production
        log_warning "请编辑 .env.production 文件并配置所有必要的环境变量"
        exit 1
    fi
    
    # 检查必要的环境变量
    required_vars=("SUPABASE_URL" "SUPABASE_ANON_KEY" "IFLYTEK_APP_ID" "AMAP_API_KEY")
    for var in "${required_vars[@]}"; do
        if ! grep -q "^$var=" .env.production; then
            log_error "请在 .env.production 中配置 $var"
            exit 1
        fi
    done
    
    log_success "环境配置检查通过"
}

# 创建必要的目录
create_directories() {
    log_info "创建必要的目录..."
    
    mkdir -p logs
    mkdir -p uploads
    mkdir -p ssl
    mkdir -p monitoring/prometheus
    mkdir -p monitoring/grafana/dashboards
    mkdir -p monitoring/grafana/datasources
    
    log_success "目录创建完成"
}

# 构建Docker镜像
build_images() {
    log_info "开始构建Docker镜像..."
    
    # 构建生产环境镜像
    docker-compose -f docker-compose.prod.yml build
    
    log_success "Docker镜像构建完成"
}

# 启动服务
start_services() {
    log_info "启动生产环境服务..."
    
    # 使用生产环境配置启动服务
    docker-compose -f docker-compose.prod.yml up -d
    
    log_success "服务启动完成"
}

# 健康检查
health_check() {
    log_info "进行健康检查..."
    
    # 等待服务启动
    sleep 30
    
    # 检查应用服务
    if curl -f http://localhost/health > /dev/null 2>&1; then
        log_success "应用服务健康检查通过"
    else
        log_error "应用服务健康检查失败"
        exit 1
    fi
    
    # 检查Nginx服务
    if curl -f http://localhost > /dev/null 2>&1; then
        log_success "Nginx服务健康检查通过"
    else
        log_error "Nginx服务健康检查失败"
        exit 1
    fi
    
    log_success "所有服务健康检查通过"
}

# 显示部署信息
show_deployment_info() {
    log_success "🎉 AI旅行规划器部署完成！"
    echo ""
    echo "📊 服务访问信息："
    echo "   - 前端应用: http://localhost (或您的域名)"
    echo "   - API文档: http://localhost/api/docs"
    echo "   - 健康检查: http://localhost/health"
    echo ""
    echo "🔧 监控服务："
    echo "   - Prometheus: http://localhost:9090"
    echo "   - Grafana: http://localhost:3000 (admin/admin123)"
    echo ""
    echo "📝 常用命令："
    echo "   - 查看日志: docker-compose -f docker-compose.prod.yml logs -f"
    echo "   - 停止服务: docker-compose -f docker-compose.prod.yml down"
    echo "   - 重启服务: docker-compose -f docker-compose.prod.yml restart"
    echo "   - 查看状态: docker-compose -f docker-compose.prod.yml ps"
    echo ""
    echo "⚠️  重要提醒："
    echo "   - 请确保配置了正确的SSL证书"
    echo "   - 定期备份数据库"
    echo "   - 监控系统资源使用情况"
}

# 主部署函数
main() {
    log_info "开始AI旅行规划器生产环境部署..."
    
    # 执行部署步骤
    check_docker
    check_environment
    create_directories
    build_images
    start_services
    health_check
    show_deployment_info
    
    log_success "部署流程完成！"
}

# 显示使用说明
usage() {
    echo "使用方法: $0 [command]"
    echo ""
    echo "命令:"
    echo "  deploy      执行完整部署流程（默认）"
    echo "  build       仅构建Docker镜像"
    echo "  start       启动服务"
    echo "  stop        停止服务"
    echo "  restart     重启服务"
    echo "  logs        查看日志"
    echo "  status      查看服务状态"
    echo "  health      健康检查"
    echo ""
}

# 命令行参数处理
case "${1:-deploy}" in
    deploy)
        main
        ;;
    build)
        check_docker
        build_images
        ;;
    start)
        check_docker
        start_services
        ;;
    stop)
        docker-compose -f docker-compose.prod.yml down
        ;;
    restart)
        docker-compose -f docker-compose.prod.yml restart
        ;;
    logs)
        docker-compose -f docker-compose.prod.yml logs -f
        ;;
    status)
        docker-compose -f docker-compose.prod.yml ps
        ;;
    health)
        health_check
        ;;
    *)
        usage
        exit 1
        ;;
esac