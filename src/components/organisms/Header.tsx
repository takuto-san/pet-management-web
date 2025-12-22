"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { useLogoutUser } from "@/api/generated/auth/auth";
import type { RootState } from "@/lib/stores/store";
import { clearUser } from "@/lib/stores/store";
import { UserMenu } from "@/components/molecules/UserMenu";
import { AuthButtons } from "@/components/molecules/AuthButtons";
import { LogoIcon } from "@/components/molecules/LogoIcon";

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

  let rightContent;
  if (isLoadingUser) {
    rightContent = <div style={{ width: "100px", height: "40px" }} />;
  } else if (currentUser) {
    rightContent = <UserMenu user={currentUser} onLogout={handleLogout} />;
  } else {
    rightContent = <AuthButtons />;
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
