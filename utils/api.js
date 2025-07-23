import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Cấu hình API URLs
const API_BASE_URLS = {
  development: {
    android: {
      // Dùng 10.0.2.2 cho máy ảo Android, IP thực cho thiết bị vật lý
      emulator: 'http://10.0.2.2:3000',
      // Cấu hình IP của backend cho thiết bị vật lý - cần thay đổi cho phù hợp với mạng
      device: 'http://192.168.1.9:3000'
    },
    ios: 'http://localhost:3000',
    web: 'http://localhost:3000'
  },
  production: {
    // URL production thực tế 
    default: 'https://api.example.com'
  }
};

// Xác định URL cơ sở dựa trên môi trường
export const getApiBaseUrl = () => {
  const isDev = __DEV__;
  
  if (!isDev) {
    return API_BASE_URLS.production.default;
  }
    
  if (Platform.OS === 'android') {
    // Trên thiết bị vật lý cần dùng IP thực của máy chủ, không phải localhost
    const isEmulator = Platform.constants.Brand === 'google';
    console.log('[API] Android environment detected, emulator?', isEmulator);
    return isEmulator ? API_BASE_URLS.development.android.emulator : API_BASE_URLS.development.android.device;
  }
  
  if (Platform.OS === 'ios') {
    return API_BASE_URLS.development.ios;
  }
  
  return API_BASE_URLS.development.web;
};

/**
 * Tạo URL API đầy đủ với path và query
 * @param {string} endpoint - Endpoint API (không bao gồm / đầu tiên)
 * @param {object} queryParams - Tham số query (tùy chọn)
 */
export const buildApiUrl = (endpoint, queryParams = {}) => {
  const baseUrl = getApiBaseUrl();
  
  // Đảm bảo endpoint không bắt đầu bằng '/' để tránh double slash
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
  
  // Tạo URL cơ bản
  let url = `${baseUrl}/api/v1/${cleanEndpoint}`;
  
  // Thêm query parameters nếu có
  if (Object.keys(queryParams).length > 0) {
    const queryString = Object.entries(queryParams)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');
    url += `?${queryString}`;
  }
  
  return url;
};

/**
 * Gọi API với fetch
 * @param {string} endpoint - Endpoint API
 * @param {object} options - Options fetch
 * @returns {Promise} Promise với kết quả API
 */
export const fetchApi = async (endpoint, options = {}) => {
  try {
    // Lấy base URL dựa trên môi trường
    const url = buildApiUrl(endpoint);
    
    // Log thông tin request
    console.log(`[API] ${options.method || 'GET'} request to:`, url);
    
    // Thực hiện fetch
    const response = await fetch(url, options);
    
    // Kiểm tra status code
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[API] Error in ${options.method || 'GET'} ${endpoint}:`, response.status, errorText);
      throw new Error(`Cannot ${options.method || 'GET'} ${endpoint}`);
    }
    
    // Parse response
    let result;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      result = await response.json();
    } else {
      result = await response.text();
    }
    
    return result;
  } catch (error) {
    console.error(`[API] Error in ${options.method || 'GET'} ${endpoint}:`, error);
    throw error;
  }
};

/**
 * Kiểm tra kết nối đến API
 * @returns {Promise<boolean>} Trạng thái kết nối
 */
export const testApiConnection = async () => {
  try {
    // Thử với root API endpoint
    const baseUrl = getApiBaseUrl();
    const rootUrl = `${baseUrl}/api/v1`;
    
    console.log("[API] Testing connection to root API:", rootUrl);
    const startTime = Date.now();
    const response = await fetch(rootUrl);
    const endTime = Date.now();
    
    // Kiểm tra response
    const success = response.ok || response.status === 404; // 404 vẫn có nghĩa server đang chạy
    
    console.log(
      `[API] Root API test ${success ? 'successful' : 'failed'}: `,
      `Status: ${response.status}, Time: ${endTime - startTime}ms`
    );
    
    if (!success) {
      // Thử endpoint API thứ hai
      return testApiConnectionWithPath('users/profile');
    }
    
    return success;
  } catch (error) {
    console.error("[API] Connection test failed with error:", error);
    // Thử lại với một endpoint khác nếu có lỗi
    return testApiConnectionWithPath('users/profile');
  }
};

/**
 * Thử kết nối với một endpoint cụ thể
 * @param {string} path - Đường dẫn API
 * @param {boolean} addAuthHeader - Có thêm auth header không
 */
const testApiConnectionWithPath = async (path, addAuthHeader = false) => {
  try {
    // Tạo URL đầy đủ
    const url = buildApiUrl(path);
    console.log(`[API] Testing connection to alternate endpoint:`, url);
    
    const startTime = Date.now();
    
    // Tạo options cho request
    const options = {};
    
    // Thêm auth header nếu cần
    if (addAuthHeader) {
      const jwt = await AsyncStorage.getItem('access_token');
      if (jwt) {
        options.headers = {
          'Authorization': `Bearer ${jwt}`
        };
      }
    }
    
    // Thực hiện request
    const response = await fetch(url, options);
    const endTime = Date.now();
    
    // Kiểm tra kết quả
    const success = response.ok || response.status === 401; // 401 có nghĩa API đang hoạt động nhưng cần auth
    
    console.log(
      `[API] Alternate connection test ${success ? 'successful' : 'failed'}: `,
      `Status: ${response.status}, Time: ${endTime - startTime}ms`
    );
    
    return success;
  } catch (error) {
    console.error(`[API] Alternate connection test failed:`, error);
    return false;
  }
}; 