import express from 'express';
import mapService from '../services/mapService.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// 地理编码 - 地址转坐标
router.post('/geocode', authenticateToken, async (req, res) => {
  try {
    const { address, city } = req.body;

    if (!address) {
      return res.status(400).json({
        success: false,
        message: '请提供地址'
      });
    }

    const result = await mapService.geocode(address, city);

    if (result.success) {
      res.json({
        success: true,
        data: result,
        message: '地理编码成功'
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('地理编码路由错误:', error);
    res.status(500).json({
      success: false,
      message: '地理编码服务暂时不可用'
    });
  }
});

// 逆地理编码 - 坐标转地址
router.post('/reverse-geocode', authenticateToken, async (req, res) => {
  try {
    const { lat, lng } = req.body;

    if (lat === undefined || lng === undefined) {
      return res.status(400).json({
        success: false,
        message: '请提供经纬度坐标'
      });
    }

    const result = await mapService.reverseGeocode(lat, lng);

    if (result.success) {
      res.json({
        success: true,
        data: result,
        message: '逆地理编码成功'
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('逆地理编码路由错误:', error);
    res.status(500).json({
      success: false,
      message: '逆地理编码服务暂时不可用'
    });
  }
});

// 搜索POI（兴趣点）
router.get('/search-poi', authenticateToken, async (req, res) => {
  try {
    const { keyword, city, types, page = 1, pageSize = 20 } = req.query;

    if (!keyword) {
      return res.status(400).json({
        success: false,
        message: '请提供搜索关键词'
      });
    }

    const result = await mapService.searchPoi(
      keyword, 
      city, 
      types, 
      parseInt(page), 
      parseInt(pageSize)
    );

    if (result.success) {
      res.json({
        success: true,
        data: result,
        message: 'POI搜索成功'
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('POI搜索路由错误:', error);
    res.status(500).json({
      success: false,
      message: 'POI搜索服务暂时不可用'
    });
  }
});

// 驾车路径规划
router.post('/driving-route', authenticateToken, async (req, res) => {
  try {
    const { origin, destination, waypoints = [] } = req.body;

    if (!origin || !destination) {
      return res.status(400).json({
        success: false,
        message: '请提供起点和终点坐标'
      });
    }

    const result = await mapService.drivingRoute(origin, destination, waypoints);

    if (result.success) {
      res.json({
        success: true,
        data: result,
        message: '路径规划成功'
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('驾车路径规划路由错误:', error);
    res.status(500).json({
      success: false,
      message: '路径规划服务暂时不可用'
    });
  }
});

// 公共交通路径规划
router.post('/transit-route', authenticateToken, async (req, res) => {
  try {
    const { origin, destination, city } = req.body;

    if (!origin || !destination) {
      return res.status(400).json({
        success: false,
        message: '请提供起点和终点坐标'
      });
    }

    const result = await mapService.transitRoute(origin, destination, city);

    if (result.success) {
      res.json({
        success: true,
        data: result,
        message: '公交路径规划成功'
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('公交路径规划路由错误:', error);
    res.status(500).json({
      success: false,
      message: '公交路径规划服务暂时不可用'
    });
  }
});

// 获取天气信息
router.get('/weather', optionalAuth, async (req, res) => {
  try {
    const { city } = req.query;

    if (!city) {
      return res.status(400).json({
        success: false,
        message: '请提供城市名称'
      });
    }

    const result = await mapService.getWeather(city);

    if (result.success) {
      res.json({
        success: true,
        data: result,
        message: '获取天气信息成功'
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('天气信息路由错误:', error);
    res.status(500).json({
      success: false,
      message: '天气服务暂时不可用'
    });
  }
});

// IP定位
router.get('/ip-location', optionalAuth, async (req, res) => {
  try {
    const clientIp = req.headers['x-forwarded-for'] || 
                     req.connection.remoteAddress || 
                     req.socket.remoteAddress;
    
    const result = await mapService.ipLocation(clientIp);

    if (result.success) {
      res.json({
        success: true,
        data: result,
        message: 'IP定位成功'
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('IP定位路由错误:', error);
    res.status(500).json({
      success: false,
      message: 'IP定位服务暂时不可用'
    });
  }
});

// 地图服务状态检查
router.get('/status', optionalAuth, (req, res) => {
  try {
    mapService.validateConfig();
    
    res.json({
      success: true,
      data: {
        service: '高德地图',
        status: '可用',
        features: [
          '地理编码',
          '逆地理编码', 
          'POI搜索',
          '路径规划',
          '天气查询',
          'IP定位'
        ]
      },
      message: '地图服务运行正常'
    });
  } catch (error) {
    res.json({
      success: false,
      data: {
        service: '高德地图',
        status: '不可用',
        error: error.message
      },
      message: '地图服务未配置'
    });
  }
});

// 获取地图配置（前端使用）
router.get('/config', optionalAuth, (req, res) => {
  try {
    const hasApiKey = !!process.env.AMAP_API_KEY;
    
    res.json({
      success: true,
      data: {
        hasApiKey,
        service: '高德地图',
        features: [
          '地图显示',
          '地点标记',
          '路径绘制',
          '地点搜索'
        ]
      },
      message: hasApiKey ? '地图服务已配置' : '地图服务未配置'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取地图配置失败'
    });
  }
});

export default router;