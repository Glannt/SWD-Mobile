import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../AuthContext";

// Tính toán chiều cao của TabBar để đảm bảo padding đúng
const TAB_BAR_HEIGHT = Platform.OS === "ios" ? 80 : 60;
const { width } = Dimensions.get("window");

// Chọn URL API phù hợp với môi trường
const getApiBaseUrl = () => {
  if (Platform.OS === "android") {
    console.log(
      "[DASHBOARD] Using Android API URL: http://10.0.2.2:3000/api/v1"
    );
    return "http://10.0.2.2:3000/api/v1"; // Cho Android Emulator
  } else if (Platform.OS === "ios") {
    // Trên iOS simulator, localhost sẽ trỏ đến máy ảo iOS
    console.log("[DASHBOARD] Using iOS API URL: http://localhost:3000/api/v1");
    return "http://localhost:3000/api/v1";
  } else if (Platform.OS === "web") {
    // Trên web, sử dụng current host
    const host = window.location.hostname;
    const url = `http://${host}:3000/api/v1`;
    console.log(`[DASHBOARD] Using Web API URL: ${url}`);
    return url;
  }
  console.log(
    "[DASHBOARD] Using fallback API URL: http://localhost:3000/api/v1"
  );
  return "http://localhost:3000/api/v1"; // Fallback
};

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

