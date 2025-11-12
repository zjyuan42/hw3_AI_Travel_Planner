# AI Travel Planner 部署指南

本文档详细说明如何部署 AI Travel Planner 项目到不同环境。

## 📋 部署前准备

### 系统要求
- **操作系统**: Ubuntu 20.04+ / CentOS 7+ / Windows Server 2019+
- **内存**: 最小 2GB，推荐 4GB+
- **存储**: 最小 10GB 可用空间
- **网络**: 需要访问外部 API 服务

### 必要服务
- Docker 20.10+
- Docker Compose 2.0+
- Git

## 🚀 快速部署

### 1. 获取代码
```bash
git clone https://github.com/your-username/ai-travel-planner.git
cd ai-travel-planner
```

### 2. 配置环境变量
```bash
# 复制环境变量模板
cp backend/.env.example backend/.env

# 编辑配置文件
vim backend/.env
```

**必需配置项:**
```env
# 服务器配置
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-domain.com

# Supabase配置
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# JWT配置
JWT_SECRET=your_secure_jwt_secret_key
JWT_EXPIRES_IN=7d

# API服务配置
IFLYTEK_APP_ID=your_iflytek_app_id
IFLYTEK_API_KEY=your_iflytek_api_key
IFLYTEK_API_SECRET=your_iflytek_api_secret
AMAP_API_KEY=your_amap_api_key
ALIYUN_BAILIAN_ACCESS_KEY_ID=your_aliyun_access_key_id
ALIYUN_BAILIAN_ACCESS_KEY_SECRET=your_aliyun_access_key_secret
```

### 3. 启动服务
```bash
# 使用 Docker Compose
docker-compose up -d

# 或者使用生产环境 Dockerfile
docker build -t ai-travel-planner:latest .
docker run -d --name ai-travel-planner -p 5000:5000 --env-file backend/.env ai-travel-planner:latest
```

### 4. 验证部署
```bash
# 检查服务状态
curl http://localhost:5000/health

# 预期响应
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "AI Travel Planner API"
}
```

## ☁️ 云平台部署

### 阿里云部署

#### 1. 容器镜像服务 (ACR)
```bash
# 登录阿里云容器镜像服务
docker login --username=your_username registry.cn-hangzhou.aliyuncs.com

# 构建并推送镜像
docker build -t registry.cn-hangzhou.aliyuncs.com/your-namespace/ai-travel-planner:latest .
docker push registry.cn-hangzhou.aliyuncs.com/your-namespace/ai-travel-planner:latest
```

#### 2. 容器服务 (ACK)
```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ai-travel-planner
spec:
  replicas: 2
  selector:
    matchLabels:
      app: ai-travel-planner
  template:
    metadata:
      labels:
        app: ai-travel-planner
    spec:
      containers:
      - name: app
        image: registry.cn-hangzhou.aliyuncs.com/your-namespace/ai-travel-planner:latest
        ports:
        - containerPort: 5000
        envFrom:
        - secretRef:
            name: app-secrets
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 5000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 5000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: ai-travel-planner-service
spec:
  selector:
    app: ai-travel-planner
  ports:
  - port: 80
    targetPort: 5000
  type: LoadBalancer
```

### 腾讯云部署

#### 1. 容器服务 (TKE)
```bash
# 登录腾讯云容器镜像服务
docker login ccr.ccs.tencentyun.com

# 构建并推送镜像
docker build -t ccr.ccs.tencentyun.com/your-namespace/ai-travel-planner:latest .
docker push ccr.ccs.tencentyun.com/your-namespace/ai-travel-planner:latest
```

### AWS 部署

