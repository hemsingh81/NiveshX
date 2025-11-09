import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { logoutUser, refreshToken } from './authService';
import { store } from '../store';

interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
});

// Request interceptor: attach access token
axiosInstance.interceptors.request.use(config => {
  const token = store.getState().user.token;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle 401 and refresh token
axiosInstance.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refresh = sessionStorage.getItem('refreshToken');

      try {
        const res = await refreshToken(refresh);
        const newToken = res?.token;

        if (newToken) {
          sessionStorage.setItem('accessToken', newToken);
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          return axiosInstance(originalRequest);
        } else {
          throw new Error('Invalid refresh response');
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        logoutUser();
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
