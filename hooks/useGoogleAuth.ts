import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { getApiBaseUrl } from '../utils/api';
import { useFcmToken } from './useFcmToken';

// Đăng ký để hoàn tất phiên xác thực
WebBrowser.maybeCompleteAuthSession();

// Google OAuth Client IDs
const GOOGLE_CLIENT_ID_ANDROID = "321128844526-9j0s82f1ukhlu1ja949ckih117dlfgk5.apps.googleusercontent.com";
const GOOGLE_CLIENT_ID_EXPO = "321128844526-9j0s82f1ukhlu1ja949ckih117dlfgk5.apps.googleusercontent.com";

export function useGoogleAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { registerFcmTokenAfterLogin } = useFcmToken();
  const apiBaseUrl = getApiBaseUrl();

  // Thiết lập Google OAuth request
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: GOOGLE_CLIENT_ID_EXPO,
    androidClientId: GOOGLE_CLIENT_ID_ANDROID,
    selectAccount: true,
  });

  // Kiểm tra trạng thái đăng nhập khi khởi tạo
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const accessToken = await AsyncStorage.getItem('accessToken');
        const userStr = await AsyncStorage.getItem('user');
        
        if (accessToken && userStr) {
          setIsAuthenticated(true);
          setUser(JSON.parse(userStr));
        }
      } catch (error) {
        console.error('[GoogleAuth] Error checking auth status:', error);
      }
    };
    
    checkAuthStatus();
  }, []);

  // Xử lý kết quả đăng nhập từ Google
  useEffect(() => {
    const handleGoogleResponse = async () => {
      try {
        if (response?.type === 'success') {
          setIsLoading(true);
          
          // Lấy access token từ kết quả
          const { authentication } = response;
          if (!authentication) {
            throw new Error('Không nhận được thông tin xác thực từ Google');
          }
          
          console.log('[GoogleAuth] Nhận được access token từ Google');
          
          // Sử dụng token từ Google để đăng nhập với backend
          const { accessToken: googleAccessToken } = authentication;
          const loginResponse = await fetch(`${apiBaseUrl}/auth/google/mobile-token`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              accessToken: googleAccessToken
            }),
          });
          
          if (!loginResponse.ok) {
            // Nếu không có endpoint mobile-token, thử endpoint khác
            // Đây là phương án dự phòng
            const userInfoResponse = await fetch('https://www.googleapis.com/userinfo/v2/me', {
              headers: { Authorization: `Bearer ${googleAccessToken}` },
            });
            
            if (!userInfoResponse.ok) {
              throw new Error('Không thể lấy thông tin người dùng từ Google');
            }
            
            const googleUser = await userInfoResponse.json();
            console.log('[GoogleAuth] Thông tin người dùng từ Google:', googleUser);
            
            // Trực tiếp gọi API đăng nhập backend với email từ Google
            const backendLoginResponse = await fetch(`${apiBaseUrl}/auth/login`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: googleUser.email,
                googleId: googleUser.id,
                googleAuth: true
              }),
            });
            
            if (!backendLoginResponse.ok) {
              throw new Error('Không thể đăng nhập với backend');
            }
            
            const backendData = await backendLoginResponse.json();
            
            // Lưu thông tin đăng nhập
            await AsyncStorage.setItem('accessToken', backendData.accessToken);
            await AsyncStorage.setItem('user', JSON.stringify(backendData.user));
            
            // Cập nhật state
            setUser(backendData.user);
            setIsAuthenticated(true);
            
            // Đăng ký FCM token nếu là admin
            if (backendData.user.role === 'admin') {
              registerFcmTokenAfterLogin();
            }
            
            Alert.alert('Đăng nhập thành công', `Xin chào ${backendData.user.firstName || backendData.user.email || 'bạn'}!`);
          } else {
            // Xử lý phản hồi từ endpoint mobile-token
            const data = await loginResponse.json();
            
            // Lưu thông tin đăng nhập
            await AsyncStorage.setItem('accessToken', data.accessToken);
            await AsyncStorage.setItem('user', JSON.stringify(data.user));
            
            // Cập nhật state
            setUser(data.user);
            setIsAuthenticated(true);
            
            // Đăng ký FCM token nếu là admin
            if (data.user.role === 'admin') {
              registerFcmTokenAfterLogin();
            }
            
            Alert.alert('Đăng nhập thành công', `Xin chào ${data.user.firstName || data.user.email || 'bạn'}!`);
          }
        } else if (response?.type === 'error') {
          console.error('[GoogleAuth] Error response:', response.error);
          setError(response.error?.message || 'Đăng nhập thất bại');
          Alert.alert('Đăng nhập thất bại', response.error?.message || 'Đã xảy ra lỗi khi đăng nhập với Google');
        }
      } catch (err: any) {
        console.error('[GoogleAuth] Error handling Google response:', err);
        setError(err.message || 'Đã xảy ra lỗi khi xử lý đăng nhập');
        Alert.alert('Đăng nhập thất bại', err.message || 'Đã xảy ra lỗi khi xử lý đăng nhập');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (response) {
      handleGoogleResponse();
    }
  }, [response, apiBaseUrl, registerFcmTokenAfterLogin]);

  // Hàm đăng nhập với Google
  const loginWithGoogle = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('[GoogleAuth] Bắt đầu đăng nhập với Google');
      
      if (!request) {
        throw new Error('Không thể tạo yêu cầu đăng nhập Google');
      }
      
      const result = await promptAsync();
      console.log('[GoogleAuth] Kết quả prompt:', result.type);
      
      // Xử lý các trường hợp thất bại
      if (result.type === 'cancel') {
        setError('Đăng nhập đã bị hủy');
      } else if (result.type === 'dismiss') {
        setError('Đăng nhập đã bị đóng');
      } else if (result.type !== 'success') {
        setError('Đăng nhập thất bại');
      }
      
    } catch (err: any) {
      console.error('[GoogleAuth] Error during login:', err);
      setError(err.message || 'Đã xảy ra lỗi khi đăng nhập');
      Alert.alert('Đăng nhập thất bại', err.message || 'Đã xảy ra lỗi khi đăng nhập');
    } finally {
      // setIsLoading được xử lý trong useEffect
    }
  }, [request, promptAsync]);

  // Hàm đăng xuất
  const logout = useCallback(async () => {
    try {
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('user');
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error('[GoogleAuth] Error during logout:', error);
    }
  }, []);

  return {
    loginWithGoogle,
    logout,
    isLoading,
    error,
    isAuthenticated,
    user,
  };
}

export default useGoogleAuth; 