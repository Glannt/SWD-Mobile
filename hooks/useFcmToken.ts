import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';
import { Alert } from 'react-native';

const FCM_TOKEN_STORAGE_KEY = 'fcm_token';

// Ghi đè kiểm tra môi trường - force dùng Firebase thật
export const FORCE_REAL_ENVIRONMENT = true;

/**
 * Kiểm tra môi trường Expo Go
 */
const checkIsExpoGo = () => {
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
    
    // 3. Kiểm tra expo constant
    try {
      const Constants = require('expo-constants');
      const executionEnvironment = Constants.default?.executionEnvironment;
      if (executionEnvironment === 'bare') return false;
      if (executionEnvironment === 'managed') return true;
    } catch (error) {
      // Tiếp tục với các phương pháp khác
    }
    
    // 4. Thử import firebase
    try {
      const firebase = require('@react-native-firebase/app');
      if (firebase && typeof firebase === 'object') return false;
    } catch (error) {
      return true;
    }
    
    // Mặc định
    return __DEV__ && !process.env.EAS_BUILD_RUNNER;
  } catch (error) {
    return false; // Assume real Firebase if check fails
  }
};

/**
 * Hook để quản lý token FCM
 */
export const useFcmToken = () => {
  const [token, setToken] = useState<string | null>(null);
  
  // Đăng ký FCM token
  const registerFcmToken = async (): Promise<boolean> => {
    try {
      console.log('[FCM] Starting FCM token registration');
      
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
    debugCurrentToken
  };
}; 