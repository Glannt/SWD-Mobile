import { useState, useEffect, useCallback } from "react";
import { authService } from "../services";
import type {
  User,
  LoginRequest,
  RegisterDto,
  CreateUserDto,
} from "../types/api";

interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterDto) => Promise<void>;
  createUser: (userData: CreateUserDto) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    // console.log("useAuth.refreshUser - Starting refresh");
    try {
      const currentUser = await authService.getCurrentUser();
      // console.log("useAuth.refreshUser - Got user:", currentUser);
      setUser(currentUser);
    } catch (error) {
      console.error("useAuth.refreshUser - Failed to refresh user:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
      // console.log("useAuth.refreshUser - Finished, isLoading:", false);
    }
  }, []);

  const login = useCallback(async (credentials: LoginRequest) => {
    // console.log("useAuth.login - Starting login");
    setIsLoading(true);
    const response = await authService.login(credentials);
    // console.log(
    //   "useAuth.login - Login successful, setting user:",
    //   response.user
    // );
    setUser(response.user);
    setIsLoading(false);
  }, []);

  const register = useCallback(async (userData: RegisterDto) => {
    // console.log("useAuth.register - Starting registration");
    setIsLoading(true);
    const response = await authService.register(userData);
    console.log(
      "useAuth.register - Registration successful, setting user:",
      response.user
    );
    setUser(response.user);
    setIsLoading(false);
  }, []);

  const createUser = useCallback(async (userData: CreateUserDto) => {
    setIsLoading(true);
    const newUser = await authService.createUser(userData);
    // Note: createUser doesn't change current user, just creates a new one
    setIsLoading(false);
    return newUser;
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
      // Even if logout fails, clear user state
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const isAuthenticated = !!user;
  console.log("useAuth - Current state:", {
    user,
    isAuthenticated,
    isLoading,
    localStorageToken: localStorage.getItem("access_token"),
    localStorageUser: localStorage.getItem("user"),
  });

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    createUser,
    logout,
    refreshUser,
  };
};
