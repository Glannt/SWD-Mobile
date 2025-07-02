import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../AuthContext";

// Chọn URL API phù hợp với môi trường
const getApiBaseUrl = () => {
  try {
    if (
      Platform.OS === "web" &&
      typeof window !== "undefined" &&
      window.location
    ) {
      // Trong môi trường web, sử dụng current host thay vì localhost
      const host = window.location.hostname;
      const port = 3000; // Giữ nguyên port
      return `http://${host}:${port}/api/v1`;
    } else if (Platform.OS === "ios") {
      // Trên iOS, sử dụng địa chỉ IP thay vì localhost
      // TODO: Thay thế bằng địa chỉ IP của máy chủ thực tế hoặc domain
      return "http://192.168.1.8:3000/api/v1"; // Thay đổi IP này
    } else if (Platform.OS === "android") {
      // Trên Android có thể sử dụng 10.0.2.2 để trỏ đến localhost của máy chủ
      return "http://10.0.2.2:3000/api/v1";
    }
  } catch (e) {
    console.error("[MOBILE] Error getting API base URL:", e);
  }
  // Fallback nếu không xác định được
  return "http://localhost:3000/api/v1";
};

const API_BASE_URL = getApiBaseUrl();

export default function SettingsScreen() {
  const { accessToken, userId, clearAuth } = useAuth();
  const [twoFactorEnabled, setTwoFactorEnabled] = React.useState(false);
  const [emailNotifications, setEmailNotifications] = React.useState(true);

  // Xử lý đăng xuất
  const handleLogout = async () => {
    console.log("[SETTINGS] Starting logout process");

    try {
      // Gọi API đăng xuất
      if (accessToken) {
        console.log("[SETTINGS] Calling logout API");
        const response = await fetch(`${API_BASE_URL}/auth/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });

        console.log("[SETTINGS] Logout API response status:", response.status);
      } else {
        console.log("[SETTINGS] No access token, skipping API call");
      }
    } catch (e) {
      console.log("[SETTINGS] Logout request failed, clearing state anyway", e);
    } finally {
      console.log("[SETTINGS] Clearing auth state");

      // Xóa thông tin đăng nhập
      clearAuth();

      console.log("[SETTINGS] Logout process completed");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.pageTitle}>Cài đặt</Text>

      {/* Cài đặt tài khoản */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cài đặt tài khoản</Text>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Thay đổi mật khẩu</Text>
            <Text style={styles.settingDesc}>
              Cập nhật mật khẩu tài khoản của bạn
            </Text>
          </View>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Thay đổi</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Thông báo email</Text>
            <Text style={styles.settingDesc}>Quản lý thông báo qua email</Text>
          </View>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Cài đặt</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bảo mật và quyền riêng tư */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bảo mật và quyền riêng tư</Text>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Xác thực hai yếu tố</Text>
            <Text style={styles.settingDesc}>
              Bảo vệ tài khoản bằng mã xác thực
            </Text>
          </View>
          <Switch
            value={twoFactorEnabled}
            onValueChange={setTwoFactorEnabled}
            trackColor={{ false: "#e5e7eb", true: "#4ade80" }}
            thumbColor="#ffffff"
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Quyền riêng tư</Text>
            <Text style={styles.settingDesc}>
              Quản lý thông tin hiển thị công khai
            </Text>
          </View>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Cài đặt</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Khu vực nguy hiểm */}
      <View style={styles.dangerSection}>
        <Text style={styles.dangerTitle}>Khu vực nguy hiểm</Text>

        <View style={styles.dangerItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.dangerItemTitle}>Đăng xuất</Text>
            <Text style={styles.settingDesc}>
              Đăng xuất khỏi tài khoản hiện tại
            </Text>
          </View>
          <TouchableOpacity style={styles.dangerButton} onPress={handleLogout}>
            <Text style={styles.dangerButtonText}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6f8fb",
    padding: 16,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#23232b",
    marginTop: 20,
    marginBottom: 20,
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#23232b",
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  settingInfo: {
    flex: 1,
    paddingRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#23232b",
    marginBottom: 4,
  },
  settingDesc: {
    fontSize: 14,
    color: "#888",
  },
  actionButton: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionButtonText: {
    color: "#23232b",
    fontWeight: "500",
  },
  dangerSection: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  dangerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#e53935",
    marginBottom: 16,
  },
  dangerItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  dangerItemTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#23232b",
    marginBottom: 4,
  },
  dangerButton: {
    backgroundColor: "#ffebee",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  dangerButtonText: {
    color: "#e53935",
    fontWeight: "500",
  },
});
