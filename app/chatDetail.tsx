import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ChatMessage, useChatHistory } from "../hooks/useChatHistory";
import { formatDate } from "../utils/dateUtils";

export default function ChatDetailScreen() {
  const { sessionId } = useLocalSearchParams();
  const chatHistory = useChatHistory();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [session, setSession] = useState<{
    sessionId: string;
    createdAt: string;
    title?: string;
  } | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (!sessionId) {
      router.back();
      return;
    }

    const fetchSessionDetails = async () => {
      // Find session in the loaded sessions or fetch sessions if not loaded yet
      if (chatHistory.sessions.length === 0) {
        await chatHistory.loadSessions();
      }

      const currentSession = chatHistory.sessions.find(
        (s) => s.sessionId === sessionId
      );
      if (currentSession) {
        setSession(currentSession);
      }

      // Load messages for this session
      const sessionMessages = await chatHistory.loadSessionMessages(
        sessionId as string
      );
      if (sessionMessages) {
        setMessages(sessionMessages);

        // Scroll to bottom after messages are loaded
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: false });
        }, 300);
      }
    };

    fetchSessionDetails();
  }, [sessionId]);

  // Handle delete session
  const handleDeleteSession = () => {
    Alert.alert("Xác nhận", "Bạn có chắc chắn muốn xóa đoạn chat này không?", [
      {
        text: "Hủy",
        style: "cancel",
      },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          if (sessionId) {
            const success = await chatHistory.deleteSession(
              sessionId as string
            );
            if (success) {
              router.back();
            }
          }
        },
      },
    ]);
  };

  // Handle sending a new message (not implemented in this view-only version)
  const handleSend = () => {
    if (!input.trim()) return;

    Alert.alert(
      "Thông báo",
      "Tính năng gửi tin nhắn mới từ màn hình chi tiết đang được phát triển.",
      [{ text: "OK" }]
    );

    setInput("");
  };

  // Render message item
  const renderMessage = (message: ChatMessage, index: number) => {
    const isUser = message.sender === "user";

    return (
      <View key={message.id || index} style={styles.messageRow}>
        <View
          style={[styles.avatar, isUser ? styles.userAvatar : styles.botAvatar]}
        >
          <Text style={{ fontSize: 16 }}>{isUser ? "🧑" : "🤖"}</Text>
        </View>
        <View
          style={[styles.messageContent, isUser && styles.userMessageContent]}
        >
          <Text style={[styles.messageText, isUser && styles.userMessageText]}>
            {message.content}
          </Text>
          {message.timestamp && (
            <Text style={styles.timestampText}>
              {formatDate(new Date(message.timestamp))}
            </Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.copyBtn}
          onPress={() => {
            if (Platform.OS === "web") {
              navigator.clipboard.writeText(message.content);
            }
            Alert.alert("Thông báo", "Đã sao chép nội dung tin nhắn");
          }}
        >
          <Ionicons name="copy-outline" size={18} color="#bbb" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#222" />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>
            {session?.title || `Chat ${(sessionId as string)?.slice(-6)}`}
          </Text>
          {session?.createdAt && (
            <Text style={styles.subtitle}>
              {formatDate(new Date(session.createdAt))}
            </Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={handleDeleteSession}
        >
          <MaterialIcons name="delete-outline" size={20} color="#222" />
          <Text style={styles.deleteText}>Xóa chat</Text>
        </TouchableOpacity>
      </View>

      {/* Danh sách tin nhắn */}
      {chatHistory.isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ff6600" />
          <Text style={styles.loadingText}>Đang tải tin nhắn...</Text>
        </View>
      ) : (
        <ScrollView
          ref={scrollViewRef}
          style={styles.chatList}
          contentContainerStyle={{ paddingVertical: 16 }}
        >
          {messages.length === 0 ? (
            <Text style={styles.emptyText}>Không có tin nhắn nào</Text>
          ) : (
            messages.map(renderMessage)
          )}
        </ScrollView>
      )}

      {/* Ô nhập tin nhắn */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.inputContainer}
      >
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Gửi tin nhắn"
            placeholderTextColor="#bbb"
            value={input}
            onChangeText={setInput}
          />
          <TouchableOpacity
            style={[styles.sendBtn, !input.trim() && styles.disabledSendBtn]}
            onPress={handleSend}
            disabled={!input.trim()}
          >
            <Ionicons name="arrow-forward" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingTop: Platform.OS === "ios" ? 50 : 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backBtn: {
    backgroundColor: "#f6f8fb",
    borderRadius: 16,
    padding: 6,
  },
  titleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#23232b",
  },
  subtitle: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f6f8fb",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  deleteText: {
    marginLeft: 4,
    color: "#222",
    fontSize: 13,
  },
  moreBtn: {
    padding: 6,
  },
  chatList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    color: "#888",
    fontSize: 14,
  },
  emptyText: {
    textAlign: "center",
    color: "#888",
    fontSize: 14,
    marginTop: 32,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 18,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  userAvatar: {
    backgroundColor: "#dbeafe",
  },
  botAvatar: {
    backgroundColor: "#fef3c7",
  },
  messageContent: {
    flex: 1,
    backgroundColor: "#f6f8fb",
    borderRadius: 12,
    padding: 12,
  },
  userMessageContent: {
    backgroundColor: "#ff6600",
  },
  messageText: {
    color: "#23232b",
    fontSize: 15,
    lineHeight: 20,
  },
  userMessageText: {
    color: "#fff",
  },
  timestampText: {
    fontSize: 11,
    color: "#888",
    marginTop: 6,
    textAlign: "right",
  },
  copyBtn: {
    marginLeft: 8,
    padding: 4,
  },
  inputContainer: {
    width: "100%",
    borderTopWidth: 1,
    borderColor: "#f0f0f0",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    backgroundColor: "#f6f6f6",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 44,
    fontSize: 15,
    color: "#23232b",
  },
  sendBtn: {
    backgroundColor: "#ff6600",
    borderRadius: 12,
    padding: 10,
    marginLeft: 8,
  },
  disabledSendBtn: {
    backgroundColor: "#ffcbab",
  },
});
