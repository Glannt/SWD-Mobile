import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useEffect, useState } from "react";
import {
  Alert,
  BackHandler,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ExternalAuthScreen() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(15);

  // Xử lý sự kiện khi người dùng nhấn nút Back trên thiết bị
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        router.replace("/(tabs)/profile");
        return true;
      }
    );

    return () => backHandler.remove();
  }, [router]);

  // Đếm ngược và tự động quay lại màn hình profile
  useEffect(() => {
    if (countdown <= 0) {
      router.replace("/(tabs)/profile");
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, router]);

  const handleReturnToApp = () => {
    router.replace("/(tabs)/profile");
  };

  const handleOpenBrowser = async () => {
    try {
      // Tạo URL redirect dùng scheme của app
      const redirectUrl = "swdmobile://oauthCallback";

      // Tạo URL đăng nhập Google
      const baseUrl = "https://swd-be-1-2-3.onrender.com/api/v1";
      const authUrl = `${baseUrl}/auth/google?redirect=${encodeURIComponent(
        redirectUrl
      )}`;

      console.log("[ExternalAuth] Mở URL đăng nhập:", authUrl);

      // Mở URL trong trình duyệt và chờ kết quả trả về
      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        redirectUrl
      );

      console.log("[ExternalAuth] WebBrowser result:", result.type);

      if (result.type === "success") {
        // Người dùng đã quay lại thành công qua deep link
        router.replace("/(tabs)/profile");
      }
    } catch (error) {
      console.error("[ExternalAuth] Error opening browser:", error);
      Alert.alert("Lỗi", "Không thể mở trình duyệt. Vui lòng thử lại sau.", [
        { text: "OK" },
      ]);
    }
  };

  return (
    <View style={styles.container}>
      <Ionicons
        name="globe-outline"
        size={80}
        color="#ff6600"
        style={styles.icon}
      />

      <Text style={styles.title}>Xác thực trong trình duyệt</Text>

      <Text style={styles.description}>
        Ứng dụng sẽ mở trình duyệt để bạn đăng nhập với Google. Sau khi hoàn
        tất, bạn sẽ được chuyển về ứng dụng tự động.
      </Text>

      <View style={styles.stepsContainer}>
        <View style={styles.stepRow}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>1</Text>
          </View>
          <Text style={styles.stepText}>
            Nhấn nút bên dưới để mở trình duyệt
          </Text>
        </View>

        <View style={styles.stepRow}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>2</Text>
          </View>
          <Text style={styles.stepText}>
            Đăng nhập với tài khoản Google của bạn
          </Text>
        </View>

        <View style={styles.stepRow}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>3</Text>
          </View>
          <Text style={styles.stepText}>
            Sau khi đăng nhập, ứng dụng sẽ tự động mở lại
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={handleOpenBrowser}
      >
        <Ionicons
          name="logo-google"
          size={20}
          color="#fff"
          style={{ marginRight: 8 }}
        />
        <Text style={styles.primaryButtonText}>Đăng nhập với Google</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={handleReturnToApp}
      >
        <Ionicons
          name="arrow-back"
          size={20}
          color="#ff6600"
          style={{ marginRight: 8 }}
        />
        <Text style={styles.secondaryButtonText}>
          Quay lại ứng dụng ({countdown}s)
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 24,
  },
  stepsContainer: {
    width: "100%",
    marginBottom: 30,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#ff6600",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  stepNumberText: {
    color: "white",
    fontWeight: "bold",
  },
  stepText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  primaryButton: {
    backgroundColor: "#ff6600",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginBottom: 12,
  },
  primaryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  secondaryButton: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ff6600",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  secondaryButtonText: {
    color: "#ff6600",
    fontSize: 16,
    fontWeight: "bold",
  },
});
