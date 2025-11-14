// src/api/axiosInstance.ts
import axios, { AxiosError, AxiosRequestConfig } from "axios";
import toast from "react-hot-toast";
import { logoutUser, refreshToken } from "./authService";
import { store } from "../store";
import { setAuthToken } from "../store/userSlice"; // adjust to your slice/action

interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
});

// Attach token from store (single source of truth)
axiosInstance.interceptors.request.use((config) => {
  const token = store.getState().user?.token;
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    // Defensive guards
    const originalRequest = (error.config || {}) as CustomAxiosRequestConfig;
    const status = error.response?.status;
    const requestUrl = originalRequest?.url ?? "";
    const isLoginRequest = typeof requestUrl === "string" && requestUrl.includes("/auth/login");

    // 401 + refresh logic (single retry)
    if (status === 401 && !originalRequest._retry && !isLoginRequest) {
      originalRequest._retry = true;

      const refresh = sessionStorage.getItem("refreshToken");
      if (!refresh) {
        // No refresh token — force logout
        toast.error("Session expired. Please log in again.");
        logoutUser();
        return Promise.reject(error);
      }

      try {
        const res = await refreshToken(refresh); // expect typed { token: string, ... }
        const newToken = res?.token;
        if (newToken) {
          // persist token centrally: update both session and redux store
          sessionStorage.setItem("token", newToken);
          store.dispatch(setAuthToken(newToken)); // ensure your store has this action
          // update original headers and retry
          originalRequest.headers = originalRequest.headers ?? {};
          (originalRequest.headers as Record<string, string>).Authorization = `Bearer ${newToken}`;
          return axiosInstance(originalRequest);
        } else {
          throw new Error("Invalid refresh response");
        }
      } catch (refreshErr) {
        // refresh failed: logout and surface original error
        toast.error("Session expired. Please log in again.");
        logoutUser();
        return Promise.reject(error);
      }
    }

    // Avoid duplicate toasts: allow callers to suppress toasts by setting x-skip-error-toaster: "true"
    const headers = (originalRequest?.headers || {}) as Record<string, string | undefined>;
    const skipToast = headers["x-skip-error-toaster"] === "true" || headers["X-Skip-Error-Toaster"] === "true";

    if (!skipToast) {
      const data = error.response?.data as any;

      // Validation shape: object keys => string[] (commonly returned by ASP.NET, etc.)
      if (data?.errors && typeof data.errors === "object") {
        // flatten messages, preserve newlines for toast readability
        const validationMessages = Object.entries(data.errors).flatMap(([field, messages]) =>
          (Array.isArray(messages) ? messages : [messages]).map((m) => `${field}: ${String(m)}`)
        );
        toast.error(validationMessages.join("\n"), {
          duration: 8000,
          style: { whiteSpace: "pre-line" },
        });
        // still reject so callers get full error object
        return Promise.reject(error);
      }

      // Generic message fallback
      const message =
        data?.message ||
        (status === 400 && "Bad request.") ||
        (status === 401 && "Unauthorized.") ||
        (status === 403 && "Forbidden.") ||
        (status === 404 && "Resource not found.") ||
        (status === 500 && "Server error. Please try again later.") ||
        "Unexpected error occurred.";

      toast.error(String(message));
    }

    // Always reject so callers (e.g., UI components) can inspect error.response.data
    return Promise.reject(error);
  }
);

export default axiosInstance;
