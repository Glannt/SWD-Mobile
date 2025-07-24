import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState } from 'react';

const FCM_TOKEN_STORAGE_KEY = 'fcm_token';

// Đảm bảo luôn dùng Firebase thật khi chạy development build
export const FORCE_REAL_ENVIRONMENT = true;

/**
 * Kiểm tra môi trường Expo Go
 * Sử dụng cùng một phương pháp phát hiện với firebase-messaging.ts
 */
const checkIsExpoGo = () => {
  // Sử dụng phương pháp phát hiện từ firebase-messaging.ts để đồng bộ
  try {
    const firebaseMessaging = require('../services/firebase-messaging');
    return firebaseMessaging.isRunningInExpoGo();
  } catch (error) {
    console.error('[FCM] Error using firebase-messaging environment detection:', error);
    
    // Fallback nếu không thể import firebase-messaging
    // Check override flag first
    if (FORCE_REAL_ENVIRONMENT) {
      console.log('[FCM] FORCE_REAL_ENVIRONMENT is enabled, using real Firebase implementation');
      return false;
    }

    try {
      // 1. Kiểm tra biến môi trường trực tiếp
      if (process.env.EAS_BUILD_RUNNER) {
        return false;
      }
      
      // 2. Kiểm tra global.expo
      if (global.expo !== undefined) {
        return true;
      }
      
      // Mặc định
      return __DEV__ && !process.env.EAS_BUILD_RUNNER;
    } catch (fallbackError) {
      console.error('[FCM] Fallback environment detection error:', fallbackError);
      return false; // Assume real Firebase if check fails
    }
  }
};

/**
 * Hook để quản lý token FCM
 */
