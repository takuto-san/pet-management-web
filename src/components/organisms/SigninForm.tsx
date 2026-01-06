"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";
import { Box, Paper, Alert, Container, Backdrop, CircularProgress, ThemeProvider, createTheme, Link, Typography } from "@mui/material";
import { useAuthenticateUser } from "@/api/generated/auth/auth";
import { setsigninPending } from "@/stores/slices/userSlice";
import { Input } from "@/components/atoms/Input";
import { Button } from "@/components/atoms/Button";
import { PasswordInput } from "@/components/molecules/PasswordInput";
import { FormHeader } from "@/components/molecules/FormHeader";
import { FormFooter } from "@/components/molecules/FormFooter";
import type { RootState } from "@/lib/stores/store";

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#d32f2f', // 赤色系アクセント
    },
    background: {
      default: '#000000', // 黒
    },
  },
});

export function SigninForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const signinPending = useSelector((state: RootState) => state.user.signinPending);

  const currentUser = useSelector((state: RootState) => state.user.currentUser);

  const { mutate: signin, isPending } = useAuthenticateUser({
    mutation: {
      onSuccess: (data) => {
        setSuccess("ログインに成功しました！");
        localStorage.setItem("token", data.accessToken);
        if (data.refreshToken) {
          localStorage.setItem("refreshToken", data.refreshToken);
        }
        dispatch(setsigninPending());
        // Invalidate the current user query to trigger re-fetch
        queryClient.invalidateQueries({ queryKey: ["/auth/me"] });
      },
      onError: (err: any) => {
        const status = err?.response?.status;
        let errorMessage = "ログインに失敗しました。メールアドレスとパスワードを確認してください。";
        if (status === 401) {
          errorMessage = "メールアドレスまたはパスワードが間違っています。";
        } else if (status === 400) {
          errorMessage = "入力内容を確認してください。";
        } else if (err?.response?.data?.detail) {
          errorMessage = err.response.data.detail;
        }
        setError(errorMessage);
      },
    },
  });

  const isLoading = isPending || signinPending;

  useEffect(() => {
    if (currentUser) {
      if (currentUser.username && currentUser.firstName && currentUser.lastName) {
        // ログイン成功後はダッシュボードにリダイレクト
        router.push(`/${currentUser.username}`);
      } else {
        router.push("/onboarding");
      }
    }
  }, [currentUser, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");
    setPasswordError("");
    setError("");
    setSuccess("");

    if (!email) {
      setEmailError("メールアドレスを入力してください。");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("正しいメールアドレスを入力してください。");
      return;
    }

    if (!password) {
      setPasswordError("パスワードを入力してください。");
      return;
    }

    signin({ data: { email, password } });
  };



  return (
    <ThemeProvider theme={darkTheme}>
      <Box
        sx={{
          minHeight: "calc(100vh - 64px)", // AppBarの高さを引く
          background: "#2D2631", // ダークパープル（暗い灰色）
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
        }}
      >
        <Container maxWidth="sm">
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 3,
              background: "rgba(255, 255, 255, 0.05)", // 背景より少し明るい
              border: "1px solid rgba(255, 255, 255, 0.1)", // 細い枠線
              backdropFilter: "blur(10px)",
            }}
          >
            <FormHeader
              title="ログイン"
              subtitle="アカウントにアクセスしてペットを管理しましょう。"
            />

            {/* Success Message */}
            {success && (
              <Alert severity="success" sx={{ mb: 3 }}>
                {success}
              </Alert>
            )}

            {/* Error Message */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {/* Form */}
            <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
              <Input
                id="email"
                fullWidth
                label="メールアドレス"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={emailError}
                required
                disabled={isLoading}
              />
              <PasswordInput
                id="password"
                label="パスワード"
                placeholder="パスワードを入力してください"
                value={password}
                onChange={setPassword}
                error={passwordError}
                required
                disabled={isLoading}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isLoading}
                size="small"
                sx={{
                  backgroundColor: '#A21D32', // 深紅色（ワインレッド）
                  color: 'white',
                  fontSize: '1rem',
                  padding: '8px 16px',
                  minHeight: '36px',
                  '&:hover': {
                    backgroundColor: '#8B1726',
                  },
                }}
              >
                {isLoading ? "ログイン中..." : "ログイン"}
              </Button>
            </Box>

            {/* Forgot Password Link */}
            <Box sx={{ textAlign: "center", mt: 2, mb: 2 }}>
              <Link
                href="/auth/signin" // 仮のリンク（Forgot passwordページがないため）
                variant="body2"
                sx={{
                  color: "#D84C7A", // ピンク（ローズ）
                  textDecoration: "none",
                  '&:hover': {
                    textDecoration: "underline",
                  },
                }}
              >
                パスワードをお忘れですか？
              </Link>
            </Box>

            <Box sx={{ mt: 4 }}>
              <FormFooter
                text="アカウントをお持ちでないですか？"
                linkText="新規登録"
                href="/auth/signup"
              />
            </Box>
          </Paper>
          <Backdrop
            sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={isLoading}
          >
            <CircularProgress color="inherit" />
          </Backdrop>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
