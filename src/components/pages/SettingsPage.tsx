"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { Box, Typography, Avatar, Paper, List, ListItem, ListItemButton, ListItemText, Button, Alert, IconButton } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import { Header } from "@/components/organisms/Header";
import { Footer } from "@/components/organisms/Footer";
import { LayoutTemplate } from "@/components/templates/LayoutTemplate";
import { LogoIcon } from "@/components/molecules/LogoIcon";
import { ImageUpload } from "@/components/molecules/ImageUpload";
import { useUpdateUser } from "@/api/generated/user/user";
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
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [editedData, setEditedData] = useState({
    firstName: '',
    lastName: '',
    firstNameKana: '',
    lastNameKana: '',
    telephone: '',
  });
  const { currentUser, isLoadingUser } = useSelector((state: RootState) => ({
    currentUser: state.user.currentUser,
    isLoadingUser: state.user.isLoadingUser,
  }));

  const { mutate: updateUser, isPending: isUpdating } = useUpdateUser({
    mutation: {
      onSuccess: (data) => {
        setIsEditing(false);
        setProfileImage(null);
        setProfileImagePreview(null);
      },
      onError: (err: any) => {
        console.error('Update failed:', err);
      },
    },
  });

  useEffect(() => {
    if (currentUser) {
      setEditedData({
        firstName: currentUser.firstName || '',
        lastName: currentUser.lastName || '',
        firstNameKana: currentUser.firstNameKana || '',
        lastNameKana: currentUser.lastNameKana || '',
        telephone: currentUser.telephone || '',
      });
    }
  }, [currentUser]);

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
            <Box sx={{ position: 'relative' }}>
              <div className="bg-[rgba(255,255,255,0.05)] rounded-lg p-6 border border-[rgba(255,255,255,0.1)]" style={{ backdropFilter: 'blur(10px)' }}>
                {!isEditing && (
                  <IconButton
                    sx={{
                      position: 'absolute',
                      bottom: 8,
                      right: 8,
                      color: 'white',
                      fontSize: '1.5rem',
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.1)',
                      },
                    }}
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    <EditIcon fontSize="large" />
                  </IconButton>
                )}
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3, alignItems: 'center' }}>
                <Box sx={{ flex: { xs: 1, sm: '0 0 33%' }, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Box sx={{ position: 'relative', display: 'inline-block' }}>
                    <Avatar
                      src={profileImagePreview || currentUser.icon}
                      sx={{ width: 100, height: 100, bgcolor: '#333333', fontSize: '2rem' }}
                    >
                      {currentUser.firstName?.[0] || currentUser.username?.[0] || 'U'}
                    </Avatar>
                    {isEditing && (
                      <IconButton
                        sx={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          bgcolor: 'rgba(128, 128, 128, 0.3)',
                          color: 'white',
                          borderRadius: '50%',
                          width: 50,
                          height: 50,
                          '&:hover': {
                            bgcolor: 'rgba(128, 128, 128, 0.5)',
                          },
                        }}
                        onClick={() => setIsEditing(true)}
                      >
                        <PhotoCamera />
                      </IconButton>
                    )}
                  </Box>
                  <Typography variant="h6" sx={{ mt: 2, color: 'white', fontWeight: 'bold' }}>
                    {isEditing ? `${editedData.lastName} ${editedData.firstName}` : (currentUser.firstName && currentUser.lastName ? `${currentUser.firstName} ${currentUser.lastName}` : currentUser.username || 'ユーザー')}
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
                    <Typography variant="body2" sx={{ color: '#A0A0A0' }}>姓</Typography>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedData.lastName}
                        onChange={(e) => setEditedData(prev => ({ ...prev, lastName: e.target.value }))}
                        style={{ background: 'transparent', border: '1px solid #A0A0A0', color: 'white', padding: '4px', borderRadius: '4px' }}
                      />
                    ) : (
                      <Typography variant="body1" sx={{ color: 'white' }}>
                        {currentUser.lastName || '未設定'}
                      </Typography>
                    )}
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ color: '#A0A0A0' }}>名</Typography>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedData.firstName}
                        onChange={(e) => setEditedData(prev => ({ ...prev, firstName: e.target.value }))}
                        style={{ background: 'transparent', border: '1px solid #A0A0A0', color: 'white', padding: '4px', borderRadius: '4px' }}
                      />
                    ) : (
                      <Typography variant="body1" sx={{ color: 'white' }}>
                        {currentUser.firstName || '未設定'}
                      </Typography>
                    )}
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ color: '#A0A0A0' }}>姓（カナ）</Typography>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedData.lastNameKana}
                        onChange={(e) => setEditedData(prev => ({ ...prev, lastNameKana: e.target.value }))}
                        style={{ background: 'transparent', border: '1px solid #A0A0A0', color: 'white', padding: '4px', borderRadius: '4px' }}
                      />
                    ) : (
                      <Typography variant="body1" sx={{ color: 'white' }}>
                        {currentUser.lastNameKana || '未設定'}
                      </Typography>
                    )}
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ color: '#A0A0A0' }}>名（カナ）</Typography>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedData.firstNameKana}
                        onChange={(e) => setEditedData(prev => ({ ...prev, firstNameKana: e.target.value }))}
                        style={{ background: 'transparent', border: '1px solid #A0A0A0', color: 'white', padding: '4px', borderRadius: '4px' }}
                      />
                    ) : (
                      <Typography variant="body1" sx={{ color: 'white' }}>
                        {currentUser.firstNameKana || '未設定'}
                      </Typography>
                    )}
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ color: '#A0A0A0' }}>電話番号</Typography>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedData.telephone}
                        onChange={(e) => setEditedData(prev => ({ ...prev, telephone: e.target.value }))}
                        style={{ background: 'transparent', border: '1px solid #A0A0A0', color: 'white', padding: '4px', borderRadius: '4px' }}
                      />
                    ) : (
                      <Typography variant="body1" sx={{ color: 'white' }}>
                        {currentUser.telephone || '未設定'}
                      </Typography>
                    )}
                  </Box>

                  {isEditing && (
                    <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                      <Button
                        variant="contained"
                        onClick={() => {
                          const data = {
                            username: currentUser.username,
                            email: currentUser.email,
                            ...editedData,
                            icon: profileImagePreview || currentUser.icon,
                          };
                          updateUser({ userId: currentUser.id, data });
                        }}
                        disabled={isUpdating}
                        sx={{
                          backgroundColor: '#8B0000',
                          '&:hover': {
                            backgroundColor: '#A52A2A',
                          },
                        }}
                      >
                        {isUpdating ? '保存中...' : '保存'}
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => {
                          setIsEditing(false);
                          setProfileImage(null);
                          setProfileImagePreview(null);
                          setEditedData({
                            firstName: currentUser.firstName || '',
                            lastName: currentUser.lastName || '',
                            firstNameKana: currentUser.firstNameKana || '',
                            lastNameKana: currentUser.lastNameKana || '',
                            telephone: currentUser.telephone || '',
                          });
                        }}
                        sx={{
                          borderColor: '#8B0000',
                          color: '#8B0000',
                          '&:hover': {
                            borderColor: '#A52A2A',
                            color: '#A52A2A',
                          },
                        }}
                      >
                        キャンセル
                      </Button>
                    </Box>
                  )}
                </Box>
              </Box>
              </div>
            </Box>
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
