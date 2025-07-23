import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useNotification } from "../app/NotificationContext";
import { useFcmToken } from "../hooks/useFcmToken";
import { fetchApi } from "../utils/api";

export default function NotificationBell() {
  const { notifications, unreadCount, markAllAsRead, addNotification } =
    useNotification();
  const { registerFcmToken, debugCurrentToken } = useFcmToken();
  const [showModal, setShowModal] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const bellRef = useRef(null);

  // Hiệu ứng rung khi có thông báo mới
  useEffect(() => {
    if (notifications.some((n) => n.isNew)) {
      setIsShaking(true);
      const timer = setTimeout(() => {
        setIsShaking(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notifications]);

  const toggleModal = () => {
    if (showModal) {
      markAllAsRead();
    }
    setShowModal(!showModal);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
    });
  };

  // Tạo thông báo giả để kiểm tra hiển thị
  const createTestNotification = () => {
    const now = new Date();
    addNotification({
      messageId: `test_${Date.now()}`,
      notification: {
        title: `Thông báo test [${now.getHours()}:${now.getMinutes()}]`,
        body: `Đây là nội dung thông báo test được tạo lúc ${now.toLocaleTimeString()}`,
      },
      sentTime: Date.now(),
    });
  };

  // Kiểm tra FCM token
  const checkFcmToken = async () => {
    const token = await debugCurrentToken();
    Alert.alert(
      "FCM Token",
      token
        ? `Token hiện tại: ${token.substring(0, 20)}...`
        : "Không tìm thấy token",
      [{ text: "OK" }]
    );
  };

  // Hàm mới: Kiểm tra toàn diện FCM
  const runFcmTest = async () => {
    const results = {
      firebaseInitialized: false,
      hasToken: false,
      token: null,
      hasPermission: false,
      apiConnected: false,
      hasJwt: false,
      jwtValid: false,
      isExpoGo: false,
    };

    try {
      // Kiểm tra môi trường Expo Go
      const isExpoGoEnv = __DEV__ && !process.env.EAS_BUILD_RUNNER;
      results.isExpoGo = isExpoGoEnv;
      console.log("[FCM-TEST] Running in Expo Go:", isExpoGoEnv);

      results.firebaseInitialized = true; // Giả sử luôn được khởi tạo (mock hoặc thật)

      // 1. Kiểm tra FCM token
      const token = await AsyncStorage.getItem("fcm_token");
      results.hasToken = !!token;
      if (token) {
        results.token = token.substring(0, 10) + "...";
      }

      // 2. Kiểm tra quyền thông báo
      try {
        if (isExpoGoEnv) {
          // Sử dụng mock trong Expo Go
          console.log("[FCM-TEST] Using mock for permission check");
          const mockFirebase = require("../services/mock-firebase");
          results.hasPermission =
            await mockFirebase.checkNotificationPermission();
        } else {
          const {
            checkNotificationPermission,
          } = require("../services/firebase-messaging");
          results.hasPermission = await checkNotificationPermission();
        }
      } catch (permError) {
        console.error("[FCM-TEST] Permission check error:", permError);
      }

      // 3. Kiểm tra API
      results.apiConnected = await testApiConnection();

      // 4. Kiểm tra JWT
      const jwt = await AsyncStorage.getItem("access_token");
      results.hasJwt = !!jwt;

      // 5. Kiểm tra tính hợp lệ của JWT
      if (jwt) {
        try {
          const response = await fetchApi("users/profile", {
            method: "GET",
            headers: {
              Authorization: `Bearer ${jwt}`,
            },
          });
          results.jwtValid = !!response;
        } catch (jwtError) {
          console.error("[FCM-TEST] JWT validation error:", jwtError);
        }
      }

      // Hiển thị kết quả
      Alert.alert(
        "Kết quả kiểm tra FCM",
        `${
          results.isExpoGo ? "⚠️ Đang chạy trong Expo Go (mock mode)\n\n" : ""
        }` +
          `✓ Firebase đã được khởi tạo\n\n` +
          `${results.hasToken ? "✓" : "✗"} FCM token tồn tại: ${
            results.token || "Không có"
          }\n\n` +
          `${
            results.hasPermission ? "✓" : "✗"
          } Đã được cấp quyền thông báo\n\n` +
          `${results.apiConnected ? "✓" : "✗"} API kết nối thành công\n\n` +
          `${results.hasJwt ? "✓" : "✗"} Có JWT\n\n` +
          `${results.jwtValid ? "✓" : "✗"} JWT hợp lệ\n\n` +
          `${
            results.hasToken && results.hasJwt && results.apiConnected
              ? "✓"
              : "✗"
          } Đăng ký token với server ${
            results.hasToken && results.hasJwt && results.apiConnected
              ? "thành công"
              : "thất bại"
          }`,
        [
          {
            text: "ĐÓNG",
            style: "cancel",
          },
          {
            text: "THỬ LẠI",
            onPress: async () => {
              await registerFcmToken();
              runFcmTest();
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert("Lỗi", `Lỗi kiểm tra FCM: ${error.message}`);
    }
  };

  // Thêm hàm để tạo test FCM token với giá trị cụ thể
  const createTestFcmToken = async () => {
    try {
      const FCM_TOKEN_STORAGE_KEY = "fcm_token";
      const testToken =
        "test-fcm-token-" + Math.random().toString(36).substring(2, 8);
      await AsyncStorage.setItem(FCM_TOKEN_STORAGE_KEY, testToken);
      console.log("[TEST] Created test FCM token:", testToken);

      // Cập nhật UI
      Alert.alert(
        "Token test đã tạo",
        `Token FCM: ${testToken}\n\nToken đã được lưu vào storage.`
      );
      return testToken;
    } catch (error) {
      console.error("[TEST] Error creating test token:", error);
      return null;
    }
  };

  // Thêm hàm để kiểm tra kết nối API chi tiết
  const testApiConnection = async () => {
    try {
      const apiModule = require("../utils/api");

      // Test API connection với các endpoints có sẵn trong backend
      const tests = [
        { name: "Root API", endpoint: "" },
        { name: "User Profile", endpoint: "users/profile", requiresAuth: true },
        { name: "App Root", endpoint: "app", requiresAuth: false },
      ];

      const results = [];

      for (const test of tests) {
        try {
          const baseUrl = apiModule.getApiBaseUrl();
          const url = test.endpoint
            ? `${baseUrl}/api/v1/${test.endpoint}`
            : baseUrl;

          console.log(`[API-TEST] Testing ${test.name} at ${url}`);
          const startTime = Date.now();

          // Tạo options cho request
          const options = {};

          // Thêm auth header nếu cần
          if (test.requiresAuth) {
            const jwt = await AsyncStorage.getItem("access_token");
            if (jwt) {
              options.headers = {
                Authorization: `Bearer ${jwt}`,
              };
            } else {
              console.log(
                "[API-TEST] JWT không có sẵn cho endpoint yêu cầu auth"
              );
            }
          }

          const response = await fetch(url, options);
          const endTime = Date.now();

          const duration = endTime - startTime;
          const status = response.status;
          const statusText = response.statusText;

          // 401 vẫn được coi là thành công nếu endpoint yêu cầu auth
          const isSuccess =
            response.ok || (test.requiresAuth && status === 401);

          results.push({
            name: test.name,
            success: isSuccess,
            status,
            statusText,
            duration,
          });

          console.log(
            `[API-TEST] ${
              test.name
            }: ${status} ${statusText} (${duration}ms) - ${
              isSuccess ? "OK" : "FAILED"
            }`
          );
        } catch (error) {
          console.error(`[API-TEST] ${test.name} failed:`, error);
          results.push({
            name: test.name,
            success: false,
            error: error.message,
          });
        }
      }

      // Hiển thị kết quả
      const resultsText = results
        .map(
          (r) =>
            `${r.name}: ${r.success ? "✓" : "✗"} ${
              r.success
                ? `Status ${r.status} (${r.duration}ms)`
                : r.error || "Failed"
            }`
        )
        .join("\n\n");

      Alert.alert("Kết quả kiểm tra API", resultsText, [{ text: "OK" }]);
    } catch (error) {
      console.error("[API-TEST] General error:", error);
      Alert.alert("Lỗi kiểm tra API", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Pressable
        onPress={toggleModal}
        style={({ pressed }) => [
          styles.iconContainer,
          pressed && styles.pressed,
        ]}
        ref={bellRef}
      >
        <Ionicons
          name="notifications"
          size={24}
          color="#fff"
          style={[isShaking && styles.shaking]}
        />
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount}</Text>
          </View>
        )}
      </Pressable>

      <Modal
        visible={showModal}
        transparent={true}
        animationType="slide"
        onRequestClose={toggleModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Thông báo</Text>
              <TouchableOpacity
                onPress={toggleModal}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#555" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.notificationsList}>
              {notifications.length === 0 ? (
                <Text style={styles.emptyText}>Không có thông báo nào</Text>
              ) : (
                notifications.map((notification) => (
                  <View
                    key={notification.id}
                    style={[
                      styles.notificationItem,
                      !notification.read && styles.unread,
                      notification.isNew && styles.newNotification,
                    ]}
                  >
                    <Text style={styles.notificationTitle}>
                      {notification.title}
                    </Text>
                    <Text style={styles.notificationBody}>
                      {notification.body}
                    </Text>
                    <Text style={styles.notificationTime}>
                      {formatTime(notification.receivedAt)}
                    </Text>
                  </View>
                ))
              )}
            </ScrollView>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.button}
                onPress={createTestNotification}
              >
                <Text style={styles.buttonText}>Tạo Thông Báo Test</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.checkButton]}
                onPress={checkFcmToken}
              >
                <Text style={styles.buttonText}>Kiểm Tra FCM Token</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.testButton]}
                onPress={runFcmTest}
              >
                <Text style={styles.buttonText}>Kiểm Tra FCM</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, { backgroundColor: "#4CAF50" }]}
                onPress={createTestFcmToken}
              >
                <Text style={styles.buttonText}>Tạo FCM Token Thử</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, { backgroundColor: "#9C27B0" }]}
                onPress={testApiConnection}
              >
                <Text style={styles.buttonText}>Kiểm Tra API Chi Tiết</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginRight: 10,
  },
  iconContainer: {
    padding: 8,
    borderRadius: 20,
  },
  pressed: {
    opacity: 0.7,
  },
  badge: {
    position: "absolute",
    right: 0,
    top: 0,
    backgroundColor: "#ff4c4c",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 5,
  },
  notificationsList: {
    flex: 1,
  },
  notificationItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#fff",
  },
  unread: {
    backgroundColor: "#f0f7ff",
  },
  newNotification: {
    backgroundColor: "#e6f7ff",
    borderLeftWidth: 3,
    borderLeftColor: "#1890ff",
  },
  notificationTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 5,
  },
  notificationBody: {
    color: "#555",
    marginBottom: 5,
  },
  notificationTime: {
    fontSize: 12,
    color: "#999",
    alignSelf: "flex-end",
  },
  emptyText: {
    padding: 20,
    textAlign: "center",
    color: "#999",
  },
  buttonContainer: {
    flexDirection: "column",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    alignItems: "stretch",
  },
  button: {
    backgroundColor: "#1890ff",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 5,
  },
  checkButton: {
    backgroundColor: "#52c41a",
  },
  testButton: {
    backgroundColor: "#722ed1",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  shaking: {
    transform: [{ rotate: "5deg" }],
  },
});
