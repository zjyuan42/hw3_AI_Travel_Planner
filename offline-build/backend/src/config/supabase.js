import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('缺少Supabase配置。请检查环境变量SUPABASE_URL和SUPABASE_ANON_KEY');
}

// 创建Supabase客户端
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// 使用服务角色密钥的管理客户端（用于服务器端操作）
export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : supabase;

// 数据库表名常量
export const TABLES = {
  USERS: 'users',
  TRAVEL_PLANS: 'travel_plans',
  BUDGET_ITEMS: 'budget_items',
  USER_PREFERENCES: 'user_preferences'
};

// 错误处理辅助函数
export const handleSupabaseError = (error) => {
  console.error('Supabase错误:', error);
  
  if (error.code === 'PGRST116') {
    return { success: false, message: '未找到请求的数据' };
  }
  
  if (error.code === '23505') {
    return { success: false, message: '数据已存在' };
  }
  
  return { 
    success: false, 
    message: error.message || '数据库操作失败' 
  };
};

// 成功响应辅助函数
export const successResponse = (data, message = '操作成功') => {
  return {
    success: true,
    message,
    data
  };
};