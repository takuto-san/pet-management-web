import { useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { Avatar, Popover, Box, Typography, Button, Divider, Link } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import type { RootState } from "@/lib/stores/store";

interface UserMenuProps {
  onLogout: () => void;
}

export const UserMenu = ({ onLogout }: UserMenuProps) => {
  const { currentUser } = useSelector((state: RootState) => ({
    currentUser: state.user.currentUser,
  }));
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const router = useRouter();

  const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    onLogout();
    handleClose();
  };

  const handleManageAccount = () => {
    if (currentUser) {
      router.push(`/${currentUser.username}/setting`);
    }
    handleClose();
  };

  if (!currentUser) return null;

  const open = Boolean(anchorEl);

  return (
    <>
      <Avatar onClick={handleAvatarClick} style={{ cursor: "pointer" }}>
        {currentUser.firstName ? currentUser.firstName[0] : <PersonIcon />}
      </Avatar>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        sx={{
          '& .MuiPopover-paper': {
            borderRadius: 2,
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
            minWidth: 250,
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          {/* Header */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
              {currentUser.firstName} {currentUser.lastName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {currentUser.email}
            </Typography>
          </Box>

          <Divider sx={{ mb: 1 }} />

          {/* Main Action */}
          <Box sx={{ mb: 1 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={handleManageAccount}
              sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
            >
              アカウントを管理
            </Button>
          </Box>

          {/* Action List */}
          <Box sx={{ mb: 1 }}>
            <Button
              fullWidth
              variant="text"
              onClick={handleLogout}
              sx={{ justifyContent: 'flex-start', textTransform: 'none', color: 'error.main' }}
            >
              ログアウト
            </Button>
          </Box>

          <Divider sx={{ mb: 1 }} />

          {/* Footer */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
            <Link href="#" color="inherit" underline="hover">
              プライバシーポリシー
            </Link>
            <Link href="#" color="inherit" underline="hover">
              利用規約
            </Link>
          </Box>
        </Box>
      </Popover>
    </>
  );
};
