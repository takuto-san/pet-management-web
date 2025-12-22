import Link from "next/link";
import { Button } from "@/components/atoms/Button";

export const AuthButtons = () => {
  return (
    <div>
      <Link href="/auth/signin">
        <Button variant="contained" sx={{ marginRight: "0.5rem" }}>
          ログイン
        </Button>
      </Link>
      <Link href="/auth/signup">
        <Button variant="outlined">
          新規登録
        </Button>
      </Link>
    </div>
  );
};
