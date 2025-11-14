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

export const getAllUsers = async (): Promise<UserResponse[]> => {
  const res = await withToast(() => axiosInstance.get(`${API_URL}`), {
    loading: "Loading users...",
    success: "Users loaded!",
    error: "Failed to load users.",
  });
  return res.data;
};

export const createUser = async (data: CreateUserRequest): Promise<void> => {
  await withToast(() => axiosInstance.post(`${API_URL}`, data), {
    loading: "Creating user...",
    success: "User created!",
    error: "Failed to create user.",
  });
};

export const updateUser = async (
  id: string,
  data: UpdateUserRequest
): Promise<void> => {
  await withToast(() => axiosInstance.put(`${API_URL}/${id}`, data), {
    loading: "Updating user...",
    success: "User updated!",
    error: "Failed to update user.",
  });
};

export const deleteUser = async (id: string): Promise<void> => {
  await withToast(() => axiosInstance.delete(`${API_URL}/${id}`), {
    loading: "Deleting user...",
    success: "User deleted!",
    error: "Failed to delete user.",
  });
};
