import { useState, useCallback } from "react";
import { userService } from "../services";
import type { User, CreateUserDto, UserRole, UserStatus } from "../types/api";

interface UseUsersReturn {
  users: User[];
  isLoading: boolean;
  error: string | null;
  getUsers: () => Promise<void>;
  getUserById: (userId: string) => Promise<User>;
  createUser: (userData: CreateUserDto) => Promise<User>;
  updateUser: (
    userId: string,
    userData: Partial<CreateUserDto>
  ) => Promise<User>;
  deleteUser: (userId: string) => Promise<void>;
  updateUserStatus: (userId: string, status: UserStatus) => Promise<User>;
  updateUserRole: (userId: string, role: UserRole) => Promise<User>;
  getUsersByRole: (role: UserRole) => Promise<User[]>;
  getUsersByStatus: (status: UserStatus) => Promise<User[]>;
  searchUsers: (query: string) => Promise<User[]>;
}

export const useUsers = (): UseUsersReturn => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = (err: unknown) => {
    const errorMessage =
      err instanceof Error ? err.message : "An error occurred";
    setError(errorMessage);
    console.error("User service error:", err);
  };

  const getUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const usersData = await userService.getUsers();
      setUsers(usersData);
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getUserById = useCallback(async (userId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const user = await userService.getUserById(userId);
      return user;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createUser = useCallback(async (userData: CreateUserDto) => {
    setIsLoading(true);
    setError(null);
    try {
      const newUser = await userService.createUser(userData);
      setUsers((prev) => [newUser, ...prev]);
      return newUser;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateUser = useCallback(
    async (userId: string, userData: Partial<CreateUserDto>) => {
      setIsLoading(true);
      setError(null);
      try {
        const updatedUser = await userService.updateUser(userId, userData);
        setUsers((prev) =>
          prev.map((user) => (user.user_id === userId ? updatedUser : user))
        );
        return updatedUser;
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const deleteUser = useCallback(async (userId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await userService.deleteUser(userId);
      setUsers((prev) => prev.filter((user) => user.user_id !== userId));
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateUserStatus = useCallback(
    async (userId: string, status: UserStatus) => {
      setIsLoading(true);
      setError(null);
      try {
        const updatedUser = await userService.updateUserStatus(userId, status);
        setUsers((prev) =>
          prev.map((user) => (user.user_id === userId ? updatedUser : user))
        );
        return updatedUser;
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const updateUserRole = useCallback(async (userId: string, role: UserRole) => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedUser = await userService.updateUserRole(userId, role);
      setUsers((prev) =>
        prev.map((user) => (user.user_id === userId ? updatedUser : user))
      );
      return updatedUser;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getUsersByRole = useCallback(async (role: UserRole) => {
    setIsLoading(true);
    setError(null);
    try {
      const usersData = await userService.getUsersByRole(role);
      setUsers(usersData);
      return usersData;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getUsersByStatus = useCallback(async (status: UserStatus) => {
    setIsLoading(true);
    setError(null);
    try {
      const usersData = await userService.getUsersByStatus(status);
      setUsers(usersData);
      return usersData;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchUsers = useCallback(async (query: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const usersData = await userService.searchUsers(query);
      setUsers(usersData);
      return usersData;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    users,
    isLoading,
    error,
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    updateUserStatus,
    updateUserRole,
    getUsersByRole,
    getUsersByStatus,
    searchUsers,
  };
};
