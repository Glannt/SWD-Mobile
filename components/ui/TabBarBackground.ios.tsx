import { Platform, StyleSheet, View } from "react-native";

export default function BlurTabBarBackground() {
  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        { backgroundColor: "rgba(255, 255, 255, 0.9)" }, // Màu trắng mờ, có thể điều chỉnh
      ]}
    />
  );
}

export function useBottomTabOverflow() {
  // Trả về chiều cao của tab bar để các component có thể điều chỉnh padding bottom
  return Platform.OS === "ios" ? 80 : 60;
}
