// src/services/userService.ts
import axiosInstance from "./axiosInstance";
import { withToast } from "../utils/toastUtils";

const API_URL = `${process.env.REACT_APP_API_BASE_URL}/user`;

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  role: string;
  isActive: boolean;
  isEmailConfirmed: boolean;
  isPhoneConfirmed: boolean;
  isLockedOut: boolean;
  failedLoginAttempts: number;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  phoneNumber?: string;
  role: string;
}

export interface UpdateUserRequest {
  name: string;
  email: string;
  phoneNumber?: string;
  role: string;
  isActive: boolean;
  isEmailConfirmed: boolean;
  isPhoneConfirmed: boolean;
  isLockedOut: boolean;
  failedLoginAttempts: number;
}

/**
 * Reads should not use withToast so callers or react-query can manage loading, dedupe and caching.
 */
export const getAllUsers = async (): Promise<UserResponse[]> => {
  const res = await axiosInstance.get<UserResponse[]>(`${API_URL}`);
  return res.data;
};

/**
 * Mutations use withToast. Pass the per-request skip header so the axios interceptor won't
 * also display generic toasts while withToast manages loading/success/error UX.
 */
export const createUser = async (data: CreateUserRequest): Promise<void> => {
  await withToast(
    () =>
      axiosInstance.post(`${API_URL}`, data, {
        headers: { "x-skip-error-toaster": "true" },
      }),
    {
      operationType: "create",
      // optional overrides:
      // loading: "Creating user...",
      // success: "User created!",
    }
  );
};

export const updateUser = async (id: string, data: UpdateUserRequest): Promise<void> => {
  await withToast(
    () =>
      axiosInstance.put(`${API_URL}/${id}`, data, {
        headers: { "x-skip-error-toaster": "true" },
      }),
    {
      operationType: "update",
      // optional overrides:
      // loading: "Updating user...",
      // success: "User updated!",
    }
  );
};

export const deleteUser = async (id: string): Promise<void> => {
  await withToast(
    () =>
      axiosInstance.delete(`${API_URL}/${id}`, {
        headers: { "x-skip-error-toaster": "true" },
      }),
    {
      operationType: "delete",
      // optional overrides:
      // loading: "Deleting user...",
      // success: "User deleted!",
    }
  );
};
