#!/usr/bin/env node

/**
 * AI Travel Planner 功能测试脚本
 * 这个脚本用于测试项目的各个功能模块
 */

import { spawn } from 'child_process';
import http from 'http';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// 测试配置
const TEST_CONFIG = {
  baseUrl: 'http://localhost:5001',
  timeout: 10000,
  testUser: {
    email: 'test@example.com',
    password: 'password',
    name: '测试用户'
  }
};

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(message, color = colors.reset) {
  console.log(color + message + colors.reset);
}

function logSuccess(message) {
  log('✅ ' + message, colors.green);
}

function logError(message) {
  log('❌ ' + message, colors.red);
}

function logInfo(message) {
  log('ℹ️ ' + message, colors.blue);
}

function logWarning(message) {
  log('⚠️ ' + message, colors.yellow);
}

// HTTP请求辅助函数
async function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = responseData ? JSON.parse(responseData) : {};
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: parsedData
          });
        } catch (error) {
          reject(new Error(`JSON解析错误: ${error.message}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.setTimeout(TEST_CONFIG.timeout, () => {
      req.destroy();
      reject(new Error('请求超时'));
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// 测试用例
class TestSuite {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
    this.authToken = null;
  }
  
  addTest(name, testFn) {
    this.tests.push({ name, testFn });
  }
  
  async run() {
    log('\n' + colors.bright + '🚀 开始 AI Travel Planner 功能测试' + colors.reset);
    log('=' .repeat(50));
    
    for (const test of this.tests) {
      try {
        logInfo(`运行测试: ${test.name}`);
        await test.testFn();
        logSuccess(`测试通过: ${test.name}`);
        this.passed++;
      } catch (error) {
        logError(`测试失败: ${test.name} - ${error.message}`);
        this.failed++;
      }
      console.log('');
    }
    
    this.printSummary();
  }
  
  printSummary() {
    log('\n' + colors.bright + '📊 测试结果摘要' + colors.reset);
    log('=' .repeat(30));
    log(`总测试数: ${this.tests.length}`);
    log(`通过: ${this.passed}`, colors.green);
    log(`失败: ${this.failed}`, this.failed > 0 ? colors.red : colors.green);
    
    if (this.failed === 0) {
      logSuccess('🎉 所有测试通过！AI Travel Planner 功能正常');
    } else {
      logError('💥 部分测试失败，请检查相关问题');
    }
  }
}

// 创建测试套件
const testSuite = new TestSuite();

// 1. 测试服务器健康检查
testSuite.addTest('服务器健康检查', async () => {
  const response = await makeRequest({
    hostname: 'localhost',
    port: 5001,
    path: '/health',
    method: 'GET'
  });
  
  if (response.statusCode !== 200) {
    throw new Error(`期望状态码200，实际得到${response.statusCode}`);
  }
  
  if (!response.data.status === 'OK') {
    throw new Error('健康检查状态不正常');
  }
  
  logInfo(`服务器状态: ${response.data.status}`);
  logInfo(`服务名称: ${response.data.service}`);
});

// 2. 测试用户注册
testSuite.addTest('用户注册功能', async () => {
  const response = await makeRequest({
    hostname: 'localhost',
    port: 5001,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  }, {
    email: TEST_CONFIG.testUser.email,
    password: TEST_CONFIG.testUser.password,
    name: TEST_CONFIG.testUser.name
  });
  
  if (response.statusCode !== 201) {
    throw new Error(`期望状态码201，实际得到${response.statusCode}: ${response.data.message}`);
  }
  
  if (!response.data.success) {
    throw new Error('注册失败: ' + response.data.message);
  }
  
  logInfo(`注册成功: ${response.data.data.user.name}`);
});

// 3. 测试用户登录
testSuite.addTest('用户登录功能', async () => {
  const response = await makeRequest({
    hostname: 'localhost',
    port: 5001,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  }, {
    email: TEST_CONFIG.testUser.email,
    password: TEST_CONFIG.testUser.password
  });
  
  if (response.statusCode !== 200) {
    throw new Error(`期望状态码200，实际得到${response.statusCode}: ${response.data.message}`);
  }
  
  if (!response.data.success) {
    throw new Error('登录失败: ' + response.data.message);
  }
  
  if (!response.data.data.token) {
    throw new Error('登录响应中缺少token');
  }
  
  testSuite.authToken = response.data.data.token;
  logInfo(`登录成功，获取到token`);
});

// 4. 测试语音识别服务状态
testSuite.addTest('语音识别服务状态检查', async () => {
  if (!testSuite.authToken) {
    throw new Error('需要先登录获取token');
  }
  
  const response = await makeRequest({
    hostname: 'localhost',
    port: 5001,
    path: '/api/voice/status',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${testSuite.authToken}`
    }
  });
  
  if (response.statusCode !== 200) {
    throw new Error(`期望状态码200，实际得到${response.statusCode}`);
  }
  
  if (!response.data.success) {
    throw new Error('语音服务状态检查失败: ' + response.data.message);
  }
  
  logInfo(`语音服务: ${response.data.data.service}`);
  logInfo(`服务状态: ${response.data.data.status}`);
});

