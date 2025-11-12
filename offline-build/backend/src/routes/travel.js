import express from 'express';
import { supabase, handleSupabaseError, successResponse } from '../config/supabase.js';
import { authenticateToken } from '../middleware/auth.js';
import aiService from '../services/aiService.js';
import mapService from '../services/mapService.js';

const router = express.Router();

// 获取用户的所有旅行计划
router.get('/plans', authenticateToken, async (req, res) => {
  try {
    const { data: plans, error } = await supabase
      .from('travel_plans')
      .select('*')
      .eq('user_id', req.user.userId)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json(handleSupabaseError(error));
    }

    res.json(successResponse(plans || [], '获取旅行计划成功'));
  } catch (error) {
    console.error('获取旅行计划错误:', error);
    res.status(500).json({
      success: false,
      message: '获取旅行计划失败'
    });
  }
});

// 获取单个旅行计划详情
router.get('/plans/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: plan, error } = await supabase
      .from('travel_plans')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user.userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: '旅行计划不存在'
        });
      }
      return res.status(500).json(handleSupabaseError(error));
    }

    res.json(successResponse(plan, '获取旅行计划详情成功'));
  } catch (error) {
    console.error('获取旅行计划详情错误:', error);
    res.status(500).json({
      success: false,
      message: '获取旅行计划详情失败'
    });
  }
});

// 创建新的旅行计划
router.post('/plans', authenticateToken, async (req, res) => {
  try {
    const {
      title,
      destination,
      startDate,
      endDate,
      budget,
      travelers,
      preferences = [],
      notes = ''
    } = req.body;

    // 验证必填字段
    if (!title || !destination || !startDate || !endDate || !budget || !travelers) {
      return res.status(400).json({
        success: false,
        message: '请填写完整的旅行计划信息'
      });
    }

    // 计算旅行天数
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    if (days <= 0) {
      return res.status(400).json({
        success: false,
        message: '结束日期不能早于开始日期'
      });
    }

    const planData = {
      user_id: req.user.userId,
      title,
      destination,
      start_date: startDate,
      end_date: endDate,
      days,
      budget: parseFloat(budget),
      travelers: parseInt(travelers),
      preferences,
      notes,
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: plan, error } = await supabase
      .from('travel_plans')
      .insert(planData)
      .select()
      .single();

    if (error) {
      return res.status(500).json(handleSupabaseError(error));
    }

    res.status(201).json(successResponse(plan, '创建旅行计划成功'));
  } catch (error) {
    console.error('创建旅行计划错误:', error);
    res.status(500).json({
      success: false,
      message: '创建旅行计划失败'
    });
  }
});

// 使用AI生成旅行计划
router.post('/plans/ai-generate', authenticateToken, async (req, res) => {
  try {
    const {
      destination,
      days,
      budget,
      travelers,
      preferences = [],
      startDate,
      endDate
    } = req.body;

    // 验证必填字段
    if (!destination || !days || !budget || !travelers) {
      return res.status(400).json({
        success: false,
        message: '请提供目的地、天数、预算和旅行人数'
      });
    }

    // 验证AI服务配置
    try {
      aiService.validateConfig();
    } catch (configError) {
      return res.status(500).json({
        success: false,
        message: 'AI服务未配置，无法生成旅行计划'
      });
    }

    // 使用AI生成旅行计划
    const aiResult = await aiService.generateTravelPlan({
      destination,
      days: parseInt(days),
      budget: parseFloat(budget),
      travelers: parseInt(travelers),
      preferences,
      startDate,
      endDate
    });

    if (!aiResult.success) {
      return res.status(500).json({
        success: false,
        message: `AI生成旅行计划失败: ${aiResult.message}`
      });
    }

    // 创建旅行计划记录
    const planData = {
      user_id: req.user.userId,
      title: aiResult.plan.title || `${destination} ${days}天旅行计划`,
      destination,
      start_date: startDate,
      end_date: endDate,
      days: parseInt(days),
      budget: parseFloat(budget),
      travelers: parseInt(travelers),
      preferences,
      itinerary: aiResult.plan.dailyItinerary || [],
      budget_breakdown: aiResult.plan.budgetBreakdown || {},
      travel_tips: aiResult.plan.travelTips || [],
      emergency_contacts: aiResult.plan.emergencyContacts || [],
      status: 'generated',
      ai_generated: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: plan, error } = await supabase
      .from('travel_plans')
      .insert(planData)
      .select()
      .single();

    if (error) {
      return res.status(500).json(handleSupabaseError(error));
    }

    res.status(201).json(successResponse({
      plan,
      aiResponse: aiResult.plan,
      usage: aiResult.usage
    }, 'AI生成旅行计划成功'));
  } catch (error) {
    console.error('AI生成旅行计划错误:', error);
    res.status(500).json({
      success: false,
      message: '生成旅行计划失败'
    });
  }
});

