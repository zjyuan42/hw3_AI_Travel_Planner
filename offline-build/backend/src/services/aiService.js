import axios from 'axios';
import crypto from 'crypto';

/**
 * 阿里云百炼大语言模型服务
 * 用于智能行程规划和费用预算分析
 */
class AIService {
  constructor() {
    this.accessKeyId = process.env.ALIYUN_BAILIAN_ACCESS_KEY_ID;
    this.accessKeySecret = process.env.ALIYUN_BAILIAN_ACCESS_KEY_SECRET;
    this.endpoint = process.env.ALIYUN_BAILIAN_ENDPOINT || 'bailian.cn-beijing.aliyuncs.com';
    this.model = process.env.ALIYUN_BAILIAN_MODEL || 'qwen-plus';
    this.apiVersion = '2023-06-01';
  }

  /**
   * 验证配置
   */
  validateConfig() {
    const missingConfigs = [];
    
    if (!this.accessKeyId) missingConfigs.push('ALIYUN_BAILIAN_ACCESS_KEY_ID');
    if (!this.accessKeySecret) missingConfigs.push('ALIYUN_BAILIAN_ACCESS_KEY_SECRET');

    if (missingConfigs.length > 0) {
      throw new Error(`缺少阿里云百炼配置: ${missingConfigs.join(', ')}`);
    }

    return true;
  }

  /**
   * 生成阿里云API签名
   */
  generateSignature(method, path, queryParams, headers, body = '') {
    const date = new Date().toUTCString();
    const contentMd5 = crypto.createHash('md5').update(body).digest('base64');
    
    const canonicalizedResource = this.buildCanonicalizedResource(path, queryParams);
    const canonicalizedHeaders = this.buildCanonicalizedHeaders(headers);
    
    const stringToSign = `${method}\n${contentMd5}\napplication/json\n${date}\n${canonicalizedHeaders}${canonicalizedResource}`;
    
    const signature = crypto
      .createHmac('sha1', this.accessKeySecret)
      .update(stringToSign)
      .digest('base64');
    
    return `acs ${this.accessKeyId}:${signature}`;
  }

  /**
   * 构建规范化资源
   */
  buildCanonicalizedResource(path, queryParams) {
    const sortedParams = Object.keys(queryParams)
      .sort()
      .map(key => `${key}=${queryParams[key]}`)
      .join('&');
    
    return sortedParams ? `${path}?${sortedParams}` : path;
  }

  /**
   * 构建规范化头部
   */
  buildCanonicalizedHeaders(headers) {
    return Object.keys(headers)
      .filter(key => key.toLowerCase().startsWith('x-acs-'))
      .sort()
      .map(key => `${key.toLowerCase()}:${headers[key]}\n`)
      .join('');
  }

  /**
   * 调用大语言模型API
   */
  async callLLM(messages, temperature = 0.7, maxTokens = 2000) {
    try {
      this.validateConfig();

      const method = 'POST';
      const path = `/v2/app/completions`;
      const queryParams = {};
      const body = JSON.stringify({
        model: this.model,
        messages: messages,
        temperature: temperature,
        max_tokens: maxTokens,
        stream: false
      });

      const date = new Date().toUTCString();
      const headers = {
        'Content-Type': 'application/json',
        'Date': date,
        'x-acs-version': this.apiVersion,
        'x-acs-signature-nonce': crypto.randomBytes(16).toString('hex'),
        'x-acs-signature-method': 'HMAC-SHA1',
        'x-acs-signature-version': '1.0'
      };

      const signature = this.generateSignature(method, path, queryParams, headers, body);
      headers['Authorization'] = signature;

      const url = `https://${this.endpoint}${path}`;
      
      const response = await axios.post(url, body, { headers });
      
      if (response.data && response.data.data) {
        return {
          success: true,
          content: response.data.data.choices[0].message.content,
          usage: response.data.data.usage
        };
      } else {
        return {
          success: false,
          message: 'API响应格式错误'
        };
      }
    } catch (error) {
      console.error('调用大语言模型错误:', error);
      
      if (error.response) {
        return {
          success: false,
          message: `API错误: ${error.response.data?.message || error.response.statusText}`
        };
      }
      
      return {
        success: false,
        message: `网络错误: ${error.message}`
      };
    }
  }

