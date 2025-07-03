import { apiPost } from "../utils/api";
import {
  LoginRequest,
  RegisterDto,
  CreateUserDto,
  AuthResponse,
  User,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  VerifyResetTokenRequest,
  ChangePasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordResponse,
  VerifyResetTokenResponse,
  ChangePasswordResponse,
} from "../types/api";

class AuthService {
  private readonly baseUrl = "/auth";

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    console.log(
      "authService.login - Starting login with credentials:",
      credentials
    );

    const response = await apiPost<AuthResponse>(
      `${this.baseUrl}/login`,
      credentials
    );

    console.log("authService.login - API response:", response);

    // Store access token and user data (refresh token is in httpOnly cookie)
    localStorage.setItem("access_token", response.accessToken);
    localStorage.setItem("user", JSON.stringify(response.user));

    console.log("authService.login - Stored in localStorage:", {
      token: response.accessToken,
      user: response.user,
    });

    return response;
  }

  // Dành cho user tự đăng ký
  async register(userData: RegisterDto): Promise<AuthResponse> {
    console.log(
      "authService.register - Starting registration with data:",
      userData
    );

    const response = await apiPost<AuthResponse>(
      `${this.baseUrl}/register`,
      userData
    );

    console.log("authService.register - API response:", response);

    // Store access token and user data (refresh token is in httpOnly cookie)
    localStorage.setItem("access_token", response.accessToken);
    localStorage.setItem("user", JSON.stringify(response.user));

    console.log("authService.register - Stored in localStorage:", {
      token: response.accessToken,
      user: response.user,
    });

    return response;
  }

  // Dành cho admin tạo user mới
  async createUser(userData: CreateUserDto): Promise<User> {
    return apiPost<User>(`${this.baseUrl}/create-user`, userData);
  }

  async logout(): Promise<void> {
    try {
      // Call logout endpoint if available
      await apiPost(`${this.baseUrl}/logout`);
    } catch (error) {
      // Even if logout fails, clear local storage
      console.warn(
        "Logout request failed, clearing local storage anyway",
        error
      );
    } finally {
      // Clear local storage (refresh token is cleared by backend cookie)
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const user = localStorage.getItem("user");
      const token = localStorage.getItem("access_token");

      console.log("getCurrentUser - localStorage check:", {
        hasUser: !!user,
        hasToken: !!token,
        user: user ? JSON.parse(user) : null,
      });

      if (!user || !token) {
        console.log("getCurrentUser - No user or token found");
        return null;
      }

      // For now, just return stored user without API validation
      // TODO: Add API validation when backend profile endpoint is ready
      const storedUser = JSON.parse(user);
      console.log("getCurrentUser - Returning stored user:", storedUser);
      return storedUser;

      // Optionally validate token with server (commented out for now)
      // const response = await apiGet<User>(`${this.baseUrl}/profile`);
      // return response;
    } catch (error) {
      // If parsing fails, clear storage
      console.warn(
        "getCurrentUser - Error parsing user data, clearing storage",
        error
      );
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      return null;
    }
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem("access_token");
    return !!token;
  }

  getStoredUser(): User | null {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  }

  async forgotPassword(
    data: ForgotPasswordRequest
  ): Promise<ForgotPasswordResponse> {
    return apiPost<ForgotPasswordResponse>(
      `${this.baseUrl}/forgot-password`,
      data
    );
  }

  async verifyResetToken(
    data: VerifyResetTokenRequest
  ): Promise<VerifyResetTokenResponse> {
    return apiPost<VerifyResetTokenResponse>(
      `${this.baseUrl}/verify-reset-token`,
      data
    );
  }

  async resetPassword(
    data: ResetPasswordRequest
  ): Promise<ResetPasswordResponse> {
    return apiPost<ResetPasswordResponse>(
      `${this.baseUrl}/reset-password`,
      data
    );
  }

  async changePassword(
    data: ChangePasswordRequest
  ): Promise<ChangePasswordResponse> {
    return apiPost<ChangePasswordResponse>(
      `${this.baseUrl}/change-password`,
      data
    );
  }

  async refreshToken(): Promise<AuthResponse> {
    // Refresh token is automatically sent via httpOnly cookie
    const response = await apiPost<AuthResponse>(
      `${this.baseUrl}/refresh-token`
    );

    // Update stored access token and user data
    localStorage.setItem("access_token", response.accessToken);
    localStorage.setItem("user", JSON.stringify(response.user));

    return response;
  }

  // This method is no longer needed since refresh token is in httpOnly cookie
  getRefreshToken(): string | null {
    return null; // Refresh token is in httpOnly cookie, not accessible via JavaScript
  }
}

export const authService = new AuthService();
export default authService;
