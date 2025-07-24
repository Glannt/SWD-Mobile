import { useCallback, useState } from 'react';
import { Alert, Platform } from 'react-native';
import { useAuth } from '../app/AuthContext';
import { buildApiUrl, getApiBaseUrl } from '../utils/api';

export interface ChatSession {
  sessionId: string;
  createdAt: string;
  status: string;
  title?: string;
  messages?: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  chat_message_id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: string;
}

export function useChatHistory() {
  const { accessToken, userId } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const API_BASE_URL = getApiBaseUrl();

  // Log API base URL for debugging
  console.log('[Chat History] Using API base URL:', API_BASE_URL);

  // Load tất cả sessions của người dùng
  const loadSessions = useCallback(async () => {
    if (!accessToken || !userId) {
      setError('Bạn cần đăng nhập để xem lịch sử chat');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log(`[Chat History] Fetching sessions for user ${userId}`);
      const url = buildApiUrl(`chatsession/user/${userId}`);
      console.log(`[Chat History] Request URL: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        console.error(`[Chat History] Failed to fetch sessions: ${response.status}`);
        const errorText = await response.text();
        console.error(`[Chat History] Error response: ${errorText}`);
        throw new Error(`Lỗi ${response.status}: Không thể lấy danh sách chat`);
      }

      const data = await response.json();
      console.log('[Chat History] Sessions response:', data);
      
      const sessionsList = data.data || data;

      if (!Array.isArray(sessionsList)) {
        throw new Error('Định dạng dữ liệu không hợp lệ');
      }

      // Sắp xếp theo thời gian tạo, mới nhất lên đầu
      const sortedSessions = [...sessionsList].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      console.log(`[Chat History] Found ${sortedSessions.length} sessions`);
      setSessions(sortedSessions);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi';
      setError(errorMessage);
      console.error('[Chat History] Error loading sessions:', err);
      
      if (Platform.OS !== 'web') {
        Alert.alert('Lỗi', errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, userId, API_BASE_URL]);

  // Lấy chi tiết tin nhắn của một session cụ thể
  const loadSessionMessages = useCallback(async (sessionId: string) => {
    if (!accessToken || !sessionId) return null;

    setIsLoading(true);
    setError('');

    try {
      console.log(`[Chat History] Fetching messages for session ${sessionId}`);
      const url = buildApiUrl(`chatsession/${sessionId}/messages`);
      console.log(`[Chat History] Request URL: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        console.error(`[Chat History] Failed to fetch messages: ${response.status}`);
        throw new Error(`Lỗi ${response.status}: Không thể lấy tin nhắn`);
      }

      const data = await response.json();
      console.log('[Chat History] Messages response:', data);
      
      const messages = data.data || data;

      if (!Array.isArray(messages)) {
        throw new Error('Định dạng dữ liệu không hợp lệ');
      }

      console.log(`[Chat History] Found ${messages.length} messages`);
      return messages;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi';
      setError(errorMessage);
      console.error('[Chat History] Error loading messages:', err);
      
      if (Platform.OS !== 'web') {
        Alert.alert('Lỗi', errorMessage);
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, API_BASE_URL]);

  // Xóa một session
  const deleteSession = useCallback(async (sessionId: string) => {
    if (!accessToken || !sessionId) return false;

    setIsLoading(true);
    setError('');

    try {
      console.log(`[Chat History] Deleting session ${sessionId}`);
      const url = buildApiUrl(`chatsession/${sessionId}`);
      console.log(`[Chat History] Request URL: ${url}`);
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        console.error(`[Chat History] Failed to delete session: ${response.status}`);
        throw new Error(`Lỗi ${response.status}: Không thể xóa chat`);
      }

      // Cập nhật lại danh sách sessions sau khi xóa thành công
      setSessions(prevSessions => 
        prevSessions.filter(session => session.sessionId !== sessionId)
      );

      console.log(`[Chat History] Session ${sessionId} deleted successfully`);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi khi xóa';
      setError(errorMessage);
      console.error('[Chat History] Error deleting session:', err);
      
      if (Platform.OS !== 'web') {
        Alert.alert('Lỗi', errorMessage);
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, API_BASE_URL]);

  return {
    sessions,
    isLoading,
    error,
    loadSessions,
    loadSessionMessages,
    deleteSession,
  };
} 