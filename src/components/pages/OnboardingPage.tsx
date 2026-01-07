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
  MenuItem,
  Backdrop,
  CircularProgress,
} from "@mui/material";
import AcUnitIcon from "@mui/icons-material/AcUnit";
import { useUpdateUser } from "@/api/generated/user/user";
import { useAddPet } from "@/api/generated/pet/pet";
import type { RootState } from "@/lib/stores/store";
import AuthHeader from "@/components/organisms/AuthHeader";
import type { UserBase, PetFields } from "@/types/api";
import { PetType, PetSex } from "@/types/api";
import { LayoutTemplate } from "@/components/templates/LayoutTemplate";

export function OnboardingPage() {
  const textFieldSx = {
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: 'white',
      },
      '&:hover fieldset': {
        borderColor: 'white',
      },
      '&.Mui-focused fieldset': {
        borderColor: 'white',
      },
      '&.Mui-disabled fieldset': {
        borderColor: 'white',
      },
      '& .MuiInputBase-input': {
        color: 'white',
      },
    },
    '& .MuiInputLabel-root': {
      color: 'white',
      '&.Mui-required .MuiInputLabel-asterisk': {
        color: '#8B0000',
      },
      '&.Mui-disabled': {
        color: 'white',
      },
    },
    '& .MuiInputLabel-asterisk': {
      color: '#8B0000',
    },
    '& .MuiInputBase-input.Mui-disabled': {
      color: 'rgba(255, 255, 255, 0.6)',
      WebkitTextFillColor: 'rgba(255, 255, 255, 0.6)',
    },
  };

  const [currentStep, setCurrentStep] = useState(1);
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
  const [petData, setPetData] = useState<PetFields>({
    name: "",
    birthDate: "",
    sex: PetSex.unknown,
    type: PetType.dog,
    userId: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();
  const currentUser = useSelector((state: RootState) => state.user.currentUser);

  const { mutate: updateUser, isPending: isUserPending } = useUpdateUser({
    mutation: {
      onSuccess: (data) => {
        setSuccess("プロフィールが更新されました！");
        setCurrentStep(2);
        setSuccess("");
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

  const { mutate: addPet, isPending: isPetPending } = useAddPet({
    mutation: {
      onSuccess: () => {
        setSuccess("ペットが登録されました！");
        setTimeout(() => {
          // オンボーディング完了後はダッシュボードにリダイレクト
          if (currentUser?.username) {
            router.push(`/${currentUser.username}`);
          }
        }, 1500);
      },
      onError: (err: any) => {
        setError("ペットの登録に失敗しました。");
      },
    },
  });

  const isPetLoading = isPetPending || !!success;

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
      setPetData((prev) => ({ ...prev, userId: currentUser.id }));
    }
  }, [currentUser]);

  const handleChange = (field: keyof UserBase) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handlePetChange = (field: keyof PetFields) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setPetData((prev) => ({ ...prev, [field]: e.target.value }));
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

  const handlePetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!petData.name) {
      setError("ペットの名前は必須です。");
      return;
    }

    if (!petData.userId) {
      setError("ユーザー情報が取得できませんでした。");
      return;
    }

    addPet({ data: petData });
  };

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  const mainContent = (
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
      <Container maxWidth="md">
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
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <AcUnitIcon sx={{ fontSize: 60, color: '#8B0000', mb: 3 }} />
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: "bold", color: 'white' }}>
              {currentStep === 1 ? "基本情報入力" : "ペット情報入力"}
            </Typography>
            <Typography variant="body1" sx={{ color: 'white' }}>
              {currentStep === 1
                ? "ペットの管理を始める前に、基本情報を入力してください"
                : "ペットの情報を入力してください"
              }
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, color: 'white' }}>
              ステップ {currentStep} / 2
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

          {currentStep === 1 ? (
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
                    sx={{ ...textFieldSx, flex: "1 1 300px" }}
                  />
                  <TextField
                    fullWidth
                    label="メールアドレス"
                    value={formData.email}
                    disabled
                    variant="outlined"
                    sx={{ ...textFieldSx, flex: "1 1 300px" }}
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
                    sx={{ ...textFieldSx, flex: "1 1 300px" }}
                  />
                  <TextField
                    fullWidth
                    label="名"
                    value={formData.firstName}
                    onChange={handleChange("firstName")}
                    required
                    variant="outlined"
                    sx={{ ...textFieldSx, flex: "1 1 300px" }}
                  />
                </Box>
                <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                  <TextField
                    fullWidth
                    label="姓（カナ）"
                    value={formData.lastNameKana}
                    onChange={handleChange("lastNameKana")}
                    variant="outlined"
                    sx={{ ...textFieldSx, flex: "1 1 300px" }}
                  />
                  <TextField
                    fullWidth
                    label="名（カナ）"
                    value={formData.firstNameKana}
                    onChange={handleChange("firstNameKana")}
                    variant="outlined"
                    sx={{ ...textFieldSx, flex: "1 1 300px" }}
                  />
                </Box>
                <TextField
                  fullWidth
                  label="電話番号"
                  value={formData.telephone}
                  onChange={handleChange("telephone")}
                  variant="outlined"
                  sx={textFieldSx}
                />
                <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                  <TextField
                    fullWidth
                    label="郵便番号"
                    value={formData.postalCode}
                    onChange={handleChange("postalCode")}
                    variant="outlined"
                    sx={{ ...textFieldSx, flex: "1 1 200px" }}
                  />
                  <TextField
                    fullWidth
                    label="都道府県"
                    value={formData.prefecture}
                    onChange={handleChange("prefecture")}
                    variant="outlined"
                    sx={{ ...textFieldSx, flex: "2 1 400px" }}
                  />
                </Box>
                <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                  <TextField
                    fullWidth
                    label="市区町村"
                    value={formData.city}
                    onChange={handleChange("city")}
                    variant="outlined"
                    sx={{ ...textFieldSx, flex: "1 1 300px" }}
                  />
                  <TextField
                    fullWidth
                    label="住所"
                    value={formData.address}
                    onChange={handleChange("address")}
                    variant="outlined"
                    sx={{ ...textFieldSx, flex: "1 1 300px" }}
                  />
                </Box>
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isUserPending}
                size="large"
                sx={{
                  py: 2,
                  borderRadius: 2,
                  fontSize: "1.1rem",
                  boxShadow: 3,
                  mt: 4,
                  backgroundColor: '#8B0000',
                  '&:hover': {
                    backgroundColor: '#A52A2A',
                    boxShadow: 6,
                  },
                }}
              >
                {isUserPending ? "更新中..." : "次へ"}
              </Button>
            </Box>
          ) : (
            <Box component="form" onSubmit={handlePetSubmit} sx={{ width: "100%" }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <TextField
                  fullWidth
                  label="ペットの名前"
                  value={petData.name}
                  onChange={handlePetChange("name")}
                  required
                  variant="outlined"
                  disabled={isPetLoading}
                  sx={textFieldSx}
                />
                <TextField
                  fullWidth
                  label="生年月日"
                  type="date"
                  value={petData.birthDate || ""}
                  onChange={handlePetChange("birthDate")}
                  variant="outlined"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  disabled={isPetLoading}
                  sx={textFieldSx}
                />
                <TextField
                  fullWidth
                  label="性別"
                  select
                  value={petData.sex}
                  onChange={handlePetChange("sex")}
                  variant="outlined"
                  disabled={isPetLoading}
                  sx={textFieldSx}
                >
                  <MenuItem value={PetSex.male}>オス</MenuItem>
                  <MenuItem value={PetSex.female}>メス</MenuItem>
                  <MenuItem value={PetSex.unknown}>不明</MenuItem>
                </TextField>
                <TextField
                  fullWidth
                  label="種類"
                  select
                  value={petData.type}
                  onChange={handlePetChange("type")}
                  variant="outlined"
                  required
                  disabled={isPetLoading}
                  sx={textFieldSx}
                >
                  <MenuItem value={PetType.dog}>犬</MenuItem>
                  <MenuItem value={PetType.cat}>猫</MenuItem>
                  <MenuItem value={PetType.rabbit}>ウサギ</MenuItem>
                  <MenuItem value={PetType.hamster}>ハムスター</MenuItem>
                  <MenuItem value={PetType.bird}>鳥</MenuItem>
                  <MenuItem value={PetType.turtle}>カメ</MenuItem>
                  <MenuItem value={PetType.fish}>魚</MenuItem>
                </TextField>
              </Box>

              <Box sx={{ display: "flex", gap: 2, mt: 4 }}>
                <Button
                  type="button"
                  variant="outlined"
                  onClick={() => setCurrentStep(1)}
                  size="large"
                  disabled={isPetLoading}
                  sx={{
                    py: 2,
                    borderRadius: 2,
                    fontSize: "1.1rem",
                    flex: 1,
                    borderColor: '#B22222',
                    color: 'white',
                    '&:hover': {
                      borderColor: '#A52A2A',
                      backgroundColor: 'rgba(139, 0, 0, 0.04)',
                      color: 'white',
                    },
                  }}
                >
                  戻る
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isPetLoading}
                  size="large"
                  sx={{
                    py: 2,
                    borderRadius: 2,
                    fontSize: "1.1rem",
                    boxShadow: 3,
                    flex: 1,
                    backgroundColor: '#8B0000',
                    '&:hover': {
                      backgroundColor: '#A52A2A',
                      boxShadow: 6,
                    },
                  }}
                >
                  {isPetLoading ? "登録中..." : "完了"}
                </Button>
              </Box>
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );

  return (
    <>
      <LayoutTemplate
        header={<AuthHeader />}
        main={mainContent}
        isCentered={true}
      />
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isPetLoading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </>
  );
}
