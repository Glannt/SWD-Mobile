import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import { Platform } from "react-native";
import { useAuth } from "../app/AuthContext";

// Chọn URL API phù hợp với môi trường
const getApiBaseUrl = () => {
  try {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location) {
      // Trong môi trường web, sử dụng current host thay vì localhost
      const host = window.location.hostname;
      const port = 3000; // Giữ nguyên port
      return `http://${host}:${port}/api/v1`;
    } else if (Platform.OS === 'ios') {
      // Trên iOS, sử dụng địa chỉ IP thay vì localhost
      // TODO: Thay thế bằng địa chỉ IP của máy chủ thực tế hoặc domain
      return 'http://192.168.1.8:3000/api/v1'; // Thay đổi IP này
    } else if (Platform.OS === 'android') {
      // Trên Android có thể sử dụng 10.0.2.2 để trỏ đến localhost của máy chủ
      return 'http://10.0.2.2:3000/api/v1';
    }
  } catch (e) {
    console.error('[MOBILE] Error getting API base URL:', e);
  }
  // Fallback nếu không xác định được
  return 'http://localhost:3000/api/v1';
};

const API_BASE_URL = getApiBaseUrl();

// Kiểm tra nếu đang trong web environment
const isWebEnvironment = Platform.OS === 'web';

// Hàm tạo một _id giả từ user_id
const createFakeMongoId = (userId) => {
  if (!userId) return null;
  
  // Tạo một chuỗi 24 ký tự hex từ user_id
  let fakeId = '';
  const source = userId.toString();
  
  // Lấy mã ASCII của mỗi ký tự và chuyển thành hex
  for (let i = 0; i < source.length && fakeId.length < 24; i++) {
    const charCode = source.charCodeAt(i).toString(16);
    fakeId += charCode;
  }
  
  // Đảm bảo đủ 24 ký tự bằng cách thêm '0'
  while (fakeId.length < 24) {
    fakeId += '0';
  }
  
  // Cắt lấy 24 ký tự đầu nếu dài hơn
  return fakeId.substring(0, 24);
};

// Hàm lấy dữ liệu từ localStorage hoặc AsyncStorage
const getStoredAuth = async () => {
  // Kiểm tra chi tiết môi trường web để tránh lỗi trên mobile
  if (Platform.OS === 'web') {
  if (typeof window === 'undefined') {
    console.log('[MOBILE] Window is undefined, skipping localStorage check');
    return { storedToken: null, storedUserId: null, storedUserObjectId: null };
  }
  
  if (!window.localStorage) {
    console.log('[MOBILE] localStorage is not available, skipping check');
    return { storedToken: null, storedUserId: null, storedUserObjectId: null };
  }
  
  try {
    console.log('[MOBILE] Checking localStorage for auth data');
    const storedToken = localStorage.getItem('access_token');
    const storedUserString = localStorage.getItem('user');
    
    if (!storedToken || !storedUserString) {
      console.log('[MOBILE] No stored auth data found in localStorage');
      return { storedToken: null, storedUserId: null, storedUserObjectId: null };
    }

    const storedUser = JSON.parse(storedUserString);
    console.log('[MOBILE] Found auth data in localStorage', { 
      hasToken: !!storedToken,
      hasUser: !!storedUser
    });
    
    return {
      storedToken,
      storedUserId: storedUser?.user_id,
      storedUserObjectId: storedUser?._id // Lấy _id nếu có
    };
  } catch (error) {
    console.error('[MOBILE] Error getting stored auth:', error);
    return { storedToken: null, storedUserId: null, storedUserObjectId: null };
    }
  } else {
    // Lấy từ AsyncStorage cho mobile
    try {
      console.log('[MOBILE] Checking AsyncStorage for auth data');
      const storedToken = await AsyncStorage.getItem('access_token');
      const storedUserString = await AsyncStorage.getItem('user');
      
      if (!storedToken || !storedUserString) {
        console.log('[MOBILE] No stored auth data found in AsyncStorage');
        return { storedToken: null, storedUserId: null, storedUserObjectId: null };
      }

      const storedUser = JSON.parse(storedUserString);
      console.log('[MOBILE] Found auth data in AsyncStorage', { 
        hasToken: !!storedToken,
        hasUser: !!storedUser
      });
      
      return {
        storedToken,
        storedUserId: storedUser?.user_id,
        storedUserObjectId: storedUser?._id // Lấy _id nếu có
      };
    } catch (error) {
      console.error('[MOBILE] Error getting stored auth from AsyncStorage:', error);
      return { storedToken: null, storedUserId: null, storedUserObjectId: null };
    }
  }
};

