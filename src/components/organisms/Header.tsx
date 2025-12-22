"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
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

  const { mutate: logout } = useLogoutUser({
    mutation: {
      onSettled: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        dispatch(clearUser());
        router.push("/");
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
  if (isLoadingUser || isNavigating) {
    rightContent = <CircularProgress size={24} />;
  } else if (currentUser) {
    rightContent = <UserMenu user={currentUser} onLogout={handleLogout} />;
  } else {
    rightContent = <AuthButtons onNavigate={handleNavigate} />;
  }

  return (
    <header style={{
      backgroundColor: "var(--background, #f0f0f0)",
      color: "var(--foreground, #000)",
      padding: "1rem",
      borderBottom: "1px solid var(--border, #ccc)"
    }}>
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link href="/">
          <LogoIcon />
        </Link>
        {rightContent}
      </nav>
    </header>
  );
};
