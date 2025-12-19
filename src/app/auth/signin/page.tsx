"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  Button,
  TextField,
  Typography,
  Box,
  Paper,
  Alert,
  Avatar,
  Container,
  AppBar,
  Toolbar,
  IconButton,
  InputAdornment,
} from "@mui/material";
import PetsIcon from "@mui/icons-material/Pets";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useAuthenticateUser, useGetCurrentUser } from "@/api/auth/auth";
import { setsigninPending, setUser } from "@/stores/slices/userSlice";
import type { RootState } from "@/lib/stores/store";

export default function SigninPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const dispatch = useDispatch();
  const signinPending = useSelector((state: RootState) => state.user.signinPending);

  const { mutate: signin, isPending } = useAuthenticateUser({
    mutation: {
      onSuccess: () => {
        dispatch(setsigninPending());
      },
      onError: (err: any) => {
        setError("ログインに失敗しました。メールアドレスとパスワードを確認してください。");
      },
    },
  });

  const { data: userData } = useGetCurrentUser({
    query: {
      enabled: signinPending,
    },
  });

  useEffect(() => {
    if (userData?.data) {
      dispatch(setUser({
        id: userData.data.id,
        email: userData.data.email,
        username: userData.data.username,
      }));
      if (userData.data.username) {
        router.push(`/${userData.data.username}`);
      }
    }
  }, [userData, dispatch, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    signin({ data: { email, password } });
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  return (
    <>
      <AppBar position="static" sx={{ mb: 2 }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="home">
            <Link href="/">
              <PetsIcon />
            </Link>
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            ペット管理システム
          </Typography>
        </Toolbar>
      </AppBar>
      <Box
        sx={{
          minHeight: "calc(100vh - 64px)", // AppBarの高さを引く
          background: "linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
        }}
      >
      <Container maxWidth="sm">
        <Paper
          elevation={10}
          sx={{
            p: 4,
            borderRadius: 3,
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
          }}
        >
          {/* Header */}
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
              ログイン
            </Typography>
            <Typography variant="body1" color="text.secondary">
              アカウントにログインして、ペットの管理を始めましょう
            </Typography>
          </Box>

          {/* Error Message */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
            <TextField
              fullWidth
              label="メールアドレス"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              sx={{ mb: 3 }}
              variant="outlined"
            />
            <TextField
              fullWidth
              label="パスワード"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              sx={{ mb: 4 }}
              variant="outlined"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

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
                mb: 3,
              }}
            >
              {isPending ? "ログイン中..." : "ログイン"}
            </Button>
          </Box>

          {/* Footer */}
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              アカウントをお持ちでないですか？{" "}
              <Link
                href="/auth/signup"
                style={{
                  color: "#1976d2",
                  textDecoration: "none",
                  fontWeight: "medium",
                }}
              >
                新規登録
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
      </Box>
    </>
  );
}
