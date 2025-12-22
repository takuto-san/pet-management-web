"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/atoms/Button";

interface AuthButtonsProps {
  onNavigate?: () => void;
}

export const AuthButtons = ({ onNavigate }: AuthButtonsProps) => {
  const router = useRouter();

  const handleSignin = () => {
    if (onNavigate) onNavigate();
    router.push("/auth/signin");
  };

  const handleSignup = () => {
    if (onNavigate) onNavigate();
    router.push("/auth/signup");
  };

  return (
    <div>
      <Button variant="contained" sx={{ marginRight: "0.5rem" }} onClick={handleSignin}>
        ログイン
      </Button>
      <Button variant="outlined" onClick={handleSignup}>
        新規登録
      </Button>
    </div>
  );
};
