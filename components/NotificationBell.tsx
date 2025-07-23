import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useNotification } from "../app/NotificationContext";

const { width } = Dimensions.get("window");

export default function NotificationBell() {
  const { notifications, unreadCount, markAllAsRead } = useNotification();
  const [showModal, setShowModal] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const bellRef = useRef(null);

  // Hiệu ứng rung khi có thông báo mới
  useEffect(() => {
    if (notifications.some((n) => n.isNew)) {
      setIsShaking(true);
      const timer = setTimeout(() => {
        setIsShaking(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notifications]);

  const toggleModal = () => {
    if (showModal) {
      markAllAsRead();
    }
    setShowModal(!showModal);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
    });
  };

  return (
    <View style={styles.container}>
      <Pressable
        onPress={toggleModal}
        style={({ pressed }) => [
          styles.iconContainer,
          pressed && styles.pressed,
        ]}
        ref={bellRef}
      >
        <Ionicons
          name="notifications"
          size={24}
          color="#000"
          style={[isShaking && styles.shaking]}
        />
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount}</Text>
          </View>
        )}
      </Pressable>

      <Modal
        visible={showModal}
        transparent={true}
        animationType="fade"
        onRequestClose={toggleModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Thông báo</Text>
              <TouchableOpacity
                onPress={toggleModal}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#555" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.notificationsList}>
              {notifications.length === 0 ? (
                <Text style={styles.emptyText}>Không có thông báo nào</Text>
              ) : (
                notifications.map((notification) => (
                  <View
                    key={notification.id}
                    style={[
                      styles.notificationItem,
                      !notification.read && styles.unread,
                      notification.isNew && styles.newNotification,
                    ]}
                  >
                    <Text style={styles.notificationTitle}>
                      {notification.title}
                    </Text>
                    <Text style={styles.notificationBody}>
                      {notification.body}
                    </Text>
                    <Text style={styles.notificationTime}>
                      {formatTime(notification.receivedAt)}
                    </Text>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginRight: 10,
  },
  iconContainer: {
    padding: 8,
    borderRadius: 20,
  },
  pressed: {
    opacity: 0.7,
  },
  badge: {
    position: "absolute",
    right: 0,
    top: 0,
    backgroundColor: "#ff4c4c",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    width: width * 0.85,
    maxHeight: "70%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 5,
  },
  notificationsList: {
    maxHeight: 400,
  },
  notificationItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#fff",
  },
  unread: {
    backgroundColor: "#f0f7ff",
  },
  newNotification: {
    backgroundColor: "#e6f7ff",
    borderLeftWidth: 3,
    borderLeftColor: "#1890ff",
  },
  notificationTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 5,
  },
  notificationBody: {
    color: "#555",
    marginBottom: 5,
  },
  notificationTime: {
    fontSize: 12,
    color: "#999",
    alignSelf: "flex-end",
  },
  emptyText: {
    padding: 20,
    textAlign: "center",
    color: "#999",
  },
  shaking: {
    transform: [{ rotate: "5deg" }],
  },
});
