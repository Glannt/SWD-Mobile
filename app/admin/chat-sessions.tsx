import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { getApiBaseUrl } from "../../utils/api";
import { useAuth } from "../AuthContext";

// Tính toán chiều cao của TabBar để đảm bảo padding đúng
const TAB_BAR_HEIGHT = Platform.OS === "ios" ? 80 : 60;
const { width } = Dimensions.get("window");

const API_BASE_URL = getApiBaseUrl();

// Menu items for admin navigation
const MENU_ITEMS = [
  {
    id: "dashboard",
    title: "Dashboard",
    icon: "grid-outline",
    route: "/admin/dashboard",
  },
  {
    id: "users",
    title: "User Management",
    icon: "people-outline",
    route: "/admin/user-management",
  },
  {
    id: "chat-sessions",
    title: "Quản lý Chat Sessions",
    icon: "chatbubbles-outline",
    route: "/admin/chat-sessions",
  },
];

// Interface for chat session
interface ChatMessage {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: string;
}

interface ChatSession {
  sessionId: string;
  userName: string;
  email: string;
  user_id: string;
  createdAt: string;
  messages?: ChatMessage[];
  tag?: string | null;
}

export default function ChatSessionsManagementScreen() {
  const { userData, accessToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(
    null
  );
  const [showSessionDetail, setShowSessionDetail] = useState(false);
  const [activeMenuItem, setActiveMenuItem] = useState("chat-sessions");

  // Kiểm tra xem user có quyền admin không ngay khi vào trang
  useEffect(() => {
    const checkAdminAccess = async () => {
      setCheckingAuth(true);

      // Kiểm tra đã đăng nhập chưa
      if (!accessToken) {
        console.log("[CHAT_SESSIONS] Not logged in, redirecting to profile");
        router.navigate("/(tabs)/profile");
        return;
      }

      // Kiểm tra quyền admin
      if (!userData || userData?.role !== "admin") {
        // Nếu không phải admin, chuyển hướng về trang profile mà không hiển thị thông báo
        console.log("[CHAT_SESSIONS] Not admin, redirecting to profile");
        router.navigate("/(tabs)/profile");
        return;
      }

      setCheckingAuth(false);

      // Nếu là admin, load danh sách phiên chat
      fetchChatSessions();
    };

    checkAdminAccess();
  }, [userData, accessToken]);

  // Fetch chat sessions data
  const fetchChatSessions = async () => {
    setLoading(true);
    try {
      console.log(
        `[CHAT_SESSIONS] Fetching chat sessions from API: ${API_BASE_URL}/admin/dashboard/sessions`
      );

      const response = await fetch(`${API_BASE_URL}/admin/dashboard/sessions`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("[CHAT_SESSIONS] Sessions raw data:", data);

        // Flatten the data structure
        const flattenedSessions: ChatSession[] = [];
        const sessionsArray = data.data || data;

        sessionsArray.forEach((userData: any) => {
          if (userData && userData.sessions) {
            userData.sessions.forEach((session: any) => {
              flattenedSessions.push({
                userName: userData.fullName,
                user_id: userData.user_id,
                email: userData.email,
                sessionId: session.sessionId,
                createdAt: session.createdAt,
                tag: session.tag || null,
              });
            });
          }
        });

        console.log("[CHAT_SESSIONS] Flattened sessions:", flattenedSessions);
        setSessions(flattenedSessions);
        setError(null);
      } else {
        console.error(
          "[CHAT_SESSIONS] Failed to fetch sessions:",
          response.status,
          await response.text()
        );
        // Lưu lại lỗi trong state nhưng không hiển thị lên UI
        setError("Không thể tải danh sách phiên chat");
      }
    } catch (error) {
      console.error("[CHAT_SESSIONS] Error fetching sessions data:", error);
      // Lưu lại lỗi trong state nhưng không hiển thị lên UI
      setError("Đã xảy ra lỗi khi tải danh sách phiên chat");
    } finally {
      setLoading(false);
    }
  };

  // Format date to Vietnamese format
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return dateString;
    }
  };

  // Filter sessions based on search
  const filteredSessions = sessions.filter((session) => {
    return (
      searchQuery === "" ||
      session.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.sessionId.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // View session details
  const handleViewSession = (session: ChatSession) => {
    setSelectedSession(session);
    setShowSessionDetail(true);
    // In a real app, you would fetch the messages for this session here
  };

  // Admin Menu Component
  const AdminMenu = () => (
    <View style={styles.menuContainer}>
      <Text style={styles.menuTitle}>MENU</Text>
      {MENU_ITEMS.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={[
            styles.menuItem,
            activeMenuItem === item.id && styles.menuItemActive,
          ]}
          onPress={() => {
            setActiveMenuItem(item.id);
            router.push(item.route);
          }}
        >
          <Ionicons
            name={item.icon}
            size={20}
            color={activeMenuItem === item.id ? "#465fff" : "#64748b"}
          />
          <Text
            style={[
              styles.menuItemText,
              activeMenuItem === item.id && styles.menuItemTextActive,
            ]}
          >
            {item.title}
          </Text>
        </TouchableOpacity>
      ))}
      <Text style={styles.menuTitle}>OTHERS</Text>
    </View>
  );

  // Header với nút quay lại
  const ChatSessionsHeader = () => (
    <View style={styles.header}>
      <View>
        <Text style={styles.headerTitle}>Quản lý Chat Sessions</Text>
        <Text style={styles.headerSubtitle}>
          Xem và quản lý tất cả phiên chat trong hệ thống
        </Text>
      </View>
    </View>
  );

  // Nếu không có quyền admin, không hiển thị nội dung
  if (!accessToken || !userData || userData.role !== "admin") {
    return null;
  }

  return (
    <View style={styles.container}>
      <ChatSessionsHeader />
      <AdminMenu />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#a0aec0"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm theo tên, email hoặc ID phiên..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#465fff" />
          <Text style={styles.loadingText}>
            Đang tải danh sách phiên chat...
          </Text>
        </View>
      ) : filteredSessions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="chatbubbles" size={48} color="#a0aec0" />
          <Text style={styles.emptyText}>Không tìm thấy phiên chat nào</Text>
        </View>
      ) : (
        <FlatList
          data={filteredSessions}
          keyExtractor={(item) => item.sessionId}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.sessionCard}
              onPress={() => handleViewSession(item)}
            >
              <View style={styles.sessionInfo}>
                <View style={styles.avatarContainer}>
                  <Text style={styles.avatarText}>
                    {item.userName.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.sessionDetails}>
                  <Text style={styles.userName}>{item.userName}</Text>
                  <Text style={styles.userEmail}>{item.email}</Text>
                  <View style={styles.sessionMeta}>
                    <Text style={styles.sessionId}>
                      ID: {item.sessionId.substring(0, 8)}...
                    </Text>
                    <Text style={styles.sessionDate}>
                      {formatDate(item.createdAt)}
                    </Text>
                  </View>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#a0aec0" />
            </TouchableOpacity>
          )}
        />
      )}

      {/* Refresh Button */}
      <TouchableOpacity
        style={styles.refreshButton}
        onPress={fetchChatSessions}
      >
        <Ionicons name="refresh" size={20} color="#fff" />
        <Text style={styles.refreshButtonText}>Làm mới dữ liệu</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6f8fb",
    paddingBottom: TAB_BAR_HEIGHT + 20, // Thêm padding để tránh bị che bởi TabBar
    paddingTop: Platform.OS === "android" ? 10 : 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingTop: Platform.OS === "android" ? 50 : 24,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#23232b",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#666",
  },
  menuContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4a5568",
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  menuItemActive: {
    backgroundColor: "#f0f9eb", // Light green background for active item
    borderLeftWidth: 4,
    borderLeftColor: "#465fff",
  },
  menuItemText: {
    fontSize: 14,
    color: "#64748b",
    marginLeft: 12,
  },
  menuItemTextActive: {
    color: "#465fff",
    fontWeight: "bold",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: "#4a5568",
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    color: "#666",
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  errorText: {
    marginTop: 12,
    color: "#f56565",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#465fff",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    marginTop: 12,
    color: "#a0aec0",
    fontSize: 16,
    textAlign: "center",
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  sessionCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sessionInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#465fff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  sessionDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2d3748",
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: "#4a5568",
    marginBottom: 6,
  },
  sessionMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sessionId: {
    fontSize: 12,
    color: "#718096",
  },
  sessionDate: {
    fontSize: 12,
    color: "#718096",
  },
  refreshButton: {
    flexDirection: "row",
    backgroundColor: "#465fff",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 16,
    marginBottom: 24,
  },
  refreshButtonText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 8,
  },
});