  /**
   * 生成旅行计划
   */
  async generateTravelPlan(userInput) {
    const {
      destination,
      days,
      budget,
      travelers,
      preferences = [],
      startDate,
      endDate
    } = userInput;

    const systemPrompt = `你是一个专业的旅行规划师。请根据用户的需求生成详细、实用的旅行计划。
要求：
1. 行程安排要合理，考虑交通时间和体力消耗
2. 预算分配要详细，包括交通、住宿、餐饮、景点门票、购物等
3. 考虑用户的偏好和特殊需求
4. 提供实用的旅行建议和注意事项
5. 返回格式必须是规范的JSON，不要包含其他文本

请返回以下JSON格式：
{
  "title": "行程标题",
  "summary": "行程概述",
  "dailyItinerary": [
    {
      "day": 1,
      "date": "YYYY-MM-DD",
      "theme": "当日主题",
      "activities": [
        {
          "time": "08:00-10:00",
          "name": "活动名称",
          "description": "活动描述",
          "location": "地点",
          "cost": 100,
          "type": "sightseeing|shopping|dining|entertainment|relaxation"
        }
      ],
      "accommodation": {
        "name": "住宿名称",
        "type": "hotel|hostel|apartment|resort",
        "cost": 200
      },
      "meals": [
        {
          "time": "12:00-13:00",
          "type": "breakfast|lunch|dinner|snack",
          "restaurant": "餐厅名称",
          "cost": 50
        }
      ],
      "transportation": [
        {
          "type": "flight|train|bus|car|walking",
          "description": "交通描述",
          "cost": 50
        }
      ]
    }
  ],
  "budgetBreakdown": {
    "totalBudget": 5000,
    "transportation": 1000,
    "accommodation": 1500,
    "food": 800,
    "activities": 1200,
    "shopping": 300,
    "other": 200
  },
  "travelTips": ["实用建议1", "实用建议2"],
  "emergencyContacts": ["紧急联系电话1", "紧急联系电话2"]
}`;

    const userPrompt = `请为以下需求生成旅行计划：
目的地：${destination}
旅行天数：${days}天
总预算：${budget}元
旅行人数：${travelers}人
旅行偏好：${preferences.join('、')}
旅行日期：${startDate} 至 ${endDate}

请生成详细、实用的旅行计划，确保预算合理分配。`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    const result = await this.callLLM(messages, 0.7, 3000);

    if (result.success) {
      try {
        // 尝试解析JSON响应
        const planData = JSON.parse(result.content);
        return {
          success: true,
          plan: planData,
          usage: result.usage
        };
      } catch (parseError) {
        console.error('解析AI响应JSON错误:', parseError);
        // 如果JSON解析失败，返回原始文本
        return {
          success: true,
          plan: {
            title: `${destination} ${days}天旅行计划`,
            summary: result.content.substring(0, 200) + '...',
            dailyItinerary: [],
            budgetBreakdown: {},
            travelTips: [],
            emergencyContacts: []
          },
          rawContent: result.content,
          usage: result.usage
        };
      }
    } else {
      return result;
    }
  }

