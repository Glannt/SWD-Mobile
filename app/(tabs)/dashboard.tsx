import { router } from "expo-router";
import React, { useEffect } from "react";
import { View } from "react-native";
import { useAuth } from "../AuthContext";

// File này chỉ tồn tại để đảm bảo cấu trúc thư mục cho Expo Router
// Tab thực tế sẽ điều hướng đến /admin/dashboard qua CustomTabBar
export default function DashboardTabPlaceholder() {
  const { userData, accessToken } = useAuth();

  // Tự động chuyển hướng đến dashboard thật hoặc hiển thị lỗi truy cập
  useEffect(() => {
    console.log("[DASHBOARD_PLACEHOLDER] Checking auth:", {
      hasToken: !!accessToken,
      role: userData?.role,
    });

    // Kiểm tra quyền admin trước khi chuyển hướng
    if (!accessToken) {
      // Nếu chưa đăng nhập, chuyển về trang profile để đăng nhập
      console.log(
        "[DASHBOARD_PLACEHOLDER] Not logged in, redirecting to profile"
      );
      router.navigate("/(tabs)/profile");
      return;
    }

    if (!userData || userData.role !== "admin") {
      // Nếu không có quyền admin, chuyển về home mà không hiển thị thông báo
      console.log("[DASHBOARD_PLACEHOLDER] Not admin, redirecting to home");
      router.navigate("/(tabs)/home");
      return;
    }

    // Nếu có quyền admin, chuyển đến dashboard thật
    console.log(
      "[DASHBOARD_PLACEHOLDER] Admin access granted, redirecting to admin dashboard"
    );
    router.navigate("/admin/dashboard");
  }, [userData, accessToken]);

  return <View />;
}
