import axiosInstance from "./axiosInstance";
import { store } from "../store";
import { setUser, clearUser } from "../store/userSlice";
import { withToast } from "../utils/toastUtils";

const API_URL = `${process.env.REACT_APP_API_BASE_URL}/auth`;
const BASE_URL =
  process.env.REACT_APP_API_BASE_URL?.replace(/\/?api\/?$/, "") || "";

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

export const loginUser = async (
  email: string,
  password: string
): Promise<string> => {
  const response = await withToast(
    () =>
      axiosInstance.post<LoginResponse>(
        `${API_URL}/login`,
        { email, password },
        {
          headers: {
            "x-skip-error-toaster": "true",
          },
        }
      ),
    {
      loading: "Logging in...",
      success: "Login successful!",
      error: "Login failed. Please check your credentials.",
    }
  );

  const { token, refreshToken, name, role, profilePictureUrl } = response.data;
  const fullProfilePictureUrl = profilePictureUrl
    ? `${BASE_URL}${profilePictureUrl}`
    : "";

  sessionStorage.setItem("token", token);
  sessionStorage.setItem("refreshToken", refreshToken);
  sessionStorage.setItem(
    "user",
    JSON.stringify({ name, role, profilePictureUrl: fullProfilePictureUrl })
  );
  store.dispatch(
    setUser({
      token,
      user: { name, role, profilePictureUrl: fullProfilePictureUrl },
    })
  );

  return token;
};

export const refreshToken = async (
  refreshToken: string | null
): Promise<RefreshResponse> => {
  const response = await axiosInstance.post<RefreshResponse>(
    `${API_URL}/refresh`,
    { refreshToken }
  );
  return response.data;
};

export const logoutUser = (): void => {
  sessionStorage.clear();
  store.dispatch(clearUser());
  window.location.href = "/login";
};
