import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase.js';

// JWT验证中间件
export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: '访问令牌缺失'
    });
  }

  try {
    // 验证JWT令牌
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    
    // 验证用户是否在Supabase中存在
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, name, avatar')
      .eq('id', decoded.userId)
      .single();

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: '用户不存在或已被删除'
      });
    }

    req.user = { ...req.user, ...user };
    next();
  } catch (error) {
    console.error('JWT验证失败:', error);
    
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

    return res.status(500).json({
      success: false,
      message: '令牌验证失败'
    });
  }
};

// 可选认证中间件（不强制要求登录）
export const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    
    const { data: user } = await supabase
      .from('users')
      .select('id, email, name, avatar')
      .eq('id', decoded.userId)
      .single();

    if (user) {
      req.user = { ...req.user, ...user };
    }
  } catch (error) {
    // 静默失败，不阻止请求
    console.warn('可选认证失败:', error.message);
    req.user = null;
  }

  next();
};

// 管理员权限检查中间件
export const requireAdmin = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: '需要管理员权限'
    });
  }

  try {
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', req.user.userId)
      .single();

    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '权限不足，需要管理员角色'
      });
    }

    next();
  } catch (error) {
    console.error('管理员权限检查失败:', error);
    return res.status(500).json({
      success: false,
      message: '权限验证失败'
    });
  }
};

// 生成JWT令牌
export const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};