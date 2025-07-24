import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Linking from "expo-linking";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, View } from "react-native";
import { useFcmToken } from "../hooks/useFcmToken";

export default function OAuthCallbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { registerFcmTokenAfterLogin } = useFcmToken();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        console.log(
          "[OAuthCallback] Đang xử lý callback, params:",
          JSON.stringify(params)
        );

        // Lấy token và thông tin user từ query params
        let accessToken = params.accessToken as string;
        let userStr = params.user as string;

        // Nếu không có trong params trực tiếp, thử lấy từ URL
        if (!accessToken || !userStr) {
          const url = await Linking.getInitialURL();
          console.log("[OAuthCallback] Checking URL for params:", url);

          if (url) {
            try {
              const urlObj = new URL(url);
              accessToken = urlObj.searchParams.get("accessToken") || "";
              userStr = urlObj.searchParams.get("user") || "";

              console.log("[OAuthCallback] Found params in URL:", {
                hasAccessToken: !!accessToken,
                hasUserStr: !!userStr,
              });
            } catch (error) {
              console.error("[OAuthCallback] Error parsing URL:", error);
            }
          }
        }

        if (accessToken && userStr) {
          try {
            console.log("[OAuthCallback] Parsing user data");
            const user = JSON.parse(userStr);
            console.log("[OAuthCallback] User data parsed:", user.email);

            // Lưu thông tin đăng nhập
            await AsyncStorage.setItem("accessToken", accessToken);
            await AsyncStorage.setItem("user", userStr);

            // Đăng ký FCM token nếu là admin
            if (user.role === "admin") {
              console.log(
                "[OAuthCallback] User is admin, registering FCM token"
              );
              await registerFcmTokenAfterLogin();
            }

            Alert.alert(
              "Đăng nhập thành công",
              `Xin chào ${user.fullName || user.email}!`,
              [
                {
                  text: "OK",
                  onPress: () => {
                    router.replace("/(tabs)/profile");
                  },
                },
              ]
            );
          } catch (parseError) {
            console.error(
              "[OAuthCallback] Error parsing user data:",
              parseError
            );
            if (userStr) console.error("[OAuthCallback] Raw userStr:", userStr);

            setIsProcessing(false);
            Alert.alert(
              "Đăng nhập thất bại",
              "Không thể xử lý thông tin người dùng. Vui lòng thử lại.",
              [
                {
                  text: "OK",
                  onPress: () => {
                    router.replace("/(tabs)/profile");
                  },
                },
              ]
            );
          }
        } else {
          console.error("[OAuthCallback] Missing token or user data");
          setIsProcessing(false);
          Alert.alert(
            "Đăng nhập thất bại",
            "Không thể hoàn tất đăng nhập. Thiếu thông tin xác thực.",
            [
              {
                text: "OK",
                onPress: () => {
                  router.replace("/(tabs)/profile");
                },
              },
            ]
          );
        }
      } catch (error) {
        console.error("[OAuthCallback] Error in callback handler:", error);
        setIsProcessing(false);
        Alert.alert(
          "Đăng nhập thất bại",
          "Đã xảy ra lỗi trong quá trình đăng nhập. Vui lòng thử lại.",
          [
            {
              text: "OK",
              onPress: () => {
                router.replace("/(tabs)/profile");
              },
            },
          ]
        );
      }
    };

    handleOAuthCallback();
  }, [params, router, registerFcmTokenAfterLogin]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#ff6600" />
      <Text style={styles.text}>
        {isProcessing
          ? "Đang hoàn tất đăng nhập..."
          : "Không thể hoàn tất đăng nhập"}
      </Text>
      <Text style={styles.subText}>
        {isProcessing
          ? "Vui lòng chờ trong giây lát"
          : "Vui lòng quay lại và thử lại"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  text: {
    marginTop: 20,
    fontSize: 16,
    color: "#333",
  },
  subText: {
    marginTop: 10,
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    paddingHorizontal: 40,
  },
});