// 5. 测试语音识别功能
testSuite.addTest('语音识别功能', async () => {
  if (!testSuite.authToken) {
    throw new Error('需要先登录获取token');
  }
  
  const response = await makeRequest({
    hostname: 'localhost',
    port: 5001,
    path: '/api/voice/recognize',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${testSuite.authToken}`,
      'Content-Type': 'application/json'
    }
  }, {
    // 模拟音频数据
    audio: 'mock_audio_data'
  });
  
  if (response.statusCode !== 200) {
    throw new Error(`期望状态码200，实际得到${response.statusCode}`);
  }
  
  if (!response.data.success) {
    throw new Error('语音识别失败: ' + response.data.message);
  }
  
  if (!response.data.data.text) {
    throw new Error('语音识别未返回文本');
  }
  
  logInfo(`识别文本: ${response.data.data.text}`);
  logInfo(`置信度: ${response.data.data.confidence}`);
});

// 6. 测试AI旅行计划生成
testSuite.addTest('AI旅行计划生成', async () => {
  if (!testSuite.authToken) {
    throw new Error('需要先登录获取token');
  }
  
  const travelRequest = {
    destination: '东京, 日本',
    days: 5,
    budget: 8000,
    travelers: 2,
    preferences: ['美食', '购物', '文化'],
    startDate: '2024-03-15',
    endDate: '2024-03-20'
  };
  
  const response = await makeRequest({
    hostname: 'localhost',
    port: 5001,
    path: '/api/travel/plans/ai-generate',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${testSuite.authToken}`,
      'Content-Type': 'application/json'
    }
  }, travelRequest);
  
  if (response.statusCode !== 201) {
    throw new Error(`期望状态码201，实际得到${response.statusCode}: ${response.data.message}`);
  }
  
  if (!response.data.success) {
    throw new Error('AI旅行计划生成失败: ' + response.data.message);
  }
  
  const plan = response.data.data.plan;
  logInfo(`生成计划: ${plan.title}`);
  logInfo(`目的地: ${plan.destination}`);
  logInfo(`预算: ¥${plan.budget}`);
  logInfo(`行程天数: ${plan.days}天`);
});

// 7. 测试获取旅行计划列表
testSuite.addTest('获取旅行计划列表', async () => {
  if (!testSuite.authToken) {
    throw new Error('需要先登录获取token');
  }
  
  const response = await makeRequest({
    hostname: 'localhost',
    port: 5001,
    path: '/api/travel/plans',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${testSuite.authToken}`
    }
  });
  
  if (response.statusCode !== 200) {
    throw new Error(`期望状态码200，实际得到${response.statusCode}`);
  }
  
  if (!response.data.success) {
    throw new Error('获取旅行计划列表失败: ' + response.data.message);
  }
  
  if (!Array.isArray(response.data.data)) {
    throw new Error('旅行计划数据格式不正确');
  }
  
  logInfo(`获取到 ${response.data.data.length} 个旅行计划`);
  
  if (response.data.data.length > 0) {
    response.data.data.forEach((plan, index) => {
      logInfo(`计划 ${index + 1}: ${plan.title} (${plan.status})`);
    });
  }
});

// 8. 测试地图服务地理编码
testSuite.addTest('地图服务地理编码', async () => {
  if (!testSuite.authToken) {
    throw new Error('需要先登录获取token');
  }
  
  const response = await makeRequest({
    hostname: 'localhost',
    port: 5001,
    path: '/api/map/geocode',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${testSuite.authToken}`,
      'Content-Type': 'application/json'
    }
  }, {
    address: '东京塔'
  });
  
  if (response.statusCode !== 200) {
    throw new Error(`期望状态码200，实际得到${response.statusCode}`);
  }
  
  if (!response.data.success) {
    throw new Error('地理编码失败: ' + response.data.message);
  }
  
  const location = response.data.data.location;
  logInfo(`地址: ${location.formattedAddress}`);
  logInfo(`坐标: ${location.lat}, ${location.lng}`);
  logInfo(`城市: ${location.city}`);
});

