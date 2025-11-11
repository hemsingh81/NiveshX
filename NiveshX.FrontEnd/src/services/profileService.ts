import axiosInstance from './axiosInstance';
import { withToast } from '../utils/toastUtils';

const API_URL = `${process.env.REACT_APP_API_BASE_URL}/auth`;
const BASE_URL = process.env.REACT_APP_API_BASE_URL?.replace(/\/?api\/?$/, '') || '';

export interface UserProfileResponse {
  name: string;
  email: string;
  phoneNumber: string;
  role: string;
  profilePictureUrl?: string;
}

export interface UpdateProfileRequest {
  name: string;
  phoneNumber: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export const getUserProfile = async (): Promise<UserProfileResponse> => {
  const response = await axiosInstance.get<UserProfileResponse>(`${API_URL}/profile`);
  const { name, email, phoneNumber, role, profilePictureUrl } = response.data;
  const fullProfilePictureUrl = profilePictureUrl ? `${BASE_URL}${profilePictureUrl}` : '';

  return { name, email, phoneNumber, role, profilePictureUrl: fullProfilePictureUrl };
};

export const updateProfile = async (payload: UpdateProfileRequest): Promise<void> => {
  await withToast(
    () => axiosInstance.put(`${API_URL}/profile`, payload, {
      headers: { 'x-skip-error-toaster': 'true' },
    }),
    {
      loading: 'Updating profile...',
      success: 'Profile updated successfully!',
      error: 'Failed to update profile.',
      suppressGlobalError: true,
    }
  );
};

export const changePassword = async (payload: ChangePasswordRequest): Promise<void> => {
  await withToast(
    () => axiosInstance.post(`${API_URL}/change-password`, payload, {
      headers: { 'x-skip-error-toaster': 'true' },
    }),
    {
      loading: 'Updating password...',
      success: 'Password updated successfully!',
      error: 'Failed to update password.',
      suppressGlobalError: true,
    }
  );
};

export const uploadProfileImage = async (file: File): Promise<void> => {
  const formData = new FormData();
  formData.append('file', file);

  await withToast(
    () => axiosInstance.post(`${API_URL}/profile/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'x-skip-error-toaster': 'true',
      },
    }),
    {
      loading: 'Uploading image...',
      success: 'Profile image updated!',
      error: 'Failed to upload image.',
      suppressGlobalError: true,
    }
  );
};
