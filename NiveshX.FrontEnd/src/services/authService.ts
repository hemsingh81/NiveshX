import axiosInstance from './axiosInstance';
import toast from 'react-hot-toast';
import { store } from '../store';
import { setUser, clearUser } from '../store/userSlice';

const API_URL = `${process.env.REACT_APP_API_BASE_URL}/auth`;

interface LoginResponse {
  token: string;
  refreshToken: string;
  role: string;
  name: string;
}

interface RefreshResponse {
  token: string;
}

export const loginUser = async (email: string, password: string): Promise<string> => {
  try {
    const response = await toast.promise(
      axiosInstance.post<LoginResponse>(
        `${API_URL}/login`,
        { email, password },
        { headers: { 'x-skip-error-toaster': 'true' } } // ✅ suppress global toast
      ),
      {
        loading: 'Logging in...',
        success: 'Login successful!',
        error: 'Login failed. Please check your credentials.',
      }
    );

    const { token, refreshToken, name, role } = response.data;

    if (token && refreshToken) {
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('refreshToken', refreshToken);
      sessionStorage.setItem('user', JSON.stringify({ name, role }));

      store.dispatch(setUser({ token, user: { name, role } }));
      return token;
    } else {
      throw new Error('Invalid login response');
    }
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};

export const refreshToken = async (refreshToken: string | null): Promise<RefreshResponse> => {
  try {
    const response = await axiosInstance.post<RefreshResponse>(`${API_URL}/refresh`, { refreshToken });
    return response.data;
  } catch (error) {
    console.error('Token refresh failed:', error);
    throw error;
  }
};

export const logoutUser = (): void => {
  sessionStorage.clear();
  store.dispatch(clearUser());
  window.location.href = '/login';
};

interface UserProfileResponse {
  name: string;
  email: string;
  phone: string;
  role: string;
  profileImageUrl?: string;
}

export const getUserProfile = async (): Promise<UserProfileResponse> => {
  try {
    const response = await axiosInstance.get<UserProfileResponse>(`${API_URL}/profile`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch user profile:', error);
    throw error;
  }
};

interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export const changePassword = async (payload: ChangePasswordRequest): Promise<void> => {
  await toast.promise(
    axiosInstance.post(`${API_URL}/change-password`, payload, {
      headers: { 'x-skip-error-toaster': 'true' }, 
    }),
    {
      loading: 'Updating password...',
      success: 'Password updated successfully!',
      error: 'Failed to update password.',
    }
  );
};
