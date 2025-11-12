# AI Travel Planner 测试指南

本文档详细说明如何配置API密钥并进行项目测试。

## 🎯 测试方式选择

### 方式一：模拟模式测试（推荐）
无需真实API密钥，使用模拟数据测试所有功能。

### 方式二：真实API测试
配置真实API密钥，测试完整功能。

## 🔧 模拟模式测试

### 1. 启动模拟服务器
```bash
# 进入后端目录
cd backend

# 启动模拟服务器
node test-server.js
```

服务器将在 http://localhost:5001 启动，提供所有API的模拟响应。

### 2. 运行功能测试
```bash
# 在项目根目录运行测试脚本
node test-app.js
```

测试脚本会自动：
- 启动测试服务器
- 运行10个核心功能测试
- 显示详细的测试结果

### 3. 手动测试API
使用 curl 或 Postman 测试各个端点：

```bash
# 健康检查
curl http://localhost:5001/health

# 用户注册
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password", "name": "测试用户"}'

# 用户登录
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password"}'

# 获取token后测试其他API（替换 YOUR_TOKEN）
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5001/api/travel/plans
```

## 🔑 真实API配置测试

### 步骤1：申请API密钥

#### 科大讯飞语音识别
1. 访问 [科大讯飞开放平台](https://www.xfyun.cn/)
2. 注册账号并完成实名认证
3. 创建新应用，选择"语音听写"服务
4. 获取以下信息：
   - `APPID`
   - `API Key` 
   - `API Secret`

#### 高德地图
1. 访问 [高德开放平台](https://lbs.amap.com/)
2. 注册开发者账号
3. 创建新应用，选择"Web服务"
4. 获取 `Key`

#### 阿里云百炼
1. 访问 [阿里云百炼](https://bailian.aliyuncs.com/)
2. 注册阿里云账号并完成实名认证
3. 开通百炼服务
4. 在RAM控制台创建AccessKey：
   - `AccessKey ID`
   - `AccessKey Secret`

#### Supabase
1. 访问 [Supabase](https://supabase.com/)
2. 注册账号并创建新项目
3. 在项目设置中获取：
   - `Project URL`
   - `anon public key`
   - `service_role key`

### 步骤2：配置环境变量

复制模板文件：
```bash
cp backend/.env.example backend/.env
```

编辑 `backend/.env` 文件，填入真实的API密钥：

```env
# 服务器配置
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# Supabase配置
SUPABASE_URL=你的_supabase_project_url
SUPABASE_ANON_KEY=你的_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=你的_supabase_service_role_key

# JWT配置
JWT_SECRET=你的_jwt密钥_至少32位
JWT_EXPIRES_IN=7d

# 科大讯飞语音识别
IFLYTEK_APP_ID=你的_iflytek_app_id
IFLYTEK_API_KEY=你的_iflytek_api_key
IFLYTEK_API_SECRET=你的_iflytek_api_secret

# 高德地图
AMAP_API_KEY=你的_amap_api_key

# 阿里云百炼
ALIYUN_BAILIAN_ACCESS_KEY_ID=你的_aliyun_access_key_id
ALIYUN_BAILIAN_ACCESS_KEY_SECRET=你的_aliyun_access_key_secret
ALIYUN_BAILIAN_ENDPOINT=bailian.cn-beijing.aliyuncs.com
ALIYUN_BAILIAN_MODEL=qwen-plus
```

### 步骤3：初始化数据库

在Supabase的SQL编辑器中执行以下SQL创建表结构：

```sql
-- 创建用户表
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100),
    avatar TEXT,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建旅行计划表
CREATE TABLE travel_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    destination VARCHAR(200) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days INTEGER NOT NULL,
    budget DECIMAL(10,2) NOT NULL,
    travelers INTEGER NOT NULL,
    preferences JSONB DEFAULT '[]',
    itinerary JSONB DEFAULT '[]',
    budget_breakdown JSONB DEFAULT '{}',
    travel_tips JSONB DEFAULT '[]',
    emergency_contacts JSONB DEFAULT '[]',
    status VARCHAR(50) DEFAULT 'draft',
    ai_generated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建预算项目表
CREATE TABLE budget_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    plan_id UUID REFERENCES travel_plans(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL,
    description VARCHAR(200) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 步骤4：启动真实服务

```bash
# 安装依赖
npm install
cd backend && npm install
cd ../frontend && npm install

# 启动开发服务器
npm run dev
```

服务将在：
- 前端: http://localhost:3000
- 后端: http://localhost:5000

## 🧪 测试用例

### 核心功能测试清单

#### 1. 用户认证
- [ ] 用户注册
- [ ] 用户登录
- [ ] JWT令牌验证
- [ ] 获取用户信息

#### 2. 语音识别
- [ ] 语音服务状态检查
- [ ] 音频文件识别
- [ ] 实时语音流识别
- [ ] 识别结果解析

#### 3. AI行程规划
- [ ] AI生成旅行计划
- [ ] 行程合理性验证
- [ ] 预算分配检查
- [ ] 旅行建议生成

#### 4. 地图服务
- [ ] 地理编码（地址转坐标）
- [ ] 逆地理编码（坐标转地址）
- [ ] POI兴趣点搜索
- [ ] 路径规划

#### 5. 预算管理
- [ ] 添加预算项目
- [ ] 预算统计分析
- [ ] 预算超支预警
- [ ] 数据导出

### API测试命令

使用真实服务时的测试命令：

```bash
# 健康检查
curl http://localhost:5000/health

# 用户注册
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123", "name": "测试用户"}'

# 用户登录（保存返回的token）
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}' | jq -r '.data.token')

# 使用token测试其他API
curl -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/travel/plans

# AI生成旅行计划
curl -X POST http://localhost:5000/api/travel/plans/ai-generate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "destination": "北京",
    "days": 3,
    "budget": 2000,
    "travelers": 2,
    "preferences": ["美食", "文化"]
  }'
```

## 🐳 Docker测试

### 使用Docker Compose测试

```bash
# 构建并启动服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f app

# 测试健康检查
curl http://localhost:5000/health
```

### 自定义环境变量

创建 `docker-compose.override.yml` 用于测试：

```yaml
version: '3.8'
services:
  app:
    environment:
      - NODE_ENV=development
      - ENABLE_MOCK_SERVICES=true
    volumes:
      - .:/app
```

## 🔍 故障排除

### 常见问题

#### 1. API密钥错误
**症状**: 401或403错误
**解决**: 
- 检查API密钥是否正确
- 确认服务是否已开通
- 查看API调用配额

#### 2. 数据库连接失败
**症状**: 数据库操作超时或失败
**解决**:
- 检查Supabase项目URL和密钥
- 确认网络连接
- 验证表结构是否正确创建

#### 3. 语音识别失败
**症状**: 语音识别返回空结果或错误
**解决**:
- 检查科大讯飞服务状态
- 验证音频格式支持
- 确认API配额充足

#### 4. AI服务不可用
**症状**: 旅行计划生成失败
**解决**:
- 检查阿里云百炼服务状态
- 验证AccessKey配置
- 确认模型可用性

### 调试技巧

1. **查看详细日志**:
```bash
# 后端日志
cd backend && npm run dev

# 或查看Docker日志
docker-compose logs -f app
```

2. **使用调试模式**:
```env
NODE_ENV=development
LOG_LEVEL=debug
```

3. **API监控**:
- 使用Postman或curl测试单个端点
- 检查网络请求和响应
- 验证请求头和请求体格式

## 📊 测试报告

测试完成后，请填写以下检查表：

### 功能测试
- [ ] 用户注册登录正常
- [ ] 语音识别准确率达标
- [ ] AI行程规划合理
- [ ] 地图服务响应正确
- [ ] 预算管理功能完整
- [ ] 数据持久化正常

### 性能测试
- [ ] API响应时间 < 2秒
- [ ] 并发用户支持
- [ ] 内存使用正常
- [ ] 无内存泄漏

### 安全测试
- [ ] 敏感信息不泄露
- [ ] API密钥安全
- [ ] 输入验证有效
- [ ] 权限控制正确

## 📞 技术支持

如果测试过程中遇到问题：

1. 查看项目文档：`README.md`, `API_CONFIG.md`
2. 检查错误日志和控制台输出
3. 验证环境变量配置
4. 确认网络连接和API服务状态

如需进一步帮助，请提供：
- 错误日志
- 环境配置
- 复现步骤
- 期望与实际结果

---

**祝您测试顺利！** 🎉

通过完整的测试，您可以确保AI Travel Planner的所有功能正常工作，为用户提供优质的旅行规划体验。