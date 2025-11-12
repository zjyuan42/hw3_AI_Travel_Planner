import React, { useState, useRef } from 'react';
import {
  Row,
  Col,
  Card,
  Button,
  Typography,
  Space,
  Statistic,
  Progress,
  List,
  Avatar,
  Tag,
  Input,
  message,
  Modal,
  Form,
  DatePicker,
  Select,
  InputNumber,
} from 'antd';
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  AudioOutlined,
  PlusOutlined,
  CompassOutlined,
  DollarOutlined,
  TeamOutlined,
} from '@ant-design/icons';
// import type { InputRef } from 'antd';

const { Title, Paragraph } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const Home: React.FC = () => {
  const [recording, setRecording] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [form] = Form.useForm();

  // 模拟旅行计划数据
  const recentPlans = [
    {
      id: '1',
      title: '东京5日游',
      destination: '东京, 日本',
      date: '2024-03-15 - 2024-03-20',
      budget: 8000,
      status: 'active',
    },
    {
      id: '2',
      title: '巴厘岛浪漫之旅',
      destination: '巴厘岛, 印度尼西亚',
      date: '2024-04-10 - 2024-04-17',
      budget: 12000,
      status: 'completed',
    },
  ];

  // 开始录音
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await sendAudioToServer(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setRecording(true);
      message.info('录音中...点击停止按钮结束录音');
    } catch (error) {
      console.error('无法访问麦克风:', error);
      message.error('无法访问麦克风，请检查权限设置');
    }
  };

  // 停止录音
  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  // 发送音频到服务器进行识别
  const sendAudioToServer = async (audioBlob: Blob) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');

      // 这里应该调用实际的语音识别API
      // const response = await fetch('/api/voice/recognize', {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`,
      //   },
      //   body: formData,
      // });

      // 模拟API响应
      setTimeout(() => {
        const mockResponse = {
          success: true,
          data: {
            text: '我想去日本东京旅行，5天时间，预算8000元，喜欢美食和购物',
            confidence: 0.92,
            isFinal: true,
          },
        };

        if (mockResponse.success) {
          setRecognizedText(mockResponse.data.text);
          message.success('语音识别成功');
          // 自动填充表单
          parseTravelRequest(mockResponse.data.text);
        } else {
          message.error('语音识别失败');
        }
        setLoading(false);
      }, 2000);

    } catch (error) {
      console.error('语音识别请求失败:', error);
      message.error('语音识别服务暂时不可用');
      setLoading(false);
    }
  };

  // 解析旅行请求并填充表单
  const parseTravelRequest = (text: string) => {
    // 这里可以集成更复杂的自然语言处理
    // 目前使用简单的关键词匹配
    const destinationMatch = text.match(/去(.+?)旅行|到(.+?)旅行/);
    const daysMatch = text.match(/(\d+)天/);
    const budgetMatch = text.match(/预算(\d+)元/);

    const formValues: any = {};
    
    if (destinationMatch) {
      formValues.destination = destinationMatch[1] || destinationMatch[2];
    }
    if (daysMatch) {
      formValues.days = parseInt(daysMatch[1]);
    }
    if (budgetMatch) {
      formValues.budget = parseInt(budgetMatch[1]);
    }

    form.setFieldsValue(formValues);
    setIsModalVisible(true);
  };

  // 处理创建旅行计划
  const handleCreatePlan = async (_values: any) => {
    try {
      setLoading(true);
      
      // 这里应该调用实际的API
      // const response = await fetch('/api/travel/plans/ai-generate', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`,
      //   },
      //   body: JSON.stringify(values),
      // });

      // 模拟API响应
      setTimeout(() => {
        message.success('旅行计划创建成功！');
        setIsModalVisible(false);
        form.resetFields();
        setRecognizedText('');
        setLoading(false);
      }, 1500);

    } catch (error) {
      console.error('创建旅行计划失败:', error);
      message.error('创建旅行计划失败');
      setLoading(false);
    }
  };

  return (
    <div>
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card>
            <Title level={2}>欢迎使用 AI 旅行规划器</Title>
            <Paragraph>
              通过语音或文字输入，让AI为您生成个性化的旅行计划，包括行程安排、费用预算和实用建议。
            </Paragraph>
          </Card>
        </Col>

        {/* 语音识别区域 */}
        <Col span={24}>
          <Card 
            title="语音输入旅行需求" 
            className="voice-recorder"
            extra={
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsModalVisible(true)}
              >
                手动创建
              </Button>
            }
          >
            <Row gutter={[24, 24]} align="middle">
              <Col xs={24} md={12}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div style={{ textAlign: 'center' }}>
                    <Button
                      type={recording ? "primary" : "default"}
                      danger={recording}
                      size="large"
                      icon={recording ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                      onClick={recording ? stopRecording : startRecording}
                      loading={loading}
                      style={{ height: 60, width: 60, borderRadius: '50%' }}
                    />
                    <div style={{ marginTop: 16 }}>
                      {recording ? '正在录音...' : '点击开始录音'}
                    </div>
                  </div>
                  
                  {recognizedText && (
                    <Card size="small" title="识别结果">
                      <Paragraph>{recognizedText}</Paragraph>
                    </Card>
                  )}
                </Space>
              </Col>
              
              <Col xs={24} md={12}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Title level={4}>语音输入示例：</Title>
                  <List
                    size="small"
                    dataSource={[
                      '我想去日本东京旅行，5天时间，预算8000元',
                      '计划去巴厘岛度蜜月，7天行程，预算15000元',
                      '带孩子去上海迪士尼，3天游玩，预算5000元',
                    ]}
                    renderItem={(item) => (
                      <List.Item>
                        <AudioOutlined style={{ color: '#1890ff', marginRight: 8 }} />
                        {item}
                      </List.Item>
                    )}
                  />
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* 统计信息 */}
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="旅行计划"
              value={5}
              prefix={<CompassOutlined />}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="总预算"
              value={42800}
              prefix="¥"
              suffix="元"
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="已完成"
              value={3}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="预算使用率"
              value={62}
              suffix="%"
              prefix={<DollarOutlined />}
            />
            <Progress percent={62} size="small" />
          </Card>
        </Col>

        {/* 最近的旅行计划 */}
        <Col span={24}>
          <Card title="最近的旅行计划" extra={<Button type="link">查看全部</Button>}>
            <List
              itemLayout="horizontal"
              dataSource={recentPlans}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Button type="link">查看详情</Button>,
                    <Button type="link">编辑</Button>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar icon={<CompassOutlined />} />}
                    title={item.title}
                    description={
                      <Space direction="vertical" size={0}>
                        <span>目的地：{item.destination}</span>
                        <span>时间：{item.date}</span>
                        <span>预算：¥{item.budget}</span>
                      </Space>
                    }
                  />
                  <Tag color={item.status === 'active' ? 'blue' : 'green'}>
                    {item.status === 'active' ? '进行中' : '已完成'}
                  </Tag>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* 创建旅行计划模态框 */}
      <Modal
        title="创建旅行计划"
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setRecognizedText('');
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreatePlan}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="destination"
                label="目的地"
                rules={[{ required: true, message: '请输入目的地' }]}
              >
                <Input placeholder="例如：东京, 日本" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="days"
                label="旅行天数"
                rules={[{ required: true, message: '请输入旅行天数' }]}
              >
                <InputNumber
                  min={1}
                  max={30}
                  style={{ width: '100%' }}
                  placeholder="天数"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="budget"
                label="总预算（元）"
                rules={[{ required: true, message: '请输入预算' }]}
              >
                <InputNumber
                  min={100}
                  style={{ width: '100%' }}
                  placeholder="预算金额"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="travelers"
                label="旅行人数"
                rules={[{ required: true, message: '请输入旅行人数' }]}
              >
                <InputNumber
                  min={1}
                  max={20}
                  style={{ width: '100%' }}
                  placeholder="人数"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="preferences"
            label="旅行偏好"
          >
            <Select mode="multiple" placeholder="选择您的旅行偏好">
              <Option value="美食">美食</Option>
              <Option value="购物">购物</Option>
              <Option value="自然风光">自然风光</Option>
              <Option value="历史文化">历史文化</Option>
              <Option value="冒险活动">冒险活动</Option>
              <Option value="休闲度假">休闲度假</Option>
              <Option value="家庭亲子">家庭亲子</Option>
              <Option value="摄影">摄影</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="dates"
            label="旅行日期"
            rules={[{ required: true, message: '请选择旅行日期' }]}
          >
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                生成AI旅行计划
              </Button>
              <Button 
                onClick={() => {
                  setIsModalVisible(false);
                  form.resetFields();
                }}
              >
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Home;