export const useFcmToken = () => {
  const [token, setToken] = useState<string | null>(null);
  
  // Đăng ký FCM token
  const registerFcmToken = async (userRole?: string): Promise<boolean> => {
    try {
      console.log('[FCM] Starting FCM token registration');
      
      // Kiểm tra vai trò người dùng - chỉ đăng ký cho admin
      if (userRole && userRole !== 'admin') {
        console.log('[FCM] User is not an admin, skipping FCM token registration');
        return false;
      }
      
      // Xác định môi trường
      const isExpoGoEnv = checkIsExpoGo();
      console.log('[FCM] Is Expo Go environment?', isExpoGoEnv);
      
      if (isExpoGoEnv) {
        console.log('[FCM] Running in Expo Go - using mock');
        
        // Import firebase-messaging service trực tiếp để tránh circular dependency
        try {
          // Sử dụng trực tiếp mock firebase
          const mockFirebase = require('../services/mock-firebase');
          const mockToken = await mockFirebase.getFcmToken();
          
          if (mockToken) {
            await AsyncStorage.setItem(FCM_TOKEN_STORAGE_KEY, mockToken);
            setToken(mockToken);
            
            // Trong Expo Go, giả lập đăng ký thành công
            console.log('[FCM] Registered mock token successfully');
            return true;
          }
        } catch (mockError) {
          console.error('[FCM] Error getting mock token:', mockError);
        }
        
        return false;
      }
      
      try {
        // Import dynamically để tránh lỗi
        const firebaseMessaging = require('../services/firebase-messaging');
        
        // Kiểm tra token đã lưu trước - tránh tạo token mới nếu không cần thiết
        const savedToken = await AsyncStorage.getItem(FCM_TOKEN_STORAGE_KEY);
        if (savedToken) {
          console.log('[FCM] Using existing token from storage');
          setToken(savedToken);
          
          // Đăng ký token hiện tại với server nếu có JWT
          const jwt = await AsyncStorage.getItem('access_token');
          if (jwt) {
            console.log('[FCM] Would register existing token with server');
            console.log('[FCM] =================== TOKEN REGISTRATION DEBUG ===================');
            console.log('[FCM] Token to register:', savedToken.substring(0, 15) + '...');
            console.log('[FCM] Token length:', savedToken.length);
            console.log('[FCM] JWT available:', !!jwt);
            console.log('[FCM] JWT first 15 chars:', jwt.substring(0, 15) + '...');
            console.log('[FCM] ============================================================');
            
            // Đăng ký token với server
            const success = await firebaseMessaging.registerFcmTokenWithServer(savedToken, jwt);
            console.log('[FCM] Re-registration of saved token result:', success);
            
            return success;
          } else {
            console.log('[FCM] No JWT available, cannot register saved token');
            return false;
          }
        }
        
        // 1. Kiểm tra quyền
        const hasPermission = await firebaseMessaging.checkNotificationPermission();
        console.log('[FCM] Has permission:', hasPermission);
        
        if (!hasPermission) {
          // 2. Yêu cầu quyền nếu chưa có
          console.log('[FCM] Requesting notification permission...');
          const granted = await firebaseMessaging.requestNotificationPermission();
          console.log('[FCM] Permission granted:', granted);
          
          if (!granted) {
            console.log('[FCM] Permission not granted, cannot continue');
            return false;
          }
        }
        
        // 3. Lấy token
        console.log('[FCM] Getting FCM token...');
        const fcmToken = await firebaseMessaging.getFcmToken();
        console.log('[FCM] Got token:', fcmToken ? fcmToken.substring(0, 10) + '...' : null);
        
        if (fcmToken) {
          setToken(fcmToken);
          
          // 4. Đăng ký token với server
          console.log('[FCM] Getting access token from storage...');
          const jwt = await AsyncStorage.getItem('access_token');
          
          if (jwt) {
            console.log('[FCM] Registering token with server...');
            console.log('[FCM] =================== NEW TOKEN REGISTRATION DEBUG ===================');
            console.log('[FCM] New token to register:', fcmToken.substring(0, 15) + '...');
            console.log('[FCM] Token length:', fcmToken.length);
            console.log('[FCM] JWT available:', !!jwt);
            console.log('[FCM] JWT first 15 chars:', jwt.substring(0, 15) + '...');
            console.log('[FCM] =============================================================');
            
            // Đăng ký token với server
            const success = await firebaseMessaging.registerFcmTokenWithServer(fcmToken, jwt);
            console.log('[FCM] Registration result:', success);
            
            return success;
          } else {
            console.log('[FCM] No JWT available, cannot register with server');
          }
        }
      } catch (error) {
        console.error('[FCM] Error in registerFcmToken:', error);
      }
      
      return false;
    } catch (error) {
      console.error('[FCM] Unexpected error in registerFcmToken:', error);
      return false;
    }
  };

  /**
   * Đăng ký lại FCM token sau khi đăng nhập thành công 
   * Gọi hàm này trong handler đăng nhập thành công
   */
  const registerFcmTokenAfterLogin = async (jwt: string, userData?: any): Promise<boolean> => {
    try {
      console.log('[FCM] Registering FCM token after successful login');
      
      // Kiểm tra vai trò người dùng - chỉ đăng ký cho admin
      const userRole = userData?.role || '';
      if (userRole !== 'admin') {
        console.log('[FCM] User is not an admin (role: ' + userRole + '), skipping FCM token registration');
        // Không xóa token hiện tại cho non-admin users, chỉ bỏ qua quá trình đăng ký
        return false;
      }
      
      console.log('[FCM] User is admin, proceeding with token registration');
      
      // Lấy token hiện tại nếu có
      const currentToken = await AsyncStorage.getItem(FCM_TOKEN_STORAGE_KEY);
      
      // Xác định môi trường
      const isExpoGoEnv = checkIsExpoGo();
      const firebaseMessaging = isExpoGoEnv 
        ? require('../services/mock-firebase')
        : require('../services/firebase-messaging');
      
      if (!currentToken) {
        // Nếu chưa có token, tạo mới
        console.log('[FCM] No token found, creating new token for admin');
        return await registerFcmToken('admin');
      }
      
      // Nếu có token, đăng ký với server
      console.log('[FCM] Registering existing token with server after login for admin');
      
      // Log chi tiết về token và JWT
      console.log('[FCM] =================== LOGIN TOKEN REGISTRATION ===================');
      console.log('[FCM] Token to register after login:', currentToken.substring(0, 15) + '...');
      console.log('[FCM] Token length:', currentToken.length);
      console.log('[FCM] JWT available:', !!jwt);
      console.log('[FCM] JWT first 15 chars:', jwt.substring(0, 15) + '...');
      console.log('[FCM] User role:', userRole);
      console.log('[FCM] ===============================================================');
      
      // Đăng ký token với server
      const success = await firebaseMessaging.registerFcmTokenWithServer(currentToken, jwt);
      
      console.log('[FCM] Token registration after login result:', success);
      
      if (success) {
        console.log('[FCM] Successfully registered token after login');
        setToken(currentToken);
      } else {
        console.log('[FCM] Failed to register token, trying to get new token');
        
        // Nếu đăng ký thất bại, có thể token cũ không hợp lệ, thử lấy token mới
        try {
          const newToken = await firebaseMessaging.getFcmToken();
          if (newToken) {
            console.log('[FCM] Got new token after login');
            await AsyncStorage.setItem(FCM_TOKEN_STORAGE_KEY, newToken);
            setToken(newToken);
            
            // Log chi tiết về token mới
            console.log('[FCM] =================== NEW TOKEN AFTER LOGIN ===================');
            console.log('[FCM] New token after login:', newToken.substring(0, 15) + '...');
            console.log('[FCM] New token length:', newToken.length);
            console.log('[FCM] JWT available:', !!jwt);
            console.log('[FCM] JWT first 15 chars:', jwt.substring(0, 15) + '...');
            console.log('[FCM] ============================================================');
            
            // Đăng ký token mới
            const newSuccess = await firebaseMessaging.registerFcmTokenWithServer(newToken, jwt);
            console.log('[FCM] New token registration result:', newSuccess);
            
            return newSuccess;
          }
        } catch (tokenError) {
          console.error('[FCM] Error getting new token after login:', tokenError);
        }
      }
      
      return success;
    } catch (error) {
      console.error('[FCM] Error in registerFcmTokenAfterLogin:', error);
      return false;
    }
  };

  // Debug: Lấy token hiện tại
  const debugCurrentToken = async (): Promise<string | null> => {
    try {
      const storedToken = await AsyncStorage.getItem(FCM_TOKEN_STORAGE_KEY);
      console.log('[FCM] Current stored token:', storedToken ? storedToken.substring(0, 10) + '...' : 'none');
      return storedToken;
    } catch (error) {
      console.error('[FCM] Error retrieving token for debug:', error);
      return null;
    }
  };

  return {
    token,
    registerFcmToken,
    registerFcmTokenAfterLogin,
    debugCurrentToken
  };
}; 