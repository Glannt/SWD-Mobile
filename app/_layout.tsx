import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import * as Linking from "expo-linking";
import { Redirect, SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as WebBrowser from "expo-web-browser";
import { useEffect } from "react";
import { LogBox, Platform } from "react-native";
import "react-native-reanimated";

// Tắt tất cả cảnh báo hiển thị trên giao diện
LogBox.ignoreAllLogs();

// Đăng ký để xử lý các phiên xác thực
WebBrowser.maybeCompleteAuthSession();

// Cấu hình prefixes cho deep linking
const prefix = Linking.createURL("/");
const scheme = "swdmobile";

import { useColorScheme } from "@/hooks/useColorScheme";
import { AuthProvider } from "./AuthContext";
import { NotificationProvider } from "./NotificationContext";

// Ngăn SplashScreen tự động ẩn
SplashScreen.preventAutoHideAsync().catch(() => {
  // Nếu có lỗi, bỏ qua - có thể splash đã bị ẩn
});

// Component cho path "/" để redirect đến "/home"
export function Index() {
  return <Redirect href="/home" />;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded, fontError] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  // Xử lý deep linking khi ứng dụng đã được mở
  useEffect(() => {
    // Kiểm tra URL ban đầu
    const getInitialURL = async () => {
      try {
        const initialURL = await Linking.getInitialURL();
        console.log("[DeepLink DEBUG] App khởi động với URL:", initialURL);

        if (initialURL) {
          console.log("[DeepLink DEBUG] Phân tích URL khởi động:", {
            url: initialURL,
            isOAuthCallback: initialURL.includes("oauthCallback"),
          });

          // Parse params từ URL
          try {
            const urlObj = new URL(initialURL);
            console.log(
              "[DeepLink DEBUG] URL params:",
              Array.from(urlObj.searchParams.entries())
            );
          } catch (parseError) {
            console.error("[DeepLink DEBUG] Không thể parse URL:", parseError);
          }
        }
      } catch (error) {
        console.error("[DeepLink DEBUG] Lỗi khi lấy URL khởi động:", error);
      }
    };

    // Lắng nghe URL mới
    const handleNewURL = (event: { url: string }) => {
      console.log("[DeepLink DEBUG] Nhận URL mới:", event.url);

      // Parse params từ URL
      try {
        const urlObj = new URL(event.url);
        console.log(
          "[DeepLink DEBUG] New URL params:",
          Array.from(urlObj.searchParams.entries())
        );
        console.log(
          "[DeepLink DEBUG] Có phải OAuth callback?",
          event.url.includes("oauthCallback")
        );
      } catch (parseError) {
        console.error("[DeepLink DEBUG] Không thể parse URL mới:", parseError);
      }
    };

    console.log("[DeepLink DEBUG] Đăng ký lắng nghe URL events");
    const subscription = Linking.addEventListener("url", handleNewURL);

    getInitialURL();

    return () => {
      console.log("[DeepLink DEBUG] Hủy đăng ký lắng nghe URL events");
      subscription.remove();
    };
  }, []);

  // Thiết lập Firebase và ẩn splash screen sau khi đã sẵn sàng
  useEffect(() => {
    // Kiểm tra môi trường
    console.log("[App] Initializing on platform:", Platform.OS);

    // ============= DEBUG LOGGING ============= //
    console.log("==== ENVIRONMENT DEBUG LOG ====");
    console.log("[ENV DEBUG] __DEV__:", __DEV__);
    console.log(
      "[ENV DEBUG] process.env.EAS_BUILD_RUNNER:",
      process.env.EAS_BUILD_RUNNER
    );
    console.log("[ENV DEBUG] Platform.OS:", Platform.OS);
    console.log("[ENV DEBUG] expo object exists?:", global.expo !== undefined);

    // FORCE không dùng Expo Go mode (để dùng real Firebase)
    const FORCE_REAL_ENVIRONMENT = true;
    console.log("=================================");
    console.log("[OVERRIDE] Force real environment:", FORCE_REAL_ENVIRONMENT);
    console.log("=================================");
    // ============= END DEBUG LOGGING ============= //

    // Sửa cách kiểm tra môi trường Expo Go
    const isExpoGo = () => {
      console.log(
        "\n\n==================== ENVIRONMENT CHECK LOG ===================="
      );
      console.log("💡 CHECKING ENVIRONMENT IN _layout.tsx...");

      // Force đầu tiên
      if (FORCE_REAL_ENVIRONMENT) {
        console.log("🔴 FORCE_REAL_ENVIRONMENT is TRUE in _layout.tsx");
        console.log("Should force using real Firebase implementation");
        console.log(
          "==================== END ENVIRONMENT CHECK ====================\n\n"
        );
        return false;
      }

      try {
        // Kiểm tra chi tiết hơn về môi trường
        console.log("📱 Device environment variables:");
        console.log("- __DEV__:", __DEV__);
        console.log("- EAS_BUILD_RUNNER:", process.env.EAS_BUILD_RUNNER);
        console.log("- expo global object exists:", global.expo !== undefined);
        console.log("- Platform.OS:", Platform.OS);

        // 1. Kiểm tra biến môi trường trực tiếp
        if (process.env.EAS_BUILD_RUNNER) {
          console.log("✅ EAS_BUILD_RUNNER detected, not in Expo Go");
          console.log(
            "==================== END ENVIRONMENT CHECK ====================\n\n"
          );
          return false;
        }

        // 2. Kiểm tra global.expo (dấu hiệu chạy trong Expo Go)
        if (global.expo !== undefined) {
          console.log("❌ global.expo detected, likely in Expo Go");
          console.log(
            "==================== END ENVIRONMENT CHECK ====================\n\n"
          );
          return true;
        }

        // 3. Kiểm tra expo constant
        try {
          const Constants = require("expo-constants");
          const executionEnvironment = Constants.default?.executionEnvironment;
          console.log("- executionEnvironment:", executionEnvironment);

          if (executionEnvironment === "bare") {
            console.log("✅ Bare workflow detected, not in Expo Go");
            console.log(
              "==================== END ENVIRONMENT CHECK ====================\n\n"
            );
            return false;
          }
          if (executionEnvironment === "managed") {
            console.log("❌ Managed workflow detected, likely in Expo Go");
            console.log(
              "==================== END ENVIRONMENT CHECK ====================\n\n"
            );
            return true;
          }
        } catch (error) {
          console.log("⚠️ Error checking Constants:", error);
        }

        // 4. Thử kiểm tra khả năng truy cập tới native modules Firebase
        try {
          console.log("📲 Trying to import @react-native-firebase/app...");
          const firebase = require("@react-native-firebase/app");
          if (firebase && typeof firebase === "object") {
            console.log("✅ Firebase module accessible, not in Expo Go");
            // Kiểm tra phiên bản Firebase
            try {
              console.log("- Firebase SDK version:", firebase.SDK_VERSION);
              console.log("- Firebase app name:", firebase.app()?.name);
              console.log("- Firebase apps initialized:", firebase.apps.length);
            } catch (versionError) {
              console.log("⚠️ Could not get Firebase details:", versionError);
            }
            console.log(
              "==================== END ENVIRONMENT CHECK ====================\n\n"
            );
            return false;
          }
        } catch (error) {
          console.log("❌ Firebase import error:", error.message);
          console.log("Likely in Expo Go or Firebase not configured properly");
        }

        // Mặc định dựa vào __DEV__ nếu tất cả cách khác thất bại
        const isDev = __DEV__ && !process.env.EAS_BUILD_RUNNER;
        console.log("⚠️ Using default detection method, Expo Go:", isDev);
        console.log(
          "==================== END ENVIRONMENT CHECK ====================\n\n"
        );
        return isDev;
      } catch (error) {
        console.error("❌ Error in isExpoGo check:", error);
        console.log(
          "==================== END ENVIRONMENT CHECK ====================\n\n"
        );
        // Nếu có lỗi, giả định là không chạy trong Expo Go để sử dụng Firebase thật
        return false;
      }
    };

    const setupFirebase = async () => {
      try {
        const runningInExpoGo = isExpoGo();
        console.log("[App] Running in Expo Go?", runningInExpoGo);

        if (runningInExpoGo) {
          console.log("[App] Running in Expo Go - using mock Firebase");

          // Đảm bảo tải mock service thành công
          try {
            const mockFirebase = require("../services/mockFirebase");
            mockFirebase.setupForegroundNotificationHandler(() => {
              console.log("[Mock Firebase] Test foreground handler called");
            });
            console.log("[App] Mock Firebase setup completed");
          } catch (mockError) {
            console.error("[App] Error setting up mock Firebase:", mockError);
          }
        } else {
          console.log("[App] Setting up Firebase in development build");
          try {
            // Cố gắng import Firebase để kiểm tra
            const firebaseApp = require("@react-native-firebase/app").default;

            // Kiểm tra xem Firebase đã được khởi tạo chưa
            if (!firebaseApp.apps.length) {
              console.log("[App] Firebase not initialized, initializing now");
              try {
                await firebaseApp.initializeApp({});
                console.log("[App] Firebase initialized successfully");
              } catch (initError) {
                console.error(
                  "[App] Firebase initialization error:",
                  initError
                );
              }
            } else {
              console.log(
                "[App] Firebase already initialized with",
                firebaseApp.apps.length,
                "apps"
              );
            }
          } catch (error) {
            console.error("[App] Error loading Firebase:", error);
          }
        }
      } catch (error) {
        console.error("[App] Error in setupFirebase:", error);
      } finally {
        // Đảm bảo luôn ẩn splash screen sau khi hoàn thành việc khởi tạo
        try {
          await SplashScreen.hideAsync();
        } catch (splashError) {
          console.error("[App] Error hiding splash screen:", splashError);
        }
      }
    };

    // Chỉ tiếp tục khi font đã load xong hoặc có lỗi
    if (fontsLoaded || fontError) {
      setupFirebase();
    }
  }, [fontsLoaded, fontError]);

  // Trả về null để giữ màn hình splash hiển thị khi fonts chưa load xong
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <AuthProvider>
      <NotificationProvider>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="admin" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}
