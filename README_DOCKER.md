# AI旅行规划器 - Docker镜像运行指南

## 🚀 快速开始（5分钟部署）

### 方式一：使用预构建Docker镜像（推荐）

#### 1. 下载Docker镜像
```bash
# 从阿里云镜像仓库下载（推荐，国内速度快）
docker pull registry.cn-hangzhou.aliyuncs.com/ai-travel-planner/ai-travel-planner:latest

# 或者从Docker Hub下载
docker pull ai-travel-planner/ai-travel-planner:latest
```

#### 2. 一键运行脚本
```bash
# 下载运行脚本
curl -O https://raw.githubusercontent.com/your-username/ai-travel-planner/main/run-docker.sh
chmod +x run-docker.sh

# 运行脚本（自动配置和启动）
./run-docker.sh
```

#### 3. 手动运行命令
```bash
# 创建必要目录
mkdir -p ai-travel-planner/{config,logs,uploads}
cd ai-travel-planner

# 下载配置文件
curl -O https://raw.githubusercontent.com/your-username/ai-travel-planner/main/.env.production.example
cp .env.production.example .env.production

# 运行容器
docker run -d \
  --name ai-travel-planner \
  -p 80:5000 \
  -v $(pwd)/.env.production:/app/.env.production \
  -v $(pwd)/logs:/app/logs \
  -v $(pwd)/uploads:/app/uploads \
  registry.cn-hangzhou.aliyuncs.com/ai-travel-planner/ai-travel-planner:latest
```

### 方式二：使用docker-compose（生产环境）

```bash
# 下载docker-compose文件
curl -O https://raw.githubusercontent.com/your-username/ai-travel-planner/main/docker-compose.prod.yml
curl -O https://raw.githubusercontent.com/your-username/ai-travel-planner/main/.env.production.example

# 配置环境变量
cp .env.production.example .env.production
# 编辑 .env.production 文件，填入您的API密钥

# 启动服务
docker-compose -f docker-compose.prod.yml up -d
```

## 📦 Docker镜像信息

### 镜像地址
- **主要镜像**：`registry.cn-hangzhou.aliyuncs.com/ai-travel-planner/ai-travel-planner:latest`
- **备用镜像**：`ai-travel-planner/ai-travel-planner:latest` (Docker Hub)

### 镜像特性
- 🐳 **多阶段构建** - 优化镜像大小（仅~200MB）
- 🔒 **安全加固** - 使用非root用户运行
- 🏥 **健康检查** - 自动服务监控
- 📊 **性能优化** - 生产环境调优
- 🌐 **中文支持** - 完整的中文界面和文档

### 镜像内容
- **前端**：React + TypeScript构建的现代化界面
- **后端**：Node.js + Express高性能API服务
- **数据库**：Supabase云端数据库客户端
- **AI服务**：集成科大讯飞、高德地图、阿里云百炼
- **监控**：内置健康检查和性能监控

## ⚙️ 环境配置

### 必需配置（运行前必须配置）

编辑 `.env.production` 文件，配置以下API密钥：

```env
# ==================== 必需配置 ====================

# Supabase数据库（免费注册：https://supabase.com）
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# 科大讯飞语音识别（免费试用：https://www.xfyun.cn）
IFLYTEK_APP_ID=your_iflytek_app_id
IFLYTEK_API_KEY=your_iflytek_api_key
IFLYTEK_API_SECRET=your_iflytek_api_secret

# 高德地图API（免费申请：https://lbs.amap.com）
AMAP_API_KEY=your_amap_api_key

# 阿里云百炼AI（免费试用：https://bailian.aliyun.com）
ALIBABA_BAILIAN_APP_KEY=your_bailian_app_key
ALIBABA_BAILIAN_ACCESS_KEY_ID=your_access_key_id
ALIBABA_BAILIAN_ACCESS_KEY_SECRET=your_access_key_secret

# ==================== 安全配置 ====================
JWT_SECRET=your_secure_jwt_secret_key_change_this_in_production
```

### 可选配置
```env
# 邮件服务（用于用户通知）
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# 监控配置
PROMETHEUS_ENABLED=true
LOG_LEVEL=info
```

## 🎯 快速验证

### 1. 检查服务状态
```bash
# 检查容器运行状态
docker ps

# 健康检查
curl http://localhost/health

# 预期输出：
# {"status":"healthy","service":"AI Travel Planner","timestamp":"2024-01-01T00:00:00.000Z"}
```

### 2. 访问应用
打开浏览器访问：`http://localhost`

### 3. 功能测试
1. **注册新用户** - 点击右上角"注册"按钮
2. **语音输入测试** - 在首页点击麦克风图标说："我想去北京，3天行程，预算5000元"
3. **AI行程生成** - 查看自动生成的个性化旅行计划
4. **地图服务** - 测试地理位置搜索功能

## 🔧 一键运行脚本

创建 `run-docker.sh` 脚本：

