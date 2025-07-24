import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Thêm cờ để ghi đè việc phát hiện môi trường
export const FORCE_REAL_FIREBASE = true;

// Khai báo constants
const FCM_TOKEN_STORAGE_KEY = 'fcm_token';
const API_ENDPOINT = 'users/fcm-token'; // Loại bỏ dấu / đầu endpoint

// Thêm debug flag ở đầu file
let DEBUG_FCM = true; // Đặt thành true để hiện log chi tiết

// Lazy loading của Firebase module để tránh lỗi khi import
let firebaseAppInstance = null;
let firebaseMessagingInstance = null;

/**
 * Hàm singleton để kiểm tra xem có đang chạy trong Expo Go hay không
 * Được sử dụng làm điểm phát hiện môi trường chính cho toàn bộ ứng dụng
 * @returns {boolean} true nếu đang chạy trong Expo Go, false nếu đang chạy trong build thật
 */
export const isRunningInExpoGo = () => {
  // QUAN TRỌNG: Check override flag first - nếu có cờ force thì luôn trả về false (không phải Expo Go)
  if (FORCE_REAL_FIREBASE) {
    console.log("[FCM] FORCE_REAL_FIREBASE is explicitly TRUE - forcing real Firebase implementation");
    console.log("[FCM] This should override all environment checks and return false (not Expo Go)");
    return false;
  }

  // Thêm nhiều phương pháp kiểm tra
  try {
    console.log("[FCM] Environment detection details:");

    // 1. Kiểm tra biến môi trường trực tiếp
    if (process.env.EAS_BUILD_RUNNER) {
      console.log("[FCM] EAS_BUILD_RUNNER detected, not in Expo Go");
      return false;
    }
    console.log("- EAS_BUILD_RUNNER:", process.env.EAS_BUILD_RUNNER || "not found");
    
    // 2. Kiểm tra global.expo (dấu hiệu chạy trong Expo Go)
    if (global.expo !== undefined) {
      console.log("[FCM] global.expo detected, likely in Expo Go");
      console.log("- global.expo:", global.expo ? "exists" : "undefined");
      return true;
    }
    console.log("- global.expo: not found (good)");
    
    // 3. Kiểm tra expo constant
    try {
      const Constants = require('expo-constants');
      const executionEnvironment = Constants.default?.executionEnvironment;
      console.log("- executionEnvironment:", executionEnvironment);
      
      if (executionEnvironment === 'bare') {
        console.log("[FCM] Bare workflow detected, not in Expo Go");
        return false;
      }
      if (executionEnvironment === 'managed') {
        console.log("[FCM] Managed workflow detected, likely in Expo Go");
        return true;
      }
    } catch (constError) {
      console.log("[FCM] Error checking Constants:", constError.message || constError);
    }

    // 4. Thử import firebase trực tiếp
    try {
      console.log("[FCM] Attempting direct Firebase import...");
      const firebaseApp = require('@react-native-firebase/app').default;
      if (firebaseApp && typeof firebaseApp === 'function') {
        console.log("[FCM] Firebase app can be imported directly - NOT in Expo Go");
        
        // Check Firebase configuration - nhưng không làm hỏng quá trình phát hiện
        try {
          console.log("- Firebase SDK version:", firebaseApp.SDK_VERSION || "unknown");
          console.log("- Firebase apps initialized:", firebaseApp.apps.length);
          if (firebaseApp.apps.length > 0) {
            console.log("- Default app name:", firebaseApp.app().name);
          } else {
            console.log("- No Firebase apps initialized yet");
          }
        } catch (versionError) {
          console.log("[FCM] Could not get Firebase details:", versionError.message || versionError);
        }
        
        return false;
      }
    } catch (err) {
      console.log("[FCM] Firebase import error:", err.message || err);
      console.log("[FCM] This likely means we're in Expo Go or Firebase is not configured properly");
    }

    // Mặc định dựa vào __DEV__ nếu tất cả cách khác thất bại
    const isDev = __DEV__ && !process.env.EAS_BUILD_RUNNER;
    console.log("[FCM] Using default detection method - isDev:", isDev);
    return isDev;
  } catch (error) {
    console.log("[FCM] Error detecting environment, assuming not Expo Go:", error);
    return false; // Nếu có lỗi, giả định không chạy trong Expo Go để sử dụng Firebase thật
  }
};

/**
 * Lấy Firebase messaging module
 */
