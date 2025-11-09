import axios from 'axios';
import { store } from '../store';
import { setUser } from '../store/userSlice';
import { clearUser } from '../store/userSlice';

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
    const response = await axios.post<LoginResponse>(`${API_URL}/login`, { email, password });
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
    const response = await axios.post<RefreshResponse>(`${API_URL}/refresh`, { refreshToken });
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
