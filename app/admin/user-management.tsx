import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
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
      "[USER_MANAGEMENT] Using Android API URL: http://10.0.2.2:3000/api/v1"
    );
    return "http://10.0.2.2:3000/api/v1"; // Cho Android Emulator
  } else if (Platform.OS === "ios") {
    // Trên iOS simulator, localhost sẽ trỏ đến máy ảo iOS
    console.log(
      "[USER_MANAGEMENT] Using iOS API URL: http://localhost:3000/api/v1"
    );
    return "http://localhost:3000/api/v1";
  } else if (Platform.OS === "web") {
    // Trên web, sử dụng current host
    const host = window.location.hostname;
    const url = `http://${host}:3000/api/v1`;
    console.log(`[USER_MANAGEMENT] Using Web API URL: ${url}`);
    return url;
  }
  console.log(
    "[USER_MANAGEMENT] Using fallback API URL: http://localhost:3000/api/v1"
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

// Interface cho thông tin người dùng
interface User {
  _id: string;
  user_id: string;
  fullName: string;
  email: string;
  role: string;
  status?: string;
  isVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Vai trò người dùng
const ROLE_OPTIONS = [
  { value: "all", label: "Tất cả vai trò" },
  { value: "admin", label: "Quản trị viên" },
  { value: "student", label: "Học sinh" },
  { value: "staff", label: "Nhân viên" },
  { value: "teacher", label: "Giảng viên" },
];

// Trạng thái người dùng
const STATUS_OPTIONS = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "active", label: "Đang hoạt động" },
  { value: "inactive", label: "Không hoạt động" },
  { value: "suspended", label: "Tạm khóa" },
];

