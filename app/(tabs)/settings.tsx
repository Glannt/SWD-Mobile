import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { NotificationPermissionModal } from "../../components/NotificationPermissionModal";
import { checkNotificationPermission } from "../../services/firebase-messaging";
import { useAuth } from "../AuthContext";
import { useNotification } from "../NotificationContext";

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
      return "http://192.168.1.6:3000/api/v1"; // Thay đổi IP này
    } else if (Platform.OS === "android") {
      // Trên Android có thể sử dụng 10.0.2.2 để trỏ đến localhost của máy chủ
      return "http://192.168.1.6:3000/api/v1";
    }
  } catch (e) {
    console.error("[MOBILE] Error getting API base URL:", e);
  }
  // Fallback nếu không xác định được
  return "http://localhost:3000/api/v1";
};

const API_BASE_URL = getApiBaseUrl();

export default function SettingsScreen() {
  const { accessToken, userId, userData, clearAuth } = useAuth();
  const [twoFactorEnabled, setTwoFactorEnabled] = React.useState(false);
  const [emailNotifications, setEmailNotifications] = React.useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const router = useRouter();
  const { setupUserNotifications } = useNotification();

  // Kiểm tra đăng nhập
  const isLoggedIn = !!accessToken;

  // Kiểm tra trạng thái quyền thông báo khi component mount
  useEffect(() => {
    const checkPermissions = async () => {
      if (isLoggedIn) {
        const hasPermission = await checkNotificationPermission();
        setNotificationsEnabled(hasPermission);
      }
    };

    checkPermissions();
  }, [isLoggedIn]);

  // Debug: Kiểm tra dữ liệu trong AsyncStorage khi component mount
  useEffect(() => {
    const checkAsyncStorage = async () => {
      try {
        const token = await AsyncStorage.getItem("access_token");
        const user = await AsyncStorage.getItem("user");
        console.log("[SETTINGS] AsyncStorage check on mount:", {
          hasToken: !!token,
          hasUser: !!user,
          tokenPreview: token ? `${token.substring(0, 15)}...` : null,
        });
      } catch (e) {
        console.error("[SETTINGS] Error checking AsyncStorage:", e);
      }
    };

    checkAsyncStorage();
  }, []);

  // Xử lý toggle thông báo
  const handleToggleNotifications = () => {
    if (!notificationsEnabled) {
      // Nếu chưa bật, hiển thị modal xin quyền
      setShowPermissionModal(true);
    } else {
      // Nếu đang bật, hiển thị hướng dẫn tắt thông báo
      Alert.alert(
        "Tắt thông báo",
        "Để tắt thông báo, vui lòng vào cài đặt thiết bị và tắt thông báo cho ứng dụng này.",
        [{ text: "OK" }]
      );
    }
  };

  // Xử lý sau khi đăng ký thông báo thành công
  const handleNotificationSuccess = () => {
    setNotificationsEnabled(true);
    Alert.alert("Thành công", "Bạn đã đăng ký nhận thông báo thành công!", [
      { text: "OK" },
    ]);
  };

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

      // Xóa dữ liệu khỏi AsyncStorage trực tiếp (đảm bảo xóa)
      console.log(
        `[SETTINGS] Directly clearing AsyncStorage on ${Platform.OS}`
      );

      // Sử dụng multiRemove để xóa nhiều keys cùng lúc
      const keysToRemove = ["access_token", "user"];
      await AsyncStorage.multiRemove(keysToRemove);

      // Kiểm tra xem đã xóa thành công chưa
      const tokenAfter = await AsyncStorage.getItem("access_token");
      const userAfter = await AsyncStorage.getItem("user");
      console.log("[SETTINGS] AsyncStorage after direct clear:", {
        tokenExists: !!tokenAfter,
        userExists: !!userAfter,
      });

      // Nếu vẫn còn dữ liệu, thử xóa lại từng item
      if (tokenAfter || userAfter) {
        console.log(
          "[SETTINGS] Some data still exists, trying individual removal"
        );
        if (tokenAfter) await AsyncStorage.removeItem("access_token");
        if (userAfter) await AsyncStorage.removeItem("user");
      }
    } catch (e) {
      console.error("[SETTINGS] Logout request failed:", e);
    } finally {
      console.log("[SETTINGS] Clearing auth state via context");

      // Xóa thông tin đăng nhập thông qua context
      await clearAuth();

      // Kiểm tra lại sau khi đăng xuất
      const tokenFinal = await AsyncStorage.getItem("access_token");
      const userFinal = await AsyncStorage.getItem("user");
      console.log("[SETTINGS] Final AsyncStorage check:", {
        tokenExists: !!tokenFinal,
        userExists: !!userFinal,
      });

      // Hiển thị thông báo đăng xuất thành công
      Alert.alert("Đăng xuất thành công", "Bạn đã đăng xuất khỏi tài khoản", [
        { text: "OK" },
      ]);

      // Chuyển hướng về trang chủ
      router.replace("/(tabs)/home");
    }
  };

  // Component hiển thị khi chưa đăng nhập
  const LoginPromptView = () => (
    <View style={styles.loginContainer}>
      <Ionicons name="lock-closed-outline" size={64} color="#ccc" />
      <Text style={styles.loginTitle}>Vui lòng đăng nhập</Text>
      <Text style={styles.loginDescription}>
        Bạn cần đăng nhập để xem và thay đổi cài đặt tài khoản
      </Text>
      <TouchableOpacity
        style={styles.loginButton}
        onPress={() => router.push("/(tabs)/profile")}
      >
        <Text style={styles.loginButtonText}>Đăng nhập</Text>
      </TouchableOpacity>
    </View>
  );

  // Component hiển thị khi đã đăng nhập
  const SettingsView = () => (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={styles.pageTitle}>Cài đặt</Text>

      {/* Cài đặt thông báo */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cài đặt thông báo</Text>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Thông báo đẩy</Text>
            <Text style={styles.settingDesc}>
              Nhận thông báo trực tiếp trên thiết bị
            </Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={handleToggleNotifications}
            trackColor={{ false: "#e5e7eb", true: "#ff6600" }}
            thumbColor="#ffffff"
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Thông báo email</Text>
            <Text style={styles.settingDesc}>Nhận thông báo qua email</Text>
          </View>
          <Switch
            value={emailNotifications}
            onValueChange={setEmailNotifications}
            trackColor={{ false: "#e5e7eb", true: "#ff6600" }}
            thumbColor="#ffffff"
          />
        </View>
      </View>

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

      {/* Thông tin tài khoản */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thông tin tài khoản</Text>

        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Email</Text>
          <Text style={styles.infoValue}>
            {userData?.email || "Chưa cập nhật"}
          </Text>
        </View>

        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>ID người dùng</Text>
          <Text style={styles.infoValue}>{userId || "Không có"}</Text>
        </View>

        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Vai trò</Text>
          <Text style={styles.infoValue}>{userData?.role || "Người dùng"}</Text>
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

      {/* Modal xin quyền thông báo */}
      {accessToken && (
        <NotificationPermissionModal
          isVisible={showPermissionModal}
          onClose={() => setShowPermissionModal(false)}
          jwt={accessToken}
          onSuccess={handleNotificationSuccess}
        />
      )}
    </ScrollView>
  );

  // Render theo trạng thái đăng nhập
  return isLoggedIn ? <SettingsView /> : <LoginPromptView />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6f8fb",
    padding: 16,
  },
  contentContainer: {
    paddingBottom: Platform.OS === "ios" ? 100 : 80, // Add padding to bottom to prevent TabBar overlap
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
    color: "#dc2626",
    marginBottom: 16,
  },
  dangerItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  dangerItemTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#dc2626",
    marginBottom: 4,
  },
  dangerButton: {
    backgroundColor: "#dc2626",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  dangerButtonText: {
    color: "#fff",
    fontWeight: "500",
  },
  loginContainer: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#23232b",
    marginTop: 16,
    marginBottom: 8,
  },
  loginDescription: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  loginButton: {
    backgroundColor: "#465fff",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  loginButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  infoItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  infoLabel: {
    fontSize: 14,
    color: "#888",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "500",
    color: "#23232b",
  },
});
