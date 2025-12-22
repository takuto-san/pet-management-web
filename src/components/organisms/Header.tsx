"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { useLogoutUser } from "@/api/generated/auth/auth";
import type { RootState } from "@/lib/stores/store";
import { clearUser } from "@/lib/stores/store";
import { UserMenu } from "@/components/molecules/UserMenu";
import { AuthButtons } from "@/components/molecules/AuthButtons";

export const Header = () => {
  const { currentUser, isLoadingUser } = useSelector((state: RootState) => ({
    currentUser: state.user.currentUser,
    isLoadingUser: state.user.isLoadingUser,
  }));
  const dispatch = useDispatch();
  const router = useRouter();

  const { mutate: logout } = useLogoutUser({
    mutation: {
      onSuccess: () => {
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

  return (
    <header style={{
      backgroundColor: "var(--background, #f0f0f0)",
      color: "var(--foreground, #000)",
      padding: "1rem",
      borderBottom: "1px solid var(--border, #ccc)"
    }}>
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>
          <h2 style={{ cursor: "pointer", margin: 0 }}>ペット管理システム</h2>
        </Link>
        {currentUser ? (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span>{currentUser.username}</span>
            <UserMenu user={currentUser} onLogout={handleLogout} />
          </div>
        ) : isLoadingUser ? (
          <div style={{ width: "100px" }} /> // Placeholder to prevent layout shift
        ) : (
          <AuthButtons />
        )}
      </nav>
    </header>
  );
};