// 更新旅行计划
router.put('/plans/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updated_at: new Date().toISOString() };

    // 检查旅行计划是否存在且属于当前用户
    const { data: existingPlan, error: checkError } = await supabase
      .from('travel_plans')
      .select('id')
      .eq('id', id)
      .eq('user_id', req.user.userId)
      .single();

    if (checkError || !existingPlan) {
      return res.status(404).json({
        success: false,
        message: '旅行计划不存在'
      });
    }

    const { data: plan, error } = await supabase
      .from('travel_plans')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(500).json(handleSupabaseError(error));
    }

    res.json(successResponse(plan, '更新旅行计划成功'));
  } catch (error) {
    console.error('更新旅行计划错误:', error);
    res.status(500).json({
      success: false,
      message: '更新旅行计划失败'
    });
  }
});

// 删除旅行计划
router.delete('/plans/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // 检查旅行计划是否存在且属于当前用户
    const { data: existingPlan, error: checkError } = await supabase
      .from('travel_plans')
      .select('id')
      .eq('id', id)
      .eq('user_id', req.user.userId)
      .single();

    if (checkError || !existingPlan) {
      return res.status(404).json({
        success: false,
        message: '旅行计划不存在'
      });
    }

    const { error } = await supabase
      .from('travel_plans')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(500).json(handleSupabaseError(error));
    }

    res.json(successResponse(null, '删除旅行计划成功'));
  } catch (error) {
    console.error('删除旅行计划错误:', error);
    res.status(500).json({
      success: false,
      message: '删除旅行计划失败'
    });
  }
});

// 获取旅行建议
router.post('/advice', authenticateToken, async (req, res) => {
  try {
    const { destination, preferences = [], questions = [] } = req.body;

    if (!destination) {
      return res.status(400).json({
        success: false,
        message: '请提供目的地'
      });
    }

    // 验证AI服务配置
    try {
      aiService.validateConfig();
    } catch (configError) {
      return res.status(500).json({
        success: false,
        message: 'AI服务未配置，无法获取旅行建议'
      });
    }

    const aiResult = await aiService.getTravelAdvice(destination, preferences, questions);

    if (!aiResult.success) {
      return res.status(500).json({
        success: false,
        message: `获取旅行建议失败: ${aiResult.message}`
      });
    }

    res.json(successResponse({
      advice: aiResult.advice,
      usage: aiResult.usage
    }, '获取旅行建议成功'));
  } catch (error) {
    console.error('获取旅行建议错误:', error);
    res.status(500).json({
      success: false,
      message: '获取旅行建议失败'
    });
  }
});

// 搜索目的地POI
router.get('/search-destination', authenticateToken, async (req, res) => {
  try {
    const { keyword, city = '' } = req.query;

    if (!keyword) {
      return res.status(400).json({
        success: false,
        message: '请提供搜索关键词'
      });
    }

    const result = await mapService.searchPoi(keyword, city, '', 1, 10);

    if (result.success) {
      res.json(successResponse(result, '搜索目的地成功'));
    } else {
      res.status(400).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('搜索目的地错误:', error);
    res.status(500).json({
      success: false,
      message: '搜索目的地失败'
    });
  }
});

// 获取旅行计划统计
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const { data: plans, error } = await supabase
      .from('travel_plans')
      .select('status, budget, created_at')
      .eq('user_id', req.user.userId);

    if (error) {
      return res.status(500).json(handleSupabaseError(error));
    }

    const stats = {
      totalPlans: plans?.length || 0,
      completedPlans: plans?.filter(p => p.status === 'completed').length || 0,
      totalBudget: plans?.reduce((sum, p) => sum + (p.budget || 0), 0) || 0,
      plansByStatus: {
        draft: plans?.filter(p => p.status === 'draft').length || 0,
        generated: plans?.filter(p => p.status === 'generated').length || 0,
        active: plans?.filter(p => p.status === 'active').length || 0,
        completed: plans?.filter(p => p.status === 'completed').length || 0
      }
    };

    res.json(successResponse(stats, '获取旅行计划统计成功'));
  } catch (error) {
    console.error('获取旅行计划统计错误:', error);
    res.status(500).json({
      success: false,
      message: '获取旅行计划统计失败'
    });
  }
});

export default router;