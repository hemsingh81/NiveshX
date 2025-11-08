import axios from 'axios';

const API_URL = `${process.env.REACT_APP_API_BASE_URL}/auth`;

interface LoginResponse {
  token: string;
  refreshToken: string;
}

interface RefreshResponse {
  token: string;
}

export const loginUser = async (email: string, password: string): Promise<string> => {
  try {
    const response = await axios.post<LoginResponse>(`${API_URL}/login`, { email, password });
    const { token, refreshToken } = response.data;

    if (token && refreshToken) {
      localStorage.setItem('accessToken', token);
      localStorage.setItem('refreshToken', refreshToken);
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
  localStorage.clear();
  window.location.href = '/login'; 
};
