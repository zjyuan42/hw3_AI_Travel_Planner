# AI旅行规划器 - Docker镜像运行指南

## 🚀 快速开始

### 方式一：使用预构建的Docker镜像（推荐）

#### 1. 拉取Docker镜像
```bash
# 从Docker Hub拉取最新镜像
docker pull your-username/ai-travel-planner:latest

# 或者从GitHub Packages拉取
docker pull ghcr.io/your-username/ai-travel-planner:latest
```

#### 2. 创建配置文件
```bash
# 创建配置目录
mkdir -p ai-travel-planner/config
cd ai-travel-planner

# 复制环境配置文件
curl -o .env https://raw.githubusercontent.com/your-username/ai-travel-planner/main/.env.production.example

# 编辑配置文件，填入您的API密钥
vim .env
```

#### 3. 运行容器
```bash
# 使用Docker运行
docker run -d \
  --name ai-travel-planner \
  -p 80:5000 \
  -v $(pwd)/.env:/app/.env.production \
  -v $(pwd)/logs:/app/logs \
  -v $(pwd)/uploads:/app/uploads \
  your-username/ai-travel-planner:latest
```

#### 4. 验证运行
```bash
# 检查容器状态
docker ps

# 查看日志
docker logs ai-travel-planner

# 健康检查
curl http://localhost/health
```

### 方式二：使用docker-compose（生产环境）

#### 1. 下载docker-compose文件
```bash
# 创建项目目录
mkdir ai-travel-planner && cd ai-travel-planner

# 下载docker-compose配置文件
curl -O https://raw.githubusercontent.com/your-username/ai-travel-planner/main/docker-compose.prod.yml
curl -O https://raw.githubusercontent.com/your-username/ai-travel-planner/main/.env.production.example

# 复制并配置环境变量
cp .env.production.example .env.production
vim .env.production
```

#### 2. 启动服务
```bash
# 启动所有服务
docker-compose -f docker-compose.prod.yml up -d

# 查看服务状态
docker-compose -f docker-compose.prod.yml ps

# 查看日志
docker-compose -f docker-compose.prod.yml logs -f
```

## 📋 系统要求

### 最低配置
- **Docker**: 20.10+
- **Docker Compose**: 2.0+
- **内存**: 2GB RAM
- **存储**: 5GB 可用空间
- **网络**: 稳定的互联网连接

### 推荐配置
- **Docker**: 最新稳定版
- **内存**: 4GB RAM
- **存储**: 10GB SSD
- **CPU**: 2核以上

## 🔧 环境配置

### 必需的API密钥配置

编辑 `.env.production` 文件，配置以下必需的API密钥：

```env
# Supabase配置（必需）
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# 科大讯飞语音识别（必需）
IFLYTEK_APP_ID=your_iflytek_app_id
IFLYTEK_API_KEY=your_iflytek_api_key
IFLYTEK_API_SECRET=your_iflytek_api_secret

# 高德地图（必需）
AMAP_API_KEY=your_amap_api_key

# 阿里云百炼AI（必需）
ALIBABA_BAILIAN_APP_KEY=your_bailian_app_key
ALIBABA_BAILIAN_ACCESS_KEY_ID=your_access_key_id
ALIBABA_BAILIAN_ACCESS_KEY_SECRET=your_access_key_secret
```

### 可选配置
```env
# JWT密钥（建议修改）
JWT_SECRET=your_secure_jwt_secret_key_here

# 邮件服务（可选）
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# 监控配置（可选）
PROMETHEUS_ENABLED=true
```

## 🐳 Docker镜像信息

### 镜像标签说明
- `latest`: 最新稳定版
- `v1.0.0`: 版本标签
- `dev`: 开发版本

### 镜像特性
- **多阶段构建**: 优化镜像大小
- **安全加固**: 使用非root用户运行
- **健康检查**: 自动服务监控
- **日志轮转**: 自动日志管理
- **性能优化**: 生产环境调优

