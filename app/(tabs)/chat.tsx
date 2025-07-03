import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useChatMobile } from "../../hooks/useChatMobile";
import { getApiBaseUrl } from "../../utils/api";
import { useAuth } from "../AuthContext";

// Component cho hiệu ứng loading
const LoadingBubble = () => {
  // Animation cho dấu chấm loading
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev.length >= 3) return "";
        return prev + ".";
      });
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={chatStyles.botMsgRow}>
      <View style={chatStyles.botAvatar}>
        <Text style={{ fontSize: 18 }}>🤖</Text>
      </View>
      <View
        style={[
          chatStyles.msgBubble,
          { flexDirection: "row", alignItems: "center" },
        ]}
      >
        <ActivityIndicator
          size="small"
          color="#ff6600"
          style={{ marginRight: 8 }}
        />
        <Text style={chatStyles.msgText}>AI đang trả lời{dots}</Text>
      </View>
    </View>
  );
};

// Hàm getApiBaseUrl được import từ utils/api.js

export default function ChatScreen() {
  const { accessToken, userId } = useAuth();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const chat = useChatMobile({ accessToken, userId });
  const [input, setInput] = useState("");
  const flatListRef = useRef(null);
  const [showSessions, setShowSessions] = useState(false);
  const [creatingNewChat, setCreatingNewChat] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const pingIntervalRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const API_BASE_URL = getApiBaseUrl();
  const router = useRouter();

  // Kiểm tra trạng thái đăng nhập
  useEffect(() => {
    if (accessToken && userId) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, [accessToken, userId]);

  // Load sessions on mount - chỉ khi đã đăng nhập
  useEffect(() => {
    if (isLoggedIn) {
      chat.loadSessions();
      // Thiết lập hệ thống kiểm tra kết nối
      startConnectionMonitoring();
    }

    return () => {
      // Dọn dẹp các interval và timeout khi unmount
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
      if (reconnectTimeoutRef.current)
        clearTimeout(reconnectTimeoutRef.current);
    };
  }, [isLoggedIn]);

  // Hệ thống theo dõi kết nối
  const startConnectionMonitoring = () => {
    // Hủy các interval cũ nếu có
    if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);

    // Thiết lập ping mỗi 90 giây để giữ kết nối hoạt động
    pingIntervalRef.current = setInterval(() => {
      if (chat.currentSession) {
        // Ping session hiện tại để giữ kết nối
        pingSession(chat.currentSession.sessionId);
      }
    }, 90000); // 90 giây
  };

  // Hàm ping session để giữ kết nối
  const pingSession = async (sessionId) => {
    if (!sessionId || !accessToken) return;

    try {
      const res = await fetch(`${API_BASE_URL}/chatsession/${sessionId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (res.ok) {
        console.log("[MOBILE] Ping session successful");
        // Nếu đang ở trạng thái lỗi kết nối, đánh dấu đã kết nối lại
        if (connectionError) {
          setConnectionError(false);
        }
      } else {
        handleConnectionError("Session ping failed");
      }
    } catch (error) {
      console.error("[MOBILE] Error pinging session:", error);
      handleConnectionError(error.message);
    }
  };

  // Xử lý khi mất kết nối
  const handleConnectionError = (errorMsg) => {
    console.warn("[MOBILE] Connection error detected:", errorMsg);

    // Đánh dấu trạng thái lỗi kết nối
    if (!connectionError) {
      setConnectionError(true);

      // Thử kết nối lại sau 5 giây
      if (reconnectTimeoutRef.current)
        clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = setTimeout(reconnect, 5000);
    }
  };

  // Thử kết nối lại
  const reconnect = async () => {
    console.log("[MOBILE] Attempting to reconnect...");

    try {
      // Nếu đang có session, thử ping lại
      if (chat.currentSession) {
        await pingSession(chat.currentSession.sessionId);
      } else {
        // Nếu không có session, thử tải lại danh sách session
        await chat.loadSessions();
      }

      // Nếu không có lỗi, đánh dấu đã kết nối lại
      setConnectionError(false);
      console.log("[MOBILE] Reconnection successful");
    } catch (error) {
      console.error("[MOBILE] Reconnection failed:", error);

      // Thử lại sau 10 giây
      reconnectTimeoutRef.current = setTimeout(reconnect, 10000);
    }
  };

  // Hiển thị lỗi khi có
  useEffect(() => {
    if (chat.error && isLoggedIn) {
      // Hiển thị lỗi dưới dạng alert
      Alert.alert("Thông báo", chat.error, [
        { text: "Đóng", onPress: () => chat.setError("") },
      ]);

      // Kiểm tra xem lỗi có phải do mất kết nối không
      if (
        chat.error.includes("Server error: 500") ||
        chat.error.includes("Không lấy được")
      ) {
        handleConnectionError(chat.error);
      }
    }
  }, [chat.error, isLoggedIn]);

  // Auto-scroll xuống cuối khi có tin nhắn mới
  useEffect(() => {
    if (chat.messages.length > 0 && isLoggedIn) {
      setTimeout(
        () => flatListRef.current?.scrollToEnd({ animated: true }),
        300
      );
    }
  }, [chat.messages, isLoggedIn]);

  // Khi chọn session
  const handleSelectSession = async (session) => {
    setShowSessions(false);
    await chat.selectSession(session);
  };

  // Khi tạo chat mới
  const handleNewChat = async () => {
    if (creatingNewChat) return;

    setCreatingNewChat(true);
    console.log("[MOBILE] Bắt đầu tạo chat mới...");

    // Xóa lỗi cũ trước khi bắt đầu
    chat.setError("");

    try {
      const newSession = await chat.createSession();
      console.log("[MOBILE] Kết quả createSession:", newSession);

      if (!newSession) {
        console.error(
          "[MOBILE] Không tạo được chat mới:",
          chat.error || "Không xác định nguyên nhân"
        );
        // Error message đã được hiển thị qua chat.error và useEffect
        return;
      }

      console.log("[MOBILE] Chat mới đã được tạo:", newSession);
      console.log("[MOBILE] SessionID của chat mới:", newSession.sessionId);
      setInput("");

      // Thiết lập lại hệ thống theo dõi kết nối
      startConnectionMonitoring();
      setConnectionError(false);
    } catch (error) {
      console.error("[MOBILE] Lỗi khi tạo chat mới:", error);
    } finally {
      setCreatingNewChat(false);
    }
  };

  // Gửi tin nhắn
  const handleSend = async () => {
    if (!input.trim() || chat.isSending) return;

    // Kiểm tra tình trạng kết nối
    if (connectionError) {
      Alert.alert(
        "Lỗi kết nối",
        "Kết nối tới máy chủ đã bị gián đoạn. Đang thử kết nối lại...",
        [{ text: "Đóng" }]
      );
      reconnect();
      return;
    }

    const message = input.trim();
    setInput("");

    // Debug thông tin session hiện tại
    if (chat.currentSession) {
      console.log(
        "[MOBILE] Sending message with sessionId:",
        chat.currentSession.sessionId
      );
    } else {
      console.log(
        "[MOBILE] Sending message without sessionId (new conversation)"
      );
    }

    try {
      await chat.sendMessage(message);
      // Tin nhắn đã được thêm vào state messages bởi hàm sendMessage
      setTimeout(
        () => flatListRef.current?.scrollToEnd({ animated: true }),
        300
      );
    } catch (error) {
      console.error("[MOBILE] Error in handleSend:", error);
      Alert.alert(
        "Lỗi gửi tin nhắn",
        "Không thể gửi tin nhắn. Vui lòng thử lại sau.",
        [{ text: "Đóng" }]
      );
    }
  };

  // Nếu chưa đăng nhập, hiển thị màn hình "bắt đầu ngay"
  if (!isLoggedIn) {
    return (
      <View style={chatStyles.welcomeScreen}>
        <TouchableOpacity
          style={chatStyles.backButton}
          onPress={() => {
            // Quay lại trang chính (home)
            router.push("/(tabs)/home");
          }}
        >
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>

        <View style={chatStyles.welcomeContainer}>
          <View style={chatStyles.logoContainer}>
            <Image
              source={require("../../assets/images/logo-fchat.png")}
              style={chatStyles.logoImage}
            />
          </View>

          <Text style={chatStyles.welcomeHeader}>
            Chào mừng đến với{"\n"}FCareerChat
          </Text>

          <TouchableOpacity
            style={chatStyles.startButton}
            onPress={() => {
              // Chuyển đến tab Profile để đăng nhập
              router.push("/(tabs)/profile");
            }}
          >
            <Text style={chatStyles.startButtonText}>Bắt đầu Ngay</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Nếu đã đăng nhập, hiển thị giao diện chat bình thường
  return (
    <View style={chatStyles.container}>
      {/* Header */}
      <View style={chatStyles.header}>
        <Text style={chatStyles.headerTitle}>FCareerChat</Text>
        <TouchableOpacity
          style={chatStyles.sessionBtn}
          onPress={() => setShowSessions(true)}
        >
          <Ionicons name="chatbubbles-outline" size={20} color="#ff6600" />
          <Text style={chatStyles.sessionBtnText}>
            {chat.currentSession
              ? `Chat ${chat.currentSession.sessionId.slice(-6)}`
              : "Chọn chat"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[chatStyles.newChatBtn, creatingNewChat && { opacity: 0.7 }]}
          onPress={handleNewChat}
          disabled={creatingNewChat}
        >
          {creatingNewChat ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="add" size={22} color="#fff" />
              <Text style={chatStyles.newChatText}>Chat mới</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Hiển thị thông báo mất kết nối */}
      {connectionError && (
        <TouchableOpacity
          style={chatStyles.connectionErrorBanner}
          onPress={reconnect}
        >
          <Ionicons name="alert-circle" size={18} color="#fff" />
          <Text style={chatStyles.connectionErrorText}>
            Mất kết nối với máy chủ. Nhấn để kết nối lại
          </Text>
        </TouchableOpacity>
      )}

      {/* Modal chọn session */}
      <Modal visible={showSessions} transparent animationType="fade">
        <View style={chatStyles.modalOverlay}>
          <View style={chatStyles.modalBox}>
            <Text style={chatStyles.modalTitle}>Lịch sử chat</Text>
            {chat.isLoading ? (
              <View style={{ padding: 20, alignItems: "center" }}>
                <ActivityIndicator size="small" color="#ff6600" />
                <Text style={{ marginTop: 10, color: "#888" }}>
                  Đang tải...
                </Text>
              </View>
            ) : (
              <FlatList
                data={chat.sessions}
                keyExtractor={(item) => item.sessionId}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={chatStyles.sessionItem}
                    onPress={() => handleSelectSession(item)}
                  >
                    <Text
                      style={{
                        color:
                          chat.currentSession?.sessionId === item.sessionId
                            ? "#ff6600"
                            : "#23232b",
                      }}
                    >
                      Chat {item.sessionId.slice(-6)}
                    </Text>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <Text style={{ color: "#888", textAlign: "center" }}>
                    Chưa có cuộc trò chuyện nào
                  </Text>
                }
              />
            )}
            <TouchableOpacity
              style={chatStyles.closeModalBtn}
              onPress={() => setShowSessions(false)}
            >
              <Text style={{ color: "#ff6600", fontWeight: "bold" }}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Nội dung chat */}
      <View style={chatStyles.body}>
        {chat.isLoading ? (
          <View style={chatStyles.centered}>
            <ActivityIndicator size="large" color="#ff6600" />
            <Text style={{ marginTop: 10, color: "#666" }}>Đang tải...</Text>
          </View>
        ) : chat.messages.length === 0 ? (
          <View style={chatStyles.welcomeBox}>
            <Text style={chatStyles.botIcon}>🤖</Text>
            <Text style={chatStyles.welcomeTitle}>
              Xin chào! Tôi là AI Assistant của FPT University
            </Text>
            <Text style={chatStyles.welcomeDesc}>
              Tôi có thể giúp bạn tìm hiểu về các chương trình học, học phí, và
              các thông tin khác về FPT University. Hãy bắt đầu cuộc trò chuyện!
            </Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={chat.messages}
            keyExtractor={(_, idx) => idx.toString()}
            renderItem={({ item }) => (
              <View
                style={
                  item.sender === "user"
                    ? chatStyles.userMsgRow
                    : chatStyles.botMsgRow
                }
              >
                <View
                  style={
                    item.sender === "user"
                      ? chatStyles.userAvatar
                      : chatStyles.botAvatar
                  }
                >
                  <Text style={{ fontSize: 18 }}>
                    {item.sender === "user" ? "🧑" : "🤖"}
                  </Text>
                </View>
                <View
                  style={[
                    chatStyles.msgBubble,
                    item.sender === "user" && chatStyles.userMsgBubble,
                  ]}
                >
                  <Text
                    style={[
                      chatStyles.msgText,
                      item.sender === "user" && chatStyles.userMsgText,
                    ]}
                  >
                    {item.content}
                  </Text>
                </View>
              </View>
            )}
            contentContainerStyle={{ paddingVertical: 16 }}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
            ListFooterComponent={chat.isSending ? <LoadingBubble /> : null}
          />
        )}
      </View>

      {/* Ô nhập tin nhắn */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={80}
      >
        <View style={chatStyles.inputRow}>
          <TextInput
            style={chatStyles.input}
            placeholder="Nhập tin nhắn..."
            value={input}
            onChangeText={setInput}
            editable={!chat.isSending && !connectionError}
            placeholderTextColor="#bbb"
            onSubmitEditing={handleSend}
            returnKeyType="send"
            multiline
          />
          <TouchableOpacity
            style={[
              chatStyles.sendBtn,
              (!input.trim() || chat.isSending || connectionError) &&
                chatStyles.disabledSendBtn,
            ]}
            onPress={handleSend}
            disabled={!input.trim() || chat.isSending || connectionError}
          >
            {chat.isSending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : connectionError ? (
              <Ionicons name="alert-circle" size={22} color="#fff" />
            ) : (
              <Ionicons name="arrow-up" size={22} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const chatStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f6f8fb" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 42,
    paddingBottom: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    marginTop: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#23232b",
    marginTop: 10,
  },
  sessionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff7ed",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
  },
  sessionBtnText: { color: "#ff6600", fontWeight: "bold", marginLeft: 6 },
  newChatBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ff6600",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  newChatText: { color: "#fff", fontWeight: "bold", marginLeft: 6 },
  connectionErrorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e53935",
    paddingVertical: 8,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  connectionErrorText: {
    color: "#fff",
    marginLeft: 8,
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: 300,
    maxHeight: 400,
    alignItems: "center",
  },
  modalTitle: { fontWeight: "bold", fontSize: 18, marginBottom: 12 },
  sessionItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    width: "100%",
  },
  closeModalBtn: {
    marginTop: 16,
    alignSelf: "center",
    padding: 8,
  },
  body: { flex: 1, paddingHorizontal: 12 },
  welcomeBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  botIcon: { fontSize: 64, marginBottom: 16 },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#23232b",
    textAlign: "center",
    marginBottom: 8,
  },
  welcomeDesc: {
    color: "#888",
    fontSize: 15,
    textAlign: "center",
    marginBottom: 16,
  },
  userMsgRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 12,
    alignSelf: "flex-end",
  },
  botMsgRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 12,
    alignSelf: "flex-start",
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#dbeafe",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  botAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fef3c7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  msgBubble: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    maxWidth: "80%",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  userMsgBubble: {
    backgroundColor: "#ff6600",
  },
  msgText: { color: "#23232b", fontSize: 15 },
  userMsgText: { color: "#fff" },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#23232b",
    backgroundColor: "#f6f8fb",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    minHeight: 40,
    maxHeight: 120,
  },
  sendBtn: {
    backgroundColor: "#ff6600",
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    height: 44,
    width: 44,
  },
  disabledSendBtn: {
    backgroundColor: "#ffcbab",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f6f8fb",
    padding: 24,
  },
  welcomeScreen: {
    flex: 1,
    backgroundColor: "#fff",
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    padding: 10,
    zIndex: 10,
  },
  welcomeContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  logoContainer: {
    width: 80,
    height: 80,
    backgroundColor: "#fff",
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  logoImage: {
    width: 60,
    height: 60,
    resizeMode: "contain",
  },
  welcomeHeader: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#23232b",
    marginBottom: 60,
    textAlign: "center",
    lineHeight: 32,
  },
  startButton: {
    backgroundColor: "#202020",
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    width: "100%",
    alignItems: "center",
  },
  startButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
