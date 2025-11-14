// src/store/userSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface User {
  name: string;
  role: string;
  profilePictureUrl: string;
}

interface UserState {
  token: string | null;
  user: User | null;
}

const storedToken = sessionStorage.getItem("token");
const storedUser = sessionStorage.getItem("user");

const initialState: UserState = {
  token: storedToken,
  user: storedUser ? JSON.parse(storedUser) : null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    // set both token and user (used on login)
    setUser(
      state,
      action: PayloadAction<{ token: string; user: { name: string; role: string; profilePictureUrl: string } }>
    ) {
      state.token = action.payload.token;
      state.user = action.payload.user;
      try {
        sessionStorage.setItem("token", action.payload.token);
        sessionStorage.setItem("user", JSON.stringify(action.payload.user));
      } catch {
        // ignore storage errors in constrained environments
      }
    },

    // update token only (used after refresh)
    setAuthToken(state, action: PayloadAction<string>) {
      state.token = action.payload;
      try {
        sessionStorage.setItem("token", action.payload);
      } catch {
        // ignore storage errors
      }
    },

    // clear everything on logout
    clearUser(state) {
      state.token = null;
      state.user = null;
      try {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("refreshToken");
        sessionStorage.removeItem("user");
      } catch {
        // ignore storage errors
      }
    },
  },
});

export const { setUser, clearUser, setAuthToken } = userSlice.actions;

export default userSlice.reducer;

// convenience selectors (optional)
export const selectAuthToken = (state: { user: UserState }) => state.user.token;
export const selectCurrentUser = (state: { user: UserState }) => state.user.user;
