import axiosInstance from './axiosInstance';
import { store } from '../store';
import { setUser, clearUser } from '../store/userSlice';
import { withToast } from '../utils/toastUtils';

const API_URL = `${process.env.REACT_APP_API_BASE_URL}/auth`;

interface LoginResponse {
  token: string;
  refreshToken: string;
  role: string;
  name: string;
  profilePictureUrl: string;
}

interface RefreshResponse {
  token: string;
}

export const loginUser = async (email: string, password: string): Promise<string> => {
  const response = await withToast(
    () => axiosInstance.post<LoginResponse>(
      `${API_URL}/login`,
      { email, password },
      { headers: { 'x-skip-error-toaster': 'true' } }
    ),
    {
      loading: 'Logging in...',
      success: 'Login successful!',
      error: 'Login failed. Please check your credentials.',
      suppressGlobalError: true,
    }
  );

  const { token, refreshToken, name, role, profilePictureUrl } = response.data;
  const baseUrl = process.env.REACT_APP_API_BASE_URL?.replace(/\/?api\/?$/, '') || '';
  const fullProfilePictureUrl = profilePictureUrl ? `${baseUrl}${profilePictureUrl}` : '';

  if (token && refreshToken) {
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('refreshToken', refreshToken);
    sessionStorage.setItem('user', JSON.stringify({ name, role, profilePictureUrl: fullProfilePictureUrl }));
    store.dispatch(setUser({ token, user: { name, role, profilePictureUrl: fullProfilePictureUrl } }));
    return token;
  } else {
    throw new Error('Invalid login response');
  }
};

export const refreshToken = async (refreshToken: string | null): Promise<RefreshResponse> => {
  const response = await axiosInstance.post<RefreshResponse>(`${API_URL}/refresh`, { refreshToken });
  return response.data;
};

export const logoutUser = (): void => {
  sessionStorage.clear();
  store.dispatch(clearUser());
  window.location.href = '/login';
};

interface UserProfileResponse {
  name: string;
  email: string;
  phoneNumber: string;
  role: string;
  profileImageUrl?: string;
}

export const getUserProfile = async (): Promise<UserProfileResponse> => {
  const response = await axiosInstance.get<UserProfileResponse>(`${API_URL}/profile`);
  return response.data;
};

interface UpdateProfileRequest {
  name: string;
  phoneNumber: string;
}

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


interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

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