const getMessagingModule = () => {
  try {
    if (isRunningInExpoGo()) {
      console.log('[FCM] Running in Expo Go - using mock');
      return require('./mockFirebase').default;
    }

    // Chỉ import firebase khi không ở trong Expo Go
    if (!firebaseAppInstance) {
      try {
        console.log('[FCM] Importing firebase/app...');
        const firebaseApp = require('@react-native-firebase/app').default;
        firebaseAppInstance = firebaseApp;
        
        // Kiểm tra xem Firebase đã khởi tạo chưa
        try {
          const apps = firebaseApp.apps;
          console.log('[FCM] Firebase apps:', apps ? apps.length : 'undefined');
          
          if (!apps || apps.length === 0) {
            console.log('[FCM] Initializing Firebase app...');
            firebaseAppInstance.initializeApp({});
          }
          
          console.log('[FCM] Firebase app initialized successfully');
          console.log('[FCM] Firebase app name:', firebaseApp.app().name);
          console.log('[FCM] Firebase options:', JSON.stringify(firebaseApp.app().options || {}));
        } catch (initError) {
          console.error('[FCM] Firebase initialization error:', initError);
        }
      } catch (appError) {
        console.error('[FCM] Firebase app import error:', appError);
        return require('./mockFirebase').default;
      }
    }

    if (!firebaseMessagingInstance) {
      try {
        console.log('[FCM] Importing firebase/messaging...');
        const firebaseMessaging = require('@react-native-firebase/messaging').default;
        firebaseMessagingInstance = firebaseMessaging;
        
        // Log Firebase SDK version
        try {
          const version = firebaseMessaging.SDK_VERSION;
          console.log('[FCM] Firebase SDK version:', version);
        } catch (versionError) {
          console.error('[FCM] Error getting Firebase SDK version:', versionError);
        }
        
        console.log('[FCM] Firebase messaging module loaded successfully');
      } catch (messagingError) {
        console.error('[FCM] Firebase messaging import error:', messagingError);
        return require('./mockFirebase').default;
      }
    }

    return firebaseMessagingInstance;
  } catch (error) {
    console.error('[FCM] Error getting Firebase messaging module:', error);
    return require('./mockFirebase').default;
  }
};

/**
 * Kiểm tra trạng thái quyền thông báo hiện tại
 */
export async function checkNotificationPermission() {
  try {
    const messagingModule = getMessagingModule();
    
    if (isRunningInExpoGo()) {
      // Sử dụng trực tiếp hàm trong mock
      console.log('[FCM] Using mock permission check');
      const mockFirebase = require('./mockFirebase');
      return await mockFirebase.checkNotificationPermission();
    }
    
    // Kiểm tra nếu là Firebase thật
    if (messagingModule && typeof messagingModule === 'function') {
      const authStatus = await messagingModule().hasPermission();
      const enabled =
        authStatus === messagingModule.AuthorizationStatus.AUTHORIZED ||
        authStatus === messagingModule.AuthorizationStatus.PROVISIONAL;
      
      console.log('[FCM] Permission status:', enabled ? 'Granted' : 'Denied');
      return enabled;
    } else {
      console.log('[FCM] Messaging module is not a function, falling back to mock');
      return true; // Giả định cho phép trong môi trường mock
    }
  } catch (error) {
    console.error('[FCM] Error checking permission:', error);
    return false;
  }
}

/**
 * Yêu cầu quyền thông báo từ người dùng
 */
export async function requestNotificationPermission() {
  try {
    const messagingModule = getMessagingModule();
    
    if (isRunningInExpoGo()) {
      // Sử dụng trực tiếp hàm trong mock
      console.log('[FCM] Using mock permission request');
      const mockFirebase = require('./mockFirebase');
      return await mockFirebase.requestNotificationPermission();
    }
    
    // Kiểm tra nếu là Firebase thật
    if (messagingModule && typeof messagingModule === 'function') {
      const authStatus = await messagingModule().requestPermission();
      const enabled =
        authStatus === messagingModule.AuthorizationStatus.AUTHORIZED ||
        authStatus === messagingModule.AuthorizationStatus.PROVISIONAL;
        
      console.log('[FCM] Permission status:', enabled ? 'Granted' : 'Denied');
      return enabled;
    } else {
      console.log('[FCM] Messaging module is not a function, falling back to mock');
      return true; // Giả định cho phép trong môi trường mock
    }
  } catch (error) {
    console.error('[FCM] Request permission failed:', error);
    return false;
  }
}

/**
 * Lấy FCM token hiện tại hoặc tạo token mới nếu chưa có
 */
