import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  name: string;
  role: string;
  profilePictureUrl: string;
}

interface UserState {
  token: string | null;
  user: User | null;
}

const storedToken = sessionStorage.getItem('token');
const storedUser = sessionStorage.getItem('user');

const initialState: UserState = {
  token: storedToken,
  user: storedUser ? JSON.parse(storedUser) : null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<{ token: string; user: { name: string; role: string; profilePictureUrl: string } }>) {
      state.token = action.payload.token;
      state.user = action.payload.user;
    },
    clearUser(state) {
      state.token = null;
      state.user = null;
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
