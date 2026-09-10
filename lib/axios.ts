import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosHeaders } from "axios";
import Constants from "expo-constants";

let isRedirectingToLogin = false;
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
};

export const api = axios.create({
  baseURL: Constants.expoConfig?.extra?.BACKEND_URL,
  timeout: 15000,
});

/* ---------------- REQUEST INTERCEPTOR ---------------- */
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("accessToken");

      if (!config.headers) {
        config.headers = new AxiosHeaders();
      }

      if (token) {
        config.headers.set("Authorization", `Bearer ${token}`);
      }

      // Log outgoing request details (dev only, no sensitive data)
      if (__DEV__) {
        console.log(
          `[API Request] ${config.method?.toUpperCase()} ${config.url}`,
        );
      }

      return config;
    } catch (error) {
      if (__DEV__) {
        console.error("[API Request Error] Failed to setup request:", {
          error: error instanceof Error ? error.message : "Unknown error",
          url: config.url,
        });
      }
      return Promise.reject(error);
    }
  },
  (error) => {
    if (__DEV__) {
      console.error("[API Request Interceptor Error]", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
    return Promise.reject(error);
  },
);

/* ---------------- RESPONSE INTERCEPTOR ---------------- */
api.interceptors.response.use(
  (res) => {
    if (__DEV__) {
      console.log(
        `[API Response] ${res.config.method?.toUpperCase()} ${res.config.url} → ${res.status}`,
      );
    }
    return res;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response) {
      const status = error.response.status;

      if (__DEV__) {
        if (status >= 400 && status < 500) {
          console.warn(`[API ${status}] ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url}`);
        } else if (status >= 500) {
          console.error(`[API ${status}] ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url}`);
        }
      }

      // Handle 401 Unauthorized — attempt token refresh
      if (status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          // Queue request while refresh is in progress
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then((token) => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            return api(originalRequest);
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const refreshToken = await AsyncStorage.getItem("refreshToken");

          if (!refreshToken) {
            throw new Error("No refresh token available");
          }

          const baseURL = Constants.expoConfig?.extra?.BACKEND_URL;
          const { data } = await axios.post(`${baseURL}/api/auth/token/refresh/`, {
            refresh: refreshToken,
          });

          const newAccessToken = data.access;
          await AsyncStorage.setItem("accessToken", newAccessToken);

          if (data.refresh) {
            await AsyncStorage.setItem("refreshToken", data.refresh);
          }

          processQueue(null, newAccessToken);

          originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);

          // Refresh failed — clear tokens and redirect to login
          await AsyncStorage.removeItem("accessToken");
          await AsyncStorage.removeItem("refreshToken");

          if (!isRedirectingToLogin) {
            isRedirectingToLogin = true;
            setTimeout(() => {
              isRedirectingToLogin = false;
            }, 1000);
          }

          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      // Handle other common error statuses
      if (__DEV__) {
        if (status === 403) {
          console.warn("[API Auth] Forbidden - Insufficient permissions");
        } else if (status === 404) {
          console.warn("[API Error] Resource not found");
        }
      }
    } else if (error.request) {
      if (__DEV__) {
        console.warn("[API Network Error] No response received", {
          url: error.config?.url,
          code: error.code,
        });
      }
    } else {
      if (__DEV__) {
        console.error("[API Error] Request setup failed", {
          message: error.message,
        });
      }
    }

    return Promise.reject(error);
  },
);

export default api;
