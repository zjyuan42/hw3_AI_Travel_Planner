import axios from 'axios';

/**
 * 高德地图服务
 * 提供地理位置搜索、路径规划、POI查询等功能
 */
class MapService {
  constructor() {
    this.apiKey = process.env.AMAP_API_KEY;
    this.baseUrl = 'https://restapi.amap.com/v3';
  }

  /**
   * 验证配置
   */
  validateConfig() {
    if (!this.apiKey) {
      throw new Error('缺少高德地图API密钥配置: AMAP_API_KEY');
    }
    return true;
  }

  /**
   * 构建请求URL
   */
  buildUrl(endpoint, params = {}) {
    const queryParams = new URLSearchParams({
      key: this.apiKey,
      ...params
    });
    return `${this.baseUrl}${endpoint}?${queryParams.toString()}`;
  }

  /**
   * 地理编码 - 地址转坐标
   */
  async geocode(address, city = '') {
    try {
      this.validateConfig();
      
      const url = this.buildUrl('/geocode/geo', {
        address: address,
        city: city
      });

      const response = await axios.get(url);
      const data = response.data;

      if (data.status === '1' && data.geocodes && data.geocodes.length > 0) {
        const [lng, lat] = data.geocodes[0].location.split(',').map(Number);
        return {
          success: true,
          location: {
            lat,
            lng,
            formattedAddress: data.geocodes[0].formatted_address,
            province: data.geocodes[0].province,
            city: data.geocodes[0].city,
            district: data.geocodes[0].district
          }
        };
      } else {
        return {
          success: false,
          message: data.info || '地理编码失败'
        };
      }
    } catch (error) {
      console.error('地理编码错误:', error);
      return {
        success: false,
        message: `地理编码服务错误: ${error.message}`
      };
    }
  }

  /**
   * 逆地理编码 - 坐标转地址
   */
  async reverseGeocode(lat, lng) {
    try {
      this.validateConfig();
      
      const url = this.buildUrl('/geocode/regeo', {
        location: `${lng},${lat}`,
        extensions: 'all',
        poitype: 'all'
      });

      const response = await axios.get(url);
      const data = response.data;

      if (data.status === '1' && data.regeocode) {
        return {
          success: true,
          address: {
            formattedAddress: data.regeocode.formatted_address,
            country: data.regeocode.addressComponent.country,
            province: data.regeocode.addressComponent.province,
            city: data.regeocode.addressComponent.city,
            district: data.regeocode.addressComponent.district,
            township: data.regeocode.addressComponent.township,
            neighborhood: data.regeocode.addressComponent.neighborhood?.name || '',
            street: data.regeocode.addressComponent.streetNumber?.street || '',
            streetNumber: data.regeocode.addressComponent.streetNumber?.number || ''
          },
          pois: data.regeocode.pois || []
        };
      } else {
        return {
          success: false,
          message: data.info || '逆地理编码失败'
        };
      }
    } catch (error) {
      console.error('逆地理编码错误:', error);
      return {
        success: false,
        message: `逆地理编码服务错误: ${error.message}`
      };
    }
  }

  /**
   * 搜索POI（兴趣点）
   */
  async searchPoi(keyword, city = '', types = '', page = 1, pageSize = 20) {
    try {
      this.validateConfig();
      
      const url = this.buildUrl('/place/text', {
        keywords: keyword,
        city: city,
        types: types,
        page: page.toString(),
        offset: pageSize.toString(),
        extensions: 'all'
      });

      const response = await axios.get(url);
      const data = response.data;

      if (data.status === '1' && data.pois) {
        const pois = data.pois.map(poi => ({
          id: poi.id,
          name: poi.name,
          type: poi.type,
          typeCode: poi.typecode,
          address: poi.address,
          location: {
            lat: parseFloat(poi.location.split(',')[1]),
            lng: parseFloat(poi.location.split(',')[0])
          },
          pname: poi.pname,
          cityname: poi.cityname,
          adname: poi.adname,
          tel: poi.tel || '',
          distance: poi.distance ? parseFloat(poi.distance) : null,
          businessArea: poi.business_area || ''
        }));

        return {
          success: true,
          pois: pois,
          total: parseInt(data.count) || 0,
          page: page,
          pageSize: pageSize
        };
      } else {
        return {
          success: false,
          message: data.info || 'POI搜索失败'
        };
      }
    } catch (error) {
      console.error('POI搜索错误:', error);
      return {
        success: false,
        message: `POI搜索服务错误: ${error.message}`
      };
    }
  }

