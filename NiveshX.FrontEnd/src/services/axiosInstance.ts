// src/services/axiosInstance.ts
import axios, { AxiosError, AxiosRequestConfig } from "axios";
import toast from "react-hot-toast";
import { logoutUser, refreshToken } from "./authService";
import { store } from "../store";
import { setAuthToken } from "../store/userSlice";

interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
});

// Attach token from store
axiosInstance.interceptors.request.use((config) => {
  const token = store.getState().user?.token;
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }
  return config;
});

// debug interceptor — place before other response interceptors
axiosInstance.interceptors.response.use(
  (r) => r,
  (err) => {
    try {
      console.error("AXIOS ERROR URL:", err.config?.url, "METHOD:", err.config?.method, "STATUS:", err.response?.status);
      console.error("REQUEST BODY:", err.config?.data);
      console.error("RESPONSE BODY:", err.response?.data);
    } catch (e) {}
    return Promise.reject(err);
  }
);


// Refresh-in-flight singleton to dedupe concurrent refresh attempts
let refreshPromise: Promise<string | null> | null = null;

async function doRefresh(refreshTokenValue: string): Promise<string | null> {
  try {
    const res = await refreshToken(refreshTokenValue);
    const resAny = res as any;
    const newToken = resAny?.token ?? null;

    if (newToken) {
      try {
        sessionStorage.setItem("token", newToken);
      } catch {
        // ignore storage write errors
      }
      store.dispatch(setAuthToken(newToken));
    }

    // optional refreshToken rotation
    if (resAny?.refreshToken) {
      try {
        sessionStorage.setItem("refreshToken", resAny.refreshToken);
      } catch {
        // ignore
      }
    }

    return newToken;
  } catch {
    return null;
  }
}

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = (error.config || {}) as CustomAxiosRequestConfig;
    const status = error.response?.status;
    const requestUrl = originalRequest?.url ?? "";
    const isLoginRequest = typeof requestUrl === "string" && requestUrl.includes("/auth/login");

    if (status === 401 && !originalRequest._retry && !isLoginRequest) {
      originalRequest._retry = true;

      const refresh = sessionStorage.getItem("refreshToken");
      if (!refresh) {
        toast.error("Session expired. Please log in again.");
        logoutUser();
        return Promise.reject(error);
      }

      try {
        if (!refreshPromise) {
          refreshPromise = doRefresh(refresh);
        }
        const newToken = await refreshPromise;
        refreshPromise = null;

        if (newToken) {
          originalRequest.headers = originalRequest.headers ?? {};
          (originalRequest.headers as Record<string, string>).Authorization = `Bearer ${newToken}`;
          return axiosInstance(originalRequest);
        } else {
          toast.error("Session expired. Please log in again.");
          logoutUser();
          return Promise.reject(error);
        }
      } catch {
        refreshPromise = null;
        toast.error("Session expired. Please log in again.");
        logoutUser();
        return Promise.reject(error);
      }
    }

    // Normalize headers to check skip-toaster flag safely
    const headers = ((originalRequest?.headers as Record<string, any>) || {});
    const normalizedHeaders: Record<string, any> = {};
    Object.entries(headers).forEach(([k, v]) => (normalizedHeaders[k.toLowerCase()] = v));
    const skipToast = normalizedHeaders["x-skip-error-toaster"] === "true";

    if (!skipToast) {
      const data = error.response?.data as any;

      // ModelState style validation
      if (data?.errors && typeof data.errors === "object") {
        const validationMessages = Object.entries(data.errors).flatMap(([field, messages]) =>
          (Array.isArray(messages) ? messages : [messages]).map((m) => `${field}: ${String(m)}`)
        );
        toast.error(validationMessages.join("\n"), {
          duration: 8000,
          style: { whiteSpace: "pre-line" },
        });
        return Promise.reject(error);
      }

      const message =
        data?.message ||
        (status === 400 && "Bad request.") ||
        (status === 401 && "Unauthorized.") ||
        (status === 403 && "Forbidden.") ||
        (status === 404 && "Resource not found.") ||
        (status === 409 && "Conflict occurred. Please refresh and try again.") ||
        (status === 500 && "Server error. Please try again later.") ||
        "Unexpected error occurred.";

      toast.error(String(message));
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
