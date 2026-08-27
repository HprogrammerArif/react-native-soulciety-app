import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosHeaders } from "axios";
import Constants from "expo-constants";

let isRedirectingToLogin = false;


export const api = axios.create({
  baseURL: Constants.expoConfig?.extra?.BACKEND_URL,
  // baseURL: "http://10.10.13.69:8000",
  timeout: 15000,
});

/* ---------------- REQUEST INTERCEPTOR ---------------- */
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      console.log("TOKEN", token);

      if (!config.headers) {
        config.headers = new AxiosHeaders();
      }

      if (token) {
        config.headers.set("Authorization", `Bearer ${token}`);
      }

      // Log outgoing request details
      console.log(
        `[API Request] ${config.method?.toUpperCase()} ${config.url}`,
        {
          baseURL: config.baseURL,
          params: config.params,
          data: config.data ? "(payload included)" : "(no payload)",
        },
      );

      return config;
    } catch (error) {
      // Log request setup errors
      console.error("[API Request Error] Failed to setup request:", {
        error: error instanceof Error ? error.message : "Unknown error",
        url: config.url,
        method: config.method,
      });
      return Promise.reject(error);
    }
  },
  (error) => {
    // Log request interceptor errors
    console.error("[API Request Interceptor Error]", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    return Promise.reject(error);
  },
);

/* ---------------- RESPONSE INTERCEPTOR ---------------- */
api.interceptors.response.use(
  (res) => {
    // Log successful responses
    console.log(
      `[API Response] ${res.config.method?.toUpperCase()} ${res.config.url}`,
      {
        status: res.status,
        statusText: res.statusText,
        dataSize: JSON.stringify(res.data).length + " bytes",
      },
    );
    return res;
  },
  async (error) => {
    // Comprehensive error logging
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const errorInfo = {
        status: status,
        statusText: error.response.statusText,
        url: error.config?.url,
        method: error.config?.method?.toUpperCase(),
        message: error.response.data?.message || error.message,
        errorData: error.response.data,
      };

      // Use console.warn for expected/handled errors (4xx except rare cases)
      // Use console.error only for server errors (5xx) or unexpected issues
      if (status >= 400 && status < 500) {
        console.warn("[API Client Error]", errorInfo);
      } else if (status >= 500) {
        console.error("[API Server Error]", errorInfo);
      }

      // Handle 401 Unauthorized
      if (status === 401) {
        console.warn("[API Auth] Unauthorized - Clearing access token");
        await AsyncStorage.removeItem("accessToken");

        // Optionally handle redirect to login
        if (!isRedirectingToLogin) {
          isRedirectingToLogin = true;
          // Add navigation logic here if needed
          setTimeout(() => {
            isRedirectingToLogin = false;
          }, 1000);
        }
      }

      // Handle other common error statuses
      if (status === 403) {
        console.warn("[API Auth] Forbidden - Insufficient permissions");
      } else if (status === 404) {
        console.warn("[API Error] Resource not found");
      }
    } else if (error.request) {
      // Request was made but no response received (network error)
      console.warn("[API Network Error] No response received", {
        url: error.config?.url,
        method: error.config?.method?.toUpperCase(),
        message: error.message,
        code: error.code,
      });
    } else {
      // Error during request setup
      console.error("[API Error] Request setup failed", {
        message: error.message,
        stack: error.stack,
      });
    }

    return Promise.reject(error);
  },
);

export default api;
