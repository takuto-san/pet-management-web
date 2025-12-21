"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { Avatar, Button, Menu, MenuItem } from "@mui/material";
import { useLogoutUser } from "@/api/generated/auth/auth";
import type { RootState } from "@/lib/stores/store";
import { clearUser } from "@/lib/stores/store";

export const Header = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const dispatch = useDispatch();
  const router = useRouter();

  const { mutate: logout } = useLogoutUser({
    mutation: {
      onSuccess: () => {
        dispatch(clearUser());
        router.push("/");
      },
    },
  });

  const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
  };

  return (
    <header style={{
      backgroundColor: "var(--background, #f0f0f0)",
      color: "var(--foreground, #000)",
      padding: "1rem",
      borderBottom: "1px solid var(--border, #ccc)"
    }}>
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link href="/">
          <h2 style={{ cursor: "pointer", margin: 0 }}>ペット管理システム</h2>
        </Link>
        {currentUser ? (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span>{currentUser.username}</span>
            <Avatar onClick={handleAvatarClick} style={{ cursor: "pointer" }}>
              {currentUser.firstName?.[0]}
            </Avatar>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleLogout}>ログアウト</MenuItem>
            </Menu>
          </div>
        ) : (
          <div>
            <Link href="/auth/signin">
              <Button variant="contained" style={{ marginRight: "0.5rem" }}>
                ログイン
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button variant="outlined">
                新規登録
              </Button>
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
};