// 9. 测试POI搜索
testSuite.addTest('POI兴趣点搜索', async () => {
  if (!testSuite.authToken) {
    throw new Error('需要先登录获取token');
  }
  
  const response = await makeRequest({
    hostname: 'localhost',
    port: 5001,
    path: '/api/map/search-poi?keyword=' + encodeURIComponent('餐厅'),
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${testSuite.authToken}`
    }
  });
  
  if (response.statusCode !== 200) {
    throw new Error(`期望状态码200，实际得到${response.statusCode}`);
  }
  
  if (!response.data.success) {
    throw new Error('POI搜索失败: ' + response.data.message);
  }
  
  const searchData = response.data.data;
  logInfo(`搜索到 ${searchData.total} 个POI结果`);
  
  if (searchData.pois && searchData.pois.length > 0) {
    searchData.pois.forEach((poi, index) => {
      logInfo(`POI ${index + 1}: ${poi.name} (${poi.type})`);
    });
  }
});

// 10. 测试预算管理功能
testSuite.addTest('预算项目管理', async () => {
  if (!testSuite.authToken) {
    throw new Error('需要先登录获取token');
  }
  
  // 先获取一个计划ID
  const plansResponse = await makeRequest({
    hostname: 'localhost',
    port: 5001,
    path: '/api/travel/plans',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${testSuite.authToken}`
    }
  });
  
  if (!plansResponse.data.data || plansResponse.data.data.length === 0) {
    throw new Error('没有可用的旅行计划用于测试预算管理');
  }
  
  const planId = plansResponse.data.data[0].id;
  
  // 添加预算项目
  const budgetItem = {
    category: 'transportation',
    description: '测试交通费用',
    amount: 500,
    date: '2024-03-15'
  };
  
  const addResponse = await makeRequest({
    hostname: 'localhost',
    port: 5001,
    path: `/api/budget/plans/${planId}/items`,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${testSuite.authToken}`,
      'Content-Type': 'application/json'
    }
  }, budgetItem);
  
  if (addResponse.statusCode !== 201) {
    throw new Error(`添加预算项目失败，状态码: ${addResponse.statusCode}`);
  }
  
  if (!addResponse.data.success) {
    throw new Error('添加预算项目失败: ' + addResponse.data.message);
  }
  
  logInfo(`添加预算项目: ${addResponse.data.data.description} - ¥${addResponse.data.data.amount}`);
  
  // 获取预算项目列表
  const listResponse = await makeRequest({
    hostname: 'localhost',
    port: 5001,
    path: `/api/budget/plans/${planId}/items`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${testSuite.authToken}`
    }
  });
  
  if (listResponse.statusCode !== 200) {
    throw new Error(`获取预算项目列表失败，状态码: ${listResponse.statusCode}`);
  }
  
  if (!listResponse.data.success) {
    throw new Error('获取预算项目列表失败: ' + listResponse.data.message);
  }
  
  logInfo(`获取到 ${listResponse.data.data.length} 个预算项目`);
});

// 主测试函数 - 直接运行测试（假设服务器已启动）
async function runTests() {
  try {
    // 先检查服务器是否可用
    logInfo('检查测试服务器连接...');
    
    const healthResponse = await makeRequest({
      hostname: 'localhost',
      port: 5001,
      path: '/health',
      method: 'GET'
    });
    
    if (healthResponse.statusCode === 200) {
      logSuccess('测试服务器连接正常');
      // 运行测试套件
      await testSuite.run();
    } else {
      throw new Error(`服务器健康检查失败，状态码: ${healthResponse.statusCode}`);
    }
    
  } catch (error) {
    logError(`测试执行失败: ${error.message}`);
    logInfo('请确保测试服务器正在运行: cd backend && node test-server.js');
  }
}

// 运行测试
runTests().catch(console.error);