### 镜像内容
- 前端: React + TypeScript构建的静态文件
- 后端: Node.js + Express API服务
- 数据库: Supabase客户端
- 监控: 内置健康检查端点

## 🚢 部署方案

### 单机部署
```bash
# 使用docker-compose部署所有服务
docker-compose -f docker-compose.prod.yml up -d

# 服务访问地址:
# - 前端应用: http://your-server-ip
# - API文档: http://your-server-ip/api/docs
# - 健康检查: http://your-server-ip/health
```

### 集群部署（使用Docker Swarm）
```bash
# 初始化Swarm
docker swarm init

# 部署堆栈
docker stack deploy -c docker-compose.prod.yml ai-travel-planner

# 查看服务
docker service ls
```

### Kubernetes部署
```bash
# 应用Kubernetes配置
kubectl apply -f kubernetes/

# 查看部署状态
kubectl get pods,services,ingress
```

## 🔒 安全配置

### SSL证书配置
```bash
# 创建SSL证书目录
mkdir -p ssl

# 放置证书文件（需要替换为实际证书）
cp your-cert.pem ssl/cert.pem
cp your-key.pem ssl/key.pem
```

### 防火墙配置
```bash
# 开放必要端口
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 22/tcp    # SSH
```

## 📊 监控和维护

### 服务监控
```bash
# 查看服务状态
docker-compose -f docker-compose.prod.yml ps

# 查看资源使用
docker stats

# 查看日志
docker-compose -f docker-compose.prod.yml logs -f app
```

### 健康检查
```bash
# 手动健康检查
curl -f http://localhost/health

# 自动化监控脚本
./monitoring/health-check.sh
```

### 备份和恢复
```bash
# 备份配置文件
tar -czf backup-$(date +%Y%m%d).tar.gz .env.production logs/ uploads/

# 恢复配置
tar -xzf backup-20241201.tar.gz
```

## 🛠️ 故障排除

### 常见问题

#### 1. 容器启动失败
```bash
# 检查日志
docker logs ai-travel-planner

# 常见原因：环境变量配置错误、端口占用、权限问题
```

#### 2. API服务不可用
```bash
# 检查服务状态
curl http://localhost/health

# 检查网络连接
docker exec ai-travel-planner ping api.iflytek.com
```

#### 3. 静态资源加载失败
```bash
# 检查Nginx配置
docker exec travel-planner-nginx nginx -t

# 重启Nginx服务
docker-compose restart nginx
```

### 日志分析
```bash
# 查看应用日志
tail -f logs/app.log

# 查看Nginx访问日志
docker logs travel-planner-nginx

# 查看错误日志
grep -i error logs/app.log
```

## 🔄 更新和维护

### 更新镜像
```bash
# 拉取最新镜像
docker pull your-username/ai-travel-planner:latest

# 重启服务
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d
```

### 数据备份
```bash
# 备份重要数据
docker exec ai-travel-planner tar -czf /app/backup/backup-$(date +%Y%m%d).tar.gz /app/logs /app/uploads

# 下载备份
docker cp ai-travel-planner:/app/backup/backup-20241201.tar.gz ./
```

## 🌐 访问和使用

### 首次访问
1. 打开浏览器访问 `http://your-server-ip`
2. 注册新用户账户
3. 开始使用语音识别和AI行程规划功能

### API使用
```bash
# 获取API文档
curl http://localhost/api/docs

# 测试API端点
curl -X POST http://localhost/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password","name":"Test User"}'
```

## 📞 技术支持

### 文档资源
- [项目GitHub仓库](https://github.com/your-username/ai-travel-planner)
- [API配置指南](API_CONFIG.md)
- [故障排除指南](TROUBLESHOOTING.md)

### 问题反馈
如果遇到问题，请提供以下信息：
1. Docker版本：`docker --version`
2. 系统信息：`uname -a`
3. 错误日志：`docker logs ai-travel-planner`
4. 配置信息（脱敏后）

---

**注意**: 请确保所有API密钥配置正确，并且服务器可以访问外部API服务。首次部署建议先进行功能测试。