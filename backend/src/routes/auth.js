import express from 'express';
import bcrypt from 'bcryptjs';
import { supabase, supabaseAdmin, handleSupabaseError, successResponse } from '../config/supabase.js';
import { generateToken } from '../middleware/auth.js';

const router = express.Router();

// 用户注册
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // 验证输入
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: '请提供邮箱、密码和姓名'
      });
    }

    // 检查邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: '邮箱格式不正确'
      });
    }

    // 检查密码长度
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: '密码长度至少6位'
      });
    }

    // 检查用户是否已存在
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: '该邮箱已被注册'
      });
    }

    if (checkError && checkError.code !== 'PGRST116') {
      return res.status(500).json(handleSupabaseError(checkError));
    }

    // 加密密码
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 创建用户
    const { data: user, error: createError } = await supabaseAdmin
      .from('users')
      .insert({
        email,
        password: hashedPassword,
        name,
        preferences: {
          travelStyles: [],
          budgetRange: { min: 0, max: 10000 },
          interests: []
        }
      })
      .select('id, email, name, avatar, created_at')
      .single();

    if (createError) {
      return res.status(500).json(handleSupabaseError(createError));
    }

    // 生成JWT令牌
    const token = generateToken(user.id);

    res.status(201).json(successResponse({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar
      },
      token
    }, '注册成功'));
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({
      success: false,
      message: '注册失败，请稍后重试'
    });
  }
});

// 用户登录
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 验证输入
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: '请提供邮箱和密码'
      });
    }

    // 查找用户
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email, name, avatar, password')
      .eq('email', email)
      .single();

    if (userError || !user) {
      return res.status(401).json({
        success: false,
        message: '邮箱或密码不正确'
      });
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: '邮箱或密码不正确'
      });
    }

    // 生成JWT令牌
    const token = generateToken(user.id);

    // 移除密码字段
    const { password: _, ...userWithoutPassword } = user;

    res.json(successResponse({
      user: userWithoutPassword,
      token
    }, '登录成功'));
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({
      success: false,
      message: '登录失败，请稍后重试'
    });
  }
});

// 获取当前用户信息
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: '未提供访问令牌'
      });
    }

    const jwt = await import('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, name, avatar, preferences, created_at')
      .eq('id', decoded.userId)
      .single();

    if (error || !user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    res.json(successResponse({ user }, '获取用户信息成功'));
  } catch (error) {
    console.error('获取用户信息错误:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: '令牌已过期'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: '无效的令牌'
      });
    }

    res.status(500).json({
      success: false,
      message: '获取用户信息失败'
    });
  }
});

// 更新用户信息
router.put('/profile', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: '未提供访问令牌'
      });
    }

    const jwt = await import('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { name, avatar, preferences } = req.body;

    // 构建更新数据
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (preferences !== undefined) updateData.preferences = preferences;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: '没有提供要更新的数据'
      });
    }

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', decoded.userId)
      .select('id, email, name, avatar, preferences, created_at')
      .single();

    if (error) {
      return res.status(500).json(handleSupabaseError(error));
    }

    res.json(successResponse({ user }, '更新用户信息成功'));
  } catch (error) {
    console.error('更新用户信息错误:', error);
    res.status(500).json({
      success: false,
      message: '更新用户信息失败'
    });
  }
});

export default router;