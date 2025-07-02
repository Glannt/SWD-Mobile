import React, { createContext, useContext, useEffect, useState } from "react";
import { Platform } from "react-native";

interface UserData {
  _id?: string; // MongoDB ObjectId
  user_id?: string;
  email?: string;
  name?: string;
  [key: string]: any; // Cho phép thêm các field khác
}

interface AuthContextProps {
  accessToken: string;
  userId: string;
  userObjectId: string;
  userData: UserData | null;
  setAuth: (
    token: string,
    userId: string,
    userObjectId: string,
    userData?: UserData
  ) => void;
  clearAuth: () => void;
  debug: () => void;
}

const AuthContext = createContext<AuthContextProps>({
  accessToken: "",
  userId: "",
  userObjectId: "",
  userData: null,
  setAuth: () => {},
  clearAuth: () => {},
  debug: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [accessToken, setAccessToken] = useState("");
  const [userId, setUserId] = useState("");
  const [userObjectId, setUserObjectId] = useState("");
  const [userData, setUserData] = useState<UserData | null>(null);

  // Log thông tin auth khi component mount
  useEffect(() => {
    console.log("[AUTH] Context initialized");
  }, []);

  // Khôi phục auth từ localStorage khi ở web
  useEffect(() => {
    // Kiểm tra chi tiết môi trường web để tránh lỗi trên mobile
    if (Platform.OS !== "web") {
      console.log("[AUTH] Not web platform, skipping localStorage restore");
      return;
    }

    if (typeof window === "undefined") {
      console.log("[AUTH] Window is undefined, skipping localStorage restore");
      return;
    }

    if (!window.localStorage) {
      console.log("[AUTH] localStorage is not available, skipping restore");
      return;
    }

    // Nếu là web, thử khôi phục từ localStorage
    try {
      console.log("[AUTH] Checking localStorage for auth data");
      const storedToken = localStorage.getItem("access_token");
      const storedUserStr = localStorage.getItem("user");

      if (storedToken) {
        console.log("[AUTH] Found token in localStorage");
        setAccessToken(storedToken);
      }

      if (storedUserStr) {
        console.log("[AUTH] Found user data in localStorage");
        const storedUser = JSON.parse(storedUserStr);
        setUserId(storedUser?.user_id || "");
        setUserObjectId(storedUser?._id || "");
        setUserData(storedUser || null);
      }
    } catch (e) {
      console.error("[AUTH] Error restoring from localStorage:", e);
    }
  }, []);

  const setAuth = (
    token: string,
    userId: string,
    userObjectId: string,
    userData?: UserData
  ) => {
    console.log("[AUTH] Setting auth:", {
      hasToken: !!token,
      userId,
      userObjectId,
      hasUserData: !!userData,
    });

    setAccessToken(token);
    setUserId(userId);
    setUserObjectId(userObjectId);

    // Lưu thông tin user đầy đủ nếu có
    if (userData) {
      setUserData(userData);
    } else {
      // Tạo object user data tối thiểu
      setUserData({
        _id: userObjectId,
        user_id: userId,
      });
    }

    // Lưu vào localStorage chỉ khi ở môi trường web
    if (Platform.OS !== "web") {
      console.log("[AUTH] Not web platform, skipping localStorage save");
      return;
    }

    if (typeof window === "undefined") {
      console.log("[AUTH] Window is undefined, skipping localStorage save");
      return;
    }

    if (!window.localStorage) {
      console.log("[AUTH] localStorage is not available, skipping save");
      return;
    }

    try {
      console.log("[AUTH] Saving auth data to localStorage");
      localStorage.setItem("access_token", token);

      // Lưu userData đầy đủ hoặc object tối thiểu vào localStorage
      const userToSave = userData || {
        _id: userObjectId,
        user_id: userId,
      };

      localStorage.setItem("user", JSON.stringify(userToSave));
      console.log("[AUTH] Saved to localStorage successfully");
    } catch (e) {
      console.error("[AUTH] Error saving to localStorage:", e);
    }
  };

  const clearAuth = () => {
    console.log("[AUTH] Clearing auth");

    // Xóa state trong bộ nhớ
    setAccessToken("");
    setUserId("");
    setUserObjectId("");
    setUserData(null);

    // Xóa khỏi localStorage chỉ khi ở môi trường web
    if (Platform.OS !== "web") {
      console.log("[AUTH] Not web platform, skipping localStorage clear");
      return;
    }

    if (typeof window === "undefined") {
      console.log("[AUTH] Window is undefined, skipping localStorage clear");
      return;
    }

    if (!window.localStorage) {
      console.log("[AUTH] localStorage is not available, skipping clear");
      return;
    }

    try {
      console.log("[AUTH] Clearing auth data from localStorage");
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      console.log("[AUTH] Cleared from localStorage successfully");
    } catch (e) {
      console.error("[AUTH] Error clearing localStorage:", e);
    }
  };

  const debug = () => {
    console.log("[AUTH DEBUG] Current state:", {
      accessToken: accessToken ? `${accessToken.substring(0, 15)}...` : null,
      userId,
      userObjectId,
      userData,
      hasAccessToken: !!accessToken,
      hasUserId: !!userId,
      hasUserObjectId: !!userObjectId,
      hasUserData: !!userData,
      platform: Platform.OS,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        userId,
        userObjectId,
        userData,
        setAuth,
        clearAuth,
        debug,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
