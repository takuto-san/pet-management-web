"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";
import { useLogoutUser } from "@/api/generated/auth/auth";
import { CircularProgress } from "@mui/material";
import type { RootState } from "@/lib/stores/store";
import { clearUser } from "@/lib/stores/store";
import { UserMenu } from "@/components/molecules/UserMenu";
import { AuthButtons } from "@/components/molecules/AuthButtons";
import { LogoIcon } from "@/components/molecules/LogoIcon";

interface HeaderProps {
  onNavigate?: () => void;
}

export const Header = ({ onNavigate }: HeaderProps) => {
  const { currentUser, isLoadingUser } = useSelector((state: RootState) => ({
    currentUser: state.user.currentUser,
    isLoadingUser: state.user.isLoadingUser,
  }));
  const [isNavigating, setIsNavigating] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();

  const { mutate: logout, isPending: isLoggingOut } = useLogoutUser({
    mutation: {
      onSettled: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        dispatch(clearUser());
        queryClient.clear();
        router.push("/auth/signin");
      },
    },
  });

  const handleLogout = () => {
    logout();
  };

  const handleNavigate = () => {
    setIsNavigating(true);
    if (onNavigate) onNavigate();
  };

  let rightContent;
  if (isLoadingUser) {
    rightContent = null;
  } else if (isLoggingOut) {
    rightContent = <CircularProgress size={24} />;
  } else if (isNavigating) {
    rightContent = <CircularProgress size={24} />;
  } else if (currentUser) {
    rightContent = <UserMenu onLogout={handleLogout} />;
  } else {
    rightContent = <AuthButtons onNavigate={handleNavigate} />;
  }

  return (
    <header className="bg-sidebar text-sidebar-foreground p-4 border-b border-sidebar-border">
      <nav className="flex justify-between items-center">
        <Link href="/">
          <LogoIcon />
        </Link>
        {rightContent}
      </nav>
    </header>
  );
};
