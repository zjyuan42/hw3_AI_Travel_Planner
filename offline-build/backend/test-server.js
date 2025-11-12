import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// 加载测试环境变量
dotenv.config({ path: '.env.test' });

const app = express();
const PORT = process.env.PORT || 5001;

// 中间件
app.use(cors());
app.use(express.json());

// 模拟数据
const mockUsers = [
  {
    id: 'user-1',
    email: 'test@example.com',
    name: '测试用户',
    preferences: {
      travelStyles: ['美食', '文化'],
      budgetRange: { min: 1000, max: 10000 },
      interests: ['历史', '自然']
    }
  }
];

const mockTravelPlans = [
  {
    id: 'plan-1',
    user_id: 'user-1',
    title: '东京5日游',
    destination: '东京, 日本',
    start_date: '2024-03-15',
    end_date: '2024-03-20',
    days: 5,
    budget: 8000,
    travelers: 2,
    preferences: ['美食', '购物', '动漫'],
    status: 'active',
    created_at: new Date().toISOString()
  }
];

const mockBudgetItems = [
  {
    id: 'budget-1',
    plan_id: 'plan-1',
    category: 'transportation',
    description: '往返机票',
    amount: 3000,
    date: '2024-03-15',
    created_at: new Date().toISOString()
  }
];

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'AI Travel Planner Test Server',
    environment: process.env.NODE_ENV
  });
});

// 模拟认证路由
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (email === 'test@example.com' && password === 'password') {
    res.json({
      success: true,
      data: {
        user: mockUsers[0],
        token: 'mock-jwt-token-for-testing'
      },
      message: '登录成功'
    });
  } else {
    res.status(401).json({
      success: false,
      message: '邮箱或密码不正确'
    });
  }
});

app.post('/api/auth/register', (req, res) => {
  const { email, name, password } = req.body;
  
  if (email && name && password) {
    res.status(201).json({
      success: true,
      data: {
        user: { ...mockUsers[0], email, name },
        token: 'mock-jwt-token-for-testing'
      },
      message: '注册成功'
    });
  } else {
    res.status(400).json({
      success: false,
      message: '请提供完整的注册信息'
    });
  }
});

// 模拟旅行计划路由
app.get('/api/travel/plans', (req, res) => {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: '未提供访问令牌'
    });
  }
  
  res.json({
    success: true,
    data: mockTravelPlans,
    message: '获取旅行计划成功'
  });
});

app.post('/api/travel/plans/ai-generate', (req, res) => {
  const { destination, days, budget, travelers, preferences } = req.body;
  
  if (!destination || !days || !budget || !travelers) {
    return res.status(400).json({
      success: false,
      message: '请提供完整的旅行信息'
    });
  }
  
  const mockPlan = {
    id: `plan-${Date.now()}`,
    user_id: 'user-1',
    title: `${destination} ${days}天旅行计划`,
    destination,
    start_date: '2024-03-15',
    end_date: '2024-03-20',
    days: parseInt(days),
    budget: parseFloat(budget),
    travelers: parseInt(travelers),
    preferences: preferences || [],
    itinerary: [
      {
        day: 1,
        date: '2024-03-15',
        theme: '抵达与适应',
        activities: [
          {
            time: '14:00-16:00',
            name: '抵达目的地',
            description: '乘坐飞机抵达，入住酒店',
            location: '机场 → 酒店',
            cost: 0,
            type: 'transportation'
          }
        ]
      }
    ],
    budget_breakdown: {
      totalBudget: budget,
      transportation: budget * 0.3,
      accommodation: budget * 0.4,
      food: budget * 0.2,
      activities: budget * 0.1
    },
    status: 'generated',
    ai_generated: true,
    created_at: new Date().toISOString()
  };
  
  mockTravelPlans.push(mockPlan);
  
  res.status(201).json({
    success: true,
    data: {
      plan: mockPlan,
      aiResponse: mockPlan,
      usage: { total_tokens: 1500, prompt_tokens: 800, completion_tokens: 700 }
    },
    message: 'AI生成旅行计划成功'
  });
});

// 模拟语音识别路由
app.post('/api/voice/recognize', (req, res) => {
  // 模拟处理时间
  setTimeout(() => {
    res.json({
      success: true,
      data: {
        text: '我想去日本东京旅行，5天时间，预算8000元，喜欢美食和购物',
        confidence: 0.92,
        isFinal: true
      },
      message: '语音识别成功'
    });
  }, 1000);
});

app.get('/api/voice/status', (req, res) => {
  res.json({
    success: true,
    data: {
      service: '科大讯飞语音识别',
      status: '模拟模式',
      features: ['文件识别', '实时流识别'],
      supportedFormats: ['audio/wav', 'audio/mp3', 'audio/m4a', 'audio/ogg']
    },
    message: '语音识别服务运行正常（模拟模式）'
  });
});

// 模拟地图服务路由
app.post('/api/map/geocode', (req, res) => {
  const { address } = req.body;
  
  res.json({
    success: true,
    data: {
      success: true,
      location: {
        lat: 35.6895,
        lng: 139.6917,
        formattedAddress: `${address}（模拟地址）`,
        province: '东京都',
        city: '东京',
        district: '新宿区'
      }
    },
    message: '地理编码成功'
  });
});

app.get('/api/map/search-poi', (req, res) => {
  const { keyword } = req.query;
  
  res.json({
    success: true,
    data: {
      success: true,
      pois: [
        {
          id: 'poi-1',
          name: `${keyword}景点`,
          type: 'sightseeing',
          address: '模拟地址',
          location: { lat: 35.6895, lng: 139.6917 }
        }
      ],
      total: 1,
      page: 1,
      pageSize: 10
    },
    message: 'POI搜索成功'
  });
});

// 模拟预算管理路由
app.get('/api/budget/plans/:planId/items', (req, res) => {
  const { planId } = req.params;
  
  const items = mockBudgetItems.filter(item => item.plan_id === planId);
  
  res.json({
    success: true,
    data: items,
    message: '获取预算项目成功'
  });
});

app.post('/api/budget/plans/:planId/items', (req, res) => {
  const { planId } = req.params;
  const { category, description, amount, date } = req.body;
  
  const newItem = {
    id: `budget-${Date.now()}`,
    plan_id: planId,
    category,
    description,
    amount: parseFloat(amount),
    date,
    created_at: new Date().toISOString()
  };
  
  mockBudgetItems.push(newItem);
  
  res.status(201).json({
    success: true,
    data: newItem,
    message: '添加预算项目成功'
  });
});

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API端点不存在'
  });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error('测试服务器错误:', err);
  res.status(500).json({
    success: false,
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'test' ? err.message : undefined
  });
});

// 启动测试服务器
app.listen(PORT, () => {
  console.log(`🧪 AI旅行规划器测试服务器运行在端口 ${PORT}`);
  console.log(`📊 环境: ${process.env.NODE_ENV}`);
  console.log(`🔗 健康检查: http://localhost:${PORT}/health`);
  console.log(`🎯 模拟模式: 所有API返回模拟数据`);
  console.log('\n可用端点:');
  console.log('  GET  /health');
  console.log('  POST /api/auth/login');
  console.log('  POST /api/auth/register');
  console.log('  GET  /api/travel/plans');
  console.log('  POST /api/travel/plans/ai-generate');
  console.log('  POST /api/voice/recognize');
  console.log('  GET  /api/voice/status');
  console.log('  POST /api/map/geocode');
  console.log('  GET  /api/map/search-poi');
  console.log('  GET  /api/budget/plans/:planId/items');
  console.log('  POST /api/budget/plans/:planId/items');
});

export default app;