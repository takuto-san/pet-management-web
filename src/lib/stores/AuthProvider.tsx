"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useGetCurrentUser } from "@/api/generated/auth/auth";
import { setUser } from "@/stores/slices/userSlice";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const { data: userData } = useGetCurrentUser({
    query: {
      enabled: !!token,
    },
  });

  useEffect(() => {
    if (userData) {
      dispatch(setUser(userData));
    }
  }, [userData, dispatch]);

  return <>{children}</>;
}
