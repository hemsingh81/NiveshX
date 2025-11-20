// src/services/axiosInstance.ts
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import toast from "react-hot-toast";
import { logoutUser, refreshToken } from "./authService";
import { store } from "../store";
import { setAuthToken } from "../store/userSlice";

interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

// --- Configuration: toggle debug diagnostics here ---
const ENABLE_INIT_DIAGNOSTICS = true;

// --- create axios instance once ---
const axiosInstance: AxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  // timeout: 30000,
});

// --- Helper: stable stringify for dedupe key ---
const stableStringify = (v: any) => {
  try {
    if (v == null) return "";
    if (typeof v === "string") return v;
    if (typeof v === "object") {
      if (Array.isArray(v)) return JSON.stringify(v);
      const keys = Object.keys(v).sort();
      const ordered: Record<string, any> = {};
      for (const k of keys) ordered[k] = v[k];
      return JSON.stringify(ordered);
    }
    return String(v);
  } catch {
    try {
      return JSON.stringify(v);
    } catch {
      return String(v);
    }
  }
};

const makeRequestKey = (config: AxiosRequestConfig) =>
  `${(config.method || "get").toLowerCase()}|${String(config.url || "")}|${stableStringify(
    config.params ?? null
  )}|${stableStringify(config.data ?? null)}`;

// In-flight dedupe map (GET/HEAD) - stores AxiosResponse promises
const inFlightRequests = new Map<string, Promise<AxiosResponse<any>>>();

// --- refresh token singleton ---
let refreshPromise: Promise<string | null> | null = null;
async function doRefresh(refreshTokenValue: string): Promise<string | null> {
  try {
    const res = await refreshToken(refreshTokenValue);
    const resAny = res as any;
    const newToken = resAny?.token ?? null;

    if (newToken) {
      try {
        sessionStorage.setItem("token", newToken);
      } catch {}
      store.dispatch(setAuthToken(newToken));
    }

    if (resAny?.refreshToken) {
      try {
        sessionStorage.setItem("refreshToken", resAny.refreshToken);
      } catch {}
    }

    return newToken;
  } catch (e) {
    console.error("[AUTH REFRESH] refresh failed", e);
    return null;
  }
}

// --- Idempotent interceptor attachment ---
// Mark on the instance so repeated imports don't attach again.
if (!(axiosInstance as any).__interceptorsAttached) {
  // Diagnostic: where this file was initialized (stack trace)
  if (ENABLE_INIT_DIAGNOSTICS) {
    try {
      // Capture a stack trace to help identify duplicate initializations
      const err = new Error("axiosInstance init stack");
      const stack = (err.stack || "").split("\n").slice(1, 6).map((s) => s.trim());
      console.info("[AXIOS INIT] axiosInstance initialized. Stack (top frames):", stack);
    } catch {}
  }

  // Attach token header on each request
  axiosInstance.interceptors.request.use((config) => {
    try {
      const token = store.getState().user?.token;
      if (token) {
        config.headers = config.headers ?? {};
        (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
      }
    } catch {}
    return config;
  });

  // Main response error handler (consolidated)
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = (error.config || {}) as CustomAxiosRequestConfig;
      const status = error.response?.status;
      const requestUrl = originalRequest?.url ?? "<unknown>";
      const method = originalRequest?.method ?? "<unknown>";

      // Rich console logging for debugging
      try {
        console.error("[AXIOS] Request failed:", method, requestUrl);
        console.error("  request headers:", originalRequest.headers);
        console.error("  request data:", originalRequest.data);
        console.error("  response status:", error.response?.status);
        console.error("  response headers:", error.response?.headers);
        console.error("  response data:", error.response?.data);
      } catch (e) {
        console.error("[AXIOS] failed to print debug info", e);
      }

      // No response
      if (!error.response) {
        const netMsg =
          error.message && error.message.includes("Network Error")
            ? "Network error. Check your connection or API server."
            : `No response from server. ${String(error.message || "")}`;
        toast.error(netMsg);
        return Promise.reject(error);
      }

      // 401 refresh flow
      const isLoginRequest = String(requestUrl).includes("/auth/login");
      if (status === 401 && !originalRequest._retry && !isLoginRequest) {
        originalRequest._retry = true;

        const refresh = sessionStorage.getItem("refreshToken");
        if (!refresh) {
          toast.error("Session expired. Please log in again.");
          logoutUser();
          return Promise.reject(error);
        }

        try {
          if (!refreshPromise) refreshPromise = doRefresh(refresh);
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
        } catch (e) {
          refreshPromise = null;
          toast.error("Session expired. Please log in again.");
          logoutUser();
          return Promise.reject(error);
        }
      }

      // skip-toaster header check (case-insensitive)
      const headers = ((originalRequest?.headers as Record<string, any>) || {});
      const normalizedHeaders: Record<string, any> = {};
      Object.entries(headers).forEach(([k, v]) => (normalizedHeaders[k.toLowerCase()] = v));
      const skipToast = normalizedHeaders["x-skip-error-toaster"] === "true";
      if (skipToast) return Promise.reject(error);

      const data = error.response?.data as any;

      if (Array.isArray(data)) {
        if (data.length === 0) {
          toast.error(`Server returned an empty list for ${requestUrl} (status ${status}).`);
        } else {
          toast.error(`Server returned array response for ${requestUrl}: ${JSON.stringify(data)}`);
        }
        return Promise.reject(error);
      }

      if (data?.errors && typeof data.errors === "object" && !Array.isArray(data.errors)) {
        const validationMessages = Object.entries(data.errors).flatMap(([field, messages]) =>
          (Array.isArray(messages) ? messages : [messages]).map((m) => `${field}: ${String(m)}`)
        );
        toast.error(validationMessages.join("\n"), { duration: 8000, style: { whiteSpace: "pre-line" } });
        return Promise.reject(error);
      }

      if (data?.message) {
        toast.error(String(data.message));
        return Promise.reject(error);
      }

      if (typeof data === "string" && data.trim().length > 0) {
        toast.error(data);
        return Promise.reject(error);
      }

      if (typeof data === "object" && data !== null) {
        const bodyPreview = JSON.stringify(data).slice(0, 500);
        toast.error(`Error ${status} for ${requestUrl}: ${bodyPreview}`);
        return Promise.reject(error);
      }

      const fallback =
        (status === 400 && "Bad request.") ||
        (status === 401 && "Unauthorized.") ||
        (status === 403 && "Forbidden.") ||
        (status === 404 && "Resource not found.") ||
        (status === 409 && "Conflict occurred. Please refresh and try again.") ||
        (status === 500 && "Server error. Please try again later.") ||
        null;

      if (fallback) toast.error(fallback);
      else toast.error(`Unexpected error occurred (${status}) for ${requestUrl}`);

      return Promise.reject(error);
    }
  );

  // Mark as attached so subsequent imports don't reattach
  (axiosInstance as any).__interceptorsAttached = true;
}

// Export instance as before
export default axiosInstance;
