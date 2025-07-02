import { Platform } from 'react-native';

/**
 * Lấy URL API phù hợp với môi trường
 * @returns {string} URL API cơ sở
 */
export const getApiBaseUrl = () => {
  try {
    let baseUrl = '';
    
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location) {
      // Trong môi trường web, sử dụng current host thay vì localhost
      const host = window.location.hostname;
      const port = 3000; // Giữ nguyên port
      baseUrl = `http://${host}:${port}/api/v1`;
      console.log('[API] Using web API URL:', baseUrl);
    } else if (Platform.OS === 'ios') {
      // Trên iOS, sử dụng địa chỉ IP thay vì localhost
      // Thay đổi IP này thành địa chỉ máy chủ thực của bạn
      baseUrl = 'http://192.168.1.8:3000/api/v1';
      console.log('[API] Using iOS API URL:', baseUrl);
    } else if (Platform.OS === 'android') {
      // Trên Android, 10.0.2.2 trỏ đến localhost của máy chủ
      baseUrl = 'http://10.0.2.2:3000/api/v1';
      console.log('[API] Using Android API URL:', baseUrl);
    } else {
      // Fallback nếu không xác định được
      baseUrl = 'http://localhost:3000/api/v1';
      console.log('[API] Using fallback API URL:', baseUrl);
    }
    
    // Đảm bảo URL kết thúc với dấu /
    if (!baseUrl.endsWith('/')) {
      baseUrl = `${baseUrl}/`;
    }
    
    return baseUrl;
  } catch (e) {
    console.error('[MOBILE] Error getting API base URL:', e);
    // Fallback nếu không xác định được
    return 'http://localhost:3000/api/v1/';
  }
};

/**
 * Kiểm tra kết nối đến API
 * @returns {Promise<boolean>} Trạng thái kết nối
 */
export const testApiConnection = async () => {
  const API_BASE_URL = getApiBaseUrl();
  
  try {
    console.log("[API] Testing connection to:", API_BASE_URL);
    const startTime = Date.now();
    const response = await fetch(`${API_BASE_URL}/health`, { 
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    const endTime = Date.now();
    
    const responseText = await response.text();
    const success = response.ok;
    
    console.log(
      `[API] Connection test ${success ? 'successful' : 'failed'}: `,
      `Status: ${response.status}, Time: ${endTime - startTime}ms, Response:`, 
      responseText
    );
    
    return success;
  } catch (error) {
    console.error("[API] Connection test failed with error:", error);
    return false;
  }
};

/**
 * Thực hiện HTTP request với xử lý lỗi nhất quán
 * @param {string} endpoint - Endpoint API (không bao gồm base URL)
 * @param {Object} options - Tùy chọn fetch
 * @returns {Promise<Object>} Kết quả API
 */
export const fetchApi = async (endpoint, options = {}) => {
  const API_BASE_URL = getApiBaseUrl();
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  try {
    console.log(`[API] ${options.method || 'GET'} request to: ${url}`);
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      ...options
    });
    
    // Lấy response body dưới dạng text
    const responseText = await response.text();
    
    // Parse JSON nếu có thể
    let data;
    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch (e) {
      console.warn('[API] Response is not valid JSON:', responseText);
      data = { message: responseText };
    }
    
    // Xử lý lỗi HTTP
    if (!response.ok) {
      const error = new Error(data.message || `HTTP error ${response.status}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error(`[API] Error in ${options.method || 'GET'} ${url}:`, error);
    throw error;
  }
}; 