  /**
   * 分析费用预算
   */
  async analyzeBudget(expenses, budget) {
    const systemPrompt = `你是一个专业的财务分析师。请分析用户的旅行费用数据，提供预算建议和优化方案。
要求：
1. 分析当前支出情况
2. 识别超支和节省的类别
3. 提供具体的优化建议
4. 预测剩余预算的使用
5. 返回格式必须是规范的JSON

请返回以下JSON格式：
{
  "analysis": "总体分析说明",
  "currentStatus": {
    "totalSpent": 2000,
    "remainingBudget": 3000,
    "budgetUtilization": 0.4
  },
  "categoryAnalysis": [
    {
      "category": "transportation",
      "spent": 500,
      "budget": 600,
      "status": "under|over|within",
      "percentage": 83.3
    }
  ],
  "recommendations": [
    "建议1",
    "建议2"
  ],
  "forecast": {
    "estimatedTotalCost": 4500,
    "estimatedRemaining": 500,
    "riskLevel": "low|medium|high"
  }
}`;

    const userPrompt = `请分析以下旅行费用数据：
总预算：${budget.total}元
已支出：${expenses.totalSpent}元
分类支出情况：${JSON.stringify(expenses.byCategory, null, 2)}

剩余旅行天数：${budget.remainingDays}天
请提供详细的预算分析和优化建议。`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    const result = await this.callLLM(messages, 0.5, 1500);

    if (result.success) {
      try {
        const analysisData = JSON.parse(result.content);
        return {
          success: true,
          analysis: analysisData,
          usage: result.usage
        };
      } catch (parseError) {
        console.error('解析预算分析JSON错误:', parseError);
        return {
          success: true,
          analysis: {
            analysis: result.content,
            currentStatus: {
              totalSpent: expenses.totalSpent,
              remainingBudget: budget.total - expenses.totalSpent,
              budgetUtilization: expenses.totalSpent / budget.total
            },
            categoryAnalysis: [],
            recommendations: [],
            forecast: {}
          },
          rawContent: result.content,
          usage: result.usage
        };
      }
    } else {
      return result;
    }
  }

  /**
   * 获取旅行建议
   */
  async getTravelAdvice(destination, preferences, questions = []) {
    const systemPrompt = `你是一个经验丰富的旅行顾问。请根据用户的目的地和偏好提供专业的旅行建议。
要求：
1. 提供目的地的基本信息
2. 根据用户偏好推荐景点和活动
3. 回答用户的具体问题
4. 提供实用的旅行贴士
5. 返回格式必须是规范的JSON

请返回以下JSON格式：
{
  "destinationInfo": {
    "bestTime": "最佳旅行时间",
    "weather": "气候特点",
    "currency": "货币",
    "language": "语言",
    "visa": "签证要求"
  },
  "recommendations": {
    "mustSee": ["必看景点1", "必看景点2"],
    "localFood": ["当地美食1", "当地美食2"],
    "activities": ["推荐活动1", "推荐活动2"]
  },
  "answers": [
    {
      "question": "用户问题",
      "answer": "详细回答"
    }
  ],
  "travelTips": ["贴士1", "贴士2"]
}`;

    const userPrompt = `目的地：${destination}
用户偏好：${preferences.join('、')}
用户问题：${questions.join('；')}

请提供专业的旅行建议和回答用户的问题。`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    const result = await this.callLLM(messages, 0.7, 2000);

    if (result.success) {
      try {
        const adviceData = JSON.parse(result.content);
        return {
          success: true,
          advice: adviceData,
          usage: result.usage
        };
      } catch (parseError) {
        console.error('解析旅行建议JSON错误:', parseError);
        return {
          success: true,
          advice: {
            destinationInfo: {},
            recommendations: {},
            answers: questions.map(q => ({ question: q, answer: '' })),
            travelTips: []
          },
          rawContent: result.content,
          usage: result.usage
        };
      }
    } else {
      return result;
    }
  }

  /**
   * 服务状态检查
   */
  async checkStatus() {
    try {
      this.validateConfig();
      
      // 发送一个简单的测试请求
      const messages = [
        { role: 'system', content: '你是一个测试助手，请回复"服务正常"。' },
        { role: 'user', content: '你好，请测试服务状态。' }
      ];
      
      const result = await this.callLLM(messages, 0.1, 10);
      
      return {
        success: result.success,
        service: '阿里云百炼大语言模型',
        status: result.success ? '可用' : '不可用',
        model: this.model,
        error: result.success ? null : result.message
      };
    } catch (error) {
      return {
        success: false,
        service: '阿里云百炼大语言模型',
        status: '不可用',
        error: error.message
      };
    }
  }
}

// 创建单例实例
const aiService = new AIService();

export default aiService;