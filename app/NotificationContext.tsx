import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { Alert } from "react-native";

// Force dùng Firebase thực thay vì mock
export const FORCE_REAL_FIREBASE = true;

// Key cho FCM token
const FCM_TOKEN_STORAGE_KEY = "fcm_token";

// Định nghĩa giống với frontend
type Notification = {
  id: string;
  title: string;
  body: string;
  read: boolean;
  receivedAt: number;
  isNew: boolean; // Thêm trạng thái mới
};

type NotificationContextType = {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (remoteMessage: any) => void;
  markAllAsRead: () => void;
  setupUserNotifications: (jwt: string) => Promise<boolean>;
  clearNotifications: () => void;
};

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

// Key lưu trữ danh sách thông báo
const NOTIFICATIONS_STORAGE_KEY = "mobile_notifications_list";

// Tạo giá trị mặc định với handlers rỗng để tránh lỗi khi lazy loading
const defaultHandlers = {
  setupForegroundNotificationHandler: () => () => {},
  setupNotificationOpenedHandler: () => () => {},
  setupNotifications: async () => false,
};

/**
 * Kiểm tra xem có đang sử dụng test token không và hiện cảnh báo
 */
const checkForMockToken = async () => {
  try {
    const token = await AsyncStorage.getItem(FCM_TOKEN_STORAGE_KEY);

    if (token && token.startsWith("mock-fcm-token")) {
      console.warn(
        "[Notification] WARNING: Using mock FCM token. Notifications will NOT work with backend!"
      );

      if (__DEV__) {
        setTimeout(() => {
          Alert.alert(
            "⚠️ Cảnh báo: Token FCM giả",
            "Ứng dụng đang sử dụng mock token. Thông báo sẽ KHÔNG hoạt động với backend thật!\n\n" +
              "Hãy chạy development build để sử dụng token thật.",
            [{ text: "OK" }]
          );
        }, 2000); // Delay để không chặn UI khởi động
      }
      return true;
    }
    return false;
  } catch (error) {
    console.error("[Notification] Error checking for mock token:", error);
    return false;
  }
};

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [handlers, setHandlers] = useState(defaultHandlers);

  // Tải module Firebase/mock và thông báo đã lưu
  useEffect(() => {
    const initialize = async () => {
      try {
        // Xác định môi trường - Override với FORCE_REAL_FIREBASE
        const isExpoGoEnv = FORCE_REAL_FIREBASE
          ? false
          : __DEV__ && !process.env.EAS_BUILD_RUNNER;
        console.log(
          `[Notification] FORCE_REAL_FIREBASE=${FORCE_REAL_FIREBASE}, Using ${
            isExpoGoEnv ? "mock" : "real"
          } Firebase module`
        );

        // Load module phù hợp
        let moduleHandlers;

        if (isExpoGoEnv) {
          // Dùng mock trong Expo Go
          moduleHandlers = require("../services/mock-firebase");
        } else {
          // Dùng Firebase thật trong dev build/prod
          try {
            moduleHandlers = require("../services/firebase-messaging");
          } catch (error) {
            console.error(
              "[Notification] Firebase module failed, using mock:",
              error
            );
            moduleHandlers = require("../services/mock-firebase");
          }
        }

        // Lưu handlers
        setHandlers({
          setupForegroundNotificationHandler:
            moduleHandlers.setupForegroundNotificationHandler,
          setupNotificationOpenedHandler:
            moduleHandlers.setupNotificationOpenedHandler,
          setupNotifications: moduleHandlers.setupNotifications,
        });

        // Kiểm tra mock token
        await checkForMockToken();

        // Tải thông báo đã lưu
        try {
          const savedJson = await AsyncStorage.getItem(
            NOTIFICATIONS_STORAGE_KEY
          );
          if (savedJson) {
            const savedNotifications = JSON.parse(savedJson);
            console.log(
              "[Notification] Loaded saved notifications:",
              savedNotifications.length
            );
            setNotifications(savedNotifications);
          }
        } catch (storageError) {
          console.error(
            "[Notification] Error loading saved notifications:",
            storageError
          );
        }
      } catch (error) {
        console.error("[Notification] Initialization error:", error);
        // Context vẫn hoạt động với handlers mặc định
      }
    };

    initialize();
  }, []);

  // Lưu thông báo khi có thay đổi
  useEffect(() => {
    const saveNotifications = async () => {
      try {
        await AsyncStorage.setItem(
          NOTIFICATIONS_STORAGE_KEY,
          JSON.stringify(notifications)
        );
      } catch (error) {
        console.error("[Notification] Error saving notifications:", error);
      }
    };

    saveNotifications();
  }, [notifications]);

  // Thiết lập notification handlers
  useEffect(() => {
    // Không setup nếu đang dùng handlers mặc định
    if (handlers === defaultHandlers) return;

    let unsubscribeForeground: () => void = () => {};
    let unsubscribeOpened: () => void = () => {};

    try {
      unsubscribeForeground = handlers.setupForegroundNotificationHandler(
        (remoteMessage: any) => {
          console.log("[Notification] Received in foreground");
          addNotification(remoteMessage);
        }
      );

      unsubscribeOpened = handlers.setupNotificationOpenedHandler(
        (remoteMessage: any) => {
          console.log("[Notification] Notification opened");
          addNotification({
            ...remoteMessage,
            read: true,
          });
        }
      );
    } catch (error) {
      console.error("[Notification] Error setting up handlers:", error);
    }

    return () => {
      if (unsubscribeForeground) unsubscribeForeground();
      if (unsubscribeOpened) unsubscribeOpened();
    };
  }, [handlers]);

  // Thêm thông báo mới
  const addNotification = (remoteMessage: any) => {
    const { notification, messageId, sentTime } = remoteMessage || {};

    if (!notification) {
      console.log(
        "[Notification] Received message without notification data:",
        remoteMessage
      );
      return;
    }

    const newNotification: Notification = {
      id: messageId || `notification_${Date.now()}`,
      title: notification.title || "Thông báo mới",
      body: notification.body || "",
      read: remoteMessage.read || false,
      receivedAt: sentTime || Date.now(),
      isNew: true, // Đánh dấu thông báo mới để có thể highlight
    };

    console.log("[Notification] Adding new notification:", newNotification);

    // Không hiện Alert nữa, chỉ thêm notification vào state
    setNotifications((prev) => {
      // Kiểm tra nếu thông báo đã tồn tại (tránh trùng lặp)
      const exists = prev.some((n) => n.id === newNotification.id);
      if (exists) {
        return prev.map((n) =>
          n.id === newNotification.id
            ? { ...n, read: n.read || newNotification.read }
            : n
        );
      }
      return [newNotification, ...prev];
    });

    // Sau 3 giây, xóa trạng thái "mới" khỏi thông báo để tắt hiệu ứng highlight
    setTimeout(() => {
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === newNotification.id ? { ...n, isNew: false } : n
        )
      );
    }, 3000);
  };

  // Đánh dấu tất cả thông báo đã đọc
  const markAllAsRead = () => {
    if (notifications.some((n) => !n.read)) {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  };

  // Xóa tất cả thông báo
  const clearNotifications = () => {
    setNotifications([]);
  };

  // Thiết lập thông báo cho người dùng
  const setupUserNotifications = async (jwt: string) => {
    try {
      return await handlers.setupNotifications(jwt);
    } catch (error) {
      console.error("[Notification] Error in setupUserNotifications:", error);
      return false;
    }
  };

  // Tính số thông báo chưa đọc
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Luôn render context ngay cả khi đang khởi tạo
  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAllAsRead,
        setupUserNotifications,
        clearNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

// Hook để sử dụng context
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
};

export default NotificationProvider;
