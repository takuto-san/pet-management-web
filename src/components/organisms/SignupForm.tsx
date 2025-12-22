"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Paper, Alert, Container } from "@mui/material";
import { useRegisterUser } from "@/api/generated/auth/auth";
import { Input } from "@/components/atoms/Input";
import { Button } from "@/components/atoms/Button";
import { PasswordInput } from "@/components/molecules/PasswordInput";
import { FormHeader } from "@/components/molecules/FormHeader";
import { FormFooter } from "@/components/molecules/FormFooter";

export function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();

  const { mutate: signup, isPending } = useRegisterUser({
    mutation: {
      onSuccess: (data) => {
        setSuccessMessage(`アカウントが作成されました。${data.email} で登録されました。ログインしてください。`);
        setError("");
        setTimeout(() => {
          router.push("/auth/signin");
        }, 3000); // 3秒後にリダイレクト
      },
      onError: (err: any) => {
        const status = err?.response?.status;
        let errorMessage = "登録に失敗しました。入力内容を確認してください。";
        if (status === 409) {
          errorMessage = "このメールアドレスは既に登録されています。";
        } else if (status === 400) {
          errorMessage = "入力内容を確認してください。";
        } else if (err?.response?.data?.detail) {
          errorMessage = err.response.data.detail;
        }
        setError(errorMessage);
        setSuccessMessage("");
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



  return (
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
        <FormHeader
          title="新規登録"
          subtitle="無料でアカウントを作成して、ペットの管理を始めましょう"
        />

        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Success Message */}
        {successMessage && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {successMessage}
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
            required
          />
          <PasswordInput
            label="パスワード"
            value={password}
            onChange={setPassword}
            error=""
            required
            helperText="8文字以上、大文字・小文字・数字を含む"
          />
          <PasswordInput
            label="パスワード（確認）"
            value={confirmPassword}
            onChange={setConfirmPassword}
            error=""
            required
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isPending}
            size="large"
          >
            {isPending ? "登録中..." : "新規登録"}
          </Button>
        </Box>

        <FormFooter
          text="既にアカウントをお持ちですか？"
          linkText="ログイン"
          href="/auth/signin"
        />
      </Paper>
    </Container>
    </Box>
  );
}
