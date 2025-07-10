import { Ionicons } from "@expo/vector-icons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useRouter } from "expo-router";
import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";

import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useAuth } from "../app/AuthContext";
import { HapticTab } from "./HapticTab";
import TabBarBackground from "./ui/TabBarBackground";

export default function CustomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const { userData, accessToken } = useAuth();
  const colorScheme = useColorScheme();
  const isAdmin = accessToken && userData?.role === "admin";
  const router = useRouter();

  // Lọc ra các tab sẽ hiển thị dựa trên quyền
  const visibleRoutes = state.routes.filter((route) => {
    // Ẩn tab dashboard nếu không phải admin
    if (route.name === "dashboard" && !isAdmin) {
      return false;
    }
    return true;
  });

  // Tìm index mới cho tab đang active sau khi lọc
  const focusedIndex = state.index;
  const focusedRoute = state.routes[focusedIndex];
  const visibleFocusedIndex = visibleRoutes.findIndex(
    (r) => r.key === focusedRoute.key
  );

  // Xử lý điều hướng giữa các tab
  const handleNavigation = (routeName: string) => {
    // Xử lý đặc biệt cho tab dashboard
    if (routeName === "dashboard") {
      router.push("/admin/dashboard");
    } else {
      // Điều hướng đến các tab khác
      router.push(`/(tabs)/${routeName}`);
    }
  };

  return (
    <View style={styles.container}>
      {TabBarBackground && <TabBarBackground />}
      <View style={styles.tabBar}>
        {visibleRoutes.map((route, index) => {
          const { options } = descriptors[route.key] || {
            options: { title: route.name },
          };
          const isFocused = visibleFocusedIndex === index;

          const onPress = () => {
            try {
              const event = navigation.emit
                ? navigation.emit({
                    type: "tabPress",
                    target: route.key,
                    canPreventDefault: true,
                  })
                : { defaultPrevented: false };

              if (!isFocused && !event.defaultPrevented) {
                handleNavigation(route.name);
              }
            } catch (error) {
              // Fallback nếu navigation.emit không tồn tại
              handleNavigation(route.name);
            }
          };

          // Xác định icon và tên hiển thị
          let iconName: any = "help-circle-outline";
          let tabTitle = options?.title || route.name;

          if (route.name === "home") {
            iconName = "home-outline";
          } else if (route.name === "chat") {
            iconName = "chatbubble-ellipses-outline";
          } else if (route.name === "dashboard") {
            iconName = "analytics-outline";
          } else if (route.name === "profile") {
            iconName = "person-outline";
          } else if (route.name === "settings") {
            iconName = "settings-outline";
          }

          return (
            <HapticTab
              key={route.key}
              onPress={onPress}
              style={styles.tabButton}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options?.tabBarAccessibilityLabel}
            >
              <Ionicons
                name={iconName}
                size={24}
                color={
                  isFocused ? Colors[colorScheme ?? "light"].tint : "#8E8E93"
                }
              />
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: isFocused
                      ? Colors[colorScheme ?? "light"].tint
                      : "#8E8E93",
                  },
                ]}
              >
                {tabTitle}
              </Text>
            </HapticTab>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0, 0, 0, 0.2)",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    height: Platform.OS === "ios" ? 80 : 60,
    paddingBottom: Platform.OS === "ios" ? 20 : 0,
    zIndex: 100,
  },
  tabBar: {
    flexDirection: "row",
    height: "100%",
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 2,
  },
});
