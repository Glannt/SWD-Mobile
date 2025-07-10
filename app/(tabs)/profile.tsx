import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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

const editInfoStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 24,
    paddingTop: Platform.OS === "android" ? 50 : 24, // Add more padding on Android
  },
  backBtn: { padding: 4, borderRadius: 8, marginBottom: 16 },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 24,
    alignSelf: "center",
    color: "#23232b",
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#23232b",
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    marginBottom: 18,
    height: 48,
    width: "100%",
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#23232b",
    padding: 0,
  },
  editIcon: {
    marginLeft: 8,
  },
  saveBtn: {
    width: "100%",
    backgroundColor: "#23232b",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 18,
  },
  saveBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
});

const changePasswordStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 24,
    paddingTop: Platform.OS === "android" ? 50 : 24, // Add more padding on Android
  },
  backBtn: { padding: 4, borderRadius: 8, marginBottom: 16 },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 24,
    alignSelf: "center",
    color: "#23232b",
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#23232b",
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    marginBottom: 18,
    height: 48,
    width: "100%",
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: 15, color: "#23232b", padding: 0 },
  editIcon: { marginLeft: 8 },
  saveBtn: {
    width: "100%",
    backgroundColor: "#23232b",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 18,
  },
  saveBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});

const forgotStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 24,
    paddingTop: Platform.OS === "android" ? 70 : 50, // Add more padding on Android
  },
  backBtn: { padding: 4, borderRadius: 8, marginBottom: 16 },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#23232b",
  },
  desc: { color: "#888", fontSize: 14, marginBottom: 24 },
  emailBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#23232b",
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    backgroundColor: "#fff",
  },
  emailIcon: { marginRight: 16 },
  emailTextWrap: { flex: 1 },
  emailTitle: { fontWeight: "bold", fontSize: 15, color: "#23232b" },
  emailDesc: { color: "#888", fontSize: 13 },
  nextBtn: {
    width: "100%",
    backgroundColor: "#23232b",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 18,
  },
  nextBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});

const profileStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6f8fb",
    padding: 16,
    paddingTop: Platform.OS === "android" ? 50 : 16, // Add more padding on Android
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 18,
    color: "#23232b",
    alignSelf: "center",
  },
  box: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  boxTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#23232b",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  label: { color: "#888", fontSize: 15 },
  value: {
    color: "#23232b",
    fontSize: 15,
    fontWeight: "500",
    flexShrink: 1,
    textAlign: "right",
  },
  adminButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ff6600",
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 18,
  },
  adminButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  },
});

