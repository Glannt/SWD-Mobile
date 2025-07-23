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
      return 'http://192.168.1.6:3000/api/v1'; // Thay đổi IP này
    } else if (Platform.OS === 'android') {
      // Trên Android có thể sử dụng 10.0.2.2 để trỏ đến localhost của máy chủ
      return 'http://192.168.1.6:3000/api/v1';
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
  
  // Sử dụng hashed approach để tạo ID ổn định hơn
  let sum = 0;
  for (let i = 0; i < source.length; i++) {
    sum += source.charCodeAt(i);
  }
  
  // Thêm prefix cố định để đảm bảo tính nhất quán
  fakeId = '5f' + sum.toString(16).padStart(6, '0');
  
  // Lấy mã ASCII của mỗi ký tự và chuyển thành hex
  for (let i = 0; i < source.length && fakeId.length < 20; i++) {
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
          console.log("[MOBILE] Could not get valid userObjectId from API, using userId instead");
          
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
      
      // Thêm tham số để đảm bảo API biết đây là một ObjectId tạo từ user_id
      const queryParams = new URLSearchParams({ 
        useAsFallback: 'true', 
        isUserIdString: 'true' 
      }).toString();
      
      // Đảm bảo URL API đúng định dạng, bỏ dấu / trùng lặp nếu có
      let apiUrl = `${API_BASE_URL}/chatsession/user/${targetId}?${queryParams}`;
      apiUrl = apiUrl.replace(/([^:]\/)\/+/g, "$1");
      console.log("[MOBILE] Final API URL:", apiUrl);
      
      // Xử lý trường hợp không có dữ liệu trả về
      try {
      const res = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
      });
      
      if (!res.ok) {
          // Thử phương án fallback - tạo session mới nếu không lấy được danh sách
          console.log("[MOBILE] Failed to load sessions, attempting to create a new session instead");
          setSessions([]);
          
          if (res.status === 500 && userId) {
            console.log("[MOBILE] Server error occurred, likely due to invalid ObjectId");
            // Không ném lỗi, nhưng đặt sessions thành mảng rỗng
            return;
          }
          
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
        if (!responseText.trim()) {
          console.log("[MOBILE] Empty response from server, returning empty sessions array");
          setSessions([]);
          return;
        }
        
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
        const sessions = data.data ? data.data : Array.isArray(data) ? data : [];
      
      if (!Array.isArray(sessions)) {
        console.error("[MOBILE] Sessions data is not an array:", sessions);
          setSessions([]);
          return;
      }
      
      console.log("[MOBILE] Final sessions:", sessions);
      setSessions(sessions);
    } catch (e) {
      setError("Không lấy được danh sách chat");
      console.error("[MOBILE] Error loading sessions:", e);
        setSessions([]);
      }
    } catch (e) {
      setError("Không lấy được danh sách chat");
      console.error("[MOBILE] Error in load sessions outer try-catch:", e);
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
      
      // Chuẩn bị dữ liệu gửi đi với thêm field mới
      const requestData = {
        userId: targetId,
        isUserIdString: !isMongoId,
        useAsFallback: true,
        originalUserId: userId || null
      };
      
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
        // Thử phương án khác nếu có lỗi 500 (có thể do vấn đề ObjectId)
        if (res.status === 500 && userId) {
          console.log("[MOBILE] Server error 500, trying alternate approach");
          
          // Chuẩn bị dữ liệu với userId gốc thay vì ObjectId
          const alternateRequestData = {
            userId: userId,
            isUserIdString: true,
            useAsFallback: true,
            bypassObjectId: true
          };
          
          console.log("[MOBILE] Sending alternate request with original userId:", alternateRequestData);
          
          const alternateRes = await fetch(`${API_BASE_URL}/chatsession/create`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(alternateRequestData),
          });
          
          if (!alternateRes.ok) {
            let errorMessage = "Không tạo được session";
            try {
              const errorData = await alternateRes.json();
              errorMessage = errorData.message || errorMessage;
            } catch (e) {
              console.error("[MOBILE] Error parsing alternate error response:", e);
            }
            throw new Error(errorMessage);
          }
          
          // Xử lý alternate response thành công
          try {
            const alternateData = await alternateRes.json();
            console.log('[MOBILE] API alternate response createSession:', alternateData);
            
            const newSession = alternateData.data || alternateData;
            
            console.log('[MOBILE] Extracted alternate session:', newSession);
            
            if (!newSession || !newSession.sessionId) {
              throw new Error("Thiếu thông tin session trong phản hồi");
            }
            
            return {
              sessionId: newSession.sessionId,
              status: newSession.status || 'active',
              createdAt: newSession.createdAt || new Date().toISOString(),
            };
          } catch (e) {
            console.error('[MOBILE] Error processing alternate response:', e);
            throw new Error("Lỗi xử lý dữ liệu phản hồi");
          }
        }
        
        // Xử lý lỗi thông thường
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
      
      return {
        sessionId: newSession.sessionId,
        status: newSession.status || 'active',
        createdAt: newSession.createdAt || new Date().toISOString(),
      };
    } catch (e) {
      console.error("[MOBILE] Error creating session:", e);
      setError(e.message || "Không tạo được session chat");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, userObjectId, userId, fetchUserData]);

  // Gửi tin nhắn
  const sendMessage = useCallback(
    async (message) => {
      // Validate và clean message
      const cleanedMessage = message?.trim() ?? "";
      if (!cleanedMessage) return;

      // Không gửi tin nhắn nếu đang gửi rồi
      if (isSending) return;
    
    setIsSending(true);
    setError("");

      // Thêm tin nhắn từ người dùng ngay lập tức (optimistic UI)
      const tempUserMsgId = `temp_${Date.now()}`;
      const userMessage = {
        id: tempUserMsgId,
        chat_message_id: tempUserMsgId,
        content: cleanedMessage,
        sender: "user", 
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMessage]);

      // Biến để lưu session ID hiện tại hoặc mới
      let effectiveSessionId = currentSession?.sessionId;

      try {
        console.log("[MOBILE] Sending message:", cleanedMessage, "with session:", effectiveSessionId);

        // Nếu chưa có session, tạo mới trước
        if (!effectiveSessionId) {
          console.log("[MOBILE] No active session, creating new one first");
          
          const newSession = await createSession();
          if (!newSession?.sessionId) {
            throw new Error("Không thể tạo session mới");
          }
          
          effectiveSessionId = newSession.sessionId;
          setCurrentSession(newSession);
          console.log("[MOBILE] Created new session:", effectiveSessionId);
        }

        // Thêm tin nhắn của user vào session
        try {
          await fetch(`${API_BASE_URL}/chatsession/${effectiveSessionId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
            body: JSON.stringify({
              sender: "user",
              content: cleanedMessage,
            }),
          });
          console.log("[MOBILE] User message added to session");
        } catch (e) {
          console.error("[MOBILE] Error adding user message:", e);
          // Tiếp tục để vẫn gửi tới AI
        }

        // Gửi tin nhắn tới API AI
        const aiResponse = await fetch(`${API_BASE_URL}/app/ask`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            question: cleanedMessage,
            sessionId: effectiveSessionId,
            userId: userId,
          }),
      });
      
        // Xử lý lỗi HTTP
        if (!aiResponse.ok) {
          const errorStatus = aiResponse.status;
          let errorMessage = `Lỗi ${errorStatus}`;
          
          try {
            const errorData = await aiResponse.json();
            errorMessage = errorData.message || errorMessage;
          } catch (e) {
            // Không làm gì nếu không parse được JSON
          }
          
          throw new Error(errorMessage);
        }

        // Parse response
        const responseText = await aiResponse.text();
        console.log("[MOBILE] Raw AI response:", responseText);
        
        let data;
        try {
          data = JSON.parse(responseText);
        } catch (e) {
          console.error("[MOBILE] Error parsing AI response:", e);
          throw new Error("Định dạng phản hồi không hợp lệ");
      }
      
        // Xử lý cấu trúc response
        const aiAnswer = data.answer || 
                         (data.data && data.data.answer) || 
                         "Xin lỗi, tôi không thể trả lời lúc này.";
        
        // Thêm tin nhắn từ AI vào state
        const tempBotMsgId = `temp_${Date.now() + 1}`;
        const botMessage = {
          id: tempBotMsgId,
          chat_message_id: tempBotMsgId,
          content: aiAnswer,
            sender: "bot", 
            timestamp: new Date().toISOString(),
        };
        
        setMessages((prev) => [...prev, botMessage]);
        console.log("[MOBILE] AI response added to messages state");
        
        // Nếu session ID trả về khác với session ID hiện tại, cập nhật lại
        const responseSessionId = data.sessionId || (data.data && data.data.sessionId);
        if (responseSessionId && responseSessionId !== effectiveSessionId) {
          console.log("[MOBILE] Updating session ID from response:", responseSessionId);
          
          // Cập nhật currentSession với sessionId mới
          setCurrentSession({
            sessionId: responseSessionId,
            status: "active",
          });
          
          // Cập nhật danh sách session
          await loadSessions();
        } 
        
        return true;
    } catch (e) {
        console.error("[MOBILE] Error in sendMessage:", e);
      
        // Xóa tin nhắn optimistic UI nếu gặp lỗi
        setMessages((prev) => prev.filter((msg) => msg.id !== tempUserMsgId));
        
        // Hiển thị thông báo lỗi
        setError(e.message || "Không gửi được tin nhắn");
        return false;
    } finally {
      setIsSending(false);
    }
    },
    [accessToken, currentSession, userId, isSending, createSession, loadSessions]
  );

  // Xóa tin nhắn hiện tại
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  // Return hook API
  return {
    accessToken,
    userId,
    userObjectId,
    sessions,
    currentSession,
    messages,
    isLoading,
    isSending,
    error,
    setError,
    loadSessions,
    selectSession,
    createSession,
    sendMessage,
    setCurrentSession,
    clearMessages
  };
} 