  /**
   * 路径规划 - 驾车
   */
  async drivingRoute(origin, destination, waypoints = []) {
    try {
      this.validateConfig();
      
      const params = {
        origin: `${origin.lng},${origin.lat}`,
        destination: `${destination.lng},${destination.lat}`,
        strategy: '10' // 默认策略：高速优先
      };

      if (waypoints.length > 0) {
        params.waypoints = waypoints.map(wp => `${wp.lng},${wp.lat}`).join(';');
      }

      const url = this.buildUrl('/direction/driving', params);
      const response = await axios.get(url);
      const data = response.data;

      if (data.status === '1' && data.route) {
        const path = data.route.paths[0];
        return {
          success: true,
          route: {
            distance: path.distance, // 米
            duration: path.duration, // 秒
            tolls: path.tolls, // 收费金额
            tollDistance: path.toll_distance, // 收费路段长度
            trafficLights: path.traffic_lights, // 红绿灯个数
            steps: path.steps.map(step => ({
              instruction: step.instruction,
              orientation: step.orientation,
              road: step.road,
              distance: step.distance,
              duration: step.duration,
              polyline: step.polyline,
              action: step.action
            }))
          }
        };
      } else {
        return {
          success: false,
          message: data.info || '路径规划失败'
        };
      }
    } catch (error) {
      console.error('路径规划错误:', error);
      return {
        success: false,
        message: `路径规划服务错误: ${error.message}`
      };
    }
  }

  /**
   * 路径规划 - 公共交通
   */
  async transitRoute(origin, destination, city = '') {
    try {
      this.validateConfig();
      
      const url = this.buildUrl('/direction/transit/integrated', {
        origin: `${origin.lng},${origin.lat}`,
        destination: `${destination.lng},${destination.lat}`,
        city: city,
        strategy: '0' // 最快捷模式
      });

      const response = await axios.get(url);
      const data = response.data;

      if (data.status === '1' && data.route) {
        const routes = data.route.transits.map(transit => ({
          cost: transit.cost,
          duration: transit.duration,
          walkingDistance: transit.walking_distance,
          distance: transit.distance,
          nightFlag: transit.night_flag,
          segments: transit.segments.map(segment => ({
            walking: segment.walking,
            bus: segment.bus,
            railway: segment.railway,
            taxi: segment.taxi
          }))
        }));

        return {
          success: true,
          routes: routes
        };
      } else {
        return {
          success: false,
          message: data.info || '公交路径规划失败'
        };
      }
    } catch (error) {
      console.error('公交路径规划错误:', error);
      return {
        success: false,
        message: `公交路径规划服务错误: ${error.message}`
      };
    }
  }

  /**
   * 获取天气信息
   */
  async getWeather(city) {
    try {
      this.validateConfig();
      
      const url = this.buildUrl('/weather/weatherInfo', {
        city: city,
        extensions: 'all' // 获取预报天气
      });

      const response = await axios.get(url);
      const data = response.data;

      if (data.status === '1' && data.lives && data.lives.length > 0) {
        const live = data.lives[0];
        const forecasts = data.forecasts || [];

        return {
          success: true,
          current: {
            province: live.province,
            city: live.city,
            weather: live.weather,
            temperature: live.temperature,
            windDirection: live.winddirection,
            windPower: live.windpower,
            humidity: live.humidity,
            reportTime: live.reporttime
          },
          forecast: forecasts.length > 0 ? forecasts[0].casts : []
        };
      } else {
        return {
          success: false,
          message: data.info || '获取天气信息失败'
        };
      }
    } catch (error) {
      console.error('获取天气信息错误:', error);
      return {
        success: false,
        message: `天气服务错误: ${error.message}`
      };
    }
  }

  /**
   * IP定位
   */
  async ipLocation(ip = '') {
    try {
      this.validateConfig();
      
      const params = {};
      if (ip) {
        params.ip = ip;
      }

      const url = this.buildUrl('/ip', params);
      const response = await axios.get(url);
      const data = response.data;

      if (data.status === '1' && data.rectangle) {
        const [lng1, lat1, lng2, lat2] = data.rectangle.split(';')[0].split(',');
        const centerLng = (parseFloat(lng1) + parseFloat(lng2)) / 2;
        const centerLat = (parseFloat(lat1) + parseFloat(lat2)) / 2;

        return {
          success: true,
          location: {
            lat: centerLat,
            lng: centerLng
          },
          country: data.country,
          province: data.province,
          city: data.city,
          district: data.district,
          isp: data.isp
        };
      } else {
        return {
          success: false,
          message: data.info || 'IP定位失败'
        };
      }
    } catch (error) {
      console.error('IP定位错误:', error);
      return {
        success: false,
        message: `IP定位服务错误: ${error.message}`
      };
    }
  }
}

// 创建单例实例
const mapService = new MapService();

export default mapService;