export function useChatMobile({ accessToken: providedToken, userId: providedUserId }) {
  const { userObjectId: providedUserObjectId, accessToken: contextToken, userId: contextUserId } = useAuth();
  
  // State cho các thông tin xác thực
  const [storedAuth, setStoredAuth] = useState({
    storedToken: null,
    storedUserId: null,
    storedUserObjectId: null
  });
  
  // Load thông tin đã lưu trữ khi component mount
  useEffect(() => {
    const loadStoredAuth = async () => {
      const auth = await getStoredAuth();
      setStoredAuth(auth);
    };
    
    loadStoredAuth();
  }, []);
  
  // Kết hợp các nguồn dữ liệu - ưu tiên prop > context > localStorage/AsyncStorage
  const accessToken = providedToken || contextToken || storedAuth.storedToken;
  const userId = providedUserId || contextUserId || storedAuth.storedUserId;
  const userObjectId = providedUserObjectId || storedAuth.storedUserObjectId;
  
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");

  // Log các giá trị auth khi component mount
  useEffect(() => {
    console.log("[MOBILE AUTH] Current auth state:", {
      accessToken: accessToken ? `${accessToken.substring(0, 15)}...` : null,
      userId,
      userObjectId,
      hasAccessToken: !!accessToken,
      hasUserId: !!userId,
      hasUserObjectId: !!userObjectId
    });
  }, [accessToken, userId, userObjectId]);

  // Tự động load sessions khi component mount
  useEffect(() => {
    if (accessToken && userId) {
      loadSessions();
    }
  }, [accessToken, userId]);

  // Log API base URL khi component mount
  useEffect(() => {
    console.log("[MOBILE] Using API URL:", API_BASE_URL);
    console.log("[MOBILE] Platform:", Platform.OS);
    
    // Kiểm tra khả năng kết nối đến API
    const testApiConnection = async () => {
      try {
        console.log("[MOBILE] Testing API connection to:", API_BASE_URL);
        const startTime = Date.now();
        const response = await fetch(`${API_BASE_URL}/health`, { 
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        const endTime = Date.now();
        
        const responseText = await response.text();
        console.log(
          `[MOBILE] API connection test ${response.ok ? 'successful' : 'failed'}: `,
          `Status: ${response.status}, Time: ${endTime - startTime}ms, Response:`, 
          responseText
        );
      } catch (error) {
        console.error("[MOBILE] API connection test failed with error:", error);
      }
    };
    
    testApiConnection();
  }, []);

  // Hàm lấy user_id từ API nếu không có
  const fetchUserData = useCallback(async () => {
    if (!accessToken) {
      console.log("[MOBILE] No accessToken for fetchUserData");
      return null;
    }
    
    // Tìm kiếm trong bộ nhớ trước khi gọi API
    if (userObjectId && /^[0-9a-fA-F]{24}$/.test(userObjectId)) {
      console.log("[MOBILE] Using existing userObjectId without API call:", userObjectId);
      return { userId, userObjectId };
    }
    
    try {
      console.log("[MOBILE] Fetching user data from API...");
      const res = await fetch(`${API_BASE_URL}/users/me`, {
        method: 'GET',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
      });
      
      if (!res.ok) {
        const status = res.status;
        console.error(`[MOBILE] Error fetching user data: ${status}`);
        return null;
      }
      
      const responseText = await res.text();
      console.log(`[MOBILE] User data response: ${responseText.substring(0, 100)}...`);
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("[MOBILE] Error parsing user data JSON:", parseError);
        return null;
      }
      
      console.log("[MOBILE] Fetched user data:", JSON.stringify(data, null, 2));
      
      // Thử lấy dữ liệu từ nhiều vị trí có thể
      let userData = null;
      
      // Kiểm tra các cấu trúc phản hồi có thể
      if (data && data.data && typeof data.data === 'object') {
        userData = data.data;
        console.log("[MOBILE] Found user data in data.data");
      } else if (data && typeof data === 'object') {
        userData = data;
        console.log("[MOBILE] Using root data object");
      }
      
      // Kiểm tra nếu userData là null hoặc undefined
      if (!userData) {
        console.log("[MOBILE] User data is null or undefined");
        // Trả về userId hiện tại nếu có
        return userId ? { userId, userObjectId: null } : null;
      }
      
      // Log tất cả các ID có thể có
      console.log("[MOBILE] Available user identifiers:", {
        _id: userData._id,
        id: userData.id,
        user_id: userData.user_id,
        userId: userData.userId,
        objectId: userData.objectId
      });
      
      // Ưu tiên MongoDB ObjectId (_id) nếu có và hợp lệ
      let objectId = null;
      
      // Kiểm tra tất cả các vị trí có thể chứa MongoDB ObjectId
      if (userData._id && typeof userData._id === 'string' && /^[0-9a-fA-F]{24}$/.test(userData._id)) {
        objectId = userData._id;
        console.log("[MOBILE] Found valid MongoDB _id:", objectId);
      } else if (userData.id && typeof userData.id === 'string' && /^[0-9a-fA-F]{24}$/.test(userData.id)) {
        objectId = userData.id;
        console.log("[MOBILE] Found valid MongoDB id:", objectId);
      } else if (userData.objectId && typeof userData.objectId === 'string' && /^[0-9a-fA-F]{24}$/.test(userData.objectId)) {
        objectId = userData.objectId;
        console.log("[MOBILE] Found valid MongoDB objectId:", objectId);
      }
      
      // Kiểm tra nếu có _id là object với $oid (định dạng MongoDB mở rộng)
      else if (userData._id && typeof userData._id === 'object' && userData._id.$oid) {
        objectId = userData._id.$oid;
        console.log("[MOBILE] Found valid MongoDB _id.$oid:", objectId);
      }
      
      // Kiểm tra nếu user được lồng trong một field khác
      else if (userData.user && typeof userData.user === 'object') {
        const nestedUser = userData.user;
        
        if (nestedUser._id && typeof nestedUser._id === 'string' && /^[0-9a-fA-F]{24}$/.test(nestedUser._id)) {
          objectId = nestedUser._id;
          console.log("[MOBILE] Found valid MongoDB _id in nested user:", objectId);
        }
      }
      
      // Nếu không tìm thấy MongoDB ObjectId hợp lệ, tạo một ID giả từ user_id
      if (!objectId) {
        console.warn("[MOBILE] No valid MongoDB ObjectId found in user data");
        
        // Lấy user_id từ các vị trí có thể có
        const extractedUserId = userData.user_id || userData.userId || userId;
        
        if (extractedUserId) {
          objectId = createFakeMongoId(extractedUserId);
          console.log("[MOBILE] Created fake MongoDB ObjectId from user_id:", objectId);
          
          // Lưu vào AsyncStorage để sử dụng lần sau
          if (Platform.OS !== 'web') {
            try {
              const dataToStore = { _id: objectId, user_id: extractedUserId };
              await AsyncStorage.setItem('user', JSON.stringify(dataToStore));
              console.log("[MOBILE] Saved fake ObjectId to AsyncStorage");
            } catch (storageError) {
              console.error("[MOBILE] Error saving fake ObjectId to AsyncStorage:", storageError);
            }
          }
        }
      }
      
      // Nếu vẫn không có ObjectId hợp lệ
      if (!objectId) {
        return {
          userId: userData.user_id || userId,
          userObjectId: null
        };
      }
      
      return {
        userId: userData.user_id || userId,
        userObjectId: objectId
      };
    } catch (error) {
      console.error("[MOBILE] Error in fetchUserData:", error);
      return null;
    }
  }, [accessToken, userId, userObjectId]);

  // Load danh sách session
  const loadSessions = useCallback(async () => {
    // Cần phải có accessToken
    if (!accessToken) return;
    
    setIsLoading(true);
    setError("");
    
    try {
      // Đảm bảo có userObjectId hợp lệ trước khi gọi API
      let targetId = null;
      
      // Kiểm tra nếu đã có userObjectId hợp lệ (24 ký tự hex)
      if (userObjectId && /^[0-9a-fA-F]{24}$/.test(userObjectId)) {
        targetId = userObjectId;
        console.log("[MOBILE] Using existing valid userObjectId from auth context:", targetId);
      } 
      // Nếu không có userObjectId hợp lệ, gọi API để lấy
      else {
        console.log("[MOBILE] No valid userObjectId in auth context, fetching user data from API");
        const userData = await fetchUserData();
        
        // Kiểm tra kết quả từ API
        if (userData?.userObjectId && /^[0-9a-fA-F]{24}$/.test(userData.userObjectId)) {
          targetId = userData.userObjectId;
          console.log("[MOBILE] Got valid userObjectId from API:", targetId);
        } else {
          console.error("[MOBILE] Could not get valid userObjectId from API");
          
          // Thử tạo ID giả từ userId
          if (userId) {
            targetId = createFakeMongoId(userId);
            console.log("[MOBILE] Created fake MongoDB ObjectId from userId:", targetId);
            
            // Lưu vào AsyncStorage để sử dụng lần sau
            if (Platform.OS !== 'web') {
              try {
                const dataToStore = { _id: targetId, user_id: userId };
                await AsyncStorage.setItem('user', JSON.stringify(dataToStore));
                console.log("[MOBILE] Saved fake ObjectId to AsyncStorage for loadSessions");
              } catch (storageError) {
                console.error("[MOBILE] Error saving fake ObjectId to AsyncStorage:", storageError);
              }
            }
          }
        }
      }
      
      // Nếu vẫn không có MongoDB ObjectId hợp lệ, hiển thị lỗi
      if (!targetId) {
        console.error("[MOBILE] No valid MongoDB ObjectId available");
        setError("Không thể lấy danh sách chat, hãy tạo chat mới");
        setIsLoading(false);
        setSessions([]);
        return;
      }
      
      // Gọi API với MongoDB ObjectId hợp lệ
      console.log("[MOBILE] Fetching sessions with ObjectId:", targetId);
      
      // Đảm bảo URL API đúng định dạng, bỏ dấu / trùng lặp nếu có
      let apiUrl = `${API_BASE_URL}/chatsession/user/${targetId}`;
      apiUrl = apiUrl.replace(/([^:]\/)\/+/g, "$1");
      console.log("[MOBILE] Final API URL:", apiUrl);
      
      const res = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
      });
      
      if (!res.ok) {
        // Xử lý lỗi HTTP
        const errorStatus = res.status;
        let errorText = '';
        try {
          const errorData = await res.json();
          errorText = errorData.message || `Error ${errorStatus}`;
        } catch (e) {
          errorText = await res.text();
        }
        
        console.error("[MOBILE] Error response from API:", errorStatus, errorText);
        throw new Error(`Server error: ${errorStatus} - ${errorText}`);
      }
      
      // Parse JSON response
      const responseText = await res.text();
      console.log("[MOBILE] Raw API response:", responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error("[MOBILE] Failed to parse JSON response:", e);
        throw new Error("Invalid response format");
      }
      
      console.log("[MOBILE] Parsed sessions data:", data);
      
      // Kiểm tra cấu trúc phản hồi
      const sessions = data.data ? data.data : data;
      
      if (!Array.isArray(sessions)) {
        console.error("[MOBILE] Sessions data is not an array:", sessions);
        throw new Error("Invalid sessions data format");
      }
      
      console.log("[MOBILE] Final sessions:", sessions);
      setSessions(sessions);
    } catch (e) {
      setError("Không lấy được danh sách chat");
      console.error("[MOBILE] Error loading sessions:", e);
      setSessions([]);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, userObjectId, userId, fetchUserData]);

  // Chọn session, load messages
  const selectSession = useCallback(async (session) => {
    if (!session || !accessToken) return;
    setIsLoading(true);
    setError("");
    try {
      setCurrentSession(session);
      const res = await fetch(`${API_BASE_URL}/chatsession/${session.sessionId}/messages`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await res.json();
      console.log("[MOBILE] Loaded messages:", data);
      setMessages(data.data ? data.data : data);
    } catch (e) {
      setError("Không lấy được tin nhắn");
      setMessages([]);
      console.error("[MOBILE] Error loading messages:", e);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  // Tạo session mới
  const createSession = useCallback(async () => {
    // Cần phải có accessToken và hoặc userObjectId hoặc userId
    if (!accessToken) {
      console.log("[MOBILE] Missing accessToken");
      setError("Bạn chưa đăng nhập");
      return null;
    }
    
    let targetId = null;
    let isMongoId = false;
    
    // Kiểm tra và sử dụng MongoDB ObjectId hợp lệ
    if (userObjectId && /^[0-9a-fA-F]{24}$/.test(userObjectId)) {
      targetId = userObjectId;
      isMongoId = true;
    } else {
      console.log("[MOBILE] Invalid userObjectId format, fetching from API");
      const userData = await fetchUserData();
      if (userData?.userObjectId && /^[0-9a-fA-F]{24}$/.test(userData.userObjectId)) {
        targetId = userData.userObjectId;
        isMongoId = true;
      } else if (userData?.userId) {
        // Sử dụng userId thông thường nếu không có MongoDB ObjectId
        targetId = userData.userId;
        
        // Tạo ID giả và lưu vào AsyncStorage
        const fakeObjectId = createFakeMongoId(targetId);
        if (fakeObjectId) {
          targetId = fakeObjectId;
          isMongoId = true;
          console.log("[MOBILE] Created and using fake MongoDB ObjectId for session creation:", targetId);
          
          // Lưu vào AsyncStorage
          if (Platform.OS !== 'web') {
            try {
              const dataToStore = { _id: targetId, user_id: userData.userId };
              await AsyncStorage.setItem('user', JSON.stringify(dataToStore));
              console.log("[MOBILE] Saved fake ObjectId to AsyncStorage for createSession");
            } catch (storageError) {
              console.error("[MOBILE] Error saving fake ObjectId to AsyncStorage:", storageError);
            }
          }
        } else {
        isMongoId = false;
        }
      } else if (userId) {
        // Tạo ID giả từ userId và lưu vào AsyncStorage
        const fakeObjectId = createFakeMongoId(userId);
        if (fakeObjectId) {
          targetId = fakeObjectId;
          isMongoId = true;
          console.log("[MOBILE] Created and using fake MongoDB ObjectId from context userId:", targetId);
          
          // Lưu vào AsyncStorage
          if (Platform.OS !== 'web') {
            try {
              const dataToStore = { _id: targetId, user_id: userId };
              await AsyncStorage.setItem('user', JSON.stringify(dataToStore));
              console.log("[MOBILE] Saved fake ObjectId to AsyncStorage from context");
            } catch (storageError) {
              console.error("[MOBILE] Error saving fake ObjectId to AsyncStorage:", storageError);
            }
          }
        } else {
        // Sử dụng userId từ context nếu có
        targetId = userId;
        isMongoId = false;
        }
      }
    }
    
    if (!targetId) {
      console.log("[MOBILE] No valid user ID found for session creation");
      setError("Không tìm thấy thông tin người dùng hợp lệ");
      return null;
    }
    
    setIsLoading(true);
    setError("");
    try {
      console.log("[MOBILE] Creating session with userId:", targetId, "isMongoId:", isMongoId);
      
      // Chuẩn bị dữ liệu gửi đi tùy thuộc vào loại ID
      const requestData = isMongoId 
        ? { userId: targetId }
        : { userId: targetId, isUserIdString: true };
      
      const res = await fetch(`${API_BASE_URL}/chatsession/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(requestData),
      });
      
      // Clone response trước khi đọc body
      const clonedRes = res.clone();
      
      // Kiểm tra status code
      if (!res.ok) {
        let errorMessage = "Không tạo được session";
        try {
          const errorData = await res.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          console.error("[MOBILE] Error parsing error response:", e);
        }
        throw new Error(errorMessage);
      }
      
      // Xử lý response thành công
      let responseData;
      try {
        responseData = await clonedRes.json();
        console.log('[MOBILE] API response createSession:', responseData);
      } catch (e) {
        console.error('[MOBILE] Error parsing response JSON:', e);
        throw new Error("Lỗi định dạng phản hồi API");
      }
      
      // Trích xuất dữ liệu từ cấu trúc response
      const newSession = responseData.data || responseData;
      
      console.log('[MOBILE] Extracted session:', newSession);
      
      if (!newSession) {
        throw new Error("Không tìm thấy dữ liệu session trong phản hồi");
      }
      
      if (!newSession.sessionId) {
        console.error('[MOBILE] Missing sessionId in response:', newSession);
        throw new Error("Thiếu sessionId trong phản hồi");
      }
      
      console.log('[MOBILE] New session created successfully:', newSession);
      setCurrentSession(newSession);
      setMessages([]);
      await loadSessions();
      return newSession;
    } catch (e) {
      const errorMessage = e.message || "Không tạo được session chat";
      setError(errorMessage);
      console.error('[MOBILE] Error creating session:', e);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, userObjectId, userId, loadSessions, fetchUserData]);

  // Gửi tin nhắn
  const sendMessage = useCallback(async (message) => {
    if (!message.trim() || !accessToken) {
      setError("Bạn cần đăng nhập để gửi tin nhắn");
      return;
    }
    
    // Xác định user_id để gửi tin nhắn
    let targetId = null;
    let isMongoId = false;
    
    // Kiểm tra và sử dụng MongoDB ObjectId hợp lệ
    if (userObjectId && /^[0-9a-fA-F]{24}$/.test(userObjectId)) {
      targetId = userObjectId;
      isMongoId = true;
    } else {
      console.log("[MOBILE] Invalid userObjectId format for sending message");
      const userData = await fetchUserData();
      if (userData?.userObjectId && /^[0-9a-fA-F]{24}$/.test(userData.userObjectId)) {
        targetId = userData.userObjectId;
        isMongoId = true;
      } else if (userData?.userId) {
        // Sử dụng userId thông thường nếu không có MongoDB ObjectId
        targetId = userData.userId;
        isMongoId = false;
      } else if (userId) {
        // Sử dụng userId từ context nếu có
        targetId = userId;
        isMongoId = false;
      }
    }
    
    if (!targetId) {
      console.log("[MOBILE] No valid user ID found for sending message");
      setError("Không tìm thấy thông tin người dùng hợp lệ");
      return;
    }
    
    setIsSending(true);
    setError("");

    // ID tạm thời cho tin nhắn
    const tempUserMessageId = Date.now().toString();
    
    // Add user message ngay lập tức
    setMessages((prev) => [
      ...prev,
      { 
        sender: "user", 
        content: message,
        id: tempUserMessageId,
        chat_message_id: `temp_${tempUserMessageId}`,
        timestamp: new Date().toISOString(),
      },
    ]);
    
    try {
      // Gọi API chat
      console.log("[MOBILE] Sending message:", {
        question: message, 
        sessionId: currentSession?.sessionId,
        user_id: targetId,
        isMongoId
      });
      
      // Chuẩn bị dữ liệu gửi đi tùy thuộc vào loại ID
      const requestData = isMongoId 
        ? {
            question: message,
            sessionId: currentSession?.sessionId,
            user_id: targetId
          }
        : {
            question: message,
            sessionId: currentSession?.sessionId,
            user_id: targetId,
            isUserIdString: true
          };
      
      // Lưu trữ sessionId hiện tại để sử dụng trong trường hợp API không trả về sessionId
      const currentSessionId = currentSession?.sessionId;
      
      const res = await fetch(`${API_BASE_URL}/app/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(requestData),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Lỗi gửi tin nhắn");
      }
      
      const responseData = await res.json();
      console.log('[MOBILE] API response sendMessage:', responseData);
      
      // Kiểm tra phản hồi ở nhiều cấp khác nhau
      let answer;
      let sessionId;
      
      // Debug chi tiết cấu trúc response
      console.log("[MOBILE] Response structure:", {
        hasData: !!responseData.data,
        hasAnswer: !!(responseData.answer || (responseData.data && responseData.data.answer)),
        directAnswer: responseData.answer,
        dataAnswer: responseData.data?.answer,
        sessionId: responseData.sessionId || responseData.data?.sessionId,
      });
      
      // Thứ tự ưu tiên: responseData.data.answer > responseData.answer > responseData.data
      if (responseData.data && typeof responseData.data.answer === 'string') {
        // Trường hợp: { data: { answer: "..." } }
        answer = responseData.data.answer;
        sessionId = responseData.data.sessionId;
      } else if (typeof responseData.answer === 'string') {
        // Trường hợp: { answer: "..." }
        answer = responseData.answer;
        sessionId = responseData.sessionId;
      } else if (responseData.data && typeof responseData.data === 'string') {
        // Trường hợp: { data: "..." }
        answer = responseData.data;
        // Tìm sessionId ở cấp cao nhất nếu có
        sessionId = responseData.sessionId;
      } else if (responseData.data && responseData.data.content) {
        // Trường hợp: { data: { content: "..." } }
        answer = responseData.data.content;
        sessionId = responseData.data.sessionId;
      } else if (responseData.content) {
        // Trường hợp: { content: "..." }
        answer = responseData.content;
        sessionId = responseData.sessionId;
      } else if (responseData.data && responseData.data.text) {
        // Trường hợp khác
        answer = responseData.data.text;
        sessionId = responseData.data.sessionId;
      } else if (responseData.text) {
        // Trường hợp khác
        answer = responseData.text;
        sessionId = responseData.sessionId;
      } else if (responseData.data && responseData.data.message) {
        // Trường hợp khác
        answer = responseData.data.message;
        sessionId = responseData.data.sessionId;
      } else if (responseData.message && typeof responseData.message === 'string') {
        // Trường hợp khác
        answer = responseData.message;
        sessionId = responseData.sessionId;
      }
      
      // Cuối cùng kiểm tra nếu tìm thấy câu trả lời
      if (answer) {
        // Kiểm tra và log tất cả các vị trí có thể chứa sessionId
        const possibleSessionIds = {
          directSessionId: responseData.sessionId,
          dataSessionId: responseData.data?.sessionId,
          currentSessionId: currentSession?.sessionId
        };
        
        console.log('[MOBILE] Possible sessionIds:', possibleSessionIds);
        
        // Nếu không tìm thấy sessionId trong response, sử dụng sessionId hiện tại nếu có
        if (!sessionId && currentSessionId) {
          sessionId = currentSessionId;
          console.log('[MOBILE] Using current sessionId:', sessionId);
        }
        
        console.log('[MOBILE] Bot answer:', answer, 'sessionId:', sessionId || 'undefined (using current session)');
        
        // ID tạm thời cho tin nhắn bot
        const tempBotMessageId = Date.now() + 1;
        
        setMessages((prev) => [
          ...prev,
          { 
            sender: "bot", 
            content: answer,
            id: tempBotMessageId.toString(),
            chat_message_id: `temp_${tempBotMessageId}`,
            timestamp: new Date().toISOString(),
            sessionId: sessionId || currentSessionId // Lưu sessionId vào tin nhắn
          },
        ]);
        
        // Nếu là session mới, cập nhật lại session
        if (!currentSession && sessionId) {
          console.log('[MOBILE] New session detected in response:', sessionId);
          const session = { sessionId: sessionId, status: "active" };
          setCurrentSession(session);
          await loadSessions();
        } 
        // Nếu chưa có session và API không trả về sessionId, tạo session mới
        else if (!currentSession && !sessionId) {
          console.log('[MOBILE] No session found, creating new session...');
          const newSession = await createSession();
          if (newSession) {
            console.log('[MOBILE] Created new session:', newSession.sessionId);
          }
        }
      } else {
        console.error('[MOBILE] Missing answer in response:', responseData);
        throw new Error("Không nhận được phản hồi từ AI");
      }
    } catch (e) {
      setError(e.message || "Lỗi gửi tin nhắn");
      console.error('[MOBILE] Error sending message:', e);
      
      // Xóa tin nhắn user nếu gặp lỗi
      setMessages((prev) => prev.filter(msg => msg.id !== tempUserMessageId));
    } finally {
      setIsSending(false);
    }
  }, [accessToken, userObjectId, userId, currentSession, loadSessions, fetchUserData, createSession]);

  // Xóa tin nhắn hiện tại
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    sessions,
    currentSession,
    messages,
    isLoading,
    isSending,
    error,
    loadSessions,
    selectSession,
    createSession,
    sendMessage,
    clearMessages,
    setCurrentSession,
    setError,
  };
} 