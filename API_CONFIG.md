# API 配置指南

本文档详细说明 AI Travel Planner 项目所需的各种 API 服务的申请和配置方法。

## 📋 概述

AI Travel Planner 集成了多个第三方 API 服务，包括：
- **科大讯飞** - 语音识别服务
- **高德地图** - 地图和位置服务  
- **阿里云百炼** - 大语言模型服务
- **Supabase** - 数据库和认证服务

## 🗣️ 科大讯飞语音识别

### 服务介绍
科大讯飞提供中文语音识别服务，支持实时语音识别和音频文件识别。

### 申请步骤

#### 1. 注册账号
访问 [科大讯飞开放平台](https://www.xfyun.cn/)，注册开发者账号。

#### 2. 创建应用
1. 登录控制台
2. 进入"我的应用"页面
3. 点击"创建新应用"
4. 填写应用信息：
   - 应用名称：AI Travel Planner
   - 应用分类：生活服务
   - 应用描述：智能旅行规划语音识别服务

#### 3. 获取认证信息
创建应用后，在应用详情页面获取：
- `APPID` - 应用ID
- `API Key` - API密钥
- `API Secret` - API密钥密钥

#### 4. 开通服务
在应用内开通以下服务：
- **语音听写（流式版）** - 用于实时语音识别
- **语音转写** - 用于音频文件识别

#### 5. 配置环境变量
```env
IFLYTEK_APP_ID=5e000001
IFLYTEK_API_KEY=1234567890abcdef1234567890abcdef
IFLYTEK_API_SECRET=1234567890abcdef1234567890abcdef12345678
```

### 测试方法
```bash
# 测试语音识别服务
curl -X POST http://localhost:5000/api/voice/status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🗺️ 高德地图服务

### 服务介绍
高德地图提供地理位置服务，包括地理编码、路径规划、POI搜索等功能。

### 申请步骤

#### 1. 注册账号
访问 [高德开放平台](https://lbs.amap.com/)，注册开发者账号。

#### 2. 创建应用
1. 进入控制台
2. 点击"应用管理" → "我的应用"
3. 点击"创建新应用"
4. 填写应用信息

#### 3. 添加 Key
1. 在应用详情页面点击"添加新Key"
2. 选择"Web服务"类型
3. 填写Key名称：AI Travel Planner Server
4. 服务选择：Web服务 API

#### 4. 获取 API Key
创建成功后获取：
- `Web服务Key` - 用于服务器端调用

#### 5. 配置环境变量
```env
AMAP_API_KEY=1234567890abcdef1234567890abcdef
```

### 服务配额
- 每日调用限额：根据套餐不同
- 并发限制：根据套餐不同
- 免费额度：足够开发测试使用

### 测试方法
```bash
# 测试地理编码服务
curl -X POST http://localhost:5000/api/map/geocode \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"address": "北京市朝阳区"}'
```

## 🧠 阿里云百炼大语言模型

### 服务介绍
阿里云百炼提供大语言模型服务，用于生成旅行计划和预算分析。

### 申请步骤

#### 1. 注册账号
访问 [阿里云官网](https://www.aliyun.com/)，注册账号并完成实名认证。

#### 2. 开通服务
1. 进入 [阿里云百炼控制台](https://bailian.aliyun.com/)
2. 点击"立即开通"
3. 选择适合的套餐（建议选择按量付费）

#### 3. 创建 Access Key
1. 进入 [RAM访问控制](https://ram.console.aliyun.com/)
2. 点击"用户" → "创建用户"
3. 填写用户信息，勾选"OpenAPI调用访问"
4. 保存 AccessKey ID 和 AccessKey Secret

#### 4. 授权权限
为用户添加以下权限策略：
- `AliyunBailianFullAccess` - 百炼全权限访问

#### 5. 获取模型信息
在百炼控制台获取：
- 服务端点（Endpoint）
- 可用模型列表

#### 6. 配置环境变量
```env
ALIYUN_BAILIAN_ACCESS_KEY_ID=LTAI5t1234567890abcdef
ALIYUN_BAILIAN_ACCESS_KEY_SECRET=1234567890abcdef1234567890abcdef
ALIYUN_BAILIAN_ENDPOINT=bailian.cn-beijing.aliyuncs.com
ALIYUN_BAILIAN_MODEL=qwen-plus
```

### 支持模型
- `qwen-plus` - 通义千问增强版（推荐）
- `qwen-turbo` - 通义千问高速版
- `qwen-max` - 通义千问最大版

### 测试方法
```bash
# 测试AI服务状态
curl -X GET http://localhost:5000/api/travel/advice \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"destination": "北京", "preferences": ["美食", "文化"]}'
```

## 🗄️ Supabase 数据库

### 服务介绍
Supabase 提供 PostgreSQL 数据库和认证服务。

### 申请步骤

#### 1. 注册账号
访问 [Supabase官网](https://supabase.com/)，注册账号。

#### 2. 创建项目
1. 登录控制台
2. 点击"New Project"
3. 填写项目信息：
   - 名称：AI Travel Planner
   - 数据库密码：设置强密码
   - 区域：选择离用户近的区域

#### 3. 获取连接信息
项目创建后，在设置页面获取：
- `URL` - 项目URL
- `anon key` - 匿名访问密钥
- `service_role key` - 服务角色密钥

#### 4. 配置环境变量
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

### 数据库初始化

#### 1. 创建数据表
在 Supabase SQL 编辑器中执行以下 SQL：

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

-- 创建索引
CREATE INDEX idx_travel_plans_user_id ON travel_plans(user_id);
CREATE INDEX idx_travel_plans_status ON travel_plans(status);
CREATE INDEX idx_budget_items_plan_id ON budget_items(plan_id);
CREATE INDEX idx_budget_items_category ON budget_items(category);
CREATE INDEX idx_users_email ON users(email);

-- 启用行级安全
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_items ENABLE ROW LEVEL SECURITY;

-- 创建策略
CREATE POLICY "用户只能访问自己的数据" ON users FOR ALL USING (auth.uid() = id);
CREATE POLICY "用户只能访问自己的旅行计划" ON travel_plans FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "用户只能访问自己旅行计划的预算" ON budget_items FOR ALL USING (EXISTS (SELECT 1 FROM travel_plans WHERE travel_plans.id = budget_items.plan_id AND travel_plans.user_id = auth.uid()));
```

#### 2. 配置认证
在 Supabase 认证设置中：
1. 启用邮箱认证
2. 配置重定向URL
3. 设置会话时长

### 测试方法
```bash
# 测试数据库连接
curl -X GET http://localhost:5000/health
```

## 🔐 JWT 配置

### 生成 JWT Secret
```bash
# 生成随机密钥
openssl rand -base64 64

# 或者在 Node.js 中生成
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

### 配置环境变量
```env
JWT_SECRET=your_super_secure_jwt_secret_key_here_make_it_very_long_and_random
JWT_EXPIRES_IN=7d
```

## 🔧 本地开发配置

### 环境变量模板
创建 `backend/.env` 文件：

```env
# 服务器配置
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# 数据库配置
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# JWT配置
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# 语音识别配置
IFLYTEK_APP_ID=your_iflytek_app_id
IFLYTEK_API_KEY=your_iflytek_api_key
IFLYTEK_API_SECRET=your_iflytek_api_secret

# 地图服务配置
AMAP_API_KEY=your_amap_api_key

# AI服务配置
ALIYUN_BAILIAN_ACCESS_KEY_ID=your_aliyun_access_key_id
ALIYUN_BAILIAN_ACCESS_KEY_SECRET=your_aliyun_access_key_secret
ALIYUN_BAILIAN_ENDPOINT=bailian.cn-beijing.aliyuncs.com
ALIYUN_BAILIAN_MODEL=qwen-plus

# 其他配置
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=debug
```

## 🧪 测试配置

### 健康检查端点
所有服务都提供健康检查端点：

```bash
# 检查整体服务状态
curl http://localhost:5000/health

# 检查语音识别服务
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/voice/status

# 检查地图服务  
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/map/status

# 检查AI服务（通过实际调用测试）
curl -X POST http://localhost:5000/api/travel/plans/ai-generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"destination": "测试", "days": 1, "budget": 1000, "travelers": 1}'
```

### 模拟数据测试
如果某些服务不可用，可以使用模拟模式：

```env
# 在开发环境中启用模拟模式
ENABLE_MOCK_SERVICES=true
```

## 💰 费用估算

### 免费额度
- **科大讯飞**：每月一定量的免费调用
- **高德地图**：每日一定量的免费调用
- **阿里云百炼**：新用户有免费额度
- **Supabase**：免费套餐包含基本功能

### 生产环境预估
- 语音识别：根据使用量计费
- 地图服务：根据调用次数计费
- AI服务：按Token使用量计费
- 数据库：根据存储和请求量计费

## 🔒 安全建议

### API 密钥管理
1. **不要提交到代码库**
2. 使用环境变量管理
3. 定期轮换密钥
4. 设置访问限制

### 访问控制
1. 配置 IP 白名单
2. 设置 API 调用频率限制
3. 监控异常访问模式
4. 启用审计日志

### 数据保护
1. 加密敏感数据
2. 遵守数据隐私法规
3. 定期备份数据
4. 实施数据保留策略

## 🆘 故障排除

### 常见问题

#### 1. API 调用失败
- 检查网络连接
- 验证 API 密钥
- 查看服务配额
- 检查请求格式

#### 2. 认证错误
- 验证 JWT 配置
- 检查令牌有效期
- 确认用户权限

#### 3. 服务不可用
- 检查服务状态页面
- 查看错误日志
- 联系技术支持

### 获取帮助
- 查看各服务商的官方文档
- 访问项目 GitHub Issues
- 联系技术支持团队

---

**配置完成！** 🎉

所有 API 服务现已配置完成，可以开始使用 AI Travel Planner 的全部功能。

如果遇到任何配置问题，请参考本文档的故障排除部分或联系技术支持。