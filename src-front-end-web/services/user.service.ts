import { apiGet, apiPost, apiPut, apiDelete } from "../utils/api";
import {
  User,
  UserProfile,
  CreateUserDto,
  UserRole,
  UserStatus,
} from "../types/api";

class UserService {
  private readonly baseUrl = "/users";

  // Get all users (admin only)
  async getUsers(): Promise<User[]> {
    return apiGet<User[]>(this.baseUrl);
  }

  // Get user by ID
  async getUserById(userId: string): Promise<User> {
    return apiGet<User>(`${this.baseUrl}/${userId}`);
  }

  // Create new user (admin only)
  async createUser(userData: CreateUserDto): Promise<User> {
    return apiPost<User>(`${this.baseUrl}`, userData);
  }

  // Update user
  async updateUser(
    userId: string,
    userData: Partial<CreateUserDto>
  ): Promise<User> {
    return apiPut<User>(`${this.baseUrl}/${userId}`, userData);
  }

  // Delete user (admin only)
  async deleteUser(userId: string): Promise<void> {
    return apiDelete(`${this.baseUrl}/${userId}`);
  }

  // Update user status
  async updateUserStatus(userId: string, status: UserStatus): Promise<User> {
    return apiPut<User>(`${this.baseUrl}/${userId}/status`, { status });
  }

  // Update user role
  async updateUserRole(userId: string, role: UserRole): Promise<User> {
    return apiPut<User>(`${this.baseUrl}/${userId}/role`, { role });
  }

  // Get users by role
  async getUsersByRole(role: UserRole): Promise<User[]> {
    return apiGet<User[]>(`${this.baseUrl}/role/${role}`);
  }

  // Get users by status
  async getUsersByStatus(status: UserStatus): Promise<User[]> {
    return apiGet<User[]>(`${this.baseUrl}/status/${status}`);
  }

  // Search users
  async searchUsers(query: string): Promise<User[]> {
    return apiGet<User[]>(
      `${this.baseUrl}/search?q=${encodeURIComponent(query)}`
    );
  }

  async getUserProfile(userId: string): Promise<UserProfile> {
    return apiGet<UserProfile>(`${this.baseUrl}/${userId}`);
  }
}

export const userService = new UserService();
export default userService;