export default function UserManagementScreen() {
  const { userData, accessToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showRoleFilter, setShowRoleFilter] = useState(false);
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [activeMenuItem, setActiveMenuItem] = useState("users");

  // Kiểm tra xem user có quyền admin không ngay khi vào trang
  useEffect(() => {
    const checkAdminAccess = async () => {
      setCheckingAuth(true);

      // Kiểm tra đã đăng nhập chưa
      if (!accessToken) {
        console.log("[USER_MANAGEMENT] Not logged in, redirecting to profile");
        router.navigate("/(tabs)/profile");
        return;
      }

      // Kiểm tra quyền admin
      if (!userData || userData?.role !== "admin") {
        // Nếu không phải admin, chuyển hướng về trang profile mà không hiển thị thông báo
        console.log("[USER_MANAGEMENT] Not admin, redirecting to profile");
        router.navigate("/(tabs)/profile");
        return;
      }

      setCheckingAuth(false);

      // Nếu là admin, load danh sách người dùng
      fetchUsers();
    };

    checkAdminAccess();
  }, [userData, accessToken]);

  // Fetch users data
  const fetchUsers = async () => {
    setLoading(true);
    try {
      console.log(
        `[USER_MANAGEMENT] Fetching users from API: ${API_BASE_URL}/users`
      );

      const response = await fetch(`${API_BASE_URL}/users`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("[USER_MANAGEMENT] Users data:", data);
        setUsers(data.data || data);
        setError(null);
      } else {
        console.error(
          "[USER_MANAGEMENT] Failed to fetch users:",
          response.status,
          await response.text()
        );
        setError("Không thể tải danh sách người dùng");
      }
    } catch (error) {
      console.error("[USER_MANAGEMENT] Error fetching users data:", error);
      setError("Đã xảy ra lỗi khi tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  // Get role label in Vietnamese
  const getRoleLabel = (role: string) => {
    const roleLabels: { [key: string]: string } = {
      admin: "Quản trị viên",
      student: "Học sinh",
      staff: "Nhân viên",
      teacher: "Giảng viên",
    };
    return roleLabels[role] || role;
  };

  // Get status label in Vietnamese
  const getStatusLabel = (status: string) => {
    const statusLabels: { [key: string]: string } = {
      active: "Hoạt động",
      inactive: "Không hoạt động",
      suspended: "Tạm khóa",
    };
    return statusLabels[status || "active"] || status;
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "#48bb78";
      case "inactive":
        return "#a0aec0";
      case "suspended":
        return "#f56565";
      default:
        return "#a0aec0";
    }
  };

  // Filter users based on search, role and status
  const filteredUsers = users.filter((user) => {
    // Filter by search query
    const matchesSearch =
      searchQuery === "" ||
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    // Filter by role
    const matchesRole = selectedRole === "all" || user.role === selectedRole;

    // Filter by status
    const matchesStatus =
      selectedStatus === "all" || user.status === selectedStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Handle user deletion
  const handleDeleteUser = (user: User) => {
    Alert.alert(
      "Xác nhận xóa",
      `Bạn có chắc chắn muốn xóa người dùng ${user.fullName}?`,
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await fetch(
                `${API_BASE_URL}/users/${user.user_id}`,
                {
                  method: "DELETE",
                  headers: {
                    Authorization: `Bearer ${accessToken}`,
                  },
                }
              );

              if (response.ok) {
                Alert.alert("Thành công", "Đã xóa người dùng thành công");
                fetchUsers();
              } else {
                Alert.alert(
                  "Lỗi",
                  "Không thể xóa người dùng. Vui lòng thử lại sau."
                );
              }
            } catch (error) {
              console.error("[USER_MANAGEMENT] Error deleting user:", error);
              Alert.alert(
                "Lỗi",
                "Đã xảy ra lỗi khi xóa người dùng. Vui lòng thử lại sau."
              );
            }
          },
        },
      ]
    );
  };

  // Handle user edit
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setShowEditModal(true);
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
  const UserManagementHeader = () => (
    <View style={styles.header}>
      <View>
        <Text style={styles.headerTitle}>Quản lý người dùng</Text>
        <Text style={styles.headerSubtitle}>
          Quản lý tất cả người dùng trong hệ thống
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
      <UserManagementHeader />
      <AdminMenu />

      {/* Search and Filter Bar */}
      <View style={styles.searchFilterContainer}>
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#a0aec0"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm theo tên hoặc email..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.filtersContainer}>
          {/* Role Filter */}
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => {
              setShowRoleFilter(!showRoleFilter);
              setShowStatusFilter(false);
            }}
          >
            <Text style={styles.filterButtonText}>
              {selectedRole === "all" ? "Vai trò" : getRoleLabel(selectedRole)}
            </Text>
            <Ionicons name="chevron-down" size={16} color="#666" />
          </TouchableOpacity>

          {/* Status Filter */}
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => {
              setShowStatusFilter(!showStatusFilter);
              setShowRoleFilter(false);
            }}
          >
            <Text style={styles.filterButtonText}>
              {selectedStatus === "all"
                ? "Trạng thái"
                : getStatusLabel(selectedStatus)}
            </Text>
            <Ionicons name="chevron-down" size={16} color="#666" />
          </TouchableOpacity>

          {/* Add User Button */}
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowCreateModal(true)}
          >
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.addButtonText}>Tạo mới</Text>
          </TouchableOpacity>
        </View>

        {/* Role Filter Dropdown */}
        {showRoleFilter && (
          <View style={styles.filterDropdown}>
            {ROLE_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.filterOption,
                  selectedRole === option.value && styles.filterOptionSelected,
                ]}
                onPress={() => {
                  setSelectedRole(option.value);
                  setShowRoleFilter(false);
                }}
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    selectedRole === option.value &&
                      styles.filterOptionTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Status Filter Dropdown */}
        {showStatusFilter && (
          <View style={styles.filterDropdown}>
            {STATUS_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.filterOption,
                  selectedStatus === option.value &&
                    styles.filterOptionSelected,
                ]}
                onPress={() => {
                  setSelectedStatus(option.value);
                  setShowStatusFilter(false);
                }}
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    selectedStatus === option.value &&
                      styles.filterOptionTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#465fff" />
          <Text style={styles.loadingText}>
            Đang tải danh sách người dùng...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#f56565" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchUsers}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : filteredUsers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="people" size={48} color="#a0aec0" />
          <Text style={styles.emptyText}>Không tìm thấy người dùng nào</Text>
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.user_id}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <View style={styles.userCard}>
              <View style={styles.userInfo}>
                <View style={styles.avatarContainer}>
                  <Text style={styles.avatarText}>
                    {item.fullName.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.userDetails}>
                  <Text style={styles.userName}>{item.fullName}</Text>
                  <Text style={styles.userEmail}>{item.email}</Text>
                  <View style={styles.userMeta}>
                    <View style={styles.roleContainer}>
                      <Ionicons name="person" size={12} color="#4a5568" />
                      <Text style={styles.roleText}>
                        {getRoleLabel(item.role)}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.statusContainer,
                        {
                          backgroundColor: `${getStatusColor(
                            item.status || "active"
                          )}20`,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          { color: getStatusColor(item.status || "active") },
                        ]}
                      >
                        {getStatusLabel(item.status || "active")}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
              <View style={styles.userActions}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => handleEditUser(item)}
                >
                  <Text style={styles.editButtonText}>Sửa</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteUser(item)}
                >
                  <Text style={styles.deleteButtonText}>Xóa</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
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
  searchFilterContainer: {
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
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
  filtersContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginRight: 8,
  },
  filterButtonText: {
    fontSize: 14,
    color: "#4a5568",
    marginRight: 8,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#465fff",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  addButtonText: {
    fontSize: 14,
    color: "#fff",
    marginLeft: 4,
  },
  filterDropdown: {
    backgroundColor: "#fff",
    borderRadius: 8,
    marginTop: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  filterOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  filterOptionSelected: {
    backgroundColor: "#f0f9ff",
  },
  filterOptionText: {
    fontSize: 14,
    color: "#4a5568",
  },
  filterOptionTextSelected: {
    color: "#465fff",
    fontWeight: "bold",
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
  userCard: {
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
  userInfo: {
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
  userDetails: {
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
  userMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  roleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  roleText: {
    fontSize: 12,
    color: "#4a5568",
    marginLeft: 4,
  },
  statusContainer: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  userActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "#ebf8ff",
    marginRight: 8,
  },
  editButtonText: {
    color: "#3182ce",
    fontSize: 14,
    fontWeight: "500",
  },
  deleteButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "#fff5f5",
  },
  deleteButtonText: {
    color: "#e53e3e",
    fontSize: 14,
    fontWeight: "500",
  },
});