```bash
#!/bin/bash

echo "🚀 AI旅行规划器 - 一键部署脚本"

# 检查Docker是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ 错误: 请先安装Docker"
    exit 1
fi

# 创建项目目录
mkdir -p ai-travel-planner/{config,logs,uploads}
cd ai-travel-planner

# 下载配置文件
echo "📥 下载配置文件..."
curl -s -O https://raw.githubusercontent.com/your-username/ai-travel-planner/main/.env.production.example

# 检查是否已配置
if [ ! -f .env.production ]; then
    cp .env.production.example .env.production
    echo "⚠️  请编辑 .env.production 文件配置API密钥"
    echo "📝 使用命令: nano .env.production 或 vim .env.production"
    read -p "配置完成后按回车键继续..."
fi

# 拉取最新镜像
echo "🐳 拉取Docker镜像..."
docker pull registry.cn-hangzhou.aliyuncs.com/ai-travel-planner/ai-travel-planner:latest

# 运行容器
echo "🚀 启动AI旅行规划器..."
docker run -d \
  --name ai-travel-planner \
  -p 80:5000 \
  -v $(pwd)/.env.production:/app/.env.production \
  -v $(pwd)/logs:/app/logs \
  -v $(pwd)/uploads:/app/uploads \
  registry.cn-hangzhou.aliyuncs.com/ai-travel-planner/ai-travel-planner:latest

echo "✅ 部署完成！"
echo "🌐 访问地址: http://localhost"
echo "📊 健康检查: http://localhost/health"
echo "📝 查看日志: docker logs ai-travel-planner"
```

## 📊 系统要求

### 最低配置
- **操作系统**: Linux, macOS, Windows 10/11
- **Docker**: 20.10.0+
- **Docker Compose**: 2.0.0+ (可选)
- **内存**: 2GB RAM
- **存储**: 5GB 可用空间
- **网络**: 稳定的互联网连接

### 推荐配置
- **内存**: 4GB RAM
- **存储**: 10GB SSD
- **CPU**: 2核以上
- **网络**: 100Mbps+ 带宽

## 🛠️ 管理命令

### 常用Docker命令
```bash
# 查看容器状态
docker ps

# 查看应用日志
docker logs ai-travel-planner

# 实时查看日志
docker logs -f ai-travel-planner

# 重启服务
docker restart ai-travel-planner

# 停止服务
docker stop ai-travel-planner

# 删除容器
docker rm ai-travel-planner

# 进入容器（调试用）
docker exec -it ai-travel-planner sh
```

### 数据备份
```bash
# 备份配置文件和数据
tar -czf backup-$(date +%Y%m%d).tar.gz .env.production logs/ uploads/

# 恢复备份
tar -xzf backup-20241201.tar.gz
```

## 🔒 安全建议

### 1. 修改默认配置
```env
# 务必修改JWT密钥
JWT_SECRET=your_very_long_and_secure_random_string_here

# 启用HTTPS（生产环境）
FRONTEND_URL=https://your-domain.com
```

### 2. 防火墙配置
```bash
# 只开放必要端口
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS (如果配置SSL)
sudo ufw allow 22/tcp    # SSH
sudo ufw enable
```

### 3. 定期更新
```bash
# 拉取最新镜像
docker pull registry.cn-hangzhou.aliyuncs.com/ai-travel-planner/ai-travel-planner:latest

# 重启服务
docker restart ai-travel-planner
```

## ❓ 常见问题

### Q1: 容器启动失败
**问题**: 容器启动后立即退出
**解决**: 
```bash
# 查看错误日志
docker logs ai-travel-planner

# 常见原因：
# 1. 环境变量配置错误
# 2. 端口被占用（修改端口：-p 8080:5000）
# 3. 磁盘空间不足
```

### Q2: 语音识别不工作
**问题**: 语音识别返回错误
**解决**:
- 检查科大讯飞API密钥配置
- 确认网络连接正常
- 查看应用日志：`docker logs ai-travel-planner`

### Q3: 地图服务无法使用
**问题**: 地理位置搜索失败
**解决**:
- 检查高德地图API密钥
- 确认API调用配额充足
- 验证网络连接

### Q4: 性能问题
**问题**: 应用响应缓慢
**解决**:
```bash
# 查看资源使用
docker stats

# 优化建议：
# 1. 增加内存到4GB
# 2. 使用SSD存储
# 3. 优化网络连接
```

## 📞 技术支持

### 文档资源
- 📚 [详细配置指南](API_CONFIG.md)
- 🐳 [Docker部署指南](DOCKER_RUN_GUIDE.md)
- 🧪 [测试指南](TEST_GUIDE.md)
- 🚀 [生产部署指南](DEPLOYMENT.md)

### 问题反馈
如果遇到问题，请提供以下信息：
1. Docker版本：`docker --version`
2. 系统信息：`uname -a` 或 `systeminfo`
3. 错误日志：`docker logs ai-travel-planner`
4. 配置文件（脱敏后）

### 社区支持
- 💬 [GitHub Issues](https://github.com/your-username/ai-travel-planner/issues)
- 📧 邮箱支持：support@ai-travel-planner.com

## 🎉 开始使用

现在您已经完成了部署，可以：

1. **注册用户** - 创建您的第一个账户
2. **语音输入** - 尝试使用语音描述旅行需求
3. **AI规划** - 查看自动生成的个性化行程
4. **预算管理** - 记录和分析旅行费用
5. **地图导航** - 使用地图服务规划路线

享受智能旅行规划的便捷体验！🎊

---

**注意**: 首次使用请确保所有API密钥配置正确，并进行完整的功能测试。如有问题请参考故障排除章节或联系技术支持。