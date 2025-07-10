import { BlurView } from "expo-blur";
import { Platform, StyleSheet } from "react-native";

export default function BlurTabBarBackground() {
  return (
    <BlurView
      // System chrome material automatically adapts to the system's theme
      // and matches the native tab bar appearance on iOS.
      tint="systemChromeMaterial"
      intensity={100}
      style={StyleSheet.absoluteFill}
    />
  );
}

export function useBottomTabOverflow() {
  // Trả về chiều cao của tab bar để các component có thể điều chỉnh padding bottom
  return Platform.OS === "ios" ? 80 : 60;
}
