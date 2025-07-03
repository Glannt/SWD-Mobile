import { useState, useEffect } from "react";
import { userService } from "../services/user.service";
import { UserProfile } from "../types/api";

export const useUserProfile = (userId: string) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await userService.getUserProfile(userId);
      console.log("data user", response);

      setProfile(response);
    } catch (err: unknown) {
      console.error("Failed to fetch user profile:", err);
      if (err && typeof err === "object" && "response" in err) {
        const errorResponse = err as {
          response?: { data?: { message?: string } };
        };
        setError(
          errorResponse.response?.data?.message || "Failed to load profile"
        );
      } else {
        setError("Failed to load profile");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  const refetch = () => {
    fetchProfile();
  };

  return {
    profile,
    isLoading,
    error,
    refetch,
  };
};
