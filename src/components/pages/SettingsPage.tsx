"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { Box, Typography, Avatar, Paper, List, ListItem, ListItemButton, ListItemText } from "@mui/material";
import { Header } from "@/components/organisms/Header";
import { Footer } from "@/components/organisms/Footer";
import { LayoutTemplate } from "@/components/templates/LayoutTemplate";
import { LogoIcon } from "@/components/molecules/LogoIcon";
import type { RootState } from "@/lib/stores/store";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`setting-tabpanel-${index}`}
      aria-labelledby={`setting-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export function SettingsPage() {
  const router = useRouter();
  const [selectedSetting, setSelectedSetting] = useState('profile');
  const { currentUser, isLoadingUser } = useSelector((state: RootState) => ({
    currentUser: state.user.currentUser,
    isLoadingUser: state.user.isLoadingUser,
  }));

  useEffect(() => {
    if (!isLoadingUser && !currentUser) {
      router.push('/auth/signin');
    }
  }, [currentUser, isLoadingUser, router]);

  if (isLoadingUser || !currentUser) {
    return null;
  }

  const settings = [
    { id: 'profile', label: 'プロフィール' },
    { id: 'billing', label: '請求とお支払い' },
    { id: 'advanced', label: '詳細設定' },
  ];

  const renderContent = () => {
    switch (selectedSetting) {
      case 'profile':
        return (
          <Box sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'white' }}>
              プロフィール
            </Typography>
            <div className="bg-[rgba(255,255,255,0.05)] rounded-lg p-6 mt-6 border border-[rgba(255,255,255,0.1)]" style={{ backdropFilter: 'blur(10px)' }}>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3, alignItems: 'center' }}>
                <Box sx={{ flex: { xs: 1, sm: '0 0 33%' }, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Avatar
                    sx={{ width: 100, height: 100, bgcolor: '#333333', fontSize: '2rem' }}
                  >
                    {currentUser.firstName?.[0] || currentUser.username?.[0] || 'U'}
                  </Avatar>
                  <Typography variant="h6" sx={{ mt: 2, color: 'white', fontWeight: 'bold' }}>
                    {currentUser.firstName && currentUser.lastName
                      ? `${currentUser.firstName} ${currentUser.lastName}`
                      : currentUser.username || 'ユーザー'}
                  </Typography>
                </Box>
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant="body2" sx={{ color: '#A0A0A0' }}>ユーザー名</Typography>
                    <Typography variant="body1" sx={{ color: 'white' }}>
                      {currentUser.username || '未設定'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ color: '#A0A0A0' }}>メールアドレス</Typography>
                    <Typography variant="body1" sx={{ color: 'white' }}>
                      {currentUser.email || '未設定'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ color: '#A0A0A0' }}>名前</Typography>
                    <Typography variant="body1" sx={{ color: 'white' }}>
                      {currentUser.firstName && currentUser.lastName
                        ? `${currentUser.firstName} ${currentUser.lastName}`
                        : '未設定'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ color: '#A0A0A0' }}>アカウント作成日</Typography>
                    <Typography variant="body1" sx={{ color: 'white' }}>
                      {currentUser.createdAt ? new Date(currentUser.createdAt).toLocaleDateString('ja-JP') : '未設定'}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </div>
          </Box>
        );
      case 'billing':
        return (
          <Box sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'white' }}>
              請求とお支払い
            </Typography>
            <Paper sx={{ p: 3, mt: 3, bgcolor: '#2D2631', borderRadius: 2 }}>
              <Typography sx={{ color: 'white' }}>
                請求とお支払いの設定はここに表示されます。
              </Typography>
            </Paper>
          </Box>
        );
      case 'advanced':
        return (
          <Box sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'white' }}>
              詳細設定
            </Typography>
            <Paper sx={{ p: 3, mt: 3, bgcolor: '#2D2631', borderRadius: 2 }}>
              <Typography sx={{ color: 'white' }}>
                詳細設定はここに表示されます。
              </Typography>
            </Paper>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <LayoutTemplate
      header={<Header />}
      footer={<Footer />}
      sidebar={
        <Box sx={{ height: "100%", bgcolor: "#2D2631", p: 2 }}>
          <Typography variant="h6" sx={{ color: 'white', mb: 2, fontWeight: 'bold' }}>
            設定
          </Typography>
          <List>
            {settings.map((setting) => (
              <ListItem key={setting.id} disablePadding>
                <ListItemButton
                  selected={selectedSetting === setting.id}
                  onClick={() => setSelectedSetting(setting.id)}
                  sx={{
                    "&.Mui-selected": {
                      bgcolor: "rgba(162, 29, 50, 0.2)",
                      borderLeft: "4px solid #A21D32",
                      borderRadius: 1,
                      "&:hover": {
                        bgcolor: "rgba(162, 29, 50, 0.3)",
                      },
                    },
                    "&:hover": {
                      color: "#D84C7A",
                    },
                  }}
                >
                  <ListItemText primary={setting.label} sx={{ color: 'white' }} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      }
      main={
        <div className="bg-[#2D2631] min-h-full">
          {renderContent()}
        </div>
      }
    />
  );
}
