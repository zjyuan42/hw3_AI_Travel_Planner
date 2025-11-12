import crypto from 'crypto';
import WebSocket from 'ws';
import { Readable } from 'stream';

/**
 * 科大讯飞语音识别服务
 * 基于WebSocket实时语音识别API
 */
class VoiceRecognitionService {
  constructor() {
    this.appId = process.env.IFLYTEK_APP_ID;
    this.apiKey = process.env.IFLYTEK_API_KEY;
    this.apiSecret = process.env.IFLYTEK_API_SECRET;
    this.host = 'iat-api.xfyun.cn';
    this.path = '/v2/iat';
    this.algorithm = 'hmac-sha256';
    this.hostUrl = 'wss://iat-api.xfyun.cn/v2/iat';
  }

  /**
   * 生成鉴权URL
   */
  generateAuthUrl() {
    const date = new Date().toUTCString();
    const signatureOrigin = `host: ${this.host}\ndate: ${date}\nGET ${this.path} HTTP/1.1`;
    const signature = crypto
      .createHmac('sha256', this.apiSecret)
      .update(signatureOrigin)
      .digest('base64');
    
    const authorization = `api_key="${this.apiKey}", algorithm="${this.algorithm}", headers="host date request-line", signature="${signature}"`;
    
    return `${this.hostUrl}?authorization=${encodeURIComponent(authorization)}&date=${encodeURIComponent(date)}&host=${this.host}`;
  }

  /**
   * 处理音频数据并转换为WebSocket消息
   */
  createAudioFrame(audioData, status = 0) {
    const frame = {
      common: {
        app_id: this.appId
      },
      business: {
        language: 'zh_cn',
        domain: 'iat',
        accent: 'mandarin',
        vad_eos: 10000,
        dwa: 'wpgs'
      },
      data: {
        status: status,
        format: 'audio/L16;rate=16000',
        audio: audioData.toString('base64'),
        encoding: 'raw'
      }
    };
    return JSON.stringify(frame);
  }

  /**
   * 实时语音识别
   * @param {ReadableStream} audioStream 音频流
   * @returns {Promise<{text: string, isFinal: boolean}>} 识别结果
   */
  async recognizeStream(audioStream) {
    return new Promise((resolve, reject) => {
      const authUrl = this.generateAuthUrl();
      const ws = new WebSocket(authUrl);

      let finalResult = '';
      let isFinal = false;

      ws.on('open', () => {
        console.log('科大讯飞语音识别WebSocket连接已建立');
        
        // 开始发送音频数据
        audioStream.on('data', (chunk) => {
          if (ws.readyState === WebSocket.OPEN) {
            const frame = this.createAudioFrame(chunk, 1);
            ws.send(frame);
          }
        });

        audioStream.on('end', () => {
          if (ws.readyState === WebSocket.OPEN) {
            // 发送结束帧
            const endFrame = this.createAudioFrame(Buffer.from([]), 2);
            ws.send(endFrame);
          }
        });

        audioStream.on('error', (error) => {
          reject(new Error(`音频流错误: ${error.message}`));
        });
      });

      ws.on('message', (data) => {
        try {
          const result = JSON.parse(data.toString());
          
          if (result.code !== 0) {
            reject(new Error(`语音识别错误: ${result.message} (代码: ${result.code})`));
            return;
          }

          const text = this.parseRecognitionResult(result);
          if (text) {
            finalResult += text;
          }

          // 检查是否结束
          if (result.data && result.data.status === 2) {
            isFinal = true;
            ws.close();
          }
        } catch (error) {
          console.error('解析语音识别结果错误:', error);
        }
      });

      ws.on('close', () => {
        resolve({
          text: finalResult.trim(),
          isFinal: isFinal
        });
      });

      ws.on('error', (error) => {
        reject(new Error(`WebSocket错误: ${error.message}`));
      });

      // 设置超时
      setTimeout(() => {
        if (!isFinal) {
          ws.close();
          resolve({
            text: finalResult.trim(),
            isFinal: false
          });
        }
      }, 30000); // 30秒超时
    });
  }

  /**
   * 解析语音识别结果
   */
  parseRecognitionResult(result) {
    if (!result.data || !result.data.result) {
      return '';
    }

    const recognitionResult = result.data.result;
    let text = '';

    if (recognitionResult.ws) {
      for (const ws of recognitionResult.ws) {
        for (const cw of ws.cw) {
          text += cw.w;
        }
      }
    }

    return text;
  }

  /**
   * 处理音频文件识别
   * @param {Buffer} audioBuffer 音频缓冲区
   * @returns {Promise<string>} 识别文本
   */
  async recognizeAudio(audioBuffer) {
    const audioStream = new Readable();
    audioStream.push(audioBuffer);
    audioStream.push(null);

    const result = await this.recognizeStream(audioStream);
    return result.text;
  }

  /**
   * 验证配置
   */
  validateConfig() {
    const missingConfigs = [];
    
    if (!this.appId) missingConfigs.push('IFLYTEK_APP_ID');
    if (!this.apiKey) missingConfigs.push('IFLYTEK_API_KEY');
    if (!this.apiSecret) missingConfigs.push('IFLYTEK_API_SECRET');

    if (missingConfigs.length > 0) {
      throw new Error(`缺少科大讯飞配置: ${missingConfigs.join(', ')}`);
    }

    return true;
  }
}

// 创建单例实例
const voiceService = new VoiceRecognitionService();

export default voiceService;