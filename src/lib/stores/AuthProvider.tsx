"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useGetCurrentUser } from "@/api/generated/auth/auth";
import type { RootState } from "@/lib/stores/store";
import { setUser, setLoadingUser, clearUser } from "@/stores/slices/userSlice";
import { Box, CircularProgress } from "@mui/material";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const { currentUser, isLoadingUser } = useSelector((state: RootState) => ({
    currentUser: state.user.currentUser,
    isLoadingUser: state.user.isLoadingUser,
  }));

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // Set initial loading state based on token
  useEffect(() => {
    if (!token) {
      dispatch(setLoadingUser(false));
    }
  }, [token, dispatch]);

  const { data: userData, isLoading, error } = useGetCurrentUser({
    query: {
      enabled: !!token,
    },
  });

  useEffect(() => {
    dispatch(setLoadingUser(isLoading));
  }, [isLoading, dispatch]);

  useEffect(() => {
    if (userData) {
      dispatch(setUser(userData));
    } else if (error) {
      dispatch(clearUser());
    }
  }, [userData, error, dispatch]);

  return (
    <div suppressHydrationWarning>
      {isLoadingUser ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100%' }}>
          <CircularProgress />
        </Box>
      ) : (
        <>{children}</>
      )}
    </div>
  );
}
