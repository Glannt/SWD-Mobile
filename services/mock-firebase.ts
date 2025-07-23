// Mock Firebase Messaging service cho môi trường Expo Go
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";

const MOCK_STORAGE_KEY = 'mock_fcm_token';

// Mock FCM Token là một chuỗi giả ngẫu nhiên
const generateMockToken = () => {
  return 'mock-fcm-token-' + Math.random().toString(36).substring(2, 15);
};

// Lưu token mock vào storage
const saveMockToken = async (token) => {
  try {
    await AsyncStorage.setItem(MOCK_STORAGE_KEY, token);
    console.log('[Mock Firebase] Saved mock token:', token);
    return true;
  } catch (error) {
    console.error('[Mock Firebase] Error saving mock token:', error);
    return false;
  }
};

// Lấy token mock từ storage hoặc tạo mới nếu chưa có
const getMockToken = async () => {
  try {
    let token = await AsyncStorage.getItem(MOCK_STORAGE_KEY);
    if (!token) {
      token = generateMockToken();
      await saveMockToken(token);
    }
    return token;
  } catch (error) {
    console.error('[Mock Firebase] Error getting mock token:', error);
    return generateMockToken();
  }
};

export const mockMessaging = {
  getToken: getMockToken,
  requestPermission: () => Promise.resolve(true),
  onMessage: (callback) => {
    console.log('[Mock Firebase] onMessage registered');
    
    // Đăng ký hàm xử lý thông báo mock toàn cục để có thể kích hoạt từ bất kỳ đâu
    if (typeof global !== 'undefined') {
      global.mockFirebaseReceiveMessage = (notification) => {
        const mockPayload = {
          notification: {
            title: notification?.title || 'Thông báo test',
            body: notification?.body || 'Đây là thông báo test từ mock Firebase',
          },
          data: notification?.data || {},
          messageId: 'mock-message-' + Date.now(),
          sentTime: Date.now(),
        };
        console.log('[Mock Firebase] Received mock message:', mockPayload);
        callback(mockPayload);
      };
    }
    
    return () => {
      if (typeof global !== 'undefined') {
        delete global.mockFirebaseReceiveMessage;
      }
    };
  },
  onNotificationOpenedApp: (callback) => {
    console.log('[Mock Firebase] onNotificationOpenedApp registered');
    return () => {};
  },
  getInitialNotification: () => Promise.resolve(null),
  hasPermission: () => Promise.resolve(true),
  registerDeviceForRemoteMessages: () => Promise.resolve(),
  setBackgroundMessageHandler: () => {},
  AuthorizationStatus: {
    AUTHORIZED: 1,
    PROVISIONAL: 2
  }
};

export const setupForegroundNotificationHandler = (callback) => {
  console.log('[Mock Firebase] setupForegroundNotificationHandler registered');
  
  // Đăng ký hàm toàn cục để có thể kích hoạt thủ công
  if (typeof global !== 'undefined') {
    global.mockFirebaseTriggerNotification = (title, body, data) => {
      const mockPayload = {
        notification: {
          title: title || 'Thông báo test',
          body: body || 'Đây là thông báo test từ mock Firebase',
        },
        data: data || {},
        messageId: 'mock-message-' + Date.now(),
        sentTime: Date.now(),
      };
      
      console.log('[Mock Firebase] Triggered notification:', mockPayload);
      callback(mockPayload);
      
      // Hiển thị Alert để debug
      if (__DEV__) {
        Alert.alert(
          'Thông báo test',
          `Đã kích hoạt thông báo:\nTiêu đề: ${mockPayload.notification.title}\nNội dung: ${mockPayload.notification.body}`,
          [{ text: 'OK' }]
        );
      }
    };
  }
  
  return () => {
    if (typeof global !== 'undefined') {
      delete global.mockFirebaseTriggerNotification;
    }
  };
};

export const setupBackgroundNotificationHandler = () => {
  console.log('[Mock Firebase] setupBackgroundNotificationHandler registered');
  return Promise.resolve(true);
};

export const setupNotificationOpenedHandler = (callback) => {
  console.log('[Mock Firebase] setupNotificationOpenedHandler registered');
  return () => {};
};

export const checkNotificationPermission = async () => {
  console.log('[Mock Firebase] checkNotificationPermission called');
  return true;
};

export const requestNotificationPermission = async () => {
  console.log('[Mock Firebase] requestNotificationPermission called');
  return true;
};

export const getFcmToken = async () => {
  console.log('[Mock Firebase] getFcmToken called');
  return getMockToken();
};

export const registerFcmTokenWithServer = async (token, jwt) => {
  console.log('[Mock Firebase] registerFcmTokenWithServer called');
  console.log('[Mock Firebase] Token:', token);
  console.log('[Mock Firebase] JWT:', jwt ? jwt.substring(0, 10) + '...' : 'missing');
  
  // Giả lập thành công
  return true;
};

export const registerDeviceForNotifications = async () => {
  console.log('[Mock Firebase] registerDeviceForNotifications called');
  return true;
};

export const setupNotifications = async () => {
  console.log('[Mock Firebase] setupNotifications called');
  return true;
}; 

// Utility để kích hoạt thông báo từ mã
export const triggerMockNotification = (title, body, data) => {
  if (typeof global !== 'undefined' && global.mockFirebaseTriggerNotification) {
    global.mockFirebaseTriggerNotification(title, body, data);
    return true;
  }
  console.warn('[Mock Firebase] Cannot trigger notification, handler not registered');
  return false;
}; 