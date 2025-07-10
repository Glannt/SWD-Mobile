// This is a shim for web and Android where the tab bar is generally opaque.
import { Platform } from "react-native";

export default undefined;

export function useBottomTabOverflow() {
  // Trả về chiều cao của tab bar để các component có thể điều chỉnh padding bottom
  return Platform.OS === "ios" ? 80 : 60;
}
