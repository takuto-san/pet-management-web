"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import {
  Button,
  TextField,
  Typography,
  Box,
  Paper,
  Alert,
  Avatar,
  Container,
} from "@mui/material";
import PetsIcon from "@mui/icons-material/Pets";
import { useUpdateUser } from "@/api/generated/user/user";
import type { RootState } from "@/lib/stores/store";
import AuthHeader from "@/components/organisms/AuthHeader";
import type { UserBase } from "@/types/api";

export default function OnboardingPage() {
  const [formData, setFormData] = useState<UserBase>({
    username: "",
    firstName: "",
    lastName: "",
    firstNameKana: "",
    lastNameKana: "",
    email: "",
    postalCode: "",
    prefecture: "",
    city: "",
    address: "",
    telephone: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();
  const currentUser = useSelector((state: RootState) => state.user.currentUser);

  const { mutate: updateUser, isPending } = useUpdateUser({
    mutation: {
      onSuccess: (data) => {
        setSuccess("プロフィールが更新されました！");
        if (data.username) {
          router.push(`/${data.username}`);
        }
      },
      onError: (err: any) => {
        const status = err?.response?.status;
        let errorMessage = "更新に失敗しました。";
        if (status === 400) {
          errorMessage = "入力内容を確認してください。";
        } else if (err?.response?.data?.detail) {
          errorMessage = err.response.data.detail;
        }
        setError(errorMessage);
      },
    },
  });

  useEffect(() => {
    if (currentUser) {
      setFormData({
        username: currentUser.username || "",
        firstName: currentUser.firstName || "",
        lastName: currentUser.lastName || "",
        firstNameKana: currentUser.firstNameKana || "",
        lastNameKana: currentUser.lastNameKana || "",
        email: currentUser.email,
        postalCode: currentUser.postalCode || "",
        prefecture: currentUser.prefecture || "",
        city: currentUser.city || "",
        address: currentUser.address || "",
        telephone: currentUser.telephone || "",
      });
    }
  }, [currentUser]);

  const handleChange = (field: keyof UserBase) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!currentUser?.id) {
      setError("ユーザー情報が取得できませんでした。");
      return;
    }

    if (!formData.username || !formData.firstName || !formData.lastName) {
      setError("ユーザー名、氏名は必須です。");
      return;
    }

    updateUser({ userId: currentUser.id, data: formData });
  };

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <AuthHeader />
      <Box
        sx={{
          minHeight: "calc(100vh - 64px)",
          background: "linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
        }}
      >
        <Container maxWidth="md">
          <Paper
            elevation={10}
            sx={{
              p: 4,
              borderRadius: 3,
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(10px)",
            }}
          >
            <Box sx={{ textAlign: "center", mb: 4 }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: "primary.main",
                  mx: "auto",
                  mb: 3,
                  boxShadow: 3,
                }}
              >
                <PetsIcon sx={{ fontSize: 40 }} />
              </Avatar>
              <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: "bold" }}>
                基本情報入力
              </Typography>
              <Typography variant="body1" color="text.secondary">
                ペットの管理を始める前に、基本情報を入力してください
              </Typography>
            </Box>

            {success && (
              <Alert severity="success" sx={{ mb: 3 }}>
                {success}
              </Alert>
            )}

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                  <TextField
                    fullWidth
                    label="ユーザー名"
                    value={formData.username}
                    onChange={handleChange("username")}
                    required
                    variant="outlined"
                    sx={{ flex: "1 1 300px" }}
                  />
                  <TextField
                    fullWidth
                    label="メールアドレス"
                    value={formData.email}
                    disabled
                    variant="outlined"
                    sx={{ flex: "1 1 300px" }}
                  />
                </Box>
                <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                  <TextField
                    fullWidth
                    label="姓"
                    value={formData.lastName}
                    onChange={handleChange("lastName")}
                    required
                    variant="outlined"
                    sx={{ flex: "1 1 300px" }}
                  />
                  <TextField
                    fullWidth
                    label="名"
                    value={formData.firstName}
                    onChange={handleChange("firstName")}
                    required
                    variant="outlined"
                    sx={{ flex: "1 1 300px" }}
                  />
                </Box>
                <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                  <TextField
                    fullWidth
                    label="姓（カナ）"
                    value={formData.lastNameKana}
                    onChange={handleChange("lastNameKana")}
                    variant="outlined"
                    sx={{ flex: "1 1 300px" }}
                  />
                  <TextField
                    fullWidth
                    label="名（カナ）"
                    value={formData.firstNameKana}
                    onChange={handleChange("firstNameKana")}
                    variant="outlined"
                    sx={{ flex: "1 1 300px" }}
                  />
                </Box>
                <TextField
                  fullWidth
                  label="電話番号"
                  value={formData.telephone}
                  onChange={handleChange("telephone")}
                  variant="outlined"
                />
                <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                  <TextField
                    fullWidth
                    label="郵便番号"
                    value={formData.postalCode}
                    onChange={handleChange("postalCode")}
                    variant="outlined"
                    sx={{ flex: "1 1 200px" }}
                  />
                  <TextField
                    fullWidth
                    label="都道府県"
                    value={formData.prefecture}
                    onChange={handleChange("prefecture")}
                    variant="outlined"
                    sx={{ flex: "2 1 400px" }}
                  />
                </Box>
                <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                  <TextField
                    fullWidth
                    label="市区町村"
                    value={formData.city}
                    onChange={handleChange("city")}
                    variant="outlined"
                    sx={{ flex: "1 1 300px" }}
                  />
                  <TextField
                    fullWidth
                    label="住所"
                    value={formData.address}
                    onChange={handleChange("address")}
                    variant="outlined"
                    sx={{ flex: "1 1 300px" }}
                  />
                </Box>
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isPending}
                size="large"
                sx={{
                  py: 2,
                  borderRadius: 2,
                  fontSize: "1.1rem",
                  boxShadow: 3,
                  "&:hover": { boxShadow: 6 },
                  mt: 4,
                }}
              >
                {isPending ? "更新中..." : "更新して開始"}
              </Button>
            </Box>
          </Paper>
        </Container>
      </Box>
    </>
  );
}
