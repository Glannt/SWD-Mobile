import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useFcmToken } from "../hooks/useFcmToken";

interface NotificationPermissionModalProps {
  isVisible: boolean;
  onClose: () => void;
  jwt?: string;
  onSuccess?: () => void;
}

export const NotificationPermissionModal: React.FC<
  NotificationPermissionModalProps
> = ({ isVisible, onClose, jwt, onSuccess }) => {
  const { registerFcmToken } = useFcmToken();

  // Xử lý khi người dùng đồng ý
  const handleEnableNotifications = async () => {
    console.log("[Modal] User agreed to enable notifications");
    try {
      const success = await registerFcmToken();

      if (success) {
        console.log("[Modal] FCM token registered successfully");
        if (onSuccess) {
          onSuccess();
        }
      } else {
        console.log("[Modal] Failed to register FCM token");
      }

      onClose();
    } catch (error) {
      console.error("[Modal] Error registering FCM token:", error);
      onClose();
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Bật thông báo đẩy</Text>

          <Text style={styles.modalText}>
            Để không bỏ lỡ thông tin quan trọng, chúng tôi khuyến nghị bạn bật
            thông báo cho ứng dụng.
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.buttonCancel]}
              onPress={onClose}
            >
              <Text style={styles.buttonCancelText}>Để sau</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.buttonEnable]}
              onPress={handleEnableNotifications}
            >
              <Text style={styles.buttonEnableText}>Bật thông báo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "85%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: "#333",
  },
  modalText: {
    marginBottom: 24,
    textAlign: "center",
    fontSize: 16,
    lineHeight: 22,
    color: "#555",
  },
  buttonContainer: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
  },
  button: {
    borderRadius: 10,
    padding: 12,
    elevation: 2,
    flex: 1,
    marginHorizontal: 5,
  },
  buttonCancel: {
    backgroundColor: "#f5f5f5",
  },
  buttonEnable: {
    backgroundColor: "#FF6600",
  },
  buttonCancelText: {
    color: "#666",
    fontWeight: "bold",
    textAlign: "center",
  },
  buttonEnableText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
});
