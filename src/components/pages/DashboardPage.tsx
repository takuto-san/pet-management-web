"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import type { RootState } from "@/lib/stores/store";
import { Header } from "@/components/organisms/Header";
import { LayoutTemplate } from "@/components/templates/LayoutTemplate";
import { useListPets } from "@/api/generated/pet/pet";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
} from "@mui/material";
import PetsIcon from "@mui/icons-material/Pets";

export function DashboardPage() {
  const router = useRouter();

  const { currentUser, isLoadingUser } = useSelector((state: RootState) => ({
    currentUser: state.user.currentUser,
    isLoadingUser: state.user.isLoadingUser,
  }));

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!token) {
      router.push("/");
    }
  }, [token, router]);

  const { data: petsData, isLoading, error } = useListPets(undefined, {
    query: {
      enabled: !!currentUser && !isLoadingUser,
    },
  });

  const allPets = petsData?.content || [];
  const pets = currentUser ? allPets.filter(pet => pet.userId === currentUser.id) : [];

  const isPageLoading = isLoadingUser || (currentUser && (isLoading || (!petsData && !error)));

  if (isPageLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          width: "100%"
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // 未ログイン時は何も表示せず、リダイレクト処理に任せる
  if (!currentUser) {
    return null;
  }

  return (
    <LayoutTemplate
      header={<Header />}
      main={
        <Box sx={{ p: 4, minHeight: "calc(100vh - 64px)" }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: "bold" }}>
            {currentUser?.username} さんのダッシュボード
          </Typography>

          <Typography variant="h6" component="h2" gutterBottom sx={{ mt: 4, mb: 2 }}>
            あなたのペット
          </Typography>

          {error ? (
            <Alert severity="error" sx={{ mt: 2 }}>
              ペットの取得に失敗しました。
            </Alert>
          ) : pets.length === 0 ? (
            <Alert severity="info" sx={{ mt: 2 }}>
              まだペットが登録されていません。ペットを追加してください。
            </Alert>
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: 3,
              }}
            >
              {pets.map((pet) => (
                <Card
                  key={pet.id}
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    transition: "transform 0.2s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: 4,
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, textAlign: "center" }}>
                    <Avatar
                      sx={{
                        width: 80,
                        height: 80,
                        bgcolor: "primary.main",
                        mx: "auto",
                        mb: 2,
                        boxShadow: 2,
                      }}
                    >
                      <PetsIcon sx={{ fontSize: 40 }} />
                    </Avatar>

                    <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: "bold" }}>
                      {pet.name}
                    </Typography>

                    <Box sx={{ display: "flex", justifyContent: "center", gap: 1, mb: 2 }}>
                      <Chip
                        label={pet.type === "dog" ? "犬" :
                               pet.type === "cat" ? "猫" :
                               pet.type === "rabbit" ? "ウサギ" :
                               pet.type === "hamster" ? "ハムスター" :
                               pet.type === "bird" ? "鳥" :
                               pet.type === "turtle" ? "カメ" :
                               pet.type === "fish" ? "魚" : pet.type}
                        color="primary"
                        size="small"
                      />
                      <Chip
                        label={pet.sex === "male" ? "オス" :
                               pet.sex === "female" ? "メス" :
                               "不明"}
                        color="secondary"
                        size="small"
                      />
                    </Box>

                    {pet.birthDate && (
                      <Typography variant="body2" color="text.secondary">
                        生年月日: {new Date(pet.birthDate).toLocaleDateString("ja-JP")}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Box>
      }
    />
  );
}