export async function getFcmToken() {
  try {
    // Kiểm tra token đã lưu
    const savedToken = await AsyncStorage.getItem(FCM_TOKEN_STORAGE_KEY);
    
    if (savedToken) {
      // Kiểm tra xem token có phải là token mock hay không
      if (savedToken.startsWith('mock-fcm-token')) {
        console.log('[FCM] Found saved mock token - will be replaced with real token if not in Expo Go');
        
        // Nếu không chạy trong Expo Go, xóa token mock và lấy token thật
        if (!isRunningInExpoGo()) {
          console.log('[FCM] Not running in Expo Go, will get real token instead of mock');
          await AsyncStorage.removeItem(FCM_TOKEN_STORAGE_KEY);
        } else {
          console.log('[FCM] Running in Expo Go, using saved mock token');
          return savedToken;
        }
      } else {
        // Token thật có sẵn, sử dụng lại
        console.log('[FCM] Using saved real token:', savedToken.substring(0, 15) + '...');
        return savedToken;
      }
    }
    
    // Xử lý khác nhau cho Expo Go và build thật
    if (isRunningInExpoGo()) {
      console.log('[FCM] Using mock token in Expo Go');
      const mockFirebase = require('./mockFirebase');
      const token = await mockFirebase.getFcmToken();
      
      if (token) {
        // Lưu token giả
        await AsyncStorage.setItem(FCM_TOKEN_STORAGE_KEY, token);
        return token;
      }
      return null;
    }
    
    // Đảm bảo thiết bị đã đăng ký nhận thông báo từ xa
    const messaging = getMessagingModule();
    
    if (!messaging || typeof messaging !== 'function') {
      console.warn('[FCM] Firebase messaging is not available');
      return null;
    }
    
    if (Platform.OS !== 'web') {
      try {
        console.log('[FCM] Registering device for remote messages');
        await messaging().registerDeviceForRemoteMessages();
        console.log('[FCM] Device registered successfully');
      } catch (registerError) {
        console.error('[FCM] Error registering device for remote messages:', registerError);
        // Continue to getToken anyway as this might be already registered
      }
    }
    
    // Lấy token mới
    console.log('[FCM] Getting new token from Firebase');
    const token = await messaging().getToken();
    
    if (token) {
      console.log('[FCM] New token generated:', token.substring(0, 15) + '...');
      console.log('[FCM] Token length:', token.length);
      console.log('[FCM] Token type check:', token.startsWith("f") ? "Looks like real FCM token" : "Not a standard FCM token pattern");
      
      // Lưu token để sử dụng sau này
      await AsyncStorage.setItem(FCM_TOKEN_STORAGE_KEY, token);
      return token;
    } else {
      console.warn('[FCM] Firebase returned empty token');
    }
    
    return null;
  } catch (error) {
    console.error('[FCM] Error getting token:', error);
    return null;
  }
}

/**
 * Đăng ký token với server
 */
