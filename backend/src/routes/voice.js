import express from 'express';
import multer from 'multer';
import voiceService from '../services/voiceService.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// 配置multer用于处理文件上传
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB限制
  },
  fileFilter: (req, file, cb) => {
    // 检查文件类型
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('只支持音频文件'), false);
    }
  },
});

// 语音识别端点 - 文件上传方式
router.post('/recognize', authenticateToken, upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '请提供音频文件'
      });
    }

    console.log(`收到语音识别请求，文件大小: ${req.file.size} 字节`);

    // 验证语音服务配置
    voiceService.validateConfig();

    // 执行语音识别
    const recognizedText = await voiceService.recognizeAudio(req.file.buffer);

    res.json({
      success: true,
      data: {
        text: recognizedText,
        confidence: 0.9, // 模拟置信度
        isFinal: true
      },
      message: '语音识别成功'
    });

  } catch (error) {
    console.error('语音识别错误:', error);

    if (error.message.includes('缺少科大讯飞配置')) {
      return res.status(500).json({
        success: false,
        message: '语音识别服务未配置，请联系管理员'
      });
    }

    if (error.message.includes('音频流错误') || error.message.includes('WebSocket错误')) {
      return res.status(500).json({
        success: false,
        message: '语音识别服务暂时不可用，请稍后重试'
      });
    }

    res.status(500).json({
      success: false,
      message: '语音识别失败: ' + error.message
    });
  }
});

// 实时语音识别端点 - WebSocket方式
router.post('/recognize-stream', authenticateToken, express.raw({
  type: 'audio/*',
  limit: '5mb'
}), async (req, res) => {
  try {
    if (!req.body || req.body.length === 0) {
      return res.status(400).json({
        success: false,
        message: '请提供音频数据'
      });
    }

    console.log(`收到实时语音识别请求，数据大小: ${req.body.length} 字节`);

    // 验证语音服务配置
    voiceService.validateConfig();

    // 创建可读流
    const { Readable } = await import('stream');
    const audioStream = new Readable();
    audioStream.push(req.body);
    audioStream.push(null);

    // 执行实时语音识别
    const result = await voiceService.recognizeStream(audioStream);

    res.json({
      success: true,
      data: result,
      message: result.isFinal ? '语音识别完成' : '语音识别进行中'
    });

  } catch (error) {
    console.error('实时语音识别错误:', error);

    if (error.message.includes('缺少科大讯飞配置')) {
      return res.status(500).json({
        success: false,
        message: '语音识别服务未配置，请联系管理员'
      });
    }

    res.status(500).json({
      success: false,
      message: '实时语音识别失败: ' + error.message
    });
  }
});

// 语音识别状态检查
router.get('/status', authenticateToken, (req, res) => {
  try {
    voiceService.validateConfig();
    
    res.json({
      success: true,
      data: {
        service: '科大讯飞语音识别',
        status: '可用',
        features: ['文件识别', '实时流识别'],
        supportedFormats: ['audio/wav', 'audio/mp3', 'audio/m4a', 'audio/ogg']
      },
      message: '语音识别服务运行正常'
    });
  } catch (error) {
    res.json({
      success: false,
      data: {
        service: '科大讯飞语音识别',
        status: '不可用',
        error: error.message
      },
      message: '语音识别服务未配置'
    });
  }
});

// 语音合成端点（文本转语音）- 预留功能
router.post('/synthesize', authenticateToken, async (req, res) => {
  try {
    const { text, voice = 'xiaoyan', speed = 50, volume = 50 } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: '请提供要合成的文本'
      });
    }

    // 这里可以集成科大讯飞的语音合成API
    // 由于时间关系，我们先返回一个模拟响应
    res.json({
      success: true,
      data: {
        audioUrl: null, // 实际实现中返回音频URL
        text: text,
        duration: Math.ceil(text.length / 3) // 模拟音频时长
      },
      message: '语音合成功能开发中'
    });

  } catch (error) {
    console.error('语音合成错误:', error);
    res.status(500).json({
      success: false,
      message: '语音合成失败: ' + error.message
    });
  }
});

// 获取支持的语音列表
router.get('/voices', authenticateToken, (req, res) => {
  const voices = [
    {
      id: 'xiaoyan',
      name: '小燕',
      gender: 'female',
      language: 'zh-cn',
      description: '青年女声，甜美好听'
    },
    {
      id: 'xiaofeng',
      name: '小峰',
      gender: 'male',
      language: 'zh-cn',
      description: '青年男声，沉稳大气'
    },
    {
      id: 'xiaoye',
      name: '小野',
      gender: 'female',
      language: 'zh-cn',
      description: '青年女声，温柔亲切'
    }
  ];

  res.json({
    success: true,
    data: voices,
    message: '获取语音列表成功'
  });
});

export default router;