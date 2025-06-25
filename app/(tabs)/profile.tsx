import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const editInfoStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 24 },
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
  container: { flex: 1, backgroundColor: "#fff", padding: 24 },
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
  container: { flex: 1, backgroundColor: "#fff", padding: 24 },
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
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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
        <TouchableOpacity
          style={loginStyles.backBtn}
          onPress={() => setShowRegister(false)}
        >
          <Ionicons name="arrow-back" size={24} color="#222" />
        </TouchableOpacity>
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
            placeholder="Joseph Ren"
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
            placeholder="Joseph.Ren@Mail.Com"
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
        <TouchableOpacity
          style={loginStyles.loginBtn}
          onPress={() => {
            setIsLoggedIn(true);
            setShowRegister(false);
          }}
        >
          <Text style={loginStyles.loginBtnText}>Đăng ký</Text>
        </TouchableOpacity>
        <View style={loginStyles.registerRow}>
          <Text style={loginStyles.registerLabel}>Bạn đã có tài khoản? </Text>
          <TouchableOpacity onPress={() => setShowRegister(false)}>
            <Text style={loginStyles.registerText}>Đăng Nhập</Text>
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
        <TouchableOpacity
          style={forgotStyles.backBtn}
          onPress={() => setShowForgot(false)}
        >
          <Ionicons name="arrow-back" size={24} color="#222" />
        </TouchableOpacity>
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
      </View>
    );
  }

  if (!isLoggedIn) {
    // Trang Đăng nhập
    return (
      <View style={loginStyles.container}>
        <TouchableOpacity style={loginStyles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#222" />
        </TouchableOpacity>
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
            placeholder="__@gmail.com"
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
        <TouchableOpacity
          style={loginStyles.forgotBtn}
          onPress={() => setShowForgot(true)}
        >
          <Text style={loginStyles.forgot}>Quên mật khẩu?</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={loginStyles.loginBtn}
          onPress={() => setIsLoggedIn(true)}
        >
          <Text style={loginStyles.loginBtnText}>Đăng nhập</Text>
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
      <TouchableOpacity
        style={styles.optionRow}
        onPress={() => setIsLoggedIn(false)}
      >
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
  container: { flex: 1, backgroundColor: "#fff", padding: 24 },
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
    paddingTop: 32,
    alignItems: "center",
  },
  backBtn: {
    alignSelf: "flex-start",
    marginBottom: 12,
    backgroundColor: "#f6f8fb",
    borderRadius: 16,
    padding: 6,
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
  container: { flex: 1, backgroundColor: "#fff", padding: 24 },
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
