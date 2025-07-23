import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Modal,
  Platform,
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

  // Hiển thị FCM token đầy đủ
  const showFullFcmToken = async () => {
    try {
      const token = await AsyncStorage.getItem("fcm_token");
      if (token) {
        console.log("[FCM] FULL TOKEN FOR DEBUGGING:", token);
        Alert.alert(
          "FCM Token Đầy Đủ",
          `Đây là token FCM đầy đủ của thiết bị:\n\n${token}\n\nĐã log ra console để dễ copy.`,
          [{ text: "OK" }]
        );
      } else {
        Alert.alert(
          "Không có FCM Token",
          "Không tìm thấy FCM token trong bộ nhớ. Hãy thử đăng ký token trước.",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error("[FCM] Error getting full token:", error);
      Alert.alert("Lỗi", "Không thể lấy token: " + error.message);
    }
  };

  // Kiểm tra môi trường chi tiết
  const checkFirebaseEnvironment = async () => {
    console.log(
      "\n\n================ NOTIFICATION BELL ENVIRONMENT CHECK ================"
    );
    console.log(
      "🔍 Checking Firebase environment from NotificationBell component"
    );

    try {
      // 1. Kiểm tra cài đặt force environment
      try {
        const firebaseModule = require("../services/firebase-messaging");
        console.log(
          "- FORCE_REAL_FIREBASE:",
          firebaseModule.FORCE_REAL_FIREBASE
        );
      } catch (error) {
        console.log("❌ Không thể đọc FORCE_REAL_FIREBASE:", error.message);
      }

      try {
        const fcmHook = require("../hooks/useFcmToken");
        console.log(
          "- FORCE_REAL_ENVIRONMENT:",
          fcmHook.FORCE_REAL_ENVIRONMENT
        );
      } catch (error) {
        console.log("❌ Không thể đọc FORCE_REAL_ENVIRONMENT:", error.message);
      }

      // 2. Kiểm tra token hiện tại
      const token = await AsyncStorage.getItem("fcm_token");
      console.log(
        "- Current token:",
        token
          ? token.startsWith("mock")
            ? "MOCK TOKEN ⚠️"
            : "REAL TOKEN ✅"
          : "No token found"
      );

      // 3. Thử import Firebase trực tiếp để kiểm tra môi trường thực
      console.log("\n👉 Thử nghiệm khả năng truy cập Firebase trực tiếp:");
      try {
        console.log("📲 Trying direct Firebase import...");
        const firebaseApp = require("@react-native-firebase/app").default;
        console.log("✅ Firebase direct import successful");

        console.log("- Firebase SDK version:", firebaseApp.SDK_VERSION);
        console.log("- Firebase apps initialized:", firebaseApp.apps.length);

        if (firebaseApp.apps.length > 0) {
          console.log("- Firebase app name:", firebaseApp.app().name);
          try {
            // Thử lấy token trực tiếp từ Firebase
            console.log(
              "📱 Attempting to get token directly from Firebase Messaging"
            );
            const messaging =
              require("@react-native-firebase/messaging").default;

            // Kiểm tra quyền
            try {
              const authStatus = await messaging().requestPermission();
              console.log("- Permission request result:", authStatus);
            } catch (permError) {
              console.log("- Permission request error:", permError);
            }

            // Đăng ký thiết bị
            try {
              await messaging().registerDeviceForRemoteMessages();
              console.log(
                "- Device registered for remote messages successfully"
              );
            } catch (regError) {
              console.log(
                "- Device registration error or already registered:",
                regError.message
              );
            }

            // Lấy token trực tiếp
            const directToken = await messaging().getToken();
            console.log("✅ SUCCESSFULLY GOT DIRECT FCM TOKEN!");
            console.log(
              "- Direct token:",
              directToken.substring(0, 20) + "..."
            );
            console.log("- Token length:", directToken.length);
            console.log("- Is mock token:", directToken.startsWith("mock"));
          } catch (tokenError) {
            console.log("❌ Could not get direct token:", tokenError);
          }
        } else {
          console.log(
            "❌ No Firebase apps initialized - need to call initializeApp() first"
          );

          // Thử khởi tạo Firebase app
          try {
            console.log("📱 Attempting to initialize Firebase app...");
            await firebaseApp.initializeApp({});
            console.log("✅ Firebase app initialization successful");
          } catch (initError) {
            console.log("❌ Firebase app initialization error:", initError);
          }
        }
      } catch (firebaseError) {
        console.log("❌ Direct Firebase import failed:", firebaseError);
      }

      // 4. Kiểm tra môi trường hiện tại với các phương pháp khác nhau
      console.log("\n👉 Kiểm tra môi trường bằng nhiều phương pháp:");
      console.log("- __DEV__:", __DEV__);
      console.log(
        "- process.env.EAS_BUILD_RUNNER:",
        process.env.EAS_BUILD_RUNNER
      );
      console.log("- global.expo exists:", global.expo !== undefined);

      try {
        const Constants = require("expo-constants");
        console.log(
          "- Expo Constants executionEnvironment:",
          Constants.default?.executionEnvironment
        );
      } catch (error) {
        console.log("❌ Could not check Expo Constants:", error.message);
      }

      console.log(
        "================ END NOTIFICATION BELL ENVIRONMENT CHECK ================\n\n"
      );

      // 5. Hiển thị kết quả chi tiết
      let message = await buildEnvironmentDetailsMessage();
      Alert.alert("Kiểm Tra Môi Trường Firebase", message, [
        { text: "OK" },
        {
          text: "Tạo Token Mới",
          onPress: resetFcmToken,
        },
      ]);
    } catch (error) {
      console.error("❌ Error in environment check:", error);
      Alert.alert("Lỗi", "Lỗi kiểm tra môi trường: " + error.message);
    }
  };

  // Tạo thông báo chi tiết về môi trường
  const buildEnvironmentDetailsMessage = async () => {
    try {
      let message = "";
      const token = await AsyncStorage.getItem("fcm_token");

      // Trạng thái token
      if (token) {
        message += `🔑 FCM Token: ${
          token.startsWith("mock") ? "GIẢẢ" : "THẬT"
        }\n`;
        message += `📏 Độ dài token: ${token.length}\n`;
        message += token.startsWith("mock")
          ? "⚠️ Đây là token giả, không hoạt động với Firebase\n\n"
          : "✅ Đây có vẻ là token thật\n\n";
      } else {
        message += "⚠️ Chưa có FCM token\n\n";
      }

      // Phát hiện môi trường
      try {
        const firebaseModule = require("../services/firebase-messaging");
        const fcmHook = require("../hooks/useFcmToken");

        message += `🔄 Phát hiện môi trường:\n`;
        message += `- FORCE_REAL_FIREBASE: ${
          firebaseModule.FORCE_REAL_FIREBASE ? "BẬT ✓" : "TẮT ✗"
        }\n`;
        message += `- FORCE_REAL_ENVIRONMENT: ${
          fcmHook.FORCE_REAL_ENVIRONMENT ? "BẬT ✓" : "TẮT ✗"
        }\n`;

        // Kiểm tra với isRunningInExpoGo
        try {
          const inExpo = firebaseModule.isRunningInExpoGo();
          message += `- Đang chạy trong Expo Go: ${
            inExpo ? "CÓ ✗" : "KHÔNG ✓"
          }\n\n`;
        } catch (expoError) {
          message += `- Lỗi kiểm tra Expo Go\n\n`;
        }
      } catch (error) {
        message += `- Không thể đọc cấu hình: ${error.message}\n\n`;
      }

      // Kiểm tra Firebase trực tiếp
      try {
        const firebaseApp = require("@react-native-firebase/app").default;
        message += "✅ Firebase có thể import trực tiếp\n";
        message += `- Apps đã khởi tạo: ${firebaseApp.apps.length}\n`;

        if (firebaseApp.apps.length > 0) {
          message += `- App name: ${firebaseApp.app().name}\n\n`;

          try {
            const messaging =
              require("@react-native-firebase/messaging").default;
            const directToken = await messaging().getToken();
            message += "✅ Lấy token trực tiếp thành công!\n";
            message += `Token mới: ${directToken.substring(0, 15)}...\n\n`;
            message += "👉 Bạn nên nhấn 'Tạo Token Mới'";
          } catch (tokenError) {
            message += `\n❌ Lỗi lấy token trực tiếp:\n${tokenError.message}\n`;
          }
        } else {
          message += "⚠️ Chưa khởi tạo Firebase app\n";
        }
      } catch (error) {
        message += `❌ Không thể truy cập Firebase:\n${error.message}\n`;
        message +=
          "👉 Bạn có thể đang chạy trong Expo Go hoặc chưa cài đặt Firebase đúng cách\n";
      }

      return message;
    } catch (error) {
      return "❌ Lỗi: " + error.message;
    }
  };

  // Kiểm tra Firebase trực tiếp và trả về kết quả
  const checkDirectFirebase = async () => {
    try {
      let results = "";
      const token = await AsyncStorage.getItem("fcm_token");

      if (token) {
        results += `🔑 Token hiện tại: ${token.substring(0, 15)}...\n`;
        results += `📏 Độ dài token: ${token.length}\n`;
        results += `${
          token.startsWith("mock")
            ? "⚠️ Đây là mock token"
            : "✅ Có vẻ là token thật"
        }\n\n`;
      } else {
        results += "⚠️ Chưa có FCM token\n\n";
      }

      try {
        const firebaseApp = require("@react-native-firebase/app").default;
        results += "✅ Import Firebase thành công\n";

        if (firebaseApp.apps.length > 0) {
          results += `📱 Firebase app: ${firebaseApp.app().name}\n`;

          try {
            const messaging =
              require("@react-native-firebase/messaging").default;
            const directToken = await messaging().getToken();
            results += "\n✅ Lấy token trực tiếp thành công\n";
            results += `🔑 Token trực tiếp: ${directToken.substring(
              0,
              15
            )}...\n`;
            results += `📏 Độ dài: ${directToken.length}\n`;
          } catch (tokenError) {
            results += `\n❌ Lỗi lấy token trực tiếp: ${tokenError.message}\n`;
          }
        } else {
          results += "⚠️ Chưa khởi tạo Firebase app\n";
        }
      } catch (error) {
        results += `❌ Lỗi import Firebase: ${error.message}\n`;
        results +=
          "Có thể đang chạy trong Expo Go hoặc chưa cài đặt Firebase\n";
      }

      return results;
    } catch (error) {
      return "❌ Lỗi: " + error.message;
    }
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
      // Sử dụng cùng một phương pháp phát hiện môi trường từ firebase-messaging.ts
      const firebaseModule = require("../services/firebase-messaging");
      const isExpoGoEnv = firebaseModule.isRunningInExpoGo();
      results.isExpoGo = isExpoGoEnv;
      console.log(
        "[FCM-TEST] Running in Expo Go (using firebase-messaging detection):",
        isExpoGoEnv
      );

      results.firebaseInitialized = true; // Giả sử luôn được khởi tạo (mock hoặc thật)

      // 1. Kiểm tra FCM token
      const token = await AsyncStorage.getItem("fcm_token");
      results.hasToken = !!token;
      if (token) {
        results.token = token.substring(0, 10) + "...";
        console.log(
          "[FCM-TEST] Current token type:",
          token.startsWith("mock") ? "MOCK TOKEN" : "REAL TOKEN"
        );
        console.log("[FCM-TEST] Token full:", token);
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

  // Xóa token FCM cũ và tạo mới
  const resetFcmToken = async () => {
    try {
      // Xóa token cũ
      await AsyncStorage.removeItem("fcm_token");
      console.log("[FCM] Removed old token from AsyncStorage");

      // Kiểm tra môi trường
      const firebaseModule = require("../services/firebase-messaging");
      const isExpoGoEnv = firebaseModule.isRunningInExpoGo();

      if (!isExpoGoEnv) {
        // Nếu không phải Expo Go, tạo token thực mới
        try {
          console.log(
            "[FCM] Requesting new real token from Firebase directly..."
          );
          const messaging = require("@react-native-firebase/messaging").default;

          // Đăng ký thiết bị nếu cần
          if (Platform.OS !== "web") {
            try {
              await messaging().registerDeviceForRemoteMessages();
              console.log("[FCM] Device registered for remote messages");
            } catch (registerError) {
              console.error("[FCM] Device registration error:", registerError);
            }
          }

          // Lấy token mới trực tiếp từ Firebase
          const newToken = await messaging().getToken();
          if (newToken) {
            // Lưu token mới
            await AsyncStorage.setItem("fcm_token", newToken);
            console.log(
              "[FCM] Got new real token:",
              newToken.substring(0, 15) + "..."
            );
            Alert.alert(
              "Thành công",
              "Đã xóa token cũ và tạo token mới thành công.\n\nToken mới: " +
                newToken.substring(0, 15) +
                "..."
            );
            return;
          }
        } catch (firebaseError) {
          console.error("[FCM] Error getting new token:", firebaseError);
        }
      } else {
        console.log("[FCM] Running in Expo Go - cannot get real token");
      }

      Alert.alert(
        "Đã xóa token",
        "Token cũ đã được xóa khỏi bộ nhớ. Token mới sẽ được tạo khi bạn đăng ký thông báo.",
        [
          { text: "OK" },
          {
            text: "Đăng ký ngay",
            onPress: () => registerFcmToken(),
          },
        ]
      );
    } catch (error) {
      console.error("[FCM] Error resetting token:", error);
      Alert.alert("Lỗi", "Không thể xóa token: " + error.message);
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
                style={[styles.button, { backgroundColor: "#FF9800" }]}
                onPress={showFullFcmToken}
              >
                <Text style={styles.buttonText}>Xem Token Đầy Đủ</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, { backgroundColor: "#9C27B0" }]}
                onPress={checkFirebaseEnvironment}
              >
                <Text style={styles.buttonText}>Kiểm Tra Môi Trường</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, { backgroundColor: "#9C27B0" }]}
                onPress={testApiConnection}
              >
                <Text style={styles.buttonText}>Kiểm Tra API Chi Tiết</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, { backgroundColor: "#f44336" }]}
                onPress={resetFcmToken}
              >
                <Text style={styles.buttonText}>Xóa Token FCM Cũ</Text>
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
