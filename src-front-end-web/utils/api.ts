import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { ApiError } from "../types/api";
import { authService } from "../services/auth.service";

// API Configuration
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  withCredentials: true, // Enable sending cookies with requests
  headers: {
    "Content-Type": "application/json",
  },
});

// Flag to prevent multiple refresh requests
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  failedQueue = [];
};

// Request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add auth token to headers if available
    const token = localStorage.getItem("access_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, add to queue
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Try to refresh token (refresh token is automatically sent via httpOnly cookie)
        const response = await authService.refreshToken();

        // Process queued requests
        processQueue(null, response.accessToken);

        // Update the original request with new token
        originalRequest.headers.Authorization = `Bearer ${response.accessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear storage and redirect to login
        processQueue(refreshError, null);

        localStorage.removeItem("access_token");
        localStorage.removeItem("user");

        window.location.href = "/auth";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle other errors
    if (error.response) {
      const { status, data } = error.response;

      // Handle server errors
      if (status >= 500) {
        return Promise.reject(new Error("Server error occurred"));
      }

      // Handle validation errors
      if (status === 400) {
        const errorMessage = data.message || "Invalid request";
        return Promise.reject(new Error(errorMessage));
      }
    }

    // Handle network errors
    if (error.code === "ECONNABORTED") {
      return Promise.reject(new Error("Request timeout"));
    }

    return Promise.reject(error);
  }
);

// API helper functions
export const apiGet = <T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> => {
  return api.get(url, config).then((response) => {
    // Handle response structure: {statusCode, message, data}
    if (
      response.data &&
      typeof response.data === "object" &&
      "data" in response.data
    ) {
      return response.data.data;
    }
    return response.data;
  });
};

export const apiPost = <T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<T> => {
  return api.post(url, data, config).then((response) => {
    // Handle response structure: {statusCode, message, data}
    if (
      response.data &&
      typeof response.data === "object" &&
      "data" in response.data
    ) {
      return response.data.data;
    }
    return response.data;
  });
};

export const apiPut = <T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<T> => {
  return api.put(url, data, config).then((response) => {
    // Handle response structure: {statusCode, message, data}
    if (
      response.data &&
      typeof response.data === "object" &&
      "data" in response.data
    ) {
      return response.data.data;
    }
    return response.data;
  });
};

export const apiDelete = <T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> => {
  return api.delete(url, config).then((response) => {
    // Handle response structure: {statusCode, message, data}
    if (
      response.data &&
      typeof response.data === "object" &&
      "data" in response.data
    ) {
      return response.data.data;
    }
    return response.data;
  });
};

// Error handling utility
export const handleApiError = (error: unknown): ApiError => {
  if (error && typeof error === "object" && "response" in error) {
    const axiosError = error as {
      response: { status: number; data: { message?: string } };
    };
    return {
      status: axiosError.response.status,
      message: axiosError.response.data?.message || "An error occurred",
      details: axiosError.response.data,
    };
  }

  return {
    status: 0,
    message: error instanceof Error ? error.message : "Network error",
  };
};

export default api;
