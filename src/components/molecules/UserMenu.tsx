import { useState } from "react";
import Link from "next/link";
import { Avatar, Menu, MenuItem } from "@mui/material";
import type { UserResponse } from "@/types/api/userResponse";

interface UserMenuProps {
  user: UserResponse;
  onLogout: () => void;
}

export const UserMenu = ({ user, onLogout }: UserMenuProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    onLogout();
    handleMenuClose();
  };

  return (
    <>
      <Avatar onClick={handleAvatarClick} style={{ cursor: "pointer" }}>
        {user.firstName?.[0]}
      </Avatar>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem component={Link} href="/profile" onClick={handleMenuClose}>プロフィール</MenuItem>
        <MenuItem onClick={handleLogout}>ログアウト</MenuItem>
      </Menu>
    </>
  );
};
