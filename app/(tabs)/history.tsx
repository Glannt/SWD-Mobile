import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const todayHistory = [
  { id: "1", content: "..." },
  { id: "2", content: "..." },
  { id: "3", content: "..." },
];

const yesterdayHistory = [
  { id: "4", content: "..." },
  { id: "5", content: "..." },
  { id: "6", content: "..." },
];

export default function HistoryScreen() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Lịch sử</Text>
        <TouchableOpacity>
          <Ionicons name="create-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* Search & Filter */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons
            name="search-outline"
            size={20}
            color="#aaa"
            style={{ marginRight: 6 }}
          />
          <TextInput placeholder="Tìm kiếm" style={{ flex: 1 }} />
        </View>
        <TouchableOpacity style={styles.filterBtn}>
          <Ionicons name="options-outline" size={22} color="white" />
        </TouchableOpacity>
      </View>

      {/* Today */}
      <Text style={styles.sectionTitle}>Hôm nay</Text>
      <FlatList
        data={todayHistory}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.historyItem}>
            <Text>{item.content}</Text>
          </View>
        )}
      />

      {/* Yesterday */}
      <Text style={styles.sectionTitle}>Hôm qua</Text>
      <FlatList
        data={yesterdayHistory}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <View style={styles.historyItem}>
            {index === 0 ? (
              <Ionicons
                name="trash-outline"
                size={20}
                color="black"
                style={{ marginRight: 8 }}
              />
            ) : null}
            <Text>{item.content}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f6f8fb", padding: 16 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: { fontSize: 22, fontWeight: "bold" },
  searchRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 10,
    height: 40,
    marginRight: 10,
  },
  filterBtn: { backgroundColor: "#222", borderRadius: 12, padding: 10 },
  sectionTitle: { fontWeight: "bold", marginTop: 16, marginBottom: 8 },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
});