export async function registerFcmTokenWithServer(token: string, jwt: string) {
  const start = Date.now();
  console.log('[FCM] Starting registerFcmTokenWithServer:', new Date().toISOString());
  
  if (!token || !jwt) {
    console.warn('[FCM] Missing token or JWT for registration', { 
      hasToken: !!token, 
      hasJwt: !!jwt,
      timestamp: new Date().toISOString()
    });
    return false;
  }
  
  try {
    console.log('[FCM] Registering token with server:', token.substring(0, 15) + '...');
    console.log('[FCM] Using JWT:', jwt.substring(0, 15) + '...');
    
    // Thêm kiểm tra xem API có chạy không trước khi gọi
    try {
      // Import trực tiếp để không phụ thuộc vào import ở đầu file
      const apiModule = require('../utils/api');
      console.log('[FCM] Testing API connection...');
      const testStart = Date.now();
      const testResult = await apiModule.testApiConnection();
      console.log('[FCM] API connection test result:', testResult, 'took', Date.now() - testStart, 'ms');
      
      if (!testResult) {
        console.error('[FCM] API connection test failed, cannot register token');
        return false;
      }
    } catch (testError) {
      console.error('[FCM] Error testing API connection:', testError);
    }
    
    // Sử dụng hàm fetchApi từ utils
    try {
      const apiModule = require('../utils/api');
      
      // Tạo URL và body giống hệt như web frontend để đảm bảo tương thích
      console.log('[FCM] Preparing request to update FCM token...');
      
      // Thêm log chi tiết của request
      const requestUrl = 'users/fcm-token';
      const requestOptions = {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`,
        },
        body: JSON.stringify({ fcmToken: token }),
      };
      
      // Log chi tiết request để debug
      console.log('=================== FCM TOKEN UPDATE REQUEST ===================');
      console.log('[FCM DEBUG] Would send request to:', apiModule.getApiBaseUrl() + '/api/v1/' + requestUrl);
      console.log('[FCM DEBUG] Request method:', requestOptions.method);
      console.log('[FCM DEBUG] Request headers:', JSON.stringify(requestOptions.headers));
      console.log('[FCM DEBUG] Request body:', requestOptions.body);
      console.log('[FCM DEBUG] JWT validity:', jwt ? (jwt.split('.').length === 3 ? 'Valid format' : 'Invalid format') : 'No JWT');
      console.log('[FCM DEBUG] Token format check:', token.startsWith("f") ? "Matches FCM pattern" : "Not standard FCM pattern");
      console.log('[FCM DEBUG] Token length:', token.length);
      console.log('==============================================================');
      
      // Gửi API request thực tế để đăng ký token
      console.log('[FCM] Sending actual API request to register token with server...');
      const response = await apiModule.fetchApi('users/fcm-token', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`,
        },
        body: JSON.stringify({ fcmToken: token }),
      });
      
      console.log('[FCM] Server response:', response);
      console.log('[FCM] Token registered with server successfully');
      console.log('[FCM] registerFcmTokenWithServer completed in', Date.now() - start, 'ms');
      return true;
    } catch (fetchError) {
      console.error('[FCM] Fetch API error:', fetchError);
      
      // Log thêm chi tiết lỗi
      if (fetchError.message && fetchError.message.includes('Cannot PATCH')) {
        console.error('[FCM] Endpoint issue detected! Check API path and server logs');
        
        // Kiểm tra kết nối API thay vì kiểm tra health endpoint
        try {
          const apiModule = require('../utils/api');
          // Kiểm tra kết nối API
          const apiConnectionStatus = await apiModule.testApiConnection();
          console.log('[FCM] API connection test result:', apiConnectionStatus);
        } catch (apiError) {
          console.error('[FCM] API connection test failed:', apiError);
        }
      }
      
      console.log('[FCM] registerFcmTokenWithServer failed in', Date.now() - start, 'ms');
      return false;
    }
  } catch (error) {
    console.error('[FCM] Error registering token with server:', error);
    console.log('[FCM] registerFcmTokenWithServer failed in', Date.now() - start, 'ms');
    return false;
  }
}

/**
 * Xử lý thông báo khi app đang chạy (foreground)
 */
export function setupForegroundNotificationHandler(
  onNotificationReceived: (notification: any) => void
) {
  try {
    console.log('[FCM] Setting up foreground notification handler');
    const messaging = getMessagingModule();
    
    // Thêm kiểm tra và log debug chi tiết
    if (typeof messaging !== 'function') {
      console.error('[FCM] messaging is not a function:', messaging);
      return () => {};
    }
    
    // QUAN TRỌNG: Đăng ký listener rõ ràng
    console.log('[FCM] Creating direct onMessage listener');
    
    const unsubscribe = messaging().onMessage(async (remoteMessage: any) => {
      // Log chi tiết hơn
      console.log('[FCM] ==========================================');
      console.log('[FCM] 🔔 THÔNG BÁO MỚI NHẬN ĐƯỢC (foreground) 🔔');
      console.log('[FCM] Remote message received:', JSON.stringify(remoteMessage));
      console.log('[FCM] Title:', remoteMessage?.notification?.title);
      console.log('[FCM] Body:', remoteMessage?.notification?.body);
      console.log('[FCM] ==========================================');
      
      // Gọi callback để cập nhật state trong NotificationContext thay vì hiển thị Alert
      onNotificationReceived(remoteMessage);
      
      return Promise.resolve();
    });
    
    console.log('[FCM] Foreground notification handler set up successfully');
    return unsubscribe;
  } catch (error) {
    console.error('[FCM] Error setting up foreground notification handler:', error);
    return () => {};
  }
}

/**
 * Xử lý thông báo khi app đang chạy ngầm (background)
 * Phải được gọi ở ngoài component
 */