export default function AdminDashboardScreen() {
  const { userData, accessToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [summary, setSummary] = useState({
    totalVisits: 0,
    totalUsersChatted: 0,
    totalSessions: 0,
  });
  const [sessions, setSessions] = useState([]);
  const [chatUsers, setChatUsers] = useState([]);
  const [monthlyData, setMonthlyData] = useState({
    target: "$20K",
    revenue: "$20K",
    today: "$20K",
    targetTrend: "down", // 'up' or 'down'
    revenueTrend: "up",
    todayTrend: "up",
  });
  const [activeMenuItem, setActiveMenuItem] = useState("dashboard");

  // Kiểm tra xem user có quyền admin không ngay khi vào trang
  useEffect(() => {
    const checkAdminAccess = async () => {
      setCheckingAuth(true);

      // Kiểm tra đã đăng nhập chưa
      if (!accessToken) {
        console.log("[ADMIN_DASHBOARD] Not logged in, redirecting to profile");
        router.navigate("/(tabs)/profile");
        return;
      }

      // Kiểm tra quyền admin
      if (!userData || userData?.role !== "admin") {
        // Nếu không phải admin, chuyển hướng về trang profile mà không hiển thị thông báo
        console.log("[ADMIN_DASHBOARD] Not admin, redirecting to profile");
        router.navigate("/(tabs)/profile");
        return;
      }

      setCheckingAuth(false);

      // Nếu là admin, load dữ liệu thống kê
      fetchDashboardData();
    };

    checkAdminAccess();
  }, [userData, accessToken]);

  // Fetch dashboard data from API
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      console.log(`[DASHBOARD] Fetching data from API: ${API_BASE_URL}`);

      // Fetch summary data
      const summaryRes = await fetch(
        `${API_BASE_URL}/admin/dashboard/summary`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (summaryRes.ok) {
        const summaryData = await summaryRes.json();
        console.log("[DASHBOARD] Summary data:", summaryData);
        setSummary(summaryData.data || summaryData);
      } else {
        console.error(
          "[DASHBOARD] Failed to fetch summary:",
          summaryRes.status,
          await summaryRes.text()
        );
      }

      // Fetch sessions data - updated to match backend API structure
      const sessionsRes = await fetch(
        `${API_BASE_URL}/admin/dashboard/sessions`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (sessionsRes.ok) {
        const sessionsData = await sessionsRes.json();
        console.log("[DASHBOARD] Sessions raw data:", sessionsData);

        // Flatten the data structure to match what the UI expects
        const flattenedSessions = [];
        const sessionsArray = sessionsData.data || sessionsData;

        sessionsArray.forEach((userData) => {
          if (userData && userData.sessions) {
            userData.sessions.forEach((session) => {
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

        console.log("[DASHBOARD] Flattened sessions:", flattenedSessions);
        setSessions(flattenedSessions);
      } else {
        console.error(
          "[DASHBOARD] Failed to fetch sessions:",
          sessionsRes.status,
          await sessionsRes.text()
        );
      }

      // Fetch chat users data - updated to match backend API structure
      const usersRes = await fetch(`${API_BASE_URL}/admin/dashboard/users`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        console.log("[DASHBOARD] Users data:", usersData);
        setChatUsers(usersData.data || usersData);
      } else {
        console.error(
          "[DASHBOARD] Failed to fetch users:",
          usersRes.status,
          await usersRes.text()
        );
      }
    } catch (error) {
      console.error("[DASHBOARD] Error fetching data:", error);
      Alert.alert("Lỗi", "Không thể lấy dữ liệu từ máy chủ");
    } finally {
      setLoading(false);
    }
  };

  // Hiển thị loading khi đang kiểm tra quyền truy cập
  if (checkingAuth) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#465fff" />
        <Text style={styles.loadingText}>Đang kiểm tra quyền truy cập...</Text>
      </View>
    );
  }

  // Header với nút quay lại
  const DashboardHeader = () => (
    <View style={styles.header}>
      <View>
        <Text style={styles.headerTitle}>Bảng điều khiển</Text>
        <Text style={styles.headerSubtitle}>
          Xin chào, {userData?.fullName || "Admin"}
        </Text>
      </View>
    </View>
  );

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
            if (item.route !== "/admin/dashboard") {
              router.push(item.route);
            }
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

  // Nếu không có quyền admin, không hiển thị nội dung
  if (!accessToken || !userData || userData.role !== "admin") {
    return null;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <DashboardHeader />
      <AdminMenu />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#465fff" />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
        </View>
      ) : (
        <>
          {/* Thống kê tổng quan */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thống kê tổng quan</Text>
            <View style={styles.statsContainer}>
              {/* Card tổng số lượt truy cập */}
              <View style={styles.statCard}>
                <View
                  style={[
                    styles.statIconContainer,
                    { backgroundColor: "#e6f0ff" },
                  ]}
                >
                  <Ionicons name="time-outline" size={24} color="#4299e1" />
                </View>
                <Text style={[styles.statNumber, { color: "#4299e1" }]}>
                  {summary.totalVisits || "--"}
                </Text>
                <Text style={styles.statLabel}>Tổng lượt truy cập</Text>
              </View>

              {/* Card tổng số user đã chat */}
              <View style={styles.statCard}>
                <View
                  style={[
                    styles.statIconContainer,
                    { backgroundColor: "#eef2ff" },
                  ]}
                >
                  <Ionicons name="people-outline" size={24} color="#667eea" />
                </View>
                <Text style={[styles.statNumber, { color: "#667eea" }]}>
                  {summary.totalUsersChatted || "--"}
                </Text>
                <Text style={styles.statLabel}>User đã chat</Text>
              </View>

              {/* Card tổng số session chat */}
              <View style={styles.statCard}>
                <View
                  style={[
                    styles.statIconContainer,
                    { backgroundColor: "#f3e8ff" },
                  ]}
                >
                  <Ionicons
                    name="chatbubbles-outline"
                    size={24}
                    color="#9f7aea"
                  />
                </View>
                <Text style={[styles.statNumber, { color: "#9f7aea" }]}>
                  {summary.totalSessions || "--"}
                </Text>
                <Text style={styles.statLabel}>Session chat</Text>
              </View>

              {/* Card placeholder */}
              <View style={styles.statCard}>
                <View
                  style={[
                    styles.statIconContainer,
                    { backgroundColor: "#e6ffec" },
                  ]}
                >
                  <Ionicons name="timer-outline" size={24} color="#48bb78" />
                </View>
                <Text style={[styles.statNumber, { color: "#48bb78" }]}>
                  --
                </Text>
                <Text style={styles.statLabel}>Số liệu khác</Text>
              </View>
            </View>
          </View>

          {/* Monthly Target Card */}
          <View style={styles.section}>
            <View style={styles.monthlyTargetCard}>
              <View style={styles.monthlyTargetHeader}>
                <View>
                  <Text style={styles.monthlyTargetTitle}>
                    Mục tiêu hàng tháng
                  </Text>
                  <Text style={styles.monthlyTargetSubtitle}>
                    Mục tiêu bạn đã đặt cho mỗi tháng
                  </Text>
                </View>
                <TouchableOpacity>
                  <Ionicons name="ellipsis-vertical" size={20} color="#666" />
                </TouchableOpacity>
              </View>

              {/* Radial chart placeholder */}
              <View style={styles.radialChartContainer}>
                <View style={styles.radialChart}>
                  <Text style={styles.radialChartValue}>75.55%</Text>
                </View>
                <View style={styles.progressBadge}>
                  <Text style={styles.progressBadgeText}>+10%</Text>
                </View>
              </View>

              <Text style={styles.monthlyTargetMessage}>
                Bạn kiếm được 3.287$ hôm nay, cao hơn tháng trước. Hãy tiếp tục
                phát huy!
              </Text>

              {/* Stats row */}
              <View style={styles.monthlyStatsRow}>
                <View style={styles.monthlyStat}>
                  <Text style={styles.monthlyStatLabel}>Mục tiêu</Text>
                  <View style={styles.monthlyStatValueContainer}>
                    <Text style={styles.monthlyStatValue}>
                      {monthlyData.target}
                    </Text>
                    <Ionicons
                      name={
                        monthlyData.targetTrend === "up"
                          ? "arrow-up"
                          : "arrow-down"
                      }
                      size={16}
                      color={
                        monthlyData.targetTrend === "up" ? "#039855" : "#D92D20"
                      }
                    />
                  </View>
                </View>

                <View style={styles.statDivider} />

                <View style={styles.monthlyStat}>
                  <Text style={styles.monthlyStatLabel}>Doanh thu</Text>
                  <View style={styles.monthlyStatValueContainer}>
                    <Text style={styles.monthlyStatValue}>
                      {monthlyData.revenue}
                    </Text>
                    <Ionicons
                      name={
                        monthlyData.revenueTrend === "up"
                          ? "arrow-up"
                          : "arrow-down"
                      }
                      size={16}
                      color={
                        monthlyData.revenueTrend === "up"
                          ? "#039855"
                          : "#D92D20"
                      }
                    />
                  </View>
                </View>

                <View style={styles.statDivider} />

                <View style={styles.monthlyStat}>
                  <Text style={styles.monthlyStatLabel}>Hôm nay</Text>
                  <View style={styles.monthlyStatValueContainer}>
                    <Text style={styles.monthlyStatValue}>
                      {monthlyData.today}
                    </Text>
                    <Ionicons
                      name={
                        monthlyData.todayTrend === "up"
                          ? "arrow-up"
                          : "arrow-down"
                      }
                      size={16}
                      color={
                        monthlyData.todayTrend === "up" ? "#039855" : "#D92D20"
                      }
                    />
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Bảng session chat */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Danh sách session chat</Text>
            <View style={styles.tableContainer}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, { flex: 1 }]}>User</Text>
                <Text style={[styles.tableHeaderText, { flex: 1 }]}>
                  Session ID
                </Text>
                <Text style={[styles.tableHeaderText, { flex: 0.5 }]}>Tag</Text>
              </View>

              {sessions.length === 0 ? (
                <View style={styles.emptyTableRow}>
                  <Text style={styles.emptyTableText}>
                    Không có session nào
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={sessions}
                  keyExtractor={(item, index) => index.toString()}
                  scrollEnabled={false}
                  renderItem={({ item }) => {
                    // Kiểm tra xem session có dạng mong muốn không
                    if (!item || typeof item !== "object") return null;

                    return (
                      <View style={styles.tableRow}>
                        <Text
                          style={[styles.tableCell, { flex: 1 }]}
                          numberOfLines={1}
                        >
                          {item.userName ||
                            item.fullName ||
                            item.user_id ||
                            "-"}
                        </Text>
                        <Text
                          style={[styles.tableCell, { flex: 1 }]}
                          numberOfLines={1}
                        >
                          {item.sessionId || item.session_id || "-"}
                        </Text>
                        <Text style={[styles.tableCell, { flex: 0.5 }]}>
                          {item.tag || "-"}
                        </Text>
                      </View>
                    );
                  }}
                />
              )}
            </View>
          </View>

          {/* Bảng user đã chat */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>User đã từng chat</Text>
            <View style={styles.tableContainer}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, { flex: 1 }]}>
                  Họ tên
                </Text>
                <Text style={[styles.tableHeaderText, { flex: 1 }]}>Email</Text>
              </View>

              {chatUsers.length === 0 ? (
                <View style={styles.emptyTableRow}>
                  <Text style={styles.emptyTableText}>Không có user nào</Text>
                </View>
              ) : (
                <FlatList
                  data={chatUsers}
                  keyExtractor={(item, index) => index.toString()}
                  scrollEnabled={false}
                  renderItem={({ item }) => {
                    // Kiểm tra xem user có dạng mong muốn không
                    if (!item || typeof item !== "object") return null;

                    return (
                      <View style={styles.tableRow}>
                        <Text
                          style={[styles.tableCell, { flex: 1 }]}
                          numberOfLines={1}
                        >
                          {item.fullName || item.name || item.user_id || "-"}
                        </Text>
                        <Text
                          style={[styles.tableCell, { flex: 1 }]}
                          numberOfLines={1}
                        >
                          {item.email || "-"}
                        </Text>
                      </View>
                    );
                  }}
                />
              )}
            </View>
          </View>

          {/* Nút refresh */}
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={fetchDashboardData}
          >
            <Ionicons name="refresh" size={20} color="#fff" />
            <Text style={styles.refreshButtonText}>Làm mới dữ liệu</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6f8fb",
    paddingTop: Platform.OS === "android" ? 10 : 0,
  },
  contentContainer: {
    paddingBottom: TAB_BAR_HEIGHT + 20, // Thêm padding để tránh bị che bởi TabBar
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    height: 300,
  },
  loadingText: {
    marginTop: 12,
    color: "#666",
    fontSize: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingTop: Platform.OS === "android" ? 50 : 24,
    marginBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    marginRight: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 1,
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
  section: {
    padding: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#23232b",
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginHorizontal: -4,
  },
  statCard: {
    width: (width - 40) / 2,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 4,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  monthlyTargetCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  monthlyTargetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
  },
  monthlyTargetTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#23232b",
  },
  monthlyTargetSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  radialChartContainer: {
    height: 200,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    position: "relative",
  },
  radialChart: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 12,
    borderColor: "#465fff",
    alignItems: "center",
    justifyContent: "center",
    // Create a semi-circle effect
    borderTopColor: "#e2e8f0",
    borderRightColor: "#e2e8f0",
    transform: [{ rotate: "-45deg" }],
  },
  radialChartValue: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#23232b",
    transform: [{ rotate: "45deg" }],
  },
  progressBadge: {
    position: "absolute",
    bottom: 10,
    backgroundColor: "rgba(3, 152, 85, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  progressBadgeText: {
    color: "#039855",
    fontSize: 12,
    fontWeight: "bold",
  },
  monthlyTargetMessage: {
    textAlign: "center",
    color: "#666",
    fontSize: 14,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
  },
  monthlyStatsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 16,
    backgroundColor: "#f8fafc",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  monthlyStat: {
    alignItems: "center",
  },
  monthlyStatLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  monthlyStatValueContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  monthlyStatValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#23232b",
    marginRight: 4,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: "#e2e8f0",
  },
  tableContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f8fafc",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  tableHeaderText: {
    fontWeight: "bold",
    color: "#4a5568",
    fontSize: 14,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  tableCell: {
    color: "#2d3748",
    fontSize: 14,
  },
  emptyTableRow: {
    padding: 20,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  emptyTableText: {
    color: "#a0aec0",
    fontStyle: "italic",
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
  tableTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 12,
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
});
