"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { Box, Paper, Alert, Container } from "@mui/material";
import { useAuthenticateUser, useGetCurrentUser } from "@/api/generated/auth/auth";
import { setsigninPending, setUser } from "@/stores/slices/userSlice";
import { Input } from "@/components/atoms/Input";
import { Button } from "@/components/atoms/Button";
import { PasswordInput } from "@/components/molecules/PasswordInput";
import { FormHeader } from "@/components/molecules/FormHeader";
import { FormFooter } from "@/components/molecules/FormFooter";
import type { RootState } from "@/lib/stores/store";

export function SigninForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();
  const dispatch = useDispatch();
  const signinPending = useSelector((state: RootState) => state.user.signinPending);

  const { mutate: signin, isPending } = useAuthenticateUser({
    mutation: {
      onSuccess: (data) => {
        setSuccess("ログインに成功しました！");
        localStorage.setItem("token", data.accessToken);
        if (data.refreshToken) {
          localStorage.setItem("refreshToken", data.refreshToken);
        }
        dispatch(setsigninPending());
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

  const { data: userData } = useGetCurrentUser({
    query: {
      enabled: signinPending,
    },
  });

  useEffect(() => {
    if (userData) {
      dispatch(setUser(userData));
      if (userData.username && userData.firstName && userData.lastName) {
        router.push(`/${userData.username}`);
      } else {
        router.push("/onboarding");
      }
    }
  }, [userData, dispatch, router]);

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
        <FormHeader
          title="ログイン"
          subtitle="アカウントにログインして、ペットの管理を始めましょう"
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
            fullWidth
            label="メールアドレス"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={emailError}
            required
          />
          <PasswordInput
            label="パスワード"
            value={password}
            onChange={setPassword}
            error={passwordError}
            required
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isPending}
            size="large"
          >
            {isPending ? "ログイン中..." : "ログイン"}
          </Button>
        </Box>

        <FormFooter
          text="アカウントをお持ちでないですか？"
          linkText="新規登録"
          href="/auth/signup"
        />
      </Paper>
    </Container>
    </Box>
  );
}
