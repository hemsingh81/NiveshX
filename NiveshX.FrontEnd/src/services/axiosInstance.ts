import axios, { AxiosError, AxiosRequestConfig } from "axios";
import toast from "react-hot-toast";
import { logoutUser, refreshToken } from "./authService";
import { store } from "../store";

interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
});

axiosInstance.interceptors.request.use((config) => {
  const token = store.getState().user.token;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;
    const status = error.response?.status;
    const isLoginRequest = originalRequest?.url?.includes("/auth/login");

    if (status === 401 && !originalRequest._retry && !isLoginRequest) {
      originalRequest._retry = true;
      const refresh = sessionStorage.getItem("refreshToken");

      try {
        const res = await refreshToken(refresh);
        const newToken = res?.token;

        if (newToken) {
          sessionStorage.setItem("token", newToken);
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          return axiosInstance(originalRequest);
        } else {
          throw new Error("Invalid refresh response");
        }
      } catch (refreshError) {
        toast.error("Session expired. Please log in again.");
        logoutUser(); // ✅ This will now only run outside login
        return Promise.reject(error);
      }
    }

    const headers = error.config?.headers as Record<string, string> | undefined;
    const skipToast = headers?.["x-skip-error-toaster"] === "true";

    if (!skipToast) {
      const data = error.response?.data as { message?: string };
      const message =
        data?.message ||
        (status === 400 && "Bad request.") ||
        (status === 401 && "Unauthorized.") ||
        (status === 403 && "Forbidden.") ||
        (status === 404 && "Resource not found.") ||
        (status === 500 && "Server error. Please try again later.") ||
        "Unexpected error occurred.";
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
