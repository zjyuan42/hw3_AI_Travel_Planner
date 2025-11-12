import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

// 导入路由
import authRoutes from './routes/auth.js';
import travelRoutes from './routes/travel.js';
import budgetRoutes from './routes/budget.js';
import voiceRoutes from './routes/voice.js';
import mapRoutes from './routes/map.js';

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 安全中间件
app.use(helmet());
app.use(compression());

// 日志中间件
app.use(morgan('combined'));

// 速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 限制每个IP 15分钟内最多100次请求
  message: '请求过于频繁，请稍后再试'
});
app.use(limiter);

// 解析请求体
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS配置
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// 健康检查端点
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'AI Travel Planner API'
  });
});

// API路由
app.use('/api/auth', authRoutes);
app.use('/api/travel', travelRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/api/map', mapRoutes);

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API端点不存在'
  });
});

// 全局错误处理
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({
    success: false,
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 AI旅行规划器后端服务运行在端口 ${PORT}`);
  console.log(`📊 环境: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 健康检查: http://localhost:${PORT}/health`);
});

export default app;