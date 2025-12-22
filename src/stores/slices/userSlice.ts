import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { UserResponse } from "@/types/api";

interface User extends UserResponse {}

interface UserState {
  currentUser: User | null;
  isAuthenticated: boolean;
  signinPending: boolean;
  isLoadingUser: boolean;
}

const initialState: UserState = {
  currentUser: null,
  isAuthenticated: false,
  signinPending: false,
  isLoadingUser: true,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.currentUser = action.payload;
      state.isAuthenticated = true;
      state.signinPending = false;
      state.isLoadingUser = false;
    },
    clearUser: (state) => {
      state.currentUser = null;
      state.isAuthenticated = false;
      state.signinPending = false;
      state.isLoadingUser = false;
    },
    setsigninPending: (state) => {
      state.signinPending = true;
    },
    setLoadingUser: (state, action: PayloadAction<boolean>) => {
      state.isLoadingUser = action.payload;
    },
  },
});

export const { setUser, clearUser, setsigninPending, setLoadingUser } = userSlice.actions;
export default userSlice.reducer;