#### 1. ECS Fargate
```yaml
# task-definition.json
{
  "family": "ai-travel-planner",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::123456789012:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "app",
      "image": "your-account-id.dkr.ecr.region.amazonaws.com/ai-travel-planner:latest",
      "portMappings": [
        {
          "containerPort": 5000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {"name": "NODE_ENV", "value": "production"},
        {"name": "PORT", "value": "5000"}
      ],
      "secrets": [
        {"name": "SUPABASE_URL", "valueFrom": "arn:aws:ssm:region:account-id:parameter/supabase-url"},
        {"name": "SUPABASE_ANON_KEY", "valueFrom": "arn:aws:ssm:region:account-id:parameter/supabase-anon-key"}
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/ai-travel-planner",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

## 🔧 环境配置

### 开发环境
```env
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000
LOG_LEVEL=debug
```

### 测试环境
```env
NODE_ENV=staging
PORT=5000
FRONTEND_URL=https://staging.your-domain.com
LOG_LEVEL=info
```

### 生产环境
```env
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-domain.com
LOG_LEVEL=warn
```

## 🔒 安全配置

### 1. SSL/TLS 配置
```nginx
# nginx.conf
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    
    location / {
        proxy_pass http://app:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 2. 防火墙配置
```bash
# 只开放必要端口
ufw allow ssh
ufw allow 80
ufw allow 443
ufw enable
```

### 3. 数据库安全
- 使用强密码
- 启用 SSL 连接
- 定期备份
- 监控异常访问

## 📊 监控和日志

### 1. 健康检查
```bash
# 手动检查
curl -f http://localhost:5000/health

# 自动化监控脚本
#!/bin/bash
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/health)
if [ $response -ne 200 ]; then
    echo "服务异常，HTTP状态码: $response"
    # 发送告警通知
fi
```

### 2. 日志配置
```javascript
// 日志中间件
app.use(morgan('combined', {
    stream: {
        write: (message) => {
            logger.info(message.trim());
        }
    }
}));
```

### 3. 性能监控
```yaml
# Prometheus配置
scrape_configs:
  - job_name: 'ai-travel-planner'
    static_configs:
      - targets: ['localhost:5000']
    metrics_path: '/metrics'
    scrape_interval: 15s
```

## 🔄 持续部署

### GitHub Actions 自动化
项目已配置 GitHub Actions，在推送到 main 分支时自动：
1. 运行测试和代码检查
2. 构建 Docker 镜像
3. 推送到阿里云镜像仓库
4. 部署到目标环境

### 手动部署脚本
```bash
#!/bin/bash
# deploy.sh

echo "开始部署 AI Travel Planner..."

# 拉取最新代码
git pull origin main

# 构建新镜像
docker-compose build

# 重启服务
docker-compose down
docker-compose up -d

# 等待服务启动
sleep 30

# 健康检查
if curl -f http://localhost:5000/health; then
    echo "部署成功!"
else
    echo "部署失败，服务未正常启动"
    exit 1
fi
```

## 🚨 故障排除

### 常见问题

#### 1. 服务无法启动
```bash
# 检查日志
docker-compose logs app

# 常见原因：
# - 环境变量配置错误
# - 端口被占用
# - 依赖服务不可用
```

#### 2. 数据库连接失败
```bash
# 检查数据库连接
docker exec -it travel-planner-db psql -U travel_user -d travel_planner

# 解决方案：
# - 检查数据库服务状态
# - 验证连接字符串
# - 检查网络连接
```

#### 3. API 服务不可用
```bash
# 检查 API 密钥配置
docker exec ai-travel-planner printenv | grep API

# 验证外部 API 访问
curl "https://restapi.amap.com/v3/ip?key=YOUR_AMAP_KEY"
```

#### 4. 内存不足
```bash
# 检查系统资源
docker stats

# 解决方案：
# - 增加内存限制
# - 优化应用配置
# - 添加交换空间
```

### 性能优化建议

1. **前端优化**
   - 启用 Gzip 压缩
   - 使用 CDN 加速静态资源
   - 实现代码分割和懒加载

2. **后端优化**
   - 启用缓存（Redis）
   - 数据库查询优化
   - 连接池配置

3. **基础设施优化**
   - 负载均衡
   - 自动扩缩容
   - 内容分发网络

## 📞 支持与维护

### 维护任务
- [ ] 定期更新依赖包
- [ ] 备份数据库
- [ ] 监控系统性能
- [ ] 检查安全漏洞
- [ ] 更新 SSL 证书

### 获取帮助
- 查看项目 [README.md](README.md)
- 提交 [GitHub Issues](https://github.com/your-username/ai-travel-planner/issues)
- 联系技术支持团队

---

**部署完成！** 🎉

您的 AI Travel Planner 现在已经成功部署并运行。接下来可以：
1. 访问前端界面进行测试
2. 配置域名和 SSL 证书
3. 设置监控告警
4. 进行性能调优

如有任何问题，请参考本文档的故障排除部分或联系技术支持。