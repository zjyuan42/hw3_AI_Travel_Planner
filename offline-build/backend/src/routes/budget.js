import express from 'express';
import { supabase, handleSupabaseError, successResponse } from '../config/supabase.js';
import { authenticateToken } from '../middleware/auth.js';
import aiService from '../services/aiService.js';

const router = express.Router();

// 获取旅行计划的预算项目
router.get('/plans/:planId/items', authenticateToken, async (req, res) => {
  try {
    const { planId } = req.params;

    // 验证旅行计划是否存在且属于当前用户
    const { data: plan, error: planError } = await supabase
      .from('travel_plans')
      .select('id')
      .eq('id', planId)
      .eq('user_id', req.user.userId)
      .single();

    if (planError || !plan) {
      return res.status(404).json({
        success: false,
        message: '旅行计划不存在'
      });
    }

    const { data: items, error } = await supabase
      .from('budget_items')
      .select('*')
      .eq('plan_id', planId)
      .order('date', { ascending: false });

    if (error) {
      return res.status(500).json(handleSupabaseError(error));
    }

    res.json(successResponse(items || [], '获取预算项目成功'));
  } catch (error) {
    console.error('获取预算项目错误:', error);
    res.status(500).json({
      success: false,
      message: '获取预算项目失败'
    });
  }
});

// 添加预算项目
router.post('/plans/:planId/items', authenticateToken, async (req, res) => {
  try {
    const { planId } = req.params;
    const {
      category,
      description,
      amount,
      date,
      notes = ''
    } = req.body;

    // 验证必填字段
    if (!category || !description || !amount || !date) {
      return res.status(400).json({
        success: false,
        message: '请填写完整的预算项目信息'
      });
    }

    // 验证旅行计划是否存在且属于当前用户
    const { data: plan, error: planError } = await supabase
      .from('travel_plans')
      .select('id, budget')
      .eq('id', planId)
      .eq('user_id', req.user.userId)
      .single();

    if (planError || !plan) {
      return res.status(404).json({
        success: false,
        message: '旅行计划不存在'
      });
    }

    // 验证金额
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return res.status(400).json({
        success: false,
        message: '金额必须为大于0的数字'
      });
    }

    const itemData = {
      plan_id: planId,
      category,
      description,
      amount: amountNum,
      date,
      notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: item, error } = await supabase
      .from('budget_items')
      .insert(itemData)
      .select()
      .single();

    if (error) {
      return res.status(500).json(handleSupabaseError(error));
    }

    res.status(201).json(successResponse(item, '添加预算项目成功'));
  } catch (error) {
    console.error('添加预算项目错误:', error);
    res.status(500).json({
      success: false,
      message: '添加预算项目失败'
    });
  }
});

// 更新预算项目
router.put('/items/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updated_at: new Date().toISOString() };

    // 验证金额
    if (updateData.amount) {
      const amountNum = parseFloat(updateData.amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        return res.status(400).json({
          success: false,
          message: '金额必须为大于0的数字'
        });
      }
      updateData.amount = amountNum;
    }

    // 检查预算项目是否存在且属于当前用户的旅行计划
    const { data: existingItem, error: checkError } = await supabase
      .from('budget_items')
      .select(`
        *,
        travel_plans!inner(user_id)
      `)
      .eq('id', id)
      .eq('travel_plans.user_id', req.user.userId)
      .single();

    if (checkError || !existingItem) {
      return res.status(404).json({
        success: false,
        message: '预算项目不存在'
      });
    }

    const { data: item, error } = await supabase
      .from('budget_items')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(500).json(handleSupabaseError(error));
    }

    res.json(successResponse(item, '更新预算项目成功'));
  } catch (error) {
    console.error('更新预算项目错误:', error);
    res.status(500).json({
      success: false,
      message: '更新预算项目失败'
    });
  }
});

