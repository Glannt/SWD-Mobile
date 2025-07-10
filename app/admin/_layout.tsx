import CustomTabBar from "@/components/CustomTabBar";
import { Stack } from "expo-router";
import React from "react";
import { Platform, StatusBar, StyleSheet, View } from "react-native";

// Tạo một component giả để cung cấp props cho CustomTabBar
const createTabBarProps = () => {
  // Tạo các props cần thiết cho CustomTabBar
  return {
    state: {
      index: 2, // Dashboard là tab thứ 3 (index 2)
      routes: [
        { key: "home", name: "home" },
        { key: "chat", name: "chat" },
        { key: "dashboard", name: "dashboard" },
        { key: "profile", name: "profile" },
        { key: "settings", name: "settings" },
      ],
    },
    descriptors: {
      home: { options: { title: "Trang chủ" } },
      chat: { options: { title: "Chat" } },
      dashboard: { options: { title: "Quản trị" } },
      profile: { options: { title: "Thông tin" } },
      settings: { options: { title: "Cài đặt" } },
    },
    navigation: {
      navigate: () => {},
      emit: () => ({ defaultPrevented: false }),
    },
  };
};

export default function AdminLayout() {
  // Tạo props cho CustomTabBar
  const tabBarProps = createTabBarProps();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
      <CustomTabBar {...tabBarProps} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? 20 : 0, // Thêm padding phía trên cho Android để tránh camera notch
  },
});
 