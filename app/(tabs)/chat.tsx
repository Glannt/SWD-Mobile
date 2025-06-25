import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function ChatScreen() {
  const [showDetail, setShowDetail] = useState(false);

  if (showDetail) {
    // Giao diện chat-detail
    return (
      <View style={detailStyles.container}>
        {/* Header */}
        <View style={detailStyles.header}>
          <TouchableOpacity
            style={detailStyles.backBtn}
            onPress={() => setShowDetail(false)}
          >
            <Ionicons name="arrow-back" size={24} color="#222" />
          </TouchableOpacity>
          <TouchableOpacity style={detailStyles.deleteBtn}>
            <MaterialIcons name="delete-outline" size={20} color="#222" />
            <Text style={detailStyles.deleteText}>Xóa đoạn chat</Text>
          </TouchableOpacity>
          <TouchableOpacity style={detailStyles.moreBtn}>
            <Ionicons name="ellipsis-horizontal" size={22} color="#bbb" />
          </TouchableOpacity>
        </View>
        {/* Danh sách tin nhắn */}
        <ScrollView
          style={detailStyles.chatList}
          contentContainerStyle={{ paddingVertical: 16 }}
        >
          {/* Tin nhắn 1 */}
          <View style={detailStyles.messageRow}>
            <View style={detailStyles.avatar} />
            <View style={detailStyles.messageContent}>
              <Text style={detailStyles.messageText}>......</Text>
            </View>
            <TouchableOpacity style={detailStyles.copyBtn}>
              <Ionicons name="copy-outline" size={18} color="#bbb" />
            </TouchableOpacity>
          </View>
          {/* Tin nhắn 2 */}
          <View style={detailStyles.messageRow}>
            <View style={detailStyles.avatar} />
            <View style={detailStyles.messageContent}>
              <Text style={detailStyles.messageText}>......</Text>
            </View>
            <TouchableOpacity style={detailStyles.copyBtn}>
              <Ionicons name="copy-outline" size={18} color="#bbb" />
            </TouchableOpacity>
          </View>
        </ScrollView>
        {/* Nút tạo lại phản hồi */}
        <TouchableOpacity style={detailStyles.regenBtn}>
          <Ionicons
            name="refresh-outline"
            size={18}
            color="#888"
            style={{ marginRight: 6 }}
          />
          <Text style={detailStyles.regenText}>Tạo lại phản hồi</Text>
        </TouchableOpacity>
        {/* Ô nhập tin nhắn */}
        <View style={detailStyles.inputRow}>
          <TextInput
            style={detailStyles.input}
            placeholder="Gửi tin nhắn"
            placeholderTextColor="#bbb"
          />
          <TouchableOpacity style={detailStyles.sendBtn}>
            <Ionicons name="arrow-forward" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Giao diện chào mừng
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtn}>
        {/* Có thể thêm điều hướng back nếu cần */}
      </TouchableOpacity>
      <Image
        source={require("@/assets/images/logo-fchat.png")}
        style={styles.logo}
      />
      <Text style={styles.title}>Chào mừng đến với{"\n"}FChatCareer</Text>
      <Text style={styles.desc}>...</Text>
      <TouchableOpacity
        style={styles.startBtn}
        onPress={() => setShowDetail(true)}
      >
        <Text style={styles.startBtnText}>Bắt Đầu Ngay</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  backBtn: {
    position: "absolute",
    top: 32,
    left: 16,
    zIndex: 2,
    backgroundColor: "#f6f8fb",
    borderRadius: 16,
    padding: 6,
  },
  logo: { width: 120, height: 120, marginBottom: 32, resizeMode: "contain" },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#23232b",
    textAlign: "center",
    marginBottom: 16,
  },
  desc: { color: "#888", fontSize: 15, textAlign: "center", marginBottom: 32 },
  startBtn: {
    width: "100%",
    backgroundColor: "#23232b",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 16,
  },
  startBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});

const detailStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingBottom: 8,
    justifyContent: "space-between",
  },
  backBtn: { backgroundColor: "#f6f8fb", borderRadius: 16, padding: 6 },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f6f8fb",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  deleteText: { marginLeft: 4, color: "#222", fontSize: 13 },
  moreBtn: { padding: 6 },
  chatList: { flex: 1, paddingHorizontal: 16 },
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 18,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#eee",
    marginRight: 10,
  },
  messageContent: {
    flex: 1,
    backgroundColor: "#f6f8fb",
    borderRadius: 12,
    padding: 12,
  },
  messageText: { color: "#23232b", fontSize: 15 },
  copyBtn: { marginLeft: 8, padding: 4 },
  regenBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "#f6f8fb",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginVertical: 8,
  },
  regenText: { color: "#888", fontSize: 15 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderTopWidth: 1,
    borderColor: "#f0f0f0",
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
    backgroundColor: "#23232b",
    borderRadius: 12,
    padding: 10,
    marginLeft: 8,
  },
});