// 删除预算项目
router.delete('/items/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // 检查预算项目是否存在且属于当前用户的旅行计划
    const { data: existingItem, error: checkError } = await supabase
      .from('budget_items')
      .select(`
        *,
        travel_plans!inner(user_id)
      `)
      .eq('id', id)
      .eq('travel_plans.user_id', req.user.userId)
      .single();

    if (checkError || !existingItem) {
      return res.status(404).json({
        success: false,
        message: '预算项目不存在'
      });
    }

    const { error } = await supabase
      .from('budget_items')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(500).json(handleSupabaseError(error));
    }

    res.json(successResponse(null, '删除预算项目成功'));
  } catch (error) {
    console.error('删除预算项目错误:', error);
    res.status(500).json({
      success: false,
      message: '删除预算项目失败'
    });
  }
});

// 获取预算摘要
router.get('/plans/:planId/summary', authenticateToken, async (req, res) => {
  try {
    const { planId } = req.params;

    // 验证旅行计划是否存在且属于当前用户
    const { data: plan, error: planError } = await supabase
      .from('travel_plans')
      .select('id, budget, start_date, end_date')
      .eq('id', planId)
      .eq('user_id', req.user.userId)
      .single();

    if (planError || !plan) {
      return res.status(404).json({
        success: false,
        message: '旅行计划不存在'
      });
    }

    // 获取所有预算项目
    const { data: items, error: itemsError } = await supabase
      .from('budget_items')
      .select('category, amount')
      .eq('plan_id', planId);

    if (itemsError) {
      return res.status(500).json(handleSupabaseError(itemsError));
    }

    // 计算预算摘要
    const totalSpent = items?.reduce((sum, item) => sum + item.amount, 0) || 0;
    const remainingBudget = Math.max(0, plan.budget - totalSpent);
    const budgetUtilization = plan.budget > 0 ? (totalSpent / plan.budget) * 100 : 0;

    // 按类别分组
    const byCategory = {};
    items?.forEach(item => {
      if (!byCategory[item.category]) {
        byCategory[item.category] = {
          spent: 0,
          count: 0
        };
      }
      byCategory[item.category].spent += item.amount;
      byCategory[item.category].count += 1;
    });

    // 计算剩余天数
    const today = new Date();
    const endDate = new Date(plan.end_date);
    const remainingDays = Math.max(0, Math.ceil((endDate - today) / (1000 * 60 * 60 * 24)));

    const summary = {
      totalBudget: plan.budget,
      totalSpent,
      remainingBudget,
      budgetUtilization: Math.round(budgetUtilization * 100) / 100,
      byCategory,
      remainingDays,
      dailyBudget: remainingDays > 0 ? remainingBudget / remainingDays : 0
    };

    res.json(successResponse(summary, '获取预算摘要成功'));
  } catch (error) {
    console.error('获取预算摘要错误:', error);
    res.status(500).json({
      success: false,
      message: '获取预算摘要失败'
    });
  }
});

// AI预算分析
router.post('/plans/:planId/analyze', authenticateToken, async (req, res) => {
  try {
    const { planId } = req.params;

    // 验证旅行计划是否存在且属于当前用户
    const { data: plan, error: planError } = await supabase
      .from('travel_plans')
      .select('id, budget, start_date, end_date')
      .eq('id', planId)
      .eq('user_id', req.user.userId)
      .single();

    if (planError || !plan) {
      return res.status(404).json({
        success: false,
        message: '旅行计划不存在'
      });
    }

    // 获取预算摘要
    const { data: items, error: itemsError } = await supabase
      .from('budget_items')
      .select('category, amount')
      .eq('plan_id', planId);

    if (itemsError) {
      return res.status(500).json(handleSupabaseError(itemsError));
    }

    const totalSpent = items?.reduce((sum, item) => sum + item.amount, 0) || 0;

    // 按类别分组
    const byCategory = {};
    items?.forEach(item => {
      if (!byCategory[item.category]) {
        byCategory[item.category] = 0;
      }
      byCategory[item.category] += item.amount;
    });

    // 计算剩余天数
    const today = new Date();
    const endDate = new Date(plan.end_date);
    const remainingDays = Math.max(0, Math.ceil((endDate - today) / (1000 * 60 * 60 * 24)));

    // 验证AI服务配置
    try {
      aiService.validateConfig();
    } catch (configError) {
      return res.status(500).json({
        success: false,
        message: 'AI服务未配置，无法进行预算分析'
      });
    }

    // 使用AI分析预算
    const aiResult = await aiService.analyzeBudget(
      {
        totalSpent,
        byCategory
      },
      {
        total: plan.budget,
        remainingDays
      }
    );

    if (!aiResult.success) {
      return res.status(500).json({
        success: false,
        message: `AI预算分析失败: ${aiResult.message}`
      });
    }

    res.json(successResponse({
      analysis: aiResult.analysis,
      usage: aiResult.usage
    }, '预算分析成功'));
  } catch (error) {
    console.error('AI预算分析错误:', error);
    res.status(500).json({
      success: false,
      message: '预算分析失败'
    });
  }
});