export async function setupBackgroundNotificationHandler() {
  try {
    const messaging = getMessagingModule();
    
    messaging().setBackgroundMessageHandler(async (remoteMessage: any) => {
      // Log chi tiết
      console.log('[FCM] ==========================================');
      console.log('[FCM] 🔔 BACKGROUND MESSAGE RECEIVED 🔔');
      console.log('[FCM] Background message received:', remoteMessage);
      console.log('[FCM] ==========================================');
      return Promise.resolve();
    });
    
    // Đăng ký lắng nghe sự kiện token refresh
    messaging().onTokenRefresh(async (token) => {
      console.log('[FCM] Token refreshed:', token);
      // Lưu token mới
      await AsyncStorage.setItem(FCM_TOKEN_STORAGE_KEY, token);
      
      // Đăng ký với server nếu có JWT
      const jwt = await AsyncStorage.getItem('access_token');
      if (jwt) {
        try {
          // Log chi tiết về token mới
          console.log('[FCM] =================== TOKEN REFRESH ===================');
          console.log('[FCM] New token after refresh:', token.substring(0, 15) + '...');
          console.log('[FCM] New token length:', token.length);
          console.log('[FCM] Registering refreshed token with backend');
          console.log('[FCM] JWT available:', !!jwt);
          console.log('[FCM] =================================================');
          
          // Đăng ký token mới với server
          await registerFcmTokenWithServer(token, jwt);
          console.log('[FCM] New token registered with server after refresh');
        } catch (error) {
          console.error('[FCM] Error handling refreshed token:', error);
        }
      }
    });
    
    console.log('[FCM] Background notification handler set up successfully');
    return true;
  } catch (error) {
    console.error('[FCM] Error setting up background notification handler:', error);
    return false;
  }
}

/**
 * Xử lý khi người dùng nhấp vào thông báo để mở app
 */
export function setupNotificationOpenedHandler(
  onNotificationOpened: (notification: any) => void
) {
  try {
    const messaging = getMessagingModule();
    
    // Xử lý thông báo đã được nhấp khi app mới khởi động
    messaging()
      .getInitialNotification()
      .then((remoteMessage: any) => {
        if (remoteMessage) {
          console.log(
            '[FCM] App opened by notification while app was closed:',
            remoteMessage
          );
          onNotificationOpened(remoteMessage);
        }
      })
      .catch((error: any) => {
        console.error('[FCM] Error getting initial notification:', error);
      });

    // Xử lý thông báo được nhấp khi app đang chạy ngầm
    return messaging().onNotificationOpenedApp((remoteMessage: any) => {
      console.log(
        '[FCM] App opened by notification while app was in background:',
        remoteMessage
      );
      onNotificationOpened(remoteMessage);
    });
  } catch (error) {
    console.error('[FCM] Error setting up notification opened handler:', error);
    // Return a no-op unsubscribe function to avoid app crashes
    return () => {};
  }
}

/**
 * Đăng ký thiết bị để nhận thông báo
 */
export async function registerDeviceForNotifications() {
  try {
    if (Platform.OS === 'web') {
      console.log('[FCM] Web platform not fully supported for FCM');
      return false;
    }
    
    // Kiểm tra và xin quyền
    const hasPermission = await checkNotificationPermission();
    
    if (!hasPermission) {
      const granted = await requestNotificationPermission();
      if (!granted) return false;
    }
    
    // Đăng ký thiết bị
    const messaging = getMessagingModule();
    
    try {
      await messaging().registerDeviceForRemoteMessages();
      console.log('[FCM] Device registered for remote messages');
    } catch (registerError) {
      console.error('[FCM] Error registering device for remote messages:', registerError);
      // Continue anyway as some devices might not need explicit registration
    }
    
    return true;
  } catch (error) {
    console.error('[FCM] Error registering device:', error);
    return false;
  }
}

/**
 * Thiết lập notification đầy đủ
 * @param jwt Access token
 * @returns Boolean success state
 */
export async function setupNotifications(jwt: string | null) {
  if (!jwt) {
    console.log('[FCM] No JWT provided, skipping notification setup');
    return false;
  }
  
  try {
    console.log('[FCM] Setting up notifications with JWT');
    
    // Đăng ký thiết bị
    const registered = await registerDeviceForNotifications();
    if (!registered) {
      console.warn('[FCM] Device registration failed');
      return false;
    }
    
    // Lấy FCM token
    const token = await getFcmToken();
    if (!token) {
      console.warn('[FCM] Failed to get FCM token');
      return false;
    }
    
    console.log('[FCM] Got token, preparing registration with server...');
    
    // Log chi tiết
    console.log('[FCM] =================== SETUP NOTIFICATIONS ===================');
    console.log('[FCM] Token to register:', token.substring(0, 15) + '...');
    console.log('[FCM] Token length:', token.length);
    console.log('[FCM] JWT available:', !!jwt);
    console.log('[FCM] JWT first 15 chars:', jwt.substring(0, 15) + '...');
    console.log('[FCM] Registering token with backend');
    console.log('[FCM] ==========================================================');
    
    // Đăng ký token với server
    const registered_token = await registerFcmTokenWithServer(token, jwt);
    if (!registered_token) {
      console.warn('[FCM] Failed to register token with server');
    }
    
    return true;
  } catch (error) {
    console.error('[FCM] Error setting up notifications:', error);
    return false;
  }
} 