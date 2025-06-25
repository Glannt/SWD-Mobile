import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function ChatDetailScreen() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#222" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn}>
          <MaterialIcons name="delete-outline" size={20} color="#222" />
          <Text style={styles.deleteText}>Xóa đoạn chat</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.moreBtn}>
          <Ionicons name="ellipsis-horizontal" size={22} color="#bbb" />
        </TouchableOpacity>
      </View>
      {/* Danh sách tin nhắn */}
      <ScrollView
        style={styles.chatList}
        contentContainerStyle={{ paddingVertical: 16 }}
      >
        {/* Tin nhắn 1 */}
        <View style={styles.messageRow}>
          <View style={styles.avatar} />
          <View style={styles.messageContent}>
            <Text style={styles.messageText}>......</Text>
          </View>
          <TouchableOpacity style={styles.copyBtn}>
            <Ionicons name="copy-outline" size={18} color="#bbb" />
          </TouchableOpacity>
        </View>
        {/* Tin nhắn 2 */}
        <View style={styles.messageRow}>
          <View style={styles.avatar} />
          <View style={styles.messageContent}>
            <Text style={styles.messageText}>......</Text>
          </View>
          <TouchableOpacity style={styles.copyBtn}>
            <Ionicons name="copy-outline" size={18} color="#bbb" />
          </TouchableOpacity>
        </View>
      </ScrollView>
      {/* Nút tạo lại phản hồi */}
      <TouchableOpacity style={styles.regenBtn}>
        <Ionicons
          name="refresh-outline"
          size={18}
          color="#888"
          style={{ marginRight: 6 }}
        />
        <Text style={styles.regenText}>Tạo lại phản hồi</Text>
      </TouchableOpacity>
      {/* Ô nhập tin nhắn */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Gửi tin nhắn"
          placeholderTextColor="#bbb"
        />
        <TouchableOpacity style={styles.sendBtn}>
          <Ionicons name="arrow-forward" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