// 获取预算类别统计
router.get('/plans/:planId/categories', authenticateToken, async (req, res) => {
  try {
    const { planId } = req.params;

    // 验证旅行计划是否存在且属于当前用户
    const { data: plan, error: planError } = await supabase
      .from('travel_plans')
      .select('id')
      .eq('id', planId)
      .eq('user_id', req.user.userId)
      .single();

    if (planError || !plan) {
      return res.status(404).json({
        success: false,
        message: '旅行计划不存在'
      });
    }

    const { data: items, error } = await supabase
      .from('budget_items')
      .select('category, amount')
      .eq('plan_id', planId);

    if (error) {
      return res.status(500).json(handleSupabaseError(error));
    }

    // 按类别统计
    const categories = {
      transportation: { spent: 0, count: 0 },
      accommodation: { spent: 0, count: 0 },
      food: { spent: 0, count: 0 },
      activities: { spent: 0, count: 0 },
      shopping: { spent: 0, count: 0 },
      other: { spent: 0, count: 0 }
    };

    items?.forEach(item => {
      if (categories[item.category]) {
        categories[item.category].spent += item.amount;
        categories[item.category].count += 1;
      }
    });

    // 计算百分比
    const totalSpent = Object.values(categories).reduce((sum, cat) => sum + cat.spent, 0);
    Object.keys(categories).forEach(category => {
      categories[category].percentage = totalSpent > 0 ? 
        Math.round((categories[category].spent / totalSpent) * 100) : 0;
    });

    res.json(successResponse(categories, '获取预算类别统计成功'));
  } catch (error) {
    console.error('获取预算类别统计错误:', error);
    res.status(500).json({
      success: false,
      message: '获取预算类别统计失败'
    });
  }
});

// 导出预算数据
router.get('/plans/:planId/export', authenticateToken, async (req, res) => {
  try {
    const { planId } = req.params;

    // 验证旅行计划是否存在且属于当前用户
    const { data: plan, error: planError } = await supabase
      .from('travel_plans')
      .select('id, title, budget')
      .eq('id', planId)
      .eq('user_id', req.user.userId)
      .single();

    if (planError || !plan) {
      return res.status(404).json({
        success: false,
        message: '旅行计划不存在'
      });
    }

    // 获取预算项目
    const { data: items, error: itemsError } = await supabase
      .from('budget_items')
      .select('*')
      .eq('plan_id', planId)
      .order('date', { ascending: false });

    if (itemsError) {
      return res.status(500).json(handleSupabaseError(itemsError));
    }

    // 生成CSV格式数据
    const csvHeader = '类别,描述,金额,日期,备注\n';
    const csvRows = items?.map(item => 
      `"${item.category}","${item.description}",${item.amount},"${item.date}","${item.notes || ''}"`
    ).join('\n') || '';

    const csvData = csvHeader + csvRows;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="budget-${planId}.csv"`);
    res.send(csvData);
  } catch (error) {
    console.error('导出预算数据错误:', error);
    res.status(500).json({
      success: false,
      message: '导出预算数据失败'
    });
  }
});

export default router;