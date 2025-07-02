import { Redirect } from "expo-router";
import React, { useEffect } from "react";
import { Platform } from "react-native";
import { getApiBaseUrl, testApiConnection } from "../utils/api";
import { useAuth } from "./AuthContext";

export default function Index() {
  const { debug } = useAuth();

  // Kiểm tra kết nối API khi ứng dụng khởi động
  useEffect(() => {
    console.log("[DEBUG] App started on platform:", Platform.OS);
    console.log("[DEBUG] API URL:", getApiBaseUrl());

    // Log thông tin auth
    debug();

    // Kiểm tra kết nối API
    const checkApiConnection = async () => {
      try {
        const result = await testApiConnection();
        console.log("[DEBUG] API connection test result:", result);
      } catch (error) {
        console.error("[DEBUG] API connection test error:", error);
      }
    };

    checkApiConnection();
  }, [debug]);

  // Chuyển hướng đến trang chat
  return <Redirect href="/chat" />;
}
