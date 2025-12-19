"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Button,
  TextField,
  Typography,
  Box,
  Paper,
  Alert,
  Avatar,
  Container,
  IconButton,
  InputAdornment,
} from "@mui/material";
import PetsIcon from "@mui/icons-material/Pets";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useRegisterUser } from "@/api/generated/auth/auth";
import AuthHeader from "@/components/organisms/AuthHeader";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const { mutate: signup, isPending } = useRegisterUser({
    mutation: {
      onSuccess: () => {
        router.push("/auth/signin"); // 成功したらログインページへ
      },
      onError: (err: any) => {
        const errorMessage = err?.response?.data?.detail || "登録に失敗しました。入力内容を確認してください。";
        setError(errorMessage);
      },
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("パスワードが一致しません。");
      return;
    }

    if (password.length < 8) {
      setError("パスワードは8文字以上で入力してください。");
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(password)) {
      setError("パスワードは大文字・小文字・数字をそれぞれ1文字以上含む必要があります。");
      return;
    }

    signup({ data: { email, password } });
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleClickShowConfirmPassword = () => setShowConfirmPassword((show) => !show);

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

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
              新規登録
            </Typography>
            <Typography variant="body1" color="text.secondary">
              無料でアカウントを作成して、ペットの管理を始めましょう
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
              helperText="8文字以上、大文字・小文字・数字を含む"
              sx={{ mb: 3 }}
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
            <TextField
              fullWidth
              label="パスワード（確認）"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              sx={{ mb: 4 }}
              variant="outlined"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle confirm password visibility"
                      onClick={handleClickShowConfirmPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
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
              {isPending ? "登録中..." : "新規登録"}
            </Button>
          </Box>

          {/* Footer */}
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              既にアカウントをお持ちですか？{" "}
              <Link
                href="/auth/signin"
                style={{
                  color: "#1976d2",
                  textDecoration: "none",
                  fontWeight: "medium",
                }}
              >
                ログイン
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
      </Box>
    </>
  );
}