export default function ProfileScreen() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showOption, setShowOption] = useState(false);
  const [showEditInfo, setShowEditInfo] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  // Đăng nhập state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  // Đăng ký state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regShowPassword, setRegShowPassword] = useState(false);
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState("");
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");
  const { accessToken, userId, setAuth, clearAuth } = useAuth();
  const router = useRouter();

  // Kiểm tra trạng thái đăng nhập mỗi khi component được mount hoặc accessToken thay đổi
  useEffect(() => {
    console.log("[PROFILE] Checking auth state, accessToken:", !!accessToken);
    if (accessToken) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
      setProfile(null);
      setShowOption(false);
      setShowEditInfo(false);
      setShowChangePassword(false);
    }
  }, [accessToken]);

  const handleLogin = async () => {
    setLoginLoading(true);
    setLoginError("");
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
        }),
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Lỗi đăng nhập");
      }
      const data = await res.json();
      console.log("[PROFILE] Login response:", JSON.stringify(data, null, 2));

      // Phân tích cấu trúc data để lấy token và thông tin user
      const responseData = data.data || data;
      const token = responseData.accessToken || responseData.access_token || "";

      // Tìm thông tin user trong các vị trí có thể
      let userData = null;

      // Tìm userData ở các vị trí khác nhau trong response
      if (responseData.user && typeof responseData.user === "object") {
        userData = responseData.user;
        console.log("[PROFILE] Found user data in responseData.user");
      } else if (responseData._id || responseData.user_id) {
        // Nếu thông tin user nằm ở root
        userData = responseData;
        console.log("[PROFILE] Using root data as user data");
      }

      // Đảm bảo có đủ thông tin user cần thiết
      if (!userData) {
        console.error("[PROFILE] Missing user data in login response");
        throw new Error("Không tìm thấy thông tin người dùng");
      }

      // Log tất cả thông tin user để debug
      console.log("[PROFILE] User data:", JSON.stringify(userData, null, 2));

      // Kiểm tra và log thông tin về role
      console.log("[PROFILE] Checking for role information:");
      if (userData.role) {
        console.log(
          "[PROFILE] Found role directly in userData:",
          userData.role
        );
      } else if (userData.roles) {
        console.log("[PROFILE] Found roles array in userData:", userData.roles);
      } else if (userData.userRole) {
        console.log("[PROFILE] Found userRole in userData:", userData.userRole);
      } else if (userData.user_role) {
        console.log(
          "[PROFILE] Found user_role in userData:",
          userData.user_role
        );
      } else if (responseData.role) {
        console.log("[PROFILE] Found role in responseData:", responseData.role);
      } else if (responseData.roles) {
        console.log(
          "[PROFILE] Found roles in responseData:",
          responseData.roles
        );
      } else {
        console.log("[PROFILE] No role information found in response");
      }

      // Lấy các ID cần thiết - xử lý nhiều trường hợp có thể
      const userId = userData.user_id || userData.userId || "";

      // Trích xuất MongoDB ObjectId (xử lý nhiều định dạng có thể)
      let userObjectId = "";

      // Kiểm tra các trường hợp có thể
      if (
        userData._id &&
        typeof userData._id === "string" &&
        /^[0-9a-fA-F]{24}$/.test(userData._id)
      ) {
        userObjectId = userData._id;
      } else if (
        userData._id &&
        typeof userData._id === "object" &&
        userData._id.$oid
      ) {
        // Trường hợp MongoDB extended JSON format { "$oid": "..." }
        userObjectId = userData._id.$oid;
      } else if (
        userData.id &&
        typeof userData.id === "string" &&
        /^[0-9a-fA-F]{24}$/.test(userData.id)
      ) {
        userObjectId = userData.id;
      } else if (userData.objectId && typeof userData.objectId === "string") {
        userObjectId = userData.objectId;
      }

      console.log("[PROFILE] Extracted auth data:", {
        token: token ? "Found" : "Missing",
        userId,
        userObjectId,
      });

      if (!userObjectId) {
        console.warn("[PROFILE] No valid MongoDB ObjectId found in user data");
      }

      // Lưu thông tin đăng nhập vào AuthContext và lưu toàn bộ userData
      setAuth(token, userId, userObjectId, userData);

      setIsLoggedIn(true);
      setEmail("");
      setPassword("");
    } catch (error) {
      console.error("[PROFILE] Login error:", error);
      setLoginError(error.message || "Có lỗi xảy ra");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async () => {
    if (regPassword !== regConfirmPassword) {
      setRegisterError("Mật khẩu xác nhận không khớp.");
      return;
    }
    setRegisterLoading(true);
    setRegisterError("");
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: regEmail,
          password: regPassword,
          fullName: regName,
          confirmPassword: regConfirmPassword,
          isRegister: true,
        }),
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json();
        setRegisterError(err.message || "Đăng ký thất bại");
        setRegisterLoading(false);
        return;
      }
      const data = await res.json();
      console.log(
        "[MOBILE REGISTER] Complete data response:",
        JSON.stringify(data, null, 2)
      );

      // Lấy các trường cần thiết từ phản hồi
      const responseData = data.data || data;
      const userData = responseData.user || responseData;

      const userId = userData.user_id || userData.userId || "";
      const userObjectId = userData._id || "";
      const accessToken =
        responseData.accessToken || responseData.access_token || "";

      // Kiểm tra thông tin role trong phản hồi
      console.log("[MOBILE REGISTER] Checking for role information:");
      if (userData.role) {
        console.log(
          "[MOBILE REGISTER] Found role directly in userData:",
          userData.role
        );
      } else if (userData.roles) {
        console.log(
          "[MOBILE REGISTER] Found roles array in userData:",
          userData.roles
        );
      } else if (userData.userRole) {
        console.log(
          "[MOBILE REGISTER] Found userRole in userData:",
          userData.userRole
        );
      } else if (userData.user_role) {
        console.log(
          "[MOBILE REGISTER] Found user_role in userData:",
          userData.user_role
        );
      } else if (responseData.role) {
        console.log(
          "[MOBILE REGISTER] Found role in responseData:",
          responseData.role
        );
      } else if (responseData.roles) {
        console.log(
          "[MOBILE REGISTER] Found roles in responseData:",
          responseData.roles
        );
      } else {
        console.log("[MOBILE REGISTER] No role information found in response");
      }

      console.log(
        "[MOBILE REGISTER] userId:",
        userId,
        "userObjectId:",
        userObjectId,
        "accessToken:",
        accessToken
      );

      setIsLoggedIn(true);
      setAuth(accessToken || "", userId || "", userObjectId || "", userData);

      setRegisterLoading(false);
    } catch (e) {
      console.error("[MOBILE REGISTER] Error:", e);
      setRegisterError("Lỗi kết nối server");
      setRegisterLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      console.log("[PROFILE] Starting logout process");

      if (accessToken) {
        console.log("[PROFILE] Calling logout API");
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });
      } else {
        console.log("[PROFILE] No access token, skipping API call");
      }

      console.log("[PROFILE] Clearing AsyncStorage directly");
      // Xóa dữ liệu trực tiếp từ AsyncStorage
      const keysToRemove = ["access_token", "user"];
      await AsyncStorage.multiRemove(keysToRemove);

      // Kiểm tra xem đã xóa thành công chưa
      const tokenAfter = await AsyncStorage.getItem("access_token");
      const userAfter = await AsyncStorage.getItem("user");
      console.log("[PROFILE] AsyncStorage after direct clear:", {
        tokenExists: !!tokenAfter,
        userExists: !!userAfter,
      });

      // Nếu vẫn còn dữ liệu, thử xóa lại từng item
      if (tokenAfter || userAfter) {
        console.log(
          "[PROFILE] Some data still exists, trying individual removal"
        );
        if (tokenAfter) await AsyncStorage.removeItem("access_token");
        if (userAfter) await AsyncStorage.removeItem("user");
      }
    } catch (e) {
      console.log("[PROFILE] Logout request failed, clearing state anyway", e);
    } finally {
      // Xóa thông tin đăng nhập thông qua context
      console.log("[PROFILE] Clearing auth context");
      await clearAuth();

      // Reset tất cả state trong component
      setIsLoggedIn(false);
      setProfile(null);
      setEmail("");
      setPassword("");
      setLoginError("");
      setShowOption(false);
      setShowEditInfo(false);
      setShowChangePassword(false);
      setShowRegister(false);
      setShowForgot(false);

      // Kiểm tra lại sau khi đăng xuất
      const tokenFinal = await AsyncStorage.getItem("access_token");
      const userFinal = await AsyncStorage.getItem("user");
      console.log("[PROFILE] Final AsyncStorage check:", {
        tokenExists: !!tokenFinal,
        userExists: !!userFinal,
      });

      // Đảm bảo người dùng được chuyển về trang profile sau khi đăng xuất
      try {
        console.log("[PROFILE] Redirecting after logout");
        router.navigate("/(tabs)/profile");
      } catch (e) {
        console.error("[PROFILE] Error redirecting after logout:", e);
      }
    }
  };

  useEffect(() => {
    if (isLoggedIn && userId) {
      setProfileLoading(true);
      setProfileError("");
      fetch(`${API_BASE_URL}/users/${userId}`, {
        credentials: "include",
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("[PROFILE FETCH] API response:", data);
          setProfile(data.data ? data.data : data);
          setProfileLoading(false);
        })
        .catch((err) => {
          console.log("[PROFILE FETCH ERROR]", err);
          setProfileError("Không lấy được thông tin tài khoản");
          setProfileLoading(false);
        });
    }
  }, [isLoggedIn, userId, accessToken]);

  if (isLoggedIn && showOption && showEditInfo) {
    return (
      <View style={editInfoStyles.container}>
        <TouchableOpacity
          style={editInfoStyles.backBtn}
          onPress={() => setShowEditInfo(false)}
        >
          <Ionicons name="arrow-back" size={24} color="#222" />
        </TouchableOpacity>
        <Text style={editInfoStyles.title}>Sửa Thông Tin</Text>
        <View style={editInfoStyles.inputWrap}>
          <Ionicons
            name="person-outline"
            size={20}
            color="#bbb"
            style={editInfoStyles.inputIcon}
          />
          <TextInput
            style={editInfoStyles.input}
            placeholder="HỌ TÊN"
            placeholderTextColor="#bbb"
            editable={false}
          />
          <Ionicons
            name="create-outline"
            size={20}
            color="#bbb"
            style={editInfoStyles.editIcon}
          />
        </View>
        <View style={editInfoStyles.inputWrap}>
          <Ionicons
            name="mail-outline"
            size={20}
            color="#bbb"
            style={editInfoStyles.inputIcon}
          />
          <TextInput
            style={editInfoStyles.input}
            placeholder="EMAIL"
            placeholderTextColor="#bbb"
            editable={false}
          />
          <Ionicons
            name="create-outline"
            size={20}
            color="#bbb"
            style={editInfoStyles.editIcon}
          />
        </View>
        <TouchableOpacity style={editInfoStyles.saveBtn}>
          <Text style={editInfoStyles.saveBtnText}>LƯU THAY ĐỔI</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoggedIn && showOption && showChangePassword) {
    return (
      <View style={changePasswordStyles.container}>
        <TouchableOpacity
          style={changePasswordStyles.backBtn}
          onPress={() => setShowChangePassword(false)}
        >
          <Ionicons name="arrow-back" size={24} color="#222" />
        </TouchableOpacity>
        <Text style={changePasswordStyles.title}>Đổi Mật Khẩu</Text>
        <View style={changePasswordStyles.inputWrap}>
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color="#bbb"
            style={changePasswordStyles.inputIcon}
          />
          <TextInput
            style={changePasswordStyles.input}
            placeholder="Mật khẩu cũ"
            placeholderTextColor="#bbb"
            secureTextEntry={!showOld}
            value={oldPassword}
            onChangeText={setOldPassword}
          />
          <TouchableOpacity onPress={() => setShowOld((v) => !v)}>
            <Ionicons
              name={showOld ? "eye-off-outline" : "eye-outline"}
              size={20}
              color="#bbb"
              style={changePasswordStyles.editIcon}
            />
          </TouchableOpacity>
        </View>
        <View style={changePasswordStyles.inputWrap}>
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color="#bbb"
            style={changePasswordStyles.inputIcon}
          />
          <TextInput
            style={changePasswordStyles.input}
            placeholder="Mật khẩu mới"
            placeholderTextColor="#bbb"
            secureTextEntry={!showNew}
            value={newPassword}
            onChangeText={setNewPassword}
          />
          <TouchableOpacity onPress={() => setShowNew((v) => !v)}>
            <Ionicons
              name={showNew ? "eye-off-outline" : "eye-outline"}
              size={20}
              color="#bbb"
              style={changePasswordStyles.editIcon}
            />
          </TouchableOpacity>
        </View>
        <View style={changePasswordStyles.inputWrap}>
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color="#bbb"
            style={changePasswordStyles.inputIcon}
          />
          <TextInput
            style={changePasswordStyles.input}
            placeholder="Xác nhận mật khẩu mới"
            placeholderTextColor="#bbb"
            secureTextEntry={!showConfirm}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <TouchableOpacity onPress={() => setShowConfirm((v) => !v)}>
            <Ionicons
              name={showConfirm ? "eye-off-outline" : "eye-outline"}
              size={20}
              color="#bbb"
              style={changePasswordStyles.editIcon}
            />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={changePasswordStyles.saveBtn}>
          <Text style={changePasswordStyles.saveBtnText}>LƯU THAY ĐỔI</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoggedIn && showOption) {
    return (
      <View style={optionStyles.container}>
        <TouchableOpacity
          style={optionStyles.backBtn}
          onPress={() => setShowOption(false)}
        >
          <Ionicons name="arrow-back" size={24} color="#222" />
        </TouchableOpacity>
        <Text style={optionStyles.title}>Tùy chọn</Text>
        <TouchableOpacity
          style={optionStyles.itemRow}
          onPress={() => setShowEditInfo(true)}
        >
          <Ionicons
            name="person-outline"
            size={28}
            color="#222"
            style={optionStyles.icon}
          />
          <View>
            <Text style={optionStyles.itemTitle}>Thông tin tài khoản</Text>
            <Text style={optionStyles.itemDesc}>
              Thay đổi thông tin tài khoản
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={optionStyles.itemRow}
          onPress={() => setShowChangePassword(true)}
        >
          <Ionicons
            name="eye-outline"
            size={28}
            color="#222"
            style={optionStyles.icon}
          />
          <View>
            <Text style={optionStyles.itemTitle}>Mật khẩu</Text>
            <Text style={optionStyles.itemDesc}>Thay đổi mật khẩu</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  if (!isLoggedIn && showRegister) {
    // Trang Đăng ký
    return (
      <View style={loginStyles.container}>
        <Text style={loginStyles.title}>Tạo tài khoản</Text>
        <View style={loginStyles.inputWrap}>
          <Ionicons
            name="person-outline"
            size={20}
            color="#888"
            style={loginStyles.inputIcon}
          />
          <TextInput
            style={loginStyles.input}
            placeholder="Họ và tên"
            value={regName}
            onChangeText={setRegName}
            autoCapitalize="words"
            placeholderTextColor="#888"
          />
        </View>
        <View style={loginStyles.inputWrap}>
          <Ionicons
            name="mail-outline"
            size={20}
            color="#888"
            style={loginStyles.inputIcon}
          />
          <TextInput
            style={loginStyles.input}
            placeholder="Email"
            value={regEmail}
            onChangeText={setRegEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#888"
          />
        </View>
        <View style={loginStyles.inputWrap}>
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color="#888"
            style={loginStyles.inputIcon}
          />
          <TextInput
            style={loginStyles.input}
            placeholder="Mật khẩu"
            value={regPassword}
            onChangeText={setRegPassword}
            secureTextEntry={!regShowPassword}
            autoCapitalize="none"
            placeholderTextColor="#888"
          />
          <TouchableOpacity onPress={() => setRegShowPassword((v) => !v)}>
            <Ionicons
              name={regShowPassword ? "eye-off-outline" : "eye-outline"}
              size={20}
              color="#888"
            />
          </TouchableOpacity>
        </View>
        <View style={loginStyles.inputWrap}>
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color="#888"
            style={loginStyles.inputIcon}
          />
          <TextInput
            style={loginStyles.input}
            placeholder="Nhập lại mật khẩu"
            value={regConfirmPassword}
            onChangeText={setRegConfirmPassword}
            secureTextEntry={!regShowPassword}
            autoCapitalize="none"
            placeholderTextColor="#888"
          />
        </View>
        {registerError ? (
          <Text style={{ color: "red", marginBottom: 8 }}>{registerError}</Text>
        ) : null}
        <TouchableOpacity
          style={loginStyles.loginBtn}
          onPress={handleRegister}
          disabled={registerLoading}
        >
          <Text style={loginStyles.loginBtnText}>
            {registerLoading ? "Đang đăng ký..." : "Đăng ký"}
          </Text>
        </TouchableOpacity>
        <View style={loginStyles.registerRow}>
          <Text style={loginStyles.registerLabel}>Bạn đã có tài khoản? </Text>
          <TouchableOpacity onPress={() => setShowRegister(false)}>
            <Text style={[loginStyles.registerText, { fontWeight: "700" }]}>
              Đăng Nhập
            </Text>
          </TouchableOpacity>
        </View>
        <View style={loginStyles.dividerWrap}>
          <View style={loginStyles.divider} />
          <Text style={loginStyles.dividerText}>Tiếp tục với tài khoản</Text>
          <View style={loginStyles.divider} />
        </View>
        <TouchableOpacity style={loginStyles.googleBtn}>
          <Text style={loginStyles.googleBtnText}>GOOGLE</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!isLoggedIn && showForgot) {
    return (
      <View style={forgotStyles.container}>
        <Text style={forgotStyles.title}>Quên mật khẩu</Text>
        <Text style={forgotStyles.desc}>
          Chọn thông tin liên hệ mà chúng tôi sẽ sử dụng để đặt lại mật khẩu của
          bạn
        </Text>
        <View style={forgotStyles.emailBox}>
          <Ionicons
            name="mail-outline"
            size={28}
            color="#23232b"
            style={forgotStyles.emailIcon}
          />
          <View style={forgotStyles.emailTextWrap}>
            <Text style={forgotStyles.emailTitle}>Email</Text>
            <Text style={forgotStyles.emailDesc}>
              Mã sẽ được gửi đến email của bạn
            </Text>
          </View>
        </View>
        <TouchableOpacity style={forgotStyles.nextBtn}>
          <Text style={forgotStyles.nextBtnText}>Next</Text>
        </TouchableOpacity>

        {/* Added back navigation option */}
        <TouchableOpacity
          style={{ marginTop: 16, alignSelf: "center" }}
          onPress={() => setShowForgot(false)}
        >
          <Text style={{ color: "#23232b", fontWeight: "700" }}>
            Quay lại đăng nhập
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!isLoggedIn) {
    // Trang Đăng nhập
    return (
      <View style={loginStyles.container}>
        <Text style={loginStyles.title}>Đăng nhập</Text>
        <View style={loginStyles.inputWrap}>
          <Ionicons
            name="mail-outline"
            size={20}
            color="#888"
            style={loginStyles.inputIcon}
          />
          <TextInput
            style={loginStyles.input}
            placeholder="Nhập email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#888"
          />
        </View>
        <View style={loginStyles.inputWrap}>
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color="#888"
            style={loginStyles.inputIcon}
          />
          <TextInput
            style={loginStyles.input}
            placeholder="Mật khẩu"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            placeholderTextColor="#888"
          />
          <TouchableOpacity onPress={() => setShowPassword((v) => !v)}>
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={20}
              color="#888"
            />
          </TouchableOpacity>
        </View>
        {loginError ? (
          <Text style={{ color: "red", marginBottom: 8 }}>{loginError}</Text>
        ) : null}
        <TouchableOpacity
          style={loginStyles.forgotBtn}
          onPress={() => setShowForgot(true)}
        >
          <Text style={loginStyles.forgot}>Quên mật khẩu?</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={loginStyles.loginBtn}
          onPress={handleLogin}
          disabled={loginLoading}
        >
          <Text style={loginStyles.loginBtnText}>
            {loginLoading ? "Đang đăng nhập..." : "Đăng nhập"}
          </Text>
        </TouchableOpacity>
        <View style={loginStyles.registerRow}>
          <Text style={loginStyles.registerLabel}>Chưa có tài khoản? </Text>
          <TouchableOpacity onPress={() => setShowRegister(true)}>
            <Text style={loginStyles.registerText}>Đăng Ký</Text>
          </TouchableOpacity>
        </View>
        <View style={loginStyles.dividerWrap}>
          <View style={loginStyles.divider} />
          <Text style={loginStyles.dividerText}>Tiếp tục với tài khoản</Text>
          <View style={loginStyles.divider} />
        </View>
        <TouchableOpacity style={loginStyles.googleBtn}>
          <Text style={loginStyles.googleBtnText}>GOOGLE</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoggedIn && !showOption && !showEditInfo && !showChangePassword) {
    if (profileLoading) {
      return (
        <View style={profileStyles.container}>
          <Text>Đang tải thông tin...</Text>
        </View>
      );
    }
    if (profileError) {
      return (
        <View style={profileStyles.container}>
          <Text style={{ color: "red" }}>{profileError}</Text>
        </View>
      );
    }
    if (!profile) {
      return (
        <View style={profileStyles.container}>
          <Text>Không có dữ liệu người dùng.</Text>
        </View>
      );
    }
    // Dữ liệu thực tế từ API
    const user = profile as any;
    return (
      <ScrollView style={profileStyles.container}>
        <Text style={profileStyles.pageTitle}>Thông tin tài khoản</Text>

        {/* Admin dashboard button - only for admin users */}
        {user.role === "admin" && (
          <TouchableOpacity
            style={profileStyles.adminButton}
            onPress={() => router.push("/(tabs)/dashboard")}
          >
            <Ionicons name="analytics-outline" size={24} color="#fff" />
            <Text style={profileStyles.adminButtonText}>
              Truy cập trang quản trị
            </Text>
          </TouchableOpacity>
        )}

        {/* Thông tin cá nhân */}
        <View style={profileStyles.box}>
          <Text style={profileStyles.boxTitle}>Thông tin cơ bản</Text>
          <View style={profileStyles.row}>
            <Text style={profileStyles.label}>Họ và tên</Text>
            <Text style={profileStyles.value}>{user.fullName}</Text>
          </View>
          <View style={profileStyles.row}>
            <Text style={profileStyles.label}>Email</Text>
            <Text style={profileStyles.value}>{user.email}</Text>
          </View>
          <View style={profileStyles.row}>
            <Text style={profileStyles.label}>Vai trò</Text>
            <Text style={profileStyles.value}>{user.role}</Text>
          </View>
          <View style={profileStyles.row}>
            <Text style={profileStyles.label}>Trạng thái</Text>
            <Text
              style={[
                profileStyles.value,
                {
                  color:
                    user.status === "active" || user.status === "Hoạt động"
                      ? "#22c55e"
                      : "#ef4444",
                },
              ]}
            >
              {user.status === "active" ? "Hoạt động" : user.status}
            </Text>
          </View>
        </View>
        <View style={profileStyles.box}>
          <Text style={profileStyles.boxTitle}>Thông tin tài khoản</Text>
          <View style={profileStyles.row}>
            <Text style={profileStyles.label}>ID người dùng</Text>
            <Text style={profileStyles.value}>{user.user_id}</Text>
          </View>
          <View style={profileStyles.row}>
            <Text style={profileStyles.label}>Xác thực email</Text>
            <Text
              style={[
                profileStyles.value,
                { color: user.isVerified ? "#22c55e" : "#ef4444" },
              ]}
            >
              {user.isVerified ? "Đã xác thực" : "Chưa xác thực"}
            </Text>
          </View>
        </View>
        <View style={profileStyles.box}>
          <Text style={profileStyles.boxTitle}>Thông tin thời gian</Text>
          <View style={profileStyles.row}>
            <Text style={profileStyles.label}>Ngày tạo tài khoản</Text>
            <Text style={profileStyles.value}>
              {user.createdAt
                ? new Date(user.createdAt).toLocaleString("vi-VN")
                : ""}
            </Text>
          </View>
          <View style={profileStyles.row}>
            <Text style={profileStyles.label}>Cập nhật lần cuối</Text>
            <Text style={profileStyles.value}>
              {user.updatedAt
                ? new Date(user.updatedAt).toLocaleString("vi-VN")
                : ""}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={{
            marginTop: 24,
            backgroundColor: "#ef4444",
            borderRadius: 12,
            paddingVertical: 14,
            alignItems: "center",
          }}
          onPress={handleLogout}
        >
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>
            Đăng xuất
          </Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => setIsLoggedIn(false)}
        >
          <Ionicons name="arrow-back" size={24} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hồ sơ</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Avatar */}
      <View style={styles.avatarWrap}>
        <Image
          source={{ uri: "https://randomuser.me/api/portraits/men/32.jpg" }}
          style={styles.avatar}
        />
        <View style={styles.dot} />
      </View>
      <Text style={styles.name}>Tom Hillson</Text>
      <Text style={styles.email}>Tomhill@mail.com</Text>

      {/* Options */}
      <TouchableOpacity
        style={styles.optionRow}
        onPress={() => setShowOption(true)}
      >
        <Ionicons
          name="settings-outline"
          size={24}
          color="#222"
          style={styles.optionIcon}
        />
        <Text style={styles.optionText}>Tùy Chọn</Text>
        <Ionicons
          name="chevron-forward"
          size={20}
          color="#bbb"
          style={{ marginLeft: "auto" }}
        />
      </TouchableOpacity>
      <View style={styles.optionRow}>
        <Ionicons
          name="lock-closed-outline"
          size={24}
          color="#222"
          style={styles.optionIcon}
        />
        <Text style={styles.optionText}>Bảo mật tài khoản</Text>
        <View style={styles.progressBarWrap}>
          <View style={styles.progressBar} />
        </View>
      </View>
      <Text style={styles.rating}>Xuất sắc</Text>
      <View style={styles.optionRow}>
        <Ionicons
          name="help-circle-outline"
          size={24}
          color="#222"
          style={styles.optionIcon}
        />
        <Text style={styles.optionText}>Hỗ trợ khách hàng</Text>
        <Ionicons
          name="chevron-forward"
          size={20}
          color="#bbb"
          style={{ marginLeft: "auto" }}
        />
      </View>
      <TouchableOpacity style={styles.optionRow} onPress={handleLogout}>
        <MaterialIcons
          name="logout"
          size={24}
          color="#222"
          style={styles.optionIcon}
        />
        <Text style={styles.optionText}>Đăng xuất</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 24,
    paddingTop: Platform.OS === "android" ? 50 : 24, // Add more padding on Android
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  backBtn: { padding: 4, borderRadius: 8 },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#222" },
  avatarWrap: { alignItems: "center", marginTop: 8, marginBottom: 8 },
  avatar: { width: 80, height: 80, borderRadius: 40 },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#4ade80",
    position: "absolute",
    right: 110,
    top: 60,
    borderWidth: 2,
    borderColor: "#fff",
  },
  name: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginTop: 8 },
  email: { fontSize: 15, color: "#888", textAlign: "center", marginBottom: 16 },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f6f8fb",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  optionIcon: { marginRight: 14 },
  optionText: { fontSize: 16, color: "#222" },
  progressBarWrap: {
    flex: 1,
    height: 6,
    backgroundColor: "#e5e7eb",
    borderRadius: 3,
    marginLeft: 16,
    marginRight: 8,
  },
  progressBar: {
    width: "80%",
    height: 6,
    backgroundColor: "#4ade80",
    borderRadius: 3,
  },
  rating: { color: "#888", fontSize: 13, marginLeft: 54, marginBottom: 8 },
});

const loginStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "android" ? 70 : 50,
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#23232b",
    marginBottom: 32,
    alignSelf: "flex-start",
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#23232b",
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    marginBottom: 18,
    height: 48,
    width: "100%",
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#23232b",
    padding: 0,
  },
  forgotBtn: {
    alignSelf: "flex-end",
    marginBottom: 24,
  },
  forgot: {
    color: "#888",
    fontSize: 14,
  },
  loginBtn: {
    width: "100%",
    backgroundColor: "#23232b",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 18,
  },
  loginBtnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  registerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 32,
  },
  registerLabel: {
    color: "#888",
    fontSize: 15,
  },
  registerText: {
    color: "#23232b",
    fontWeight: "700",
    fontSize: 15,
  },
  dividerWrap: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 18,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#f2dede",
  },
  dividerText: {
    marginHorizontal: 12,
    color: "#bbb",
    fontSize: 13,
  },
  googleBtn: {
    width: "100%",
    backgroundColor: "#fbeaec",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  googleBtnText: {
    color: "#e57373",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 1,
  },
});

const optionStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 24,
    paddingTop: Platform.OS === "android" ? 50 : 24, // Add more padding on Android
  },
  backBtn: { padding: 4, borderRadius: 8, marginBottom: 16 },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 24,
    alignSelf: "center",
    color: "#23232b",
  },
  itemRow: { flexDirection: "row", alignItems: "center", marginBottom: 28 },
  icon: { marginRight: 16 },
  itemTitle: { fontSize: 17, fontWeight: "bold", color: "#23232b" },
  itemDesc: { color: "#888", fontSize: 13 },
});
