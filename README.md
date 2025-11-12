# 🗺️ AI旅行规划器 (AI Travel Planner)

一个基于AI的智能旅行规划应用，通过语音输入自动生成个性化旅行路线，提供实时地图导航和费用预算管理。

## ✨ 核心功能

- **🎤 智能语音行程规划** - 支持语音输入旅行需求，AI自动生成详细行程
- **🗺️ 实时地图导航** - 集成高德地图，提供地理位置服务和路线规划
- **💰 费用预算管理** - AI预算分析，实时记录和管理旅行开销
- **👤 用户管理系统** - 注册登录，多设备数据云端同步
- **🚀 现代化Web界面** - 响应式设计，美观易用的用户界面

## 🛠️ 技术栈

### 前端
- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **UI组件**: Ant Design
- **状态管理**: React Hooks + Context
- **路由**: React Router
- **地图**: 高德地图 API

### 后端
- **运行时**: Node.js + Express
- **数据库**: Supabase (PostgreSQL)
- **认证**: JWT + Supabase Auth
- **语音识别**: 科大讯飞 WebSocket API
- **AI服务**: 阿里云百炼大语言模型

### 部署与运维
- **容器化**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **镜像仓库**: 阿里云容器镜像服务
- **监控**: Prometheus + Grafana
- **反向代理**: Nginx

## 🚀 快速开始

### 方式一：使用预构建Docker镜像（推荐）

#### Linux/macOS
```bash
# 下载并运行一键脚本
./run-docker.sh
```

#### Windows
```cmd
# 双击运行批处理文件
run-docker.bat
```

### 方式二：从源码构建

#### 环境要求
- Node.js 18+
- Docker & Docker Compose

#### 构建步骤
```bash
# 1. 克隆项目
git clone https://github.com/your-username/ai-travel-planner.git
cd ai-travel-planner

# 2. 安装依赖
cd backend && npm install
cd ../frontend && npm install

# 3. 配置环境变量
cp backend/.env.example backend/.env.production
# 编辑 .env.production 配置API密钥

# 4. 构建Docker镜像
docker build -t ai-travel-planner:latest .

# 5. 运行服务
docker run -d -p 80:5000 --name ai-travel-planner ai-travel-planner:latest
```

## 🔑 API密钥配置

运行前需要配置以下API密钥（在`.env.production`文件中）：

### 必需配置
- **Supabase**: 数据库和用户认证
- **科大讯飞**: 语音识别功能
- **高德地图**: 地图和地理位置服务
- **阿里云百炼**: AI行程规划

### 详细配置指南
请参考 [`API_CONFIG.md`](API_CONFIG.md) 文档获取详细的API申请和配置说明。

## 📦 Docker镜像

### 镜像地址
- **阿里云镜像**: `registry.cn-hangzhou.aliyuncs.com/ai-travel-planner/ai-travel-planner:latest`
- **Docker Hub**: `ai-travel-planner/ai-travel-planner:latest`

### 拉取镜像
```bash
# 从阿里云拉取
docker pull registry.cn-hangzhou.aliyuncs.com/ai-travel-planner/ai-travel-planner:latest

# 或从Docker Hub拉取
docker pull ai-travel-planner/ai-travel-planner:latest
```

## 🏗️ 项目结构

```
ai-travel-planner/
├── frontend/                 # React前端应用
│   ├── src/
│   │   ├── components/      # 可复用组件
│   │   ├── pages/          # 页面组件
│   │   ├── services/       # API服务
│   │   └── utils/          # 工具函数
├── backend/                 # Node.js后端服务
│   ├── src/
│   │   ├── routes/         # API路由
│   │   ├── services/       # 业务服务层
│   │   ├── middleware/     # 中间件
│   │   └── config/         # 配置文件
├── nginx/                  # Nginx配置
├── docker/                 # Docker相关文件
├── .github/workflows/      # GitHub Actions工作流
└── docs/                   # 项目文档
```

## 📚 详细文档

- [🚀 Docker运行指南](DOCKER_RUN_GUIDE.md) - 完整的Docker部署说明
- [🔧 API配置指南](API_CONFIG.md) - API密钥申请和配置
- [🧪 测试指南](TESTING_GUIDE.md) - 测试和验证方法
- [🏗️ 架构设计](ARCHITECTURE.md) - 系统架构和技术设计
- [📊 监控指南](MONITORING.md) - 系统监控和日志管理

## 🔄 开发工作流

### 本地开发
```bash
# 启动后端开发服务器
cd backend && npm run dev

# 启动前端开发服务器
cd frontend && npm run dev
```

### 测试
```bash
# 运行单元测试
npm test

# 运行集成测试
npm run test:integration

# 运行端到端测试
npm run test:e2e
```

### 构建和部署
```bash
# 构建生产版本
npm run build

# 构建Docker镜像
docker build -t ai-travel-planner:latest .

# 使用Docker Compose部署
docker-compose up -d
```

## 🌐 访问地址

部署成功后，通过以下地址访问应用：

- **主应用**: http://localhost
- **健康检查**: http://localhost/health
- **API文档**: http://localhost/api/docs

## 🔒 安全特性

- JWT身份认证和授权
- API速率限制
- CORS安全配置
- 环境变量加密存储
- 输入验证和清理
- SQL注入防护

## 📊 监控和日志

- 健康检查端点
- 请求日志记录
- 错误追踪
- 性能监控
- 自动备份

## 🤝 贡献指南

1. Fork本项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [Supabase](https://supabase.com) - 开源Firebase替代品
- [Ant Design](https://ant.design) - 企业级UI设计语言
- [科大讯飞](https://www.iflytek.com) - 语音识别服务
- [高德地图](https://lbs.amap.com) - 地图和位置服务
- [阿里云百炼](https://bailian.aliyun.com) - 大语言模型服务

## 📞 支持

如有问题或建议，请通过以下方式联系：

- 📧 邮箱: your-email@example.com
- 🐛 [问题反馈](https://github.com/your-username/ai-travel-planner/issues)
- 💬 [讨论区](https://github.com/your-username/ai-travel-planner/discussions)

---

**🚀 立即开始您的智能旅行规划体验！**