"use client";

import { useSelector } from "react-redux";
import type { RootState } from "@/lib/stores/store";
import { Header } from "@/components/organisms/Header";
import { LayoutTemplate } from "@/components/templates/LayoutTemplate";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Divider,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";

export function ProfilePage() {
  const currentUser = useSelector((state: RootState) => state.user.currentUser);

  if (!currentUser) {
    return (
      <LayoutTemplate
        header={<Header />}
        main={
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="h6">ログインが必要です</Typography>
          </Box>
        }
      />
    );
  }

  return (
    <LayoutTemplate
      header={<Header />}
      main={
        <Box sx={{ p: 4, minHeight: "calc(100vh - 64px)" }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: "bold" }}>
            プロフィール
          </Typography>

          <Card sx={{ maxWidth: 600, mx: "auto", mt: 4 }}>
            <CardContent sx={{ textAlign: "center", p: 4 }}>
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  bgcolor: "primary.main",
                  mx: "auto",
                  mb: 3,
                  boxShadow: 2,
                }}
              >
                <PersonIcon sx={{ fontSize: 50 }} />
              </Avatar>

              <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold" }}>
                {currentUser.username}
              </Typography>

              <Divider sx={{ my: 3 }} />

              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    名前
                  </Typography>
                  <Typography variant="body1">
                    {currentUser.firstName || "未設定"} {currentUser.lastName || ""}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    メールアドレス
                  </Typography>
                  <Typography variant="body1">
                    {currentUser.email}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    郵便番号
                  </Typography>
                  <Typography variant="body1">
                    {currentUser.postalCode || "未設定"}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    都道府県
                  </Typography>
                  <Typography variant="body1">
                    {currentUser.prefecture || "未設定"}
                  </Typography>
                </Box>
                <Box sx={{ gridColumn: "1 / -1" }}>
                  <Typography variant="body2" color="text.secondary">
                    住所
                  </Typography>
                  <Typography variant="body1">
                    {currentUser.city || "未設定"} {currentUser.address || ""}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    電話番号
                  </Typography>
                  <Typography variant="body1">
                    {currentUser.telephone || "未設定"}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    作成日
                  </Typography>
                  <Typography variant="body1">
                    {new Date(currentUser.createdAt).toLocaleDateString("ja-JP")}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      }
    />
  );
}
