import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { createContext, useContext, useEffect, useState } from "react";
import { AppState } from "react-native";

// Định nghĩa các types cho thông báo
export interface Notification {
  id: string;
  title: string;
  body: string;
  data?: any;
  createdAt: Date;
  read: boolean;
}

// Context interface
interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  lastNotification: Notification | null;
  markAllAsRead: () => void;
  markAsRead: (id: string) => void;
  clearNotifications: () => void;
  initialize: () => Promise<boolean>;
}

// Khởi tạo context với giá trị mặc định
const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  lastNotification: null,
  markAllAsRead: () => {},
  markAsRead: () => {},
  clearNotifications: () => {},
  initialize: async () => false,
});

// Khóa lưu trữ trong AsyncStorage
const NOTIFICATIONS_STORAGE_KEY = "notifications";

// Provider component
export const NotificationProvider = ({ children }) => {
  // State cho danh sách thông báo và trạng thái khởi tạo
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();

  // Lưu thông báo vào storage
  const saveNotificationsToStorage = async (notifs: Notification[]) => {
    try {
      await AsyncStorage.setItem(
        NOTIFICATIONS_STORAGE_KEY,
        JSON.stringify(notifs)
      );
    } catch (error) {
      console.error("Error saving notifications to storage:", error);
    }
  };

  // Khởi tạo thông báo từ storage
  const initialize = async () => {
    try {
      // Nếu đã khởi tạo, không làm gì cả
      if (isInitialized) return true;

      // Đọc thông báo từ storage
      const storedNotifs = await AsyncStorage.getItem(
        NOTIFICATIONS_STORAGE_KEY
      );
      if (storedNotifs) {
        const parsedNotifs = JSON.parse(storedNotifs);

        // Đảm bảo format đúng cho date objects
        const formattedNotifs = parsedNotifs.map((notif) => ({
          ...notif,
          createdAt: new Date(notif.createdAt),
        }));

        setNotifications(formattedNotifs);
      }

      // Setup notification handlers dựa trên loại môi trường
      setupNotificationHandlers();

      setIsInitialized(true);
      return true;
    } catch (error) {
      console.error("Error initializing notifications:", error);
      return false;
    }
  };

  // Setup handlers cho thông báo
  const setupNotificationHandlers = () => {
    // Khởi tạo handlers phù hợp với môi trường
    try {
      // Xác định môi trường đang chạy
      let moduleHandlers;

      // Trong Expo Go, sử dụng mock
      const isExpoGo = __DEV__ && !process.env.EAS_BUILD_RUNNER;

      if (isExpoGo) {
        try {
          // Sử dụng mock handlers cho Expo Go
          console.log("Using mock notification handlers in Expo Go");
          moduleHandlers = require("../services/mockFirebase");
        } catch (error) {
          console.error(
            "Failed to load mock notification handlers for Expo Go:",
            error
          );
        }
      } else {
        // Dùng Firebase thật trong dev build/prod
        try {
          moduleHandlers = require("../services/firebaseMessaging");
        } catch (error) {
          console.error(
            "Failed to load Firebase notification handlers for prod:",
            error
          );
          // Fallback to mock if real Firebase fails
          try {
            console.log("Falling back to mock notification handlers");
            moduleHandlers = require("../services/mockFirebase");
          } catch (mockError) {
            console.error("Failed to load fallback mock handlers:", mockError);
          }
        }
      }

      // Setup handlers nếu module đã load thành công
      if (moduleHandlers) {
        // Handler cho thông báo nhận được khi app đang chạy
        const unsubscribeForeground =
          moduleHandlers.setupForegroundNotificationHandler(
            handleNotificationReceived
          );

        // Handler cho thông báo khi nhấp vào notification để mở app
        const unsubscribeOpened = moduleHandlers.setupNotificationOpenedHandler(
          handleNotificationOpened
        );

        // Đăng ký thiết bị cho thông báo nền
        moduleHandlers.setupBackgroundNotificationHandler?.();

        return () => {
          // Cleanup handlers khi component unmount
          if (unsubscribeForeground) unsubscribeForeground();
          if (unsubscribeOpened) unsubscribeOpened();
        };
      }
    } catch (error) {
      console.error("Error setting up notification handlers:", error);
    }
  };

  // Xử lý thông báo khi nhận được (foreground)
  const handleNotificationReceived = (message) => {
    try {
      console.log(
        "🔔 Notification received in foreground:",
        JSON.stringify(message)
      );

      // Tạo thông báo mới
      const newNotification: Notification = {
        id: message.messageId || `notification-${Date.now()}`,
        title: message?.notification?.title || "Thông báo mới",
        body: message?.notification?.body || "",
        data: message?.data || {},
        createdAt: new Date(),
        read: false,
      };

      // Thêm vào danh sách thông báo
      const updatedNotifications = [newNotification, ...notifications];
      setNotifications(updatedNotifications);

      // Lưu vào storage
      saveNotificationsToStorage(updatedNotifications);
    } catch (error) {
      console.error("Error handling notification:", error);
    }
  };

  // Xử lý khi nhấp vào thông báo để mở app
  const handleNotificationOpened = (message) => {
    try {
      console.log("🔔 App opened by notification:", JSON.stringify(message));

      // Tạo thông báo mới nếu chưa có
      const notificationId = message.messageId || `notification-${Date.now()}`;
      const existingNotification = notifications.find(
        (n) => n.id === notificationId
      );

      if (!existingNotification) {
        const newNotification: Notification = {
          id: notificationId,
          title: message?.notification?.title || "Thông báo mới",
          body: message?.notification?.body || "",
          data: message?.data || {},
          createdAt: new Date(),
          read: false,
        };

        const updatedNotifications = [newNotification, ...notifications];
        setNotifications(updatedNotifications);
        saveNotificationsToStorage(updatedNotifications);
      }

      // Xử lý điều hướng nếu có
      if (message?.data?.screen) {
        console.log(`Navigating to ${message.data.screen}`);
        // Điều hướng đến màn hình được chỉ định
        router.push(message.data.screen);
      }
    } catch (error) {
      console.error("Error handling opened notification:", error);
    }
  };

  // Đánh dấu thông báo đã đọc
  const markAsRead = (id: string) => {
    const updatedNotifications = notifications.map((notif) =>
      notif.id === id ? { ...notif, read: true } : notif
    );
    setNotifications(updatedNotifications);
    saveNotificationsToStorage(updatedNotifications);
  };

  // Đánh dấu tất cả thông báo đã đọc
  const markAllAsRead = () => {
    const updatedNotifications = notifications.map((notif) => ({
      ...notif,
      read: true,
    }));
    setNotifications(updatedNotifications);
    saveNotificationsToStorage(updatedNotifications);
  };

  // Xóa tất cả thông báo
  const clearNotifications = () => {
    setNotifications([]);
    saveNotificationsToStorage([]);
  };

  // Effect để khởi tạo khi component mount
  useEffect(() => {
    initialize();
  }, []);

  // Theo dõi trạng thái của app để refresh khi cần thiết
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        // Load lại thông báo khi app quay trở lại foreground
        // Hiện tại chỉ load từ AsyncStorage, nhưng có thể mở rộng để load từ server
        initialize();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Tính toán số thông báo chưa đọc
  const unreadCount = notifications.filter((notif) => !notif.read).length;

  // Thông báo mới nhất
  const lastNotification = notifications.length > 0 ? notifications[0] : null;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        lastNotification,
        markAsRead,
        markAllAsRead,
        clearNotifications,
        initialize,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
