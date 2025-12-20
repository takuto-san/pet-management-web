import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { UserResponse } from "@/types/api";

interface User extends UserResponse {}

interface UserState {
  currentUser: User | null;
  isAuthenticated: boolean;
  signinPending: boolean;
}

const initialState: UserState = {
  currentUser: null,
  isAuthenticated: false,
  signinPending: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.currentUser = action.payload;
      state.isAuthenticated = true;
      state.signinPending = false;
    },
    clearUser: (state) => {
      state.currentUser = null;
      state.isAuthenticated = false;
      state.signinPending = false;
    },
    setsigninPending: (state) => {
      state.signinPending = true;
    },
  },
});

export const { setUser, clearUser, setsigninPending } = userSlice.actions;
export default userSlice.